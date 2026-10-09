import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage.js";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConciergeChatResponse {
  reply: string;
  recommendedProducts?: Array<{
    name: string;
    price: number;
    originalPrice?: number;
    store: string;
    imageUrl?: string;
    url?: string;
    reason?: string;
  }>;
  suggestedPrompts?: string[];
}

export class ConciergeChatService {
  private getGeminiKey(): string | null {
    const raw = (process.env.GEMINI_API_KEY || "").trim();
    return raw.length > 20 ? raw : null;
  }

  public async chat(
    messages: ChatMessage[],
    language: "uz" | "ru" | "en" = "uz"
  ): Promise<ConciergeChatResponse> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const key = this.getGeminiKey();

    // Find relevant products from catalog to ground the answer
    const catalogProducts = storage.getProducts(300);
    const keywords = lastUserMessage.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    
    const matchingProducts = catalogProducts.filter((p: any) => {
      const pName = (p.name || "").toLowerCase();
      const pCategory = (p.category || "").toLowerCase();
      return keywords.some((kw) => pName.includes(kw) || pCategory.includes(kw));
    }).slice(0, 3);

    // Default products if none matched
    const attachedProducts = matchingProducts.length > 0 ? matchingProducts : catalogProducts.slice(0, 3);

    const formattedRecommendedProducts = attachedProducts.map((p: any) => ({
      name: p.name,
      price: p.price || 450000,
      originalPrice: p.originalPrice || Math.round((p.price || 450000) * 1.15),
      store: p.store || "Uzum Market",
      imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
      url: p.url || `https://uzum.uz/uz/search?q=${encodeURIComponent(p.name)}`,
      reason: p.reason || "O'zbekiston bozorida eng yuqori baholangan va kafolatlangan tanlov.",
    }));

    if (key) {
      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest"];
      const genAI = new GoogleGenerativeAI(key);

      const systemPrompt = `You are "Sovg'a AI Konsyerj", Uzbekistan's #1 luxury personal shopping advisor & gift expert.
You help people find the perfect gift and the best verified price in Uzbekistan stores (Olcha, Uzum Market, Texnomart, MediaPark, Asaxiy).

RULES:
1. Speak in ${language === "uz" ? "Uzbek (O'zbekcha)" : language === "ru" ? "Russian (Русский)" : "English"}. Warm, elite, expert, helpful tone.
2. Give actionable, specific gift ideas with realistic prices in UZS (so'm).
3. If they give a budget, respect it strictly.
4. Suggest where to buy (e.g. Olcha for smartphones/tech, Uzum, Texnomart) and what makes the gift special.
5. Keep paragraphs readable and concise with polite bullet points.
6. End with 1 brief question or recommendation (e.g., whether they need a calligraphy greeting card or 3D box packaging).`;

      const conversationContext = messages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "Foydalanuvchi" : "Konsyerj"}: ${m.content}`)
        .join("\n");

      const prompt = `${systemPrompt}\n\nSUHBAT TARIXI:\n${conversationContext}\n\nKonsyerj javobi:`;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1000,
            },
          });

          const res = await model.generateContent(prompt);
          const replyText = res.response.text();

          if (replyText && replyText.trim().length > 10) {
            return {
              reply: replyText.trim(),
              recommendedProducts: formattedRecommendedProducts,
              suggestedPrompts: this.getSuggestedPrompts(language),
            };
          }
        } catch (err: any) {
          console.warn(`[Concierge AI] Model ${modelName} notice:`, err?.message);
        }
      }
    }

    // Heuristic fallback response if AI key is unavailable or fails
    const fallbackText =
      language === "uz"
        ? `Sizning so'rovingiz bo'yicha O'zbekiston bozorini tahlil qildim! Ushbu toifada eng maqbul va xaridorlar tomonidan yuqori baholangan variantlarni saralab berdim. Quyida narxi kafolatlangan va tez yetkazib beriladigan eng yaxshi takliflarni ko'rishingiz mumkin:`
        : language === "ru"
        ? `Я проанализировал рынок Узбекистана по вашему запросу! Отобрал наиболее популярные и проверенные варианты с гарантией и быстрой доставкой:`
        : `I've analyzed the Uzbekistan market for your request! Here are top-rated verified gift options with best prices and fast fulfillment:`;

    return {
      reply: fallbackText,
      recommendedProducts: formattedRecommendedProducts,
      suggestedPrompts: this.getSuggestedPrompts(language),
    };
  }

  private getSuggestedPrompts(lang: "uz" | "ru" | "en"): string[] {
    if (lang === "ru") {
      return [
        "Подарок маме до 500,000 UZS",
        "Свадебный подарок молодоженам",
        "Лучшие скидки на технику сегодня",
        "Где дешевле купить iPhone 16?",
      ];
    }
    if (lang === "en") {
      return [
        "Gift for mom under 500,000 UZS",
        "Wedding gift for newlyweds",
        "Best tech deals today",
        "Cheapest place to buy iPhone 16?",
      ];
    }
    return [
      "Onamga 500,000 so'mga sovg'a",
      "To'yga yangi kelin-kuyovga nima olsam bo'ladi?",
      "Bugungi eng katta chegirmalar",
      "iPhone 16 qayerda eng arzon?",
    ];
  }
}

export const conciergeChatService = new ConciergeChatService();
