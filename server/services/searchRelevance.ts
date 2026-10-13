/**
 * Search relevance for Sovg'a.
 *
 * Understands Uzbek, Russian and English queries well enough to:
 *  - recognise the product type being asked for (perfume, watch, toy, coffee machine…)
 *  - recognise who the gift is for (women / men / kids) and drop items for the opposite gender
 *  - match model numbers exactly ("iphone 15" ranks iPhone 15 above iPhone 14)
 *  - collapse the catalog's duplicated variants ("… Partiya-2", "… Model-3")
 */

export type Gender = "female" | "male";

export interface ProductText {
  name: string;
  brand?: string | null;
  description?: string | null;
  category?: string | null;
}

interface TypeGroup {
  key: string;
  /** Generic words in a query that ask for this product type. */
  triggers: string[];
  /** Words/phrases in a product name that mean it belongs to this type. */
  terms: string[];
  /** If any of these appear in the product name, it is NOT this type. */
  exclude?: string[];
}

const TYPE_GROUPS: TypeGroup[] = [
  {
    key: "perfume",
    triggers: ["atir", "parfyum", "parfum", "duxi", "perfume", "fragrance", "cologne", "odekolon", "духи", "парфюм", "парфюмерия", "туалетная вода", "аромат"],
    terms: ["atir", "parfyum", "parfum", "duxi", "perfume", "fragrance", "cologne", "eau de parfum", "eau de toilette", "eau tendre", "extrait", "edp", "edt", "tualet suvi", "духи", "парфюм", "туалетная вода"],
  },
  {
    key: "watch",
    triggers: ["soat", "watch", "smartwatch", "smart watch", "chasi", "часы", "смарт-часы", "умные часы", "fitnes braslet", "smart band"],
    terms: ["soat", "watch", "smartwatch", "smart band", "chasi", "часы", "fitnes braslet", "fitness band"],
  },
  {
    key: "headphones",
    triggers: ["naushnik", "quloqchin", "headphone", "headphones", "earbud", "earbuds", "earphone", "наушники", "наушник", "garnitura", "гарнитура"],
    terms: ["naushnik", "quloqchin", "headphone", "earbud", "earphone", "наушник", "airpods", "buds", "garnitura", "tws"],
  },
  {
    key: "speaker",
    triggers: ["kolonka", "karnay", "speaker", "колонка", "dinamik", "akustika", "акустика"],
    terms: ["kolonka", "karnay", "speaker", "колонка", "partybox", "soundbar", "akustika"],
  },
  {
    key: "phone",
    triggers: ["telefon", "smartfon", "phone", "smartphone", "телефон", "смартфон", "mobil telefon"],
    terms: ["telefon", "smartfon", "phone", "smartphone", "iphone", "galaxy", "redmi", "xiaomi", "poco", "honor", "pixel", "oneplus", "realme", "vivo", "oppo", "tecno", "infinix", "телефон", "смартфон"],
    exclude: ["watch", "buds", "band", "tab", "ipad", "pad", "book", "tv", "airpods", "noutbuk", "laptop", "televizor", "vacuum", "changyutgich", "kolonka", "speaker", "soat", "chehol", "case", "kabel", "cable", "adapter", "quvvatlagich", "charger", "powerbank", "steklo", "plenka"],
  },
  {
    key: "laptop",
    triggers: ["noutbuk", "laptop", "ноутбук", "notebook"],
    terms: ["noutbuk", "laptop", "ноутбук", "notebook", "macbook", "thinkpad", "vivobook", "zenbook", "ideapad", "pavilion", "inspiron", "aspire", "probook", "elitebook", "legion", "rog", "tuf"],
  },
  {
    key: "tablet",
    triggers: ["planshet", "tablet", "планшет"],
    terms: ["planshet", "tablet", "ipad", "galaxy tab", "matepad", "redmi pad", "xiaomi pad", "планшет"],
  },
  {
    key: "tv",
    triggers: ["televizor", "tv", "телевизор", "телик", "smart tv"],
    terms: ["televizor", "tv", "телевизор", "oled", "qled"],
    exclude: ["box", "pristavka", "kronshteyn"],
  },
  {
    key: "toy",
    triggers: ["o'yinchoq", "oyinchoq", "toy", "toys", "игрушка", "игрушки", "konstruktor", "конструктор", "qo'g'irchoq", "кукла", "lego"],
    terms: ["o'yinchoq", "oyinchoq", "toy", "lego", "konstruktor", "конструктор", "игрушк", "qo'g'irchoq", "кукл", "samokat", "velosiped", "jip", "pult bilan boshqariladigan"],
  },
  {
    key: "baby",
    triggers: ["chaqaloq anjomlari", "baby monitor", "beshik", "sterilizator", "детская кроватка"],
    terms: ["chaqaloq", "baby", "avent", "chicco", "beshik", "sterilizator", "monitori", "младен"],
  },
  {
    key: "coffee",
    triggers: ["kofe mashina", "kofe mashinasi", "kofemashina", "qahva mashinasi", "qahva mashina", "coffee machine", "coffee maker", "espresso", "кофемашина", "кофеварка", "kofe", "qahva", "coffee", "кофе"],
    terms: ["kofemashina", "qahvamashinasi", "qahva", "kofe", "coffee", "espresso", "kapuchino", "dolce gusto", "kahvekolik", "кофе"],
  },
  {
    key: "tea",
    triggers: ["choy", "choynak", "tea", "чай", "чайник", "piyola", "choy to'plami"],
    terms: ["choy", "choynak", "piyola", "tea", "чай", "чайник"],
  },
  {
    key: "kitchen",
    triggers: ["oshxona", "kitchen", "кухня", "qozon", "idish", "posuda", "посуда", "serviz", "сервиз"],
    terms: ["oshxona", "qozon", "mikser", "blender", "air fryer", "aerogril", "gril", "toster", "idish", "serviz", "servizi", "tarelka", "luminarc", "kitchenaid", "tefal", "choynak", "lag'an", "piyola", "pichoq", "кухн", "посуда"],
  },
  {
    key: "vacuum",
    triggers: ["changyutgich", "pilesos", "vacuum", "пылесос"],
    terms: ["changyutgich", "changyutgichi", "pilesos", "vacuum", "пылесос"],
  },
  {
    key: "book",
    triggers: ["kitob", "book", "books", "книга", "книги", "kindle"],
    terms: ["kitob", "book", "книг", "kindle", "adabiyot", "xamsa", "ertak", "bestseller"],
  },
  {
    key: "pen",
    triggers: ["ruchka", "pen", "ручка", "kanselyariya", "канцелярия"],
    terms: ["ruchka", "pen", "ballpoint", "parker", "ручка"],
  },
  {
    key: "jewelry",
    triggers: ["zargarlik", "uzuk", "sirg'a", "bilaguzuk", "marjon", "jewelry", "jewellery", "ring", "earrings", "necklace", "bracelet", "украшение", "кольцо", "серьги", "браслет", "колье"],
    terms: ["zargarlik", "uzuk", "sirg'a", "bilaguzuk", "marjon", "jewelry", "jewellery", "ring", "earring", "necklace", "bracelet", "украшен", "кольц", "серьг", "браслет", "колье"],
  },
  {
    key: "flowers",
    triggers: ["gul", "gullar", "guldasta", "atirgul", "flower", "flowers", "bouquet", "roses", "цветы", "букет", "розы"],
    terms: ["gul", "guldasta", "guldastasi", "atirgul", "flower", "bouquet", "rose", "цвет", "букет", "роз"],
  },
  {
    key: "shaver",
    triggers: ["britva", "ustara", "soqol", "shaver", "бритва", "trimmer", "trimer", "триммер"],
    terms: ["britva", "ustara", "ustarasi", "soqol", "shaver", "бритв", "trimmer", "trimer"],
  },
  {
    key: "hair",
    triggers: ["fen", "soch quritgich", "stayler", "hair dryer", "фен", "стайлер", "airwrap"],
    terms: ["fen", "feni", "stayler", "hair", "airwrap", "supersonic", "airstrait", "soch", "фен", "стайлер"],
  },
  {
    key: "scarf",
    triggers: ["sharf", "ro'mol", "scarf", "платок", "шарф", "atlas", "adras", "ipak"],
    terms: ["sharf", "sharfi", "ro'mol", "scarf", "платок", "шарф", "atlas", "adras", "ipak", "silk"],
  },
  {
    key: "wallet",
    triggers: ["hamyon", "wallet", "кошелек", "портмоне", "kamar", "belt", "ремень"],
    terms: ["hamyon", "hamyoni", "wallet", "кошел", "портмоне", "kamar", "belt", "ремень"],
  },
  {
    key: "bag",
    triggers: ["sumka", "ryukzak", "bag", "backpack", "сумка", "рюкзак", "chemodan", "suitcase", "чемодан"],
    terms: ["sumka", "ryukzak", "bag", "backpack", "сумк", "рюкзак", "chemodan", "suitcase", "чемодан"],
  },
  {
    key: "fridge",
    triggers: ["muzlatgich", "холодильник", "fridge", "refrigerator"],
    terms: ["muzlatgich", "muzlatgichi", "холодильник", "fridge", "refrigerator"],
  },
  {
    key: "washer",
    triggers: ["kir yuvish", "kir mashina", "стиральная", "washing machine", "washer"],
    terms: ["kir yuvish", "стиральн", "washing machine", "washer"],
  },
  {
    key: "ac",
    triggers: ["konditsioner", "konditsaner", "кондиционер", "air conditioner"],
    terms: ["konditsioner", "konditsioneri", "кондиционер", "air conditioner"],
  },
  {
    key: "console",
    triggers: ["pristavka", "playstation", "xbox", "nintendo", "приставка", "konsol", "console", "ps5", "ps4"],
    terms: ["pristavka", "playstation", "xbox", "nintendo", "приставк", "konsol", "console", "ps5", "ps4"],
  },
  {
    key: "camera",
    triggers: ["fotoapparat", "fotokamera", "camera", "фотоаппарат", "kamera"],
    terms: ["fotoapparat", "fotokamera", "camera", "фотоаппарат", "kamera", "gopro", "instax", "canon", "nikon"],
    exclude: ["iphone", "galaxy", "redmi", "telefon", "smartfon", "phone", "soat", "watch", "bolalar"],
  },
  {
    key: "bicycle",
    triggers: ["velosiped", "velik", "bike", "bicycle", "велосипед", "samokat", "самокат", "scooter"],
    terms: ["velosiped", "velosipedi", "bike", "bicycle", "велосипед", "samokat", "samokati", "самокат", "scooter"],
  },
];

const GROUP_BY_KEY = new Map(TYPE_GROUPS.map((g) => [g.key, g]));

/** What to suggest when a query names a person but not a product ("onam uchun sovg'a"). */
const RECIPIENT_DEFAULTS: Record<"female" | "male" | "kids" | "any", string[]> = {
  female: ["perfume", "scarf", "flowers", "hair", "jewelry", "tea", "kitchen", "coffee"],
  male: ["perfume", "watch", "shaver", "wallet", "pen", "headphones", "speaker"],
  kids: ["toy", "bicycle"],
  any: ["perfume", "watch", "headphones", "tea", "book", "flowers", "pen", "coffee", "speaker", "scarf"],
};

/** Occasion words map to sensible product types when no product was named. */
const OCCASIONS: Array<{ triggers: string[]; groups: string[] }> = [
  { triggers: ["to'y", "nikoh", "kelinsalom", "svadba", "wedding", "свадьба", "свадьбу", "свадебный"], groups: ["kitchen", "tea", "coffee", "vacuum", "fridge", "washer"] },
  { triggers: ["yangi uy", "uy to'yi", "housewarming", "новоселье"], groups: ["kitchen", "coffee", "tea", "vacuum"] },
  { triggers: ["tug'ilgan kun", "tugilgan kun", "birthday", "день рождения", "днем рождения"], groups: [] },
  { triggers: ["chaqaloq", "beshik to'y", "new baby", "newborn", "новорожденный", "новорожденного"], groups: ["baby", "toy"] },
  { triggers: ["ustoz", "ustozga", "o'qituvchi", "o'qituvchiga", "muallim", "teacher", "учитель", "учителю", "учительнице"], groups: ["book", "pen", "tea"] },
  { triggers: ["bitiruv", "graduation", "выпускной", "выпуск"], groups: ["watch", "headphones", "pen", "book"] },
  { triggers: ["hamkasb", "hamkasbga", "rahbar", "rahbarga", "boshliq", "colleague", "boss", "коллега", "коллеге", "руководителю", "начальнику", "corporate", "biznes"], groups: ["pen", "wallet", "book", "tea", "coffee"] },
  { triggers: ["8 mart", "8-mart", "xotin-qizlar", "8 марта"], groups: ["perfume", "flowers", "scarf", "hair", "jewelry"] },
  { triggers: ["yillik", "yubiley", "anniversary", "годовщина", "юбилей"], groups: ["perfume", "jewelry", "flowers", "watch"] },
  { triggers: ["bayram", "bayramona", "navro'z", "yangi yil", "holiday", "new year", "праздник", "новый год"], groups: ["tea", "coffee", "flowers", "perfume", "speaker"] },
  { triggers: ["oila", "oilaga", "family", "семья", "семьи"], groups: ["kitchen", "tea", "coffee", "vacuum"] },
  { triggers: ["do'st", "do'stga", "do'stim", "do'stimga", "friend", "друг", "другу", "подруге"], groups: [] },
];

/**
 * Words added by the "Refine" chips (fast delivery, cheaper, installments, premium, discounts).
 * They change the ORDER of results, not which products match.
 */
const MODIFIER_WORDS = new Set([
  "express", "1-day", "delivery", "fast", "tashkent", "toshkentda", "toshkent", "kunda", "kun", "yetkazib", "yetkazish", "berish", "быстрая", "доставка", "доставкой", "ташкенте", "день", "за",
  "affordable", "high-quality", "alternatives", "arzonroq", "variantlar", "доступные", "качественные", "альтернативы",
  "installments", "installment", "nasiya", "bo'lib", "to'lash", "рассрочку", "рассрочка", "без", "переплат",
  "top-tier", "premium", "authentic", "flagship", "sifatli", "премиум", "флагман", "оригинал",
  "biggest", "verified", "sale", "discount", "katta", "chegirmadagi", "chegirma", "aksiya", "максимальной", "скидкой", "акции", "по",
]);

export type QueryModifier = "fast" | "cheap" | "installments" | "premium" | "discount";

function detectModifiers(norm: string): QueryModifier[] {
  const m: QueryModifier[] = [];
  if (/(express|1-day|yetkazib|yetkazish|доставк)/.test(norm)) m.push("fast");
  if (/(affordable|arzonroq|доступн|недорог)/.test(norm)) m.push("cheap");
  if (/(installment|nasiya|bo'lib to'lash|рассрочк)/.test(norm)) m.push("installments");
  if (/(premium|flagship|top-tier|премиум|флагман)/.test(norm)) m.push("premium");
  if (/(discount|chegirma|aksiya|скидк|акци|\bsale\b)/.test(norm)) m.push("discount");
  return m;
}

const STOPWORDS = new Set([
  // uz
  "uchun", "bilan", "va", "eng", "yaxshi", "arzon", "arzonroq", "yangi", "narxi", "narx", "qancha", "gacha", "dan", "ga", "haqida",
  "sovg'a", "sovga", "sovg'asi", "sovgasi", "sovg'alar", "sotib", "olish", "olmoqchiman", "kerak", "menga", "bir", "ta", "ming", "so'm", "som", "mln", "million",
  "toshkent", "uzbekistan", "o'zbekiston", "zo'r", "chiroyli", "sifatli", "original", "do'kon", "kupit",
  // ru
  "для", "и", "на", "в", "с", "подарок", "подарки", "купить", "цена", "недорого", "дешево", "лучший", "лучшие", "новый", "до", "тысяч", "сум",
  // en
  "in", "on", "at", "my", "me", "from", "by", "is", "it", "who", "likes", "like", "loves", "some", "something",
  "for", "the", "a", "an", "gift", "gifts", "present", "best", "cheap", "buy", "price", "with", "and", "of", "to", "under", "new", "good", "nice", "top", "idea", "ideas",
]);

const BRANDISH = new Set(["lego", "airwrap", "kindle", "playstation", "xbox", "nintendo", "ps5", "ps4", "airpods", "ipad", "macbook", "dyson", "gopro", "instax", "parker"]);

const UZ_MARKERS = new Set(["uchun", "bilan", "menga", "kerak", "sovg'a", "sovga", "gacha"]);

const FEMALE_WORDS = new Set([
  "ayol", "ayollar", "ayolga", "ayollarga", "ayolim", "ayolimga", "qiz", "qizga", "qizlar", "qizlarga", "qizim", "qizimga",
  "ona", "onam", "onamga", "onaga", "onajon", "onajonim", "onajonimga", "opa", "opam", "opamga", "singil", "singlim", "singlimga",
  "xotin", "xotinim", "xotinimga", "rafiqa", "rafiqam", "rafiqamga", "kelin", "kelinga", "kelinimga", "buvi", "buvim", "buvimga",
  "dugona", "dugonam", "dugonamga", "kelinoyim", "yangam",
  "women", "woman", "women's", "womens", "female", "her", "ladies", "lady", "girl", "girls", "girlfriend", "mom", "mum", "mother", "wife",
  "sister", "grandma", "grandmother", "daughter", "femme",
]);
const MALE_WORDS = new Set([
  "erkak", "erkaklar", "erkakka", "erkaklarga", "ota", "otam", "otamga", "otaga", "otajon", "otajonim", "dada", "dadam", "dadamga",
  "aka", "akam", "akamga", "uka", "ukam", "ukamga", "erim", "erimga", "yigit", "yigitga", "yigitim", "yigitimga", "bobo", "bobom", "bobomga",
  "kuyov", "kuyovga", "o'g'il", "o'g'lim", "o'g'limga", "o'g'ilga",
  "man", "men's", "mens", "male", "him", "boy", "boyfriend", "dad", "father", "husband", "brother", "grandpa", "grandfather", "son", "homme",
]);
const FEMALE_RU = /^(женщин|женск|девушк|девочк|мам[аеуы]?$|жен[аеуы]?$|сестр|бабушк|доч|подруг)/;
const MALE_RU = /^(мужчин|мужск|муж[уа]?$|пап[аеуы]?$|отц|отец|брат|дедушк|парн|сын|мальчик)/;

const KIDS_WORDS = new Set(["bola", "bolalar", "bolaga", "bolalarga", "bolam", "bolamga", "farzand", "farzandim", "chaqaloq", "chaqaloqqa", "kid", "kids", "child", "children", "baby", "toddler", "teen"]);
const KIDS_RU = /^(дет|ребен|ребён|малыш|младен)/;

const ACCESSORY_RE = /himoya oyna|ekran himoya|защитн|kronshteyn|кронштейн|tozalash vositasi|vositasi|descal|ohakdan|kapsula|zapchast|ehtiyot qism|chehol|kabel|shnur|adapter|steklo|plenka|\bcase\b|cable|cover|g'?ilof|ushlagich|shtativ|powerbank|remeshok|quvvatlagich|podstavka|zashchitn|perehodnik|zaryad|charger|чехол|кабель|стекло|зарядн/i;

const FEMALE_PRODUCT_PHRASES = [
  "ayol", "ayollar", "ayollar uchun", "qizlar", "women", "woman", "womens", "women's", "female", "femme", "pour femme", "for her", "ladies", "lady", "girl", "girls",
  // well-known women's fragrance lines
  "libre", "chance", "coco mademoiselle", "mademoiselle", "j'adore", "miss dior", "black opium", "la vie est belle", "good girl", "flowerbomb", "idole", "si passione", "alien", "bright crystal", "daisy", "my way",
];
const MALE_PRODUCT_PHRASES = [
  "erkak", "erkaklar", "erkaklar uchun", "men", "mens", "men's", "male", "homme", "pour homme", "for him", "uomo", "boy", "boys",
  // well-known men's fragrance lines
  "sauvage", "bleu de chanel", "eros", "aventus", "y eau de parfum", "acqua di gio", "invictus", "one million", "1 million", "boss bottled", "terre d'hermes", "allure homme",
];

// ───────────────────────── text helpers ─────────────────────────

export function normalizeText(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .replace(/[ʻʼ’‘`´]/g, "'")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}'\s.+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensOf(norm: string): string[] {
  return norm
    .split(" ")
    .map((t) => t.replace(/^['.+-]+|['.+-]+$/g, ""))
    .filter(Boolean);
}

const UZ_SUFFIXES = [
  "larimizga", "laringizga", "larimizni", "larimiz", "laringiz", "lariga", "larini", "laridan", "larida", "larga", "larni", "larda", "lardan", "lari", "lar",
  "imizga", "imizni", "imiz", "ingiz", "imga", "iga", "ini", "idan", "ida", "ning", "dan", "da", "ga", "ka", "qa", "ni", "si", "i",
];
const RU_SUFFIXES = [
  "ями", "ами", "ого", "его", "ому", "ему", "ыми", "ими", "ов", "ев", "ей", "ий", "ый", "ой", "ая", "яя", "ое", "ее", "ые", "ие", "ых", "их",
  "ам", "ям", "ах", "ях", "ом", "ем", "а", "я", "ы", "и", "у", "ю", "е", "о",
];

export function stem(word: string): string {
  let s = word.replace(/'s$/, "");
  if (!s || /^\d/.test(s)) return s;
  if (/[а-я]/.test(s)) {
    for (const suf of RU_SUFFIXES) {
      if (s.endsWith(suf) && s.length - suf.length >= 3) return s.slice(0, -suf.length);
    }
    return s;
  }
  for (const suf of UZ_SUFFIXES) {
    if (s.endsWith(suf) && s.length - suf.length >= 3) {
      s = s.slice(0, -suf.length);
      break;
    }
  }
  if (/(ch|sh|x|ss)es$/.test(s) && s.length > 5) s = s.slice(0, -2);
  else if (s.endsWith("s") && !s.endsWith("ss") && s.length > 3) s = s.slice(0, -1);
  return s;
}

function hasPhrase(norm: string, phrase: string): boolean {
  return (" " + norm + " ").includes(" " + phrase + " ");
}

/** True if a product's text contains a term (single word by stem, multi-word as phrase). */
function textHasTerm(norm: string, stems: string[], term: string): boolean {
  const t = normalizeText(term);
  if (t.includes(" ")) return norm.includes(t);
  const ts = stem(t);
  // long words also match as a word prefix ("kronshteyn" in "kronshteyni")
  if (t.length >= 6 && (" " + norm).includes(" " + t)) return true;
  for (const s of stems) {
    if (s === ts) return true;
    if (ts.length >= 6 && s.startsWith(ts)) return true;
    // Cyrillic stems written as prefixes in the term lists ("игрушк", "кукл")
    if (/[а-я]/.test(ts) && ts.length >= 4 && s.startsWith(ts)) return true;
  }
  return false;
}

/** Collapse the catalog's generated variants: "Foo Partiya-2" → "Foo". */
export function baseProductName(name: string): string {
  return (name || "")
    .replace(/\s+(Model|Seriya|Partiya|Edition|To'plam|Uslub|Variant)-\d+$/i, "")
    .replace(/\s*\(Maxsus Variant \d+\)$/i, "")
    .replace(/\s*\(Ver\.\s*\d+\)$/i, "")
    .trim();
}

/** Show the brand in front of names that leave it out ("Buds 5 Pro" → "Xiaomi Buds 5 Pro"). */
export function displayProductName(name: string, brand?: string | null): string {
  const base = baseProductName(name);
  if (!brand) return base;
  const b = brand.trim();
  if (!b || base.toLowerCase().includes(b.toLowerCase())) return base;
  return `${b} ${base}`;
}

export function productGender(p: ProductText): Gender | null {
  const check = (raw: string | null | undefined): Gender | null => {
    const norm = normalizeText(raw);
    if (!norm) return null;
    if (/(uniseks|unisex|унисекс)/.test(norm)) return null;
    const toks = tokensOf(norm);
    const f = FEMALE_PRODUCT_PHRASES.some((ph) => hasPhrase(norm, ph)) || toks.some((t) => FEMALE_RU.test(t) && !/^жен[аеуы]?$/.test(t));
    const m = MALE_PRODUCT_PHRASES.some((ph) => hasPhrase(norm, ph)) || toks.some((t) => /^(мужск|мужчин)/.test(t));
    if (f && !m) return "female";
    if (m && !f) return "male";
    return null;
  };
  return check(`${p.brand || ""} ${p.name}`) ?? null;
}

function isKidsProduct(p: ProductText): boolean {
  const norm = normalizeText(`${p.name} ${p.category || ""}`);
  return /\b(bolalar|bola|kids|baby|chaqaloq|o'smirlar|toddler)\b/.test(norm) || /(детск|ребен|ребён|малыш)/.test(norm);
}

// ───────────────────────── query analysis ─────────────────────────

export interface QueryAnalysis {
  norm: string;
  gender: Gender | null;
  kids: boolean;
  groups: TypeGroup[];
  /** Groups implied by the recipient when no product type was named. */
  softGroups: TypeGroup[];
  content: string[];
  numbers: string[];
  wantsAccessory: boolean;
  /** Query names only a recipient/occasion, no product. */
  recipientOnly: boolean;
  /** Ordering hints from the refine chips. */
  modifiers: QueryModifier[];
  /** Product types implied by an occasion ("to'y" → kitchen…), used if nothing else matches. */
  occasionGroups: TypeGroup[];
}

export function analyzeQuery(query: string): QueryAnalysis {
  const norm = normalizeText(query);
  const toks = tokensOf(norm);
  const looksUzbek = toks.some((t) => UZ_MARKERS.has(t));

  let female = false;
  let male = false;
  let kids = false;
  const consumed = new Set<number>();

  toks.forEach((t, i) => {
    if (FEMALE_WORDS.has(t) || FEMALE_RU.test(t)) { female = true; consumed.add(i); }
    else if (MALE_WORDS.has(t) || MALE_RU.test(t) || (t === "men" && !looksUzbek)) { male = true; consumed.add(i); }
    if (KIDS_WORDS.has(t) || KIDS_RU.test(t)) { kids = true; consumed.add(i); }
  });

  const tokStems = toks.map(stem);

  // Occasions
  const occasionGroups: string[] = [];
  let occasionHit = false;
  for (const occ of OCCASIONS) {
    for (const trig of occ.triggers) {
      const tn = normalizeText(trig);
      if (tn.includes(" ") || tn.includes("-")) {
        if (norm.includes(tn)) {
          occasionHit = true;
          occasionGroups.push(...occ.groups);
          const parts = tn.split(/[ -]/);
          toks.forEach((t, i) => { if (parts.includes(t) || parts.includes(stem(t))) consumed.add(i); });
        }
      } else {
        toks.forEach((t, i) => {
          if (t === tn || tokStems[i] === stem(tn)) { occasionHit = true; occasionGroups.push(...occ.groups); consumed.add(i); }
        });
      }
    }
  }

  // Product type triggers (multi-word first)
  const groups: TypeGroup[] = [];
  for (const g of TYPE_GROUPS) {
    let hit = false;
    for (const trig of g.triggers) {
      const tn = normalizeText(trig);
      if (tn.includes(" ")) {
        if (norm.includes(tn)) {
          hit = true;
          const parts = tn.split(" ");
          toks.forEach((t, i) => { if (parts.includes(t) || parts.map(stem).includes(stem(t))) consumed.add(i); });
        }
      } else {
        const ts = stem(tn);
        toks.forEach((t, i) => {
          if (t === tn || tokStems[i] === ts) { hit = true; consumed.add(i); }
        });
      }
    }
    if (hit) groups.push(g);
  }

  const content: string[] = [];
  const numbers: string[] = [];
  toks.forEach((t, i) => {
    // Brand-like trigger words also narrow the results ("lego" → Lego sets first, not any toy)
    if (consumed.has(i) && BRANDISH.has(t)) { content.push(stem(t)); return; }
    if (consumed.has(i) || STOPWORDS.has(t) || MODIFIER_WORDS.has(t)) return;
    if (/^\d+$/.test(t)) {
      // ignore budget-like numbers ("500 ming", "1000000")
      if (t.length >= 5) return;
      if (t === "0") return; // "0% installments"
      const next = toks[i + 1];
      if (next && /^(ming|mln|million|тыс|тысяч|k|000|kun|kunda|kunlik|day|days|день|дня|дней|soat|часа)$/.test(next)) return;
      numbers.push(t);
      return;
    }
    if (t.length < 2) return;
    content.push(stem(t));
  });

  const gender: Gender | null = female && !male ? "female" : male && !female ? "male" : null;
  const recipientOnly = groups.length === 0 && content.length === 0 && numbers.length === 0;
  let softGroups: TypeGroup[] = [];
  if (recipientOnly) {
    let keys: string[];
    if (kids) keys = occasionGroups.length ? occasionGroups : RECIPIENT_DEFAULTS.kids;
    else if (occasionGroups.length && !gender) keys = occasionGroups;
    else if (occasionGroups.length && gender) keys = [...RECIPIENT_DEFAULTS[gender].slice(0, 4), ...occasionGroups];
    else keys = gender ? RECIPIENT_DEFAULTS[gender] : RECIPIENT_DEFAULTS.any;
    softGroups = [...new Set(keys)].map((k) => GROUP_BY_KEY.get(k)!).filter(Boolean);
  }
  void occasionHit;

  return {
    norm,
    gender,
    kids,
    groups,
    softGroups,
    content,
    numbers,
    wantsAccessory: ACCESSORY_RE.test(norm),
    recipientOnly,
    modifiers: detectModifiers(norm),
    occasionGroups: [...new Set(occasionGroups)].map((k) => GROUP_BY_KEY.get(k)!).filter(Boolean),
  };
}

// ───────────────────────── scoring ─────────────────────────

function productMatchesGroup(nameNorm: string, nameStems: string[], g: TypeGroup): boolean {
  if (g.exclude && g.exclude.some((ex) => textHasTerm(nameNorm, nameStems, ex))) return false;
  return g.terms.some((term) => textHasTerm(nameNorm, nameStems, term));
}

export interface ScoredProduct {
  score: number;
  typeMatch: boolean;
  excluded: boolean;
}

export function scoreProduct(a: QueryAnalysis, p: ProductText): ScoredProduct {
  const nameNorm = normalizeText(`${p.brand || ""} ${p.name}`);
  const nameStems = tokensOf(nameNorm).map(stem);
  const descNorm = normalizeText(p.description || "");
  const descStems = descNorm ? tokensOf(descNorm).map(stem) : [];

  let score = 0;
  let excluded = false;

  // 1. Product type
  const groups = a.groups.length ? a.groups : a.softGroups;
  let typeMatch = false;
  if (groups.length) {
    typeMatch = groups.some((g) => productMatchesGroup(nameNorm, nameStems, g));
    if (typeMatch) score += a.groups.length ? 60 : 40;
  }

  // 2. Content words (brands, models, adjectives)
  let matchedInName = 0;
  for (const c of a.content) {
    const inName = nameStems.some((s) => s === c || (c.length >= 4 && s.startsWith(c)));
    if (inName) {
      score += 25;
      matchedInName++;
    } else if (descStems.some((s) => s === c || (c.length >= 4 && s.startsWith(c)))) {
      score += 6;
    }
  }

  // 3. Model numbers must match exactly ("15" ≠ "14", "15" ≠ "150")
  let numbersMatched = 0;
  for (const n of a.numbers) {
    // "15" matches "15" or "15pro", but not "a15", "150" or "15gb"
    const re = new RegExp(`^${n}([^\\d]|$)`);
    if (tokensOf(nameNorm).some((t) => re.test(t) && !/^\d+(gb|tb|mm|ml|l|w|mah|sm|kg|dyuym|hz)$/.test(t))) {
      score += 25;
      numbersMatched++;
    } else {
      score -= 20;
    }
  }
  const wantedWords = a.content.length + a.numbers.length;
  if (wantedWords > 0 && matchedInName + numbersMatched === wantedWords) score += 30;

  // 4. Who it's for
  if (a.gender) {
    const pg = productGender(p);
    if (pg && pg !== a.gender) excluded = true;
    else if (pg === a.gender) score += 15;
  }
  const kidsItem = isKidsProduct(p);
  if (a.kids && kidsItem) score += 20;
  if (!a.kids && kidsItem && (a.gender || a.groups.length)) score -= 30;

  // 5. Accessories only when asked for — including "X uchun …" / "для X" items (a mount *for* a TV, a cleaner *for* a coffee machine)
  if (!a.wantsAccessory) {
    if (ACCESSORY_RE.test(nameNorm)) score -= 60;
    else if (a.groups.length && /\b\S+ uchun\b|для /.test(nameNorm)) {
      const forType = a.groups.some((g) =>
        g.terms.concat(g.triggers).some((term) => {
          const tn = normalizeText(term);
          return tn.length >= 2 && (nameNorm.includes(`${tn} uchun`) || nameNorm.includes(`${tn}i uchun`) || nameNorm.includes(`${tn}si uchun`) || nameNorm.includes(`для ${tn}`));
        })
      );
      if (forType) score -= 60;
    }
  }

  return { score, typeMatch, excluded };
}

export interface RankOptions {
  /** Max number of weaker "related" matches to append after the strong ones. */
  maxRelated?: number;
}

/**
 * Filter and order items by relevance to a query.
 * Returns strong matches first (caller may re-sort them, e.g. by price), then a few related ones.
 */
export function rankByRelevance<T>(
  query: string | QueryAnalysis,
  items: T[],
  getText: (item: T) => ProductText,
  opts: RankOptions = {}
): Array<{ item: T; score: number; strong: boolean }> {
  const a = typeof query === "string" ? analyzeQuery(query) : query;
  const scored = items
    .map((item) => ({ item, ...scoreProduct(a, getText(item)) }))
    .filter((s) => !s.excluded);

  const hasTypes = a.groups.length > 0 || a.softGroups.length > 0;
  const anyType = hasTypes && scored.some((s) => s.typeMatch);
  const pool = anyType ? scored.filter((s) => s.typeMatch) : scored;
  const positive = pool.filter((s) => s.score > 0);
  if (positive.length === 0) {
    // "wedding gift for my colleague's sister" → nothing matched the extra words; use the occasion's product types
    if (a.occasionGroups.length && a.softGroups.length === 0) {
      return rankByRelevance({ ...a, groups: [], content: [], numbers: [], softGroups: a.occasionGroups, occasionGroups: [] }, items, getText, opts);
    }
    return [];
  }

  const top = Math.max(...positive.map((s) => s.score));
  const cut = top * 0.6;
  const strong = positive.filter((s) => s.score >= cut).sort((x, y) => y.score - x.score);
  const related = positive
    .filter((s) => s.score < cut)
    .sort((x, y) => y.score - x.score)
    .slice(0, strong.length >= 6 ? 0 : opts.maxRelated ?? 8);

  return [
    ...strong.map((s) => ({ item: s.item, score: s.score, strong: true })),
    ...related.map((s) => ({ item: s.item, score: s.score, strong: false })),
  ];
}

/** Lightweight check used to drop clearly wrong items from AI / live results. */
export function isClearlyIrrelevant(a: QueryAnalysis, p: ProductText): boolean {
  const s = scoreProduct(a, p);
  if (s.excluded) return true;
  if (a.groups.length > 0 && !s.typeMatch) return true;
  return false;
}

/** True when a product name contains every brand/model word and number from the query. */
export function matchesAllWords(query: string, name: string, minRatio = 1): boolean {
  const a = analyzeQuery(query);
  const s = scoreProduct(a, { name });
  if (s.excluded) return false;
  const nameNorm = normalizeText(name);
  const stems = tokensOf(nameNorm).map(stem);
  const hits = a.content.filter((c) => stems.some((t) => t === c || (c.length >= 4 && t.startsWith(c)))).length;
  // The first word is usually the brand or model family and must always match
  const firstOk = a.content.length === 0 || stems.some((t) => t === a.content[0] || (a.content[0].length >= 4 && t.startsWith(a.content[0])));
  // Model codes like "s24", "wh-1000xm5", "a55" must always match, even in lenient mode
  const VARIANT = new Set(["pro", "max", "plu", "plus", "ultra", "mini", "lite", "fe", "air", "se"]);
  const codesOk = a.content
    .filter((c) => /\d/.test(c) || VARIANT.has(c))
    .every((c) => stems.some((t) => t === c || (/\d/.test(c) && t.startsWith(c))));
  const wordsOk = firstOk && codesOk && hits >= Math.ceil(a.content.length * minRatio);
  const numsOk = a.numbers.every((n) => tokensOf(nameNorm).some((t) => new RegExp(`^${n}([^\\d]|$)`).test(t)));
  if (a.content.length + a.numbers.length === 0) return s.typeMatch;
  return wordsOk && numsOk && (a.groups.length === 0 || s.typeMatch);
}

/** What to type into a store's own search box for each product type. */
const STORE_TERMS: Record<string, string> = {
  perfume: "atir", watch: "aqlli soat", headphones: "quloqchin", speaker: "kolonka", phone: "smartfon", laptop: "noutbuk",
  tablet: "planshet", tv: "televizor", toy: "o'yinchoq", baby: "chaqaloq", coffee: "kofe mashinasi", tea: "choy to'plami",
  kitchen: "oshxona", vacuum: "changyutgich", book: "kitob", pen: "ruchka", jewelry: "zargarlik", flowers: "gul",
  shaver: "soqol olish mashinasi", hair: "fen", scarf: "ro'mol", wallet: "hamyon", bag: "sumka", fridge: "muzlatgich",
  washer: "kir yuvish mashinasi", ac: "konditsioner", console: "playstation", camera: "fotoapparat", bicycle: "velosiped",
};

/**
 * Turn a shopper's query into 1–3 searches a store understands.
 * "ayollar uchun atir 500 ming gacha" → ["ayollar atir"]; "onam uchun sovg'a" → ["ayollar atir", "ro'mol", "gul"].
 */
export function storeSearchQueries(query: string): string[] {
  const a = analyzeQuery(query);
  const cyr = /[а-я]/.test(a.norm);
  const genderWord = a.gender === "female" ? (cyr ? "женские" : "ayollar") : a.gender === "male" ? (cyr ? "мужские" : "erkaklar") : "";
  const genderedTypes = new Set(["perfume", "watch", "wallet", "bag", "shaver", "hair", "scarf", "jewelry"]);

  if (a.recipientOnly) {
    const groups = (a.softGroups.length ? a.softGroups : a.occasionGroups).slice(0, 3);
    return groups.map((g) => `${genderWord && genderedTypes.has(g.key) ? genderWord + " " : ""}${STORE_TERMS[g.key] || g.triggers[0]}`.trim());
  }

  const norm = a.norm;
  const toks = norm.split(" ").filter(Boolean);
  const kept: string[] = [];
  toks.forEach((t, i) => {
    const bare = t.replace(/^['.+-]+|['.+-]+$/g, "");
    if (!bare) return;
    if (STOPWORDS.has(bare) || MODIFIER_WORDS.has(bare)) return;
    if (FEMALE_WORDS.has(bare) || MALE_WORDS.has(bare) || FEMALE_RU.test(bare) || MALE_RU.test(bare)) return;
    if (KIDS_WORDS.has(bare) && a.groups.length) return;
    if (/^\d+$/.test(bare)) {
      const next = toks[i + 1];
      if (bare.length >= 5 || (next && /^(ming|mln|million|тыс|тысяч|k|000)$/.test(next))) return;
    }
    if (/^(ming|mln|million|тыс|тысяч|gacha|до)$/.test(bare)) return;
    kept.push(bare);
  });
  const typed = a.groups.some((g) => genderedTypes.has(g.key));
  const main = `${genderWord && typed ? genderWord + " " : ""}${kept.join(" ")}`.trim();
  const out = main ? [main] : [];
  // A second, simpler search helps when the full phrase is too specific for the store
  if (a.groups.length && kept.length > 2) out.push(STORE_TERMS[a.groups[0].key] || a.groups[0].triggers[0]);
  else if (kept.length > 3) out.push(kept.slice(0, 3).join(" "));
  return out.length ? out : [query];
}

/** Which suggested product type (for "onam uchun sovg'a"-style queries) an item belongs to, if any. */
export function softGroupKey(a: QueryAnalysis, p: ProductText): string | null {
  const nameNorm = normalizeText(`${p.brand || ""} ${p.name}`);
  const stems = tokensOf(nameNorm).map(stem);
  const groups = a.softGroups.length ? a.softGroups : a.occasionGroups;
  for (const g of groups) if (productMatchesGroup(nameNorm, stems, g)) return g.key;
  return null;
}
