import { connectToDatabase } from "@/lib/mongodb";
import { Image } from "@/models/Schema";
export async function GET(req) {
    const authHeader = await req.headers.get('authorization');;


    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization token is required', status: 401 }, { status: 401 }));
    }
    const tokenFromHeader = authHeader.split(' ')[1];
    try {
        await connectToDatabase();
        const verifyPayload = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/auth/verify`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenFromHeader })
        });
        const verifyResult =await verifyPayload.json();
        if (!verifyResult.success) {
            return new Response(JSON.stringify({ error: 'Unauthorized.Please,Login Again', status: 401 }), { status: 401 });
        }
        else{
            const userId = verifyResult.userID;
            const imageData = await Image.find({ userId });
            // console.log(imageData);
            const imageArr = imageData.map(image=>{
                let id=image._id.toString();
                let data=image.images.data.toString('base64');
                let contentType=image.images.contentType;
                return {id,data,contentType};
            });
            // console.log(imageArr.length);
            // console.log(imageArr);
            return new Response(JSON.stringify({ imageArr, status: 200 }), { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error while getting images for the user', status: 500 }), { status: 500 });
    }
}