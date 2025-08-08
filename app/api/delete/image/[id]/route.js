import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/models/Schema';

export async function DELETE(req,{params}) {

    const authHeader = await req.headers.get('authorization');;
    console.log(authHeader);
    
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization token is required' ,status:401}, { status: 401 }));
    }
    const tokenFromHeader = authHeader.split(' ')[1];
    try {
        await connectToDatabase();
        const verifyPayload = await fetch('http://localhost:3000/api/auth/verify', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenFromHeader })
        });
        const verifyResult = await verifyPayload.json();
        if(verifyResult.success) {
            const paramsObj = await params;
            const imageId = paramsObj.id;
            await Image.findByIdAndDelete(imageId);
            return new Response(JSON.stringify({ message: 'Image deleted successfully' ,status:200}), { status: 200 });
        }
        else{
            return new Response(JSON.stringify({ error: 'Unauthorized.Please,Login Again.' ,status:401}), { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Delete failed',status:404}, { status: 404 }));
    }
}