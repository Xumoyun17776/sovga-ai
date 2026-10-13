import type { GiftCriteria, Occasion } from "../../shared/types.js";

const occasionGuidance: Record<string, string> = {
  wedding: "Prioritize useful household items, couple-oriented gifts, elegant and long-lasting products. Consider kitchen appliances, dinner sets, bedding, home decor. Culturally appropriate for Uzbekistan.",
  birthday: "Consider personal interests, hobbies, age-appropriate gifts. Tech gadgets, accessories, experiences, personalized items.",
  graduation: "Celebrate achievement. Consider professional items, tech, books, watches, personalized gifts that mark the milestone.",
  anniversary: "Romantic and meaningful. Consider jewelry, experiences, personalized keepsakes, luxury items for the couple.",
  new_baby: "Practical baby items, nursery essentials, baby clothes, educational toys. Consider items for the parents too.",
  housewarming: "Home essentials, kitchen appliances, decorative items, smart home devices, plants, storage solutions.",
  holiday: "Festive and cheerful. Consider sweets, gift sets, winter accessories, games, family activities.",
  teacher: "Thoughtful and respectful. Consider stationery, books, quality pens, desk accessories, gift cards.",
  friend: "Fun and personal. Consider shared interests, inside jokes, experiences, trendy items.",
  family: "Warm and practical. Consider family-oriented items, home goods, traditional gifts.",
  corporate: "Professional and neutral. Consider premium stationery, desk accessories, branded items, gift baskets.",
  other: "Consider the recipient's interests and the occasion's tone.",
};

export function getOccasionGuidance(occasion: string): string {
  return occasionGuidance[occasion] || occasionGuidance.other;
}

/** Interest labels (UZ / RU / EN, free text) → product words the search understands. */
const INTEREST_TERMS: Array<[RegExp, string]> = [
  [/qahva|kofe|coffee|кофе/i, "kofe"],
  [/choy|tea|чай/i, "choy"],
  [/oshxona|oshpaz|kitchen|culinary|кухн|кулинар|посуд|tovoq|serviz/i, "oshxona"],
  [/quloqchin|naushnik|musiqa|audio|headphone|music|наушник|аудио|музык/i, "naushnik"],
  [/kolonka|speaker|колонк/i, "kolonka"],
  [/aqlli uy|smart home|iot|умный дом/i, "changyutgich"],
  [/gadjet|gadget|гаджет/i, "naushnik soat"],
  [/kulol|rishton|san'at|craft|ceramic|heritage|промысл|керамик/i, "choy to'plami"],
  [/sport|fitnes|fitness|athlet|спорт|фитнес/i, "smart band"],
  [/kitob|adabiyot|book|literature|книг|литератур/i, "kitob"],
  [/geym|gaming|kompyuter|keyboard|гейм|игр|клавиатур/i, "naushnik"],
  [/sayohat|chemodan|travel|luggage|путешеств|чемодан/i, "sumka"],
  [/dekor|decor|interer|interior|интерьер|декор/i, "suzani choy"],
  [/atir|parfyum|perfume|духи|парфюм/i, "atir"],
  [/soat|watch|часы/i, "soat"],
  [/gul|flower|цвет/i, "gul"],
  [/go'zallik|beauty|kosmetika|soch|hair|красот|космет/i, "fen atir"],
  [/zargarlik|jewel|украшен/i, "zargarlik"],
  [/o'yinchoq|toy|lego|игрушк/i, "o'yinchoq"],
];

/** Relationship labels → a recipient word the search understands (gender/kids). */
function recipientWord(criteria: GiftCriteria): string {
  const text = `${criteria.relationship || ""} ${criteria.recipient || ""}`.toLowerCase();
  const g = (criteria.gender || "").toLowerCase();
  if (/ona|mother|mom|мама|мать|buvi|grandma|бабушк/.test(text)) return "onam";
  if (/\bota|otam|father|dad|отец|пап|bobo|grandpa|дедушк/.test(text)) return "otam";
  if (/xotin|rafiqa|wife|жена|kelin/.test(text)) return "xotinim";
  if (/\ber\b|erim|husband|муж\b|kuyov/.test(text)) return "erim";
  if (/opa|singil|sister|сестр|qiz\b|qizim|daughter|доч/.test(text)) return "ayol";
  if (/aka|uka|brother|брат|o'g'il|son\b|сын/.test(text)) return "erkak";
  if (/bola|kid|child|ребен|ребён|дет/.test(text) || (criteria.age && criteria.age < 13)) return "bolalar";
  if (/female|ayol|woman|women|жен/.test(g)) return "ayol";
  if (/male|erkak|man|men|муж/.test(g)) return "erkak";
  if (/hamkasb|colleague|коллег/.test(text)) return "hamkasb";
  if (/rahbar|boshliq|boss|executive|руковод|начальник/.test(text)) return "rahbar";
  return "";
}

export function buildGiftQuery(criteria: GiftCriteria): string {
  const who = recipientWord(criteria);

  // 1. Interests → product types (all of them, so the results can mix e.g. coffee + books)
  const words: string[] = [];
  for (const raw of criteria.interests || []) {
    const hit = INTEREST_TERMS.find(([re]) => re.test(raw));
    if (hit) {
      for (const w of hit[1].split(" ")) if (!words.includes(w)) words.push(w);
    } else {
      const cleaned = raw.replace(/[^\w\s\u0400-\u04FF'-]/gi, " ").trim();
      if (cleaned.length > 2 && words.length < 4) words.push(cleaned);
    }
  }
  if (words.length > 0) {
    return `${who ? `${who} uchun ` : ""}${words.slice(0, 5).join(" ")}`.trim();
  }

  // 2. No interests: occasion + recipient
  const occasionMap: Record<Occasion, string> = {
    wedding: "to'y sovg'asi",
    birthday: "tug'ilgan kun sovg'asi",
    graduation: "bitiruv sovg'asi",
    anniversary: "yillik sovg'asi",
    new_baby: "chaqaloq sovg'asi",
    housewarming: "yangi uy sovg'asi",
    holiday: "bayramona sovg'a",
    teacher: "ustoz uchun sovg'a",
    friend: "do'st uchun sovg'a",
    family: "oila uchun sovg'a",
    corporate: "hamkasb uchun sovg'a",
    other: "sovg'a",
  };
  const occTerm = occasionMap[criteria.occasion] || "sovg'a";
  return who ? `${who} uchun ${occTerm}` : occTerm;
}

/** Remove results that contain anything the user asked to avoid. */
export function applyAvoidList<T extends { name: string }>(items: T[], avoid?: string[]): T[] {
  const terms = (avoid || []).map((a) => a.toLowerCase().trim()).filter((a) => a.length > 2);
  if (!terms.length) return items;
  return items.filter((it) => !terms.some((t) => it.name.toLowerCase().includes(t)));
}

export function buildGiftPromptContext(criteria: GiftCriteria): string {
  const parts: string[] = [];

  if (criteria.recipient) parts.push(`Sovg'a egasi: ${criteria.recipient}`);
  if (criteria.relationship) parts.push(`Munosabat: ${criteria.relationship}`);
  if (criteria.age) parts.push(`Yoshi: ${criteria.age}`);
  if (criteria.gender) parts.push(`Jinsi: ${criteria.gender}`);

  const currency = criteria.currency || "UZS";
  if (criteria.budgetMin && criteria.budgetMax) {
    parts.push(`Byudjet: ${criteria.budgetMin.toLocaleString()} - ${criteria.budgetMax.toLocaleString()} ${currency}`);
  } else if (criteria.budgetMax) {
    parts.push(`Byudjet: ${criteria.budgetMax.toLocaleString()} ${currency} gacha`);
  }

  if (criteria.interests?.length) {
    parts.push(`Qiziqishlar: ${criteria.interests.join(", ")}`);
  }
  if (criteria.avoid?.length) {
    parts.push(`Qilinmasin (Avoid): ${criteria.avoid.join(", ")}`);
  }

  const guidance = getOccasionGuidance(criteria.occasion);
  if (guidance) parts.push(`Tavsiya yo'riqnomasi: ${guidance}`);

  return parts.join("\n");
}

