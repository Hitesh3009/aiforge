import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/models/Schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function DELETE(req,{params}) {
    const session = await getServerSession(authOptions);
    try {
        if(session) {
            await connectToDatabase();
            const paramsObj = await params;            
            const imageId = paramsObj.id;
            await Image.findByIdAndDelete(imageId);
            return new Response(JSON.stringify({ message: 'Image deleted successfully' ,status:200}), { status: 200 });
        }
        else{
            return new Response(JSON.stringify({ error: 'Unauthorized' ,status:401}), { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Delete failed',status:404}, { status: 404 }));
    }
}