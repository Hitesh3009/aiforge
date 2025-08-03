import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/models/Schema';
export async function POST(req) {
    const authHeader = await req.headers.get('authorization');;
    console.log(authHeader);
    
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization token is required' ,status:401}, { status: 401 }));
    }
    const tokenFromHeader = authHeader.split(' ')[1];
    try {
        await connectToDatabase();
        const { selectedImages, prompt } = await req.json();
        const verifyPayload = await fetch('http://localhost:3000/api/auth/verify', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenFromHeader })
        });
        if(verifyPayload.ok) {
            const verifyResult = await verifyPayload.json();
            console.log(verifyResult);
            
            const userImageGallery = new Image({
                'userId': verifyResult.userID, 'imgDesc': prompt, 'images': selectedImages.map((img) => {
                    let imageBuffer = Buffer.from(img, 'base64');
                    return { contentType: 'image/png', data: imageBuffer };
                }), createdAt: Date.now()
            });
            await userImageGallery.save();
            return new Response(JSON.stringify({ message: 'Images saved successfully' ,status:200}), { status: 200 });
        }
        else{
            return new Response(JSON.stringify({ error: verifyResult.error + ' Please,Login Again.' ,status:401}), { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error,status:500}, { status: 500 }));
    }
}