import { GoogleGenAI, Modality } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    try {
        
        if (session) {
            const { prompt,inpBase64Img } = await req.json();
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
            return new Response(JSON.stringify({ images: responseArr, status: 201 }, { status: 201 }));
        }
        else {
            return new Response(JSON.stringify({ error: 'Unauthorized' }, { status: 401 }));
        }
    }
    catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' },
            { status: 500 }
        ))
    }
}