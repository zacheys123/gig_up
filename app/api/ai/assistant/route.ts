
import { getCurrentContext, GIGUP_CONTEXTS } from "@/utils";

// app/api/ai/assistant/route.ts

import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize DeepSeek client
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});
export async function POST(request: Request) {
  try {
    const { question, userRole, userTier, platformVersion } = await request.json();
   const context = platformVersion 
      ? GIGUP_CONTEXTS[platformVersion] || getCurrentContext()
      : getCurrentContext();

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: "system", 
          content: `${context}\n\nCurrent user: ${userRole}, Tier: ${userTier}. Platform: ${GIGUP_CONTEXTS.current}`
        },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });



    const answer =
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response. Please try again.";

          return NextResponse.json({
      answer: completion.choices[0].message.content,
      platformVersion: GIGUP_CONTEXTS.current,
      contextVersion: platformVersion || GIGUP_CONTEXTS.current      provider: "deepseek",
      model: "deepseek-chat",
    });


  } catch (error: any) {
    console.error("DeepSeek API error:", error);

    // Provide helpful error messages
    let errorMessage =
      "I'm currently unavailable. Please try again in a moment.";

    if (error?.status === 401) {
      errorMessage = "Authentication issue. Please contact support.";
    } else if (error?.status === 429) {
      errorMessage =
        "I'm getting too many requests. Please wait a moment and try again.";
    } else if (error?.code === "ENOTFOUND") {
      errorMessage = "Network connection issue. Please check your internet.";
    }

    return NextResponse.json(
      {
        answer: errorMessage,
        provider: "deepseek",
        error: true,
      },
      { status: 200 }
    ); // Still return 200 to avoid breaking the frontend
  }
}
