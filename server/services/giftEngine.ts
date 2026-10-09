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

export function buildGiftQuery(criteria: GiftCriteria): string {
  // 1. If user specified specific interests, select the strongest shopping term
  if (criteria.interests && criteria.interests.length > 0) {
    const rawInterest = criteria.interests[0];
    if (/qahva|kofe/i.test(rawInterest)) return "kofe mashinasi";
    if (/oshxona|tovoq|serviz|ovqat/i.test(rawInterest)) return "oshxona to'plami";
    if (/quloqchin|naushnik|musiqa/i.test(rawInterest)) return "quloqchin naushnik";
    if (/aqlli uy|smart home/i.test(rawInterest)) return "aqlli uy gadjet";
    if (/kulol|rishton|san'at/i.test(rawInterest)) return "rishton choy to'plami";
    if (/soat|watch/i.test(rawInterest)) return "smart soat";
    if (/kitob/i.test(rawInterest)) return "kitob to'plami";
    if (/fitnes|sport/i.test(rawInterest)) return "sport mashg'ulot";
    if (/changyutgich|pilesos/i.test(rawInterest)) return "robot changyutgich";

    // Clean up general tags
    const cleaned = rawInterest.replace(/[^\w\s\u0400-\u04FF'-]/gi, " ").trim();
    if (cleaned.length > 2) return cleaned;
  }

  // 2. Otherwise, map occasion to realistic Uzbek gift query
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
    corporate: "biznes sovg'a",
    other: "sovg'a to'plami",
  };

  const occTerm = occasionMap[criteria.occasion] || "sovg'a";

  if (criteria.budgetMax && criteria.budgetMax > 0 && criteria.budgetMax <= 1500000) {
    const k = Math.round(criteria.budgetMax / 1000);
    return `${occTerm} ${k} ming gacha`;
  }

  return occTerm;
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

