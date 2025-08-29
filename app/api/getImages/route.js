import { connectToDatabase } from "@/lib/mongodb";
import { Image, User } from "@/models/Schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function GET() {
    const session = await getServerSession(authOptions);
    try {
        if (session) {
            await connectToDatabase();
            const userEmail=session.user.email;
            const user=await User.findOne({email:userEmail});
            
            const userId = user._id;
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
        else{
            return new Response(JSON.stringify({ error: 'Unauthorized', status: 401 }), { status: 401 });     
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal Server Error while getting images for the user', status: 500 }), { status: 500 });
    }
}