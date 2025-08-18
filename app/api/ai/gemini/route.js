import { NextResponse } from "next/server";

import { GoogleGenAI } from "@google/genai";

export async function GET(req) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "How to make a cupcake",
  });

  console.log(response.text);
  return NextResponse.json({
    success: true,
    message: "GEMINI Responce send",
    res: response.text,
  });
}
