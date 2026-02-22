import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
    },
};


export async function POST(req) {
    const session = await getServerSession(authOptions);
    
    try {
        if (session) {
            const { prompt,inpBase64Img } = await req.json();
            const apiKey = process.env.FREEPIK_API_KEY
            //console.log(apiKey);

            const url = 'https://api.freepik.com/v1/ai/text-to-image/seedream-v4-5-edit';
            const options = {
                method: 'POST',
                headers: { 'x-freepik-api-key': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ "prompt": prompt,"reference_images": [inpBase64Img],"enable_safety_checker":false ,"aspect_ratio": "square_1_1", "seed": 1073741823 })
            };

            //console.log(options);

            const imagePromises = Array.from({ length: 3 }, async () => {
                const response = await fetch(url, options);
                const data = await response.json();
                // console.log('what is data', data);

                return data.data;
            });

            //console.log(imagePromises);
            const resolvedPromiseRes = await Promise.all(imagePromises);
            //console.log(resolvedPromiseRes);

            let finalImageArr = [];

            const taskIds = resolvedPromiseRes.map(item => item.task_id);

            let status = "IN_PROGRESS";
            while (status !== "COMPLETED") {
                await new Promise((res) => setTimeout(res, 3000));

                const pollResults = await Promise.all(
                    taskIds.map(async (taskId) => {
                        const pollRes = await fetch(
                            `https://api.freepik.com/v1/ai/text-to-image/seedream-v4-5-edit/${taskId}`,
                            {
                                method: "GET",
                                headers: { "x-freepik-api-key": apiKey }
                            }
                        );
                        return pollRes.json();
                    })
                );

                // Check if all tasks are completed
                status = pollResults.every(r => r.data.status === "COMPLETED")
                    ? "COMPLETED"
                    : "IN_PROGRESS";

                if (status === "COMPLETED") {
                    pollResults.forEach(r => {
                        if (r.data.generated) {
                            finalImageArr.push(r.data.generated[0]);
                        }
                    });
                }
            }


            //console.log(finalImageArr);

            return new Response(JSON.stringify({ images: finalImageArr, status: 201 }, { status: 201 }));
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
