import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/models/Schema';

export async function POST(req) {
    const authHeader = await req.headers.get('authorization');
    
    if (!authHeader) {
        return new Response(
            JSON.stringify({ error: 'Authorization token is required', status: 401 }),
            { status: 401 }
        );
    }

    const tokenFromHeader = authHeader.split(' ')[1];
    try {
        await connectToDatabase();

        // ✅ Manually parse the body to avoid Next.js 413 error
        const buffer = await req.arrayBuffer();
        const text = new TextDecoder().decode(buffer);
        const { selectedImages, prompt } = JSON.parse(text);

        const verifyPayload = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/auth/verify`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenFromHeader })
        });

        const verifyResult = await verifyPayload.json();

        if (verifyResult.success) {
            for (const img of selectedImages) {
                const userImageGallery = new Image({
                    userId: verifyResult.userID,
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
        } else {
            return new Response(
                JSON.stringify({ error: 'Unauthorized. Please, Login Again.', status: 401 }),
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
