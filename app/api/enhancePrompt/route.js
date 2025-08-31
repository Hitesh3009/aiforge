import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            const { userPrompt } = await req.json();
            const model = new ChatGoogleGenerativeAI({
                model: "gemini-2.0-flash",
                temperature: 0.7,
                apiKey: process.env.GOOGLE_API_KEY
            });

            const template = `
Enhance the prompt to obtain better results.
Do not include any intro or outro message, only provide the refined version of the prompt in valid HTML.
Use <h1> for the main heading, <h2> for subheadings, <p> for paragraphs.
Avoid unnecessary details, keep it short and concise.

IMPORTANT:
- Replace violent, gory, or horror terms with softer alternatives.
- For example:
  - "undead", "zombie", "decaying" → "shadowy figures", "dark spirits"
  - "grotesque" → "ominous", "menacing"
  - "post-apocalyptic" → "ruined" or "desolate"
- Always choose safe, descriptive alternatives instead of graphic ones.

The prompt is: {prompt}
`;


            const promptTemplate = PromptTemplate.fromTemplate(template);

            const completePrompt = await promptTemplate.invoke({ prompt: userPrompt });

            const response = await model.invoke(completePrompt);
            // console.log(response.content)

            return new Response(JSON.stringify({ enhancedPrompt: response.content, status: 200 }), { status: 200 })
        }
        else {
            return new Response(JSON.stringify({ error: "Unauthorized", status: 401 }), { status: 401 })
        }
    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: "Error occured while generating enhanced prompt", status: 500 }), { status: 500 })
    }
}

