import { getCurrentContext, GIGUP_CONTEXTS } from "@/utils";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

export async function POST(request: Request) {
  console.log("🔍 AI Assistant API called");

  try {
    // Check environment variables first
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("❌ DEEPSEEK_API_KEY is missing");
      throw new Error("API configuration error");
    }

    if (!process.env.DEEPSEEK_BASE_URL) {
      console.error("❌ DEEPSEEK_BASE_URL is missing");
      throw new Error("API configuration error");
    }

    const body = await request.json();
    console.log("📥 Request body:", body);

    const { question, userRole, userTier, platformVersion } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const context = platformVersion
      ? GIGUP_CONTEXTS[platformVersion] || getCurrentContext()
      : getCurrentContext();

    console.log("🤖 Using context for version:", platformVersion);

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `${context}\n\nCurrent user: ${userRole}, Tier: ${userTier}. Platform: ${GIGUP_CONTEXTS.current}`,
        },
        { role: "user", content: question },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const answer =
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response. Please try again.";

    console.log("✅ AI Response generated:", answer.substring(0, 100) + "...");

    return NextResponse.json({
      answer: answer,
      platformVersion: GIGUP_CONTEXTS.current,
      contextVersion: platformVersion || GIGUP_CONTEXTS.current,
      provider: "deepseek",
      model: "deepseek-chat",
    });
  } catch (error: any) {
    console.error("❌ DeepSeek API error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack,
    });

    let errorMessage =
      "I'm currently unavailable. Please try again in a moment.";

    if (error?.status === 401) {
      errorMessage = "Authentication issue. Please contact support.";
    } else if (error?.status === 429) {
      errorMessage =
        "I'm getting too many requests. Please wait a moment and try again.";
    } else if (error?.code === "ENOTFOUND") {
      errorMessage = "Network connection issue. Please check your internet.";
    } else if (error.message?.includes("API key")) {
      errorMessage =
        "API configuration issue. Please check your environment variables.";
    }

    return NextResponse.json(
      {
        answer: errorMessage,
        provider: "deepseek",
        error: true,
        debug:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 200 }
    );
  }
}
