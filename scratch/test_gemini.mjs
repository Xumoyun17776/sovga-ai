process.loadEnvFile(".env");
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.GEMINI_API_KEY;
console.log("Gemini API key bor:", Boolean(key));

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({
  model: "gemini-3.8-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const res = await model.generateContent("Return raw JSON: {\"status\": \"faol\", \"model\": \"gemini-3.8-flash\", \"message\": \"Google Gemini API kaliti 100% muvaffaqiyatli ishlamoqda!\"}");
console.log("Gemini javobi:\n", res.response.text());
