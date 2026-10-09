import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf-8");
let key = "";
for (const line of envContent.split("\n")) {
  if (line.startsWith("GEMINI_API_KEY=")) {
    key = line.split("=")[1].trim();
    break;
  }
}

const genAI = new GoogleGenerativeAI(key);

async function testGrounding() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      // @ts-ignore
      tools: [{ googleSearch: {} }],
    });
    const res = await model.generateContent("What is the current price of iPhone 16 in Uzbekistan stores like Olcha or Uzum in UZS?");
    console.log("Grounding response:\n", res.response.text().slice(0, 300));
  } catch (err: any) {
    console.log("Grounding error:", err.message?.slice(0, 150));
  }
}

testGrounding();
