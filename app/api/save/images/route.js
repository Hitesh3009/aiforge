import { connectToDatabase } from '@/lib/mongodb';
import { Image, User } from '@/models/Schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function POST(req) {
    const session = await getServerSession(authOptions);
    try {
        if (session) {
            await connectToDatabase();
            // ✅ Manually parse the body to avoid Next.js 413 error
            const buffer = await req.arrayBuffer();
            const text = new TextDecoder().decode(buffer);
            const { selectedImages, prompt } = JSON.parse(text);
            const userEmail=session.user.email;
            const user=await User.findOne({email:userEmail});
            
            const userId = user._id;
            for (const img of selectedImages) {
                const userImageGallery = new Image({
                    userId: userId,
                    imgDesc: prompt,
                    images: {
                        data: Buffer.from(img, 'base64'),
                        contentType: 'image/png'
                    },
                    createdAt: Date.now()
                });
                await userImageGallery.save();
            }
            return new Response(
                JSON.stringify({ message: 'Images saved successfully', status: 200 }),
                { status: 200 }
            );
        }
        else {
            return new Response(
                JSON.stringify({ error: 'Unauthorized', status: 401 }),
                { status: 401 }
            );
        }
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message, status: 500 }),
            { status: 500 }
        );
    }
}
