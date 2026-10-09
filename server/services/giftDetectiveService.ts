import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage.js";

export interface GiftDetectiveInput {
  targetPerson: string;
  gender?: string;
  age?: number | string;
  personalityTraits: string;
  budget?: number | string;
  occasion?: string;
  language?: "uz" | "ru" | "en";
}

export interface GiftDetectiveDossier {
  archetype: {
    name: string;
    badge: string;
    radarScores: {
      creativity: number;
      rationality: number;
      emotionality: number;
      techSavviness: number;
    };
    psychologicalSummary: string;
  };
  dopamineTriggers: string[];
  forbiddenRedFlags: string[];
  precisionGifts: Array<{
    name: string;
    price: number;
    store: string;
    url: string;
    imageUrl: string;
    whyItWorks: string;
    emotionalImpactScore: string;
  }>;
  presentationTactic: {
    deliveryMoment: string;
    exactWordsToSay: string;
    cardGreetingNote: string;
  };
}

export class GiftDetectiveService {
  private getGeminiKey(): string | null {
    const raw = (process.env.GEMINI_API_KEY || "").trim();
    return raw.length > 20 ? raw : null;
  }

  public async profileAndInvestigate(
    input: GiftDetectiveInput
  ): Promise<GiftDetectiveDossier> {
    const {
      targetPerson,
      gender = "Noma'lum",
      age = "20-35",
      personalityTraits,
      budget = "500,000 UZS",
      occasion = "Tug'ilgan kun / Maxsus sana",
      language = "uz",
    } = input;

    // Pull real products from local catalog
    const catalog = storage.getProducts(300);
    const keywords = personalityTraits.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    
    const matchedProducts = catalog.filter((p: any) => {
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      return keywords.some((kw) => pName.includes(kw) || pCat.includes(kw));
    }).slice(0, 3);

    const defaultGifts = (matchedProducts.length > 0 ? matchedProducts : catalog.slice(0, 3)).map((p: any, idx: number) => ({
      name: p.name,
      price: p.price || (idx === 0 ? 650000 : idx === 1 ? 420000 : 350000),
      store: p.store || (idx === 0 ? "Uzum Market" : idx === 1 ? "Texnomart" : "MediaPark"),
      url: p.url || `https://uzum.uz/uz/search?q=${encodeURIComponent(p.name)}`,
      imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop",
      whyItWorks: p.reason || "Shaxsiy qiziqishlarga 100% mos keladi, har kuni ishlatiladi va doimiy quvonch keltiradi.",
      emotionalImpactScore: `${94 + idx}%`,
    }));

    const key = this.getGeminiKey();

    if (key) {
      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest"];
      const genAI = new GoogleGenerativeAI(key);

      const prompt = `You are Sovg'a AI's "Neural Gift Detective & Psychological Persona Profiler" for the Uzbekistan market.
Analyze the following persona deeply and build a comprehensive psychological Gift Dossier.

TARGET PERSON PROFILE:
- Relationship: "${targetPerson}"
- Gender: "${gender}"
- Age: "${age}"
- Personality traits / Hobbies: "${personalityTraits}"
- Budget: "${budget}"
- Occasion: "${occasion}"

LANGUAGE: "${language}" (uz = Uzbek, ru = Russian, en = English).

CATALOG HINTS AVAILABLE IN UZBEKISTAN:
${defaultGifts.map((g) => `- ${g.name} (${g.price} UZS, ${g.store})`).join("\n")}

CRITICAL INSTRUCTIONS:
1. "archetype": Create a fascinating, deeply accurate psychological archetype name (e.g. "Estetik Minimalist Intellektual", "Energetik Tech-Innovator", "Samimiy Qalbli Mukammallik Parvarishi").
2. "radarScores": 4 numbers from 10 to 100 for creativity, rationality, emotionality, techSavviness.
3. "psychologicalSummary": Deep 2-3 sentence psychological analysis of what this person actually values in life and relationships.
4. "dopamineTriggers": 3 exact micro-experiences that give this person genuine dopamine and delight.
5. "forbiddenRedFlags": 3 strict antipathetic gift types you should NEVER give this person, with sharp reasons why they would hate or discard them.
6. "precisionGifts": Exactly 3 REAL products that exist in Uzbekistan (Uzum Market, Texnomart, MediaPark, Olcha, Asaxiy). Realistic prices in UZS. Include whyItWorks (specific psychological connection to their traits) and emotionalImpactScore (e.g. "98%").
7. "presentationTactic":
   - "deliveryMoment": The ideal psychological setting and timing to hand over the gift.
   - "exactWordsToSay": The exact natural, touching phrase the giver should speak.
   - "cardGreetingNote": A brief, poetic, memorable postcard message.

Return ONLY valid JSON matching this schema:
{
  "archetype": {
    "name": "string",
    "badge": "string",
    "radarScores": {
      "creativity": 85,
      "rationality": 90,
      "emotionality": 65,
      "techSavviness": 80
    },
    "psychologicalSummary": "string"
  },
  "dopamineTriggers": ["string", "string", "string"],
  "forbiddenRedFlags": ["string", "string", "string"],
  "precisionGifts": [
    {
      "name": "string",
      "price": 650000,
      "store": "Uzum Market",
      "url": "https://uzum.uz/uz/search?q=...",
      "imageUrl": "https://images.unsplash.com/...",
      "whyItWorks": "string",
      "emotionalImpactScore": "98%"
    }
  ],
  "presentationTactic": {
    "deliveryMoment": "string",
    "exactWordsToSay": "string",
    "cardGreetingNote": "string"
  }
}`;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          });

          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          const parsed = JSON.parse(rawText);

          if (parsed && parsed.archetype && Array.isArray(parsed.precisionGifts)) {
            // Ensure valid images & stores
            parsed.precisionGifts = parsed.precisionGifts.map((g: any, idx: number) => ({
              ...g,
              imageUrl: g.imageUrl && g.imageUrl.startsWith("http") ? g.imageUrl : defaultGifts[idx % defaultGifts.length].imageUrl,
              url: g.url && g.url.startsWith("http") ? g.url : defaultGifts[idx % defaultGifts.length].url,
            }));
            return parsed;
          }
        } catch (err: any) {
          console.warn(`[Gift Detective AI] Model ${modelName} warning:`, err?.message);
        }
      }
    }

    // High quality deterministic fallback if AI is unreachable
    return {
      archetype: {
        name: language === "uz" ? "Estetik Zamonaviy Intellektual" : language === "ru" ? "Эстетичный Интеллектуал" : "Aesthetic Modern Intellectual",
        badge: "CLASS A+ ARCHETYPE",
        radarScores: {
          creativity: 91,
          rationality: 84,
          emotionality: 73,
          techSavviness: 80,
        },
        psychologicalSummary:
          language === "uz"
            ? "Ushbu inson yuzaki sovg'alarni yoqtirmaydi. Uning uchun sovg'aning narxi emas, balki shaxsiyatiga hurmat va kundalik hayotdagi qulaylik muhim."
            : "Этот человек ценит индивидуальный подход и практичность выше стандартных формальных сувениров.",
      },
      dopamineTriggers: [
        language === "uz" ? "Estetik sifat va qulaylik hissi" : "Эстетическое качество и комфорт",
        language === "uz" ? "Vaqtni tejovchi aqlli yechimlar" : "Умные решения, экономящие время",
        language === "uz" ? "Samimiy, kutilmagan shaxsiy e'tibor" : "Искреннее, неожиданное внимание",
      ],
      forbiddenRedFlags: [
        language === "uz" ? "Keraksiz suvenirlar va arzon statuetkalar (Chiqindi deb hisoblaydi)" : "Бесполезные безделушки и дешевые сувениры",
        language === "uz" ? "Tasodifiy, o'tkir hidli parfyumeriya" : "Случайный парфюм с резким запахом",
        language === "uz" ? "Shablondagi standart shokolad qutilari" : "Шаблонные наборы из супермаркета",
      ],
      precisionGifts: defaultGifts,
      presentationTactic: {
        deliveryMoment:
          language === "uz"
            ? "Shovqinli muhitda emas, samimiy va sokin vaziyatda yoki tongda kutilmagan kuryer orqali yetkazish."
            : "В спокойной, искренней обстановке или неожиданным утренним курьером.",
        exactWordsToSay:
          language === "uz"
            ? "\"Sening qiziqishlaring va nozik didingni bilgan holda, har kuni kayfiyatingni ko'taradigan bu narsani tanladim...\""
            : "\"Зная твой прекрасный вкус и увлечения, я выбрал то, что будет радовать тебя каждый день...\"",
        cardGreetingNote:
          language === "uz"
            ? "Har bir kuning yangi ilhom, go'zal onlar va sokin xotirjamlik bilan to'lsin!"
            : "Пусть каждый твой день будет наполнен вдохновением и радостью!",
      },
    };
  }
}

export const giftDetectiveService = new GiftDetectiveService();
