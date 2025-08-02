import { GoogleGenAI, Modality } from "@google/genai";

export async function POST(req) {
    const { prompt } = await req.json();
    try {
        const apiKey = process.env.GOOGLE_API_KEY
        const ai = new GoogleGenAI({
            apiKey: apiKey
        });
        const contents = `${prompt}`;
        const imagePromises = Array.from({ length: 6 }, async () => {
            return await ai.models.generateContent({
                model: "gemini-2.0-flash-preview-image-generation",
                contents: contents,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                },
            });
        });
        const resolvedPromiseRes = await Promise.all(imagePromises);

        const responseArr = resolvedPromiseRes.map((response) => {
            const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
            if (imagePart) {
                const base64Encode = imagePart.inlineData.data;
                return base64Encode
            }
            setTimeout(()=>{},23000)
        });
        // console.log('Generated images:', responseArr);
        return new Response(JSON.stringify({ images: responseArr, status: 201 }, { status: 201 }));
    }
    catch (error)  {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' },
            { status: 500 }
        ))
    }
}