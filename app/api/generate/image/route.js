import { GoogleGenAI, Modality } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const { prompt } = await req.json();
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            const apiKey = process.env.GOOGLE_API_KEY
            console.log(apiKey);
            
            const ai = new GoogleGenAI({
                apiKey: apiKey
            });

            console.log(ai);
            
            const contents = `${prompt}`;
            const imagePromises = Array.from({ length: 6 }, async () => {

                return await ai.models.generateContent({
                    model: "gemini-2.0-flash-preview-image-generation",
                    contents: contents,
                    config: {
                        responseModalities: [Modality.TEXT, Modality.IMAGE],
                    }
                });
            });
            const resolvedPromiseRes = await Promise.all(imagePromises);

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
            return new Response(
                JSON.stringify({ error: "Unauthorized", success: false }),
                { status: 401 }
            );
        }
    }
    catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' },
            { status: 500 }
        ))
    }
}