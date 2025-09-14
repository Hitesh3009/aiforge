import { connectToDatabase } from '@/lib/mongodb';
import { Image, User } from '@/models/Schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function POST(req) {
    const session = await getServerSession(authOptions);
    try {
        if (session) {
            await connectToDatabase();
            const formData = await req.formData();
            const prompt = formData.get("prompt");
            const selectedImages = formData.getAll("images"); // File objects
            
            const userEmail = session.user.email;
            const user = await User.findOne({ email: userEmail });

            const userId = user._id;
            for (const img of selectedImages) {
                const arrayBuffer = await img.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const userImageGallery = new Image({
                    userId: userId,
                    imgDesc: prompt,
                    images: {
                        data: buffer,
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
