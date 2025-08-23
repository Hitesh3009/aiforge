import { GoogleGenAI, Modality } from "@google/genai";

export async function POST(req) {
    const { prompt,inpBase64Img } = await req.json();
    const authHeader = await req.headers.get('authorization');;

    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization token is required' }, { status: 401 }));
    }
    const token = authHeader.split(' ')[1];
    try {
        const verifyPayload = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/auth/verify`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token })
        });
        const verifyResult = await verifyPayload.json();
        if (!verifyResult.success) {
            return new Response(JSON.stringify({ error: 'Unauthorized.Please,Login Again' }, { status: 401 }));
        }
        else {

            const apiKey = process.env.GOOGLE_API_KEY
            const ai = new GoogleGenAI({
                apiKey: apiKey
            });
            
            const base64Image = inpBase64Img ;
           

            const contents = [
                { text: `${prompt}` },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image,
                    }
                },
            ];
            // console.log(contents);
            
            const imagePromises = Array.from({ length: 3 }, async () => {

                return await ai.models.generateContent({
                    model: "gemini-2.0-flash-preview-image-generation",
                    contents: contents,
                    config: {
                        responseModalities: [Modality.TEXT, Modality.IMAGE],
                    },
                })
            });
            const resolvedPromiseRes = await Promise.all(imagePromises);
            // console.log(resolvedPromiseRes[0].candidates[0].content.parts);
            
            const responseArr = resolvedPromiseRes.map((response) => {
                const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
                if (imagePart) {
                    const base64Encode = imagePart.inlineData.data;
                    return base64Encode
                }
            });
            // console.log('Generated images:', responseArr);
            return new Response(JSON.stringify({ images: responseArr, status: 201, userDetails: verifyResult }, { status: 201 }));
        }
    }
    catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' },
            { status: 500 }
        ))
    }
}