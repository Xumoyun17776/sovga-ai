// Client-side image fallback resolver for Sovg'a AI
// Precedence order: TVs, Appliances, Laptops, Audio, Watches, Flowers BEFORE Phones

export function getProductFallbackImage(name: string, category?: string): string {
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();

  // Phones first when the name clearly is one: "Samsung Galaxy A55" must not match the TV rule (…55 inch).
  const looksLikePhone =
    /(galaxy|iphone|redmi|poco|pixel|honor|realme|vivo|oppo|tecno|infinix|smartfon|smartphone|telefon)/.test(n) &&
    !/(\btv\b|televizor|watch|soat|buds|planshet|\btab\b|\bpad\b|ipad)/.test(n);
  if (looksLikePhone) return phoneFallback(n, c) || GENERIC_PHONE;

  // 1. Televizorlar & Smart TV
  if (
    c.includes("televizor") ||
    c.includes("tv") ||
    n.includes("televizor") ||
    n.includes("televizori") ||
    n.includes("smart tv") ||
    n.includes("android tv") ||
    n.includes("google tv") ||
    n.includes("oled") ||
    n.includes("qled") ||
    n.includes("smart led") ||
    /\b(tv)\b/i.test(n) ||
    /artel.*(?:24|32|40|43|50|55|65|75|85|ah90|au20|h35|h37|a65)/i.test(n) ||
    /shivaki.*(?:24|32|40|43|50|55|65|75|shtv)/i.test(n) ||
    /tcl.*(?:24|32|40|43|50|55|65|75|85|s54|p635|c645|c745|t6d)/i.test(n) ||
    /samsung.*(?:24|32|40|43|50|55|65|75|85|cu\d|du\d|crystal)/i.test(n) ||
    /lg.*(?:24|32|40|43|50|55|65|75|85|ur\d|ut\d|nano)/i.test(n) ||
    /hisense.*(?:32|40|43|50|55|65|75)/i.test(n) ||
    /xiaomi.*(?:tv|a2|p1|pro\s*55)/i.test(n)
  ) {
    return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop";
  }

  // 2. Muzlatgichlar
  if (
    c.includes("muzlatgich") ||
    c.includes("xolodilnik") ||
    c.includes("fridge") ||
    n.includes("muzlatgich") ||
    n.includes("xolodilnik") ||
    n.includes("refrigerator") ||
    n.includes("no frost") ||
    /artel.*hd\s*(?:276|341)/i.test(n) ||
    /shivaki.*bcd/i.test(n)
  ) {
    return "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop";
  }

  // 3. Kir yuvish mashinalari
  if (
    c.includes("kir yuvish") ||
    c.includes("stiralnaya") ||
    c.includes("wash") ||
    n.includes("kir yuvish") ||
    n.includes("stiralnaya") ||
    n.includes("washing machine") ||
    /lg.*(?:f2v|inverter\s*kir)/i.test(n) ||
    /artel.*grand\s*duo/i.test(n)
  ) {
    return "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop";
  }

  // 4. Changyutgichlar
  if (
    c.includes("changyutgich") ||
    c.includes("pilesos") ||
    c.includes("vacuum") ||
    n.includes("pilesos") ||
    n.includes("changyutgich") ||
    n.includes("dyson") ||
    n.includes("robot changyutgich")
  ) {
    return "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop";
  }

  // 5. Noutbuklar
  if (n.includes("macbook pro")) return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop";
  if (n.includes("macbook air") || n.includes("macbook")) return "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop";
  if (
    c.includes("noutbuk") ||
    c.includes("laptop") ||
    n.includes("noutbuk") ||
    n.includes("laptop") ||
    n.includes("ideapad") ||
    n.includes("vivobook") ||
    n.includes("thinkpad") ||
    n.includes("victus") ||
    n.includes("pavilion") ||
    n.includes("zenbook") ||
    n.includes("aspire") ||
    /lenovo.*(?:core|ryzen|intel|i3|i5|i7)/i.test(n) ||
    /asus.*(?:core|ryzen|intel|i3|i5|i7)/i.test(n) ||
    /hp.*(?:core|ryzen|intel|i3|i5|i7|250)/i.test(n)
  ) {
    return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop";
  }

  // 6. Audio & Quloqchinlar
  if (n.includes("airpods pro") || n.includes("airpod pro")) return "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop";
  if (n.includes("airpods max")) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop";
  if (n.includes("airpods") || n.includes("airpod")) return "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop";
  if (
    c.includes("audio") ||
    c.includes("headphone") ||
    c.includes("quloqchin") ||
    n.includes("naushnik") ||
    n.includes("sony wh") ||
    n.includes("headphone") ||
    n.includes("quloqchin") ||
    n.includes("earbuds") ||
    n.includes("earphone") ||
    n.includes("tws") ||
    n.includes("buds") ||
    n.includes("haylou") ||
    n.includes("baseus") ||
    n.includes("anker") ||
    n.includes("soundcore")
  ) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop";
  }

  // 7. Aqlli Soatlar
  if (n.includes("apple watch")) return "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop";
  if (
    c.includes("watch") ||
    c.includes("soat") ||
    n.includes("soat") ||
    n.includes("watch") ||
    n.includes("smart watch") ||
    n.includes("garmin") ||
    n.includes("smart band") ||
    n.includes("bilaguzuk")
  ) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop";
  }

  // 8. Planshetlar / iPad
  if (n.includes("ipad") || n.includes("planshet") || n.includes("tablet")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop";
  }

  // 9. Qahva Mashinalari
  if (n.includes("kofemashina") || n.includes("delonghi") || n.includes("qahva") || n.includes("coffee") || n.includes("espresso")) {
    return "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop";
  }

  // 10. Gullar
  if (c.includes("flower") || c.includes("gul") || n.includes("atirgul") || n.includes("gul") || n.includes("guldasta") || n.includes("lola") || n.includes("orxideya")) {
    return "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop";
  }

  // 11. Parfyumeriya
  if (c.includes("parfyum") || c.includes("perfume") || n.includes("atir") || n.includes("parfyum") || n.includes("dior") || n.includes("sauvage") || n.includes("chanel") || n.includes("perfume")) {
    return "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop";
  }

  // 12. Konditsionerlar
  if (n.includes("konditsioner") || n.includes("split-sistema") || n.includes("split tizim") || n.includes("gree inverter")) {
    return "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop";
  }

  // 13. Velosipedlar
  if (n.includes("velosiped") || n.includes("samokat") || n.includes("skuter") || n.includes("bike")) {
    return "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop";
  }

  // 14. Asboblar
  if (n.includes("drel") || n.includes("shurupavyort") || n.includes("perforator") || n.includes("asbob")) {
    return "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop";
  }

  // 15. Oshxona Idishlari
  if (n.includes("idish") || n.includes("choynak") || n.includes("serviz") || n.includes("tovoq") || n.includes("luminarc")) {
    return "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop";
  }

  const phone = phoneFallback(n, c);
  if (phone) return phone;

  return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop";
}

const GENERIC_PHONE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop";

function phoneFallback(n: string, c: string): string | null {
  // 16. Smartfonlar & Telefonlar (Checked AFTER appliances & laptops)
  if (n.includes("iphone 16")) return "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop";
  if (n.includes("iphone 15")) return "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop";
  if (n.includes("iphone 14")) return "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&auto=format&fit=crop";
  if (n.includes("iphone 13")) return "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop";
  if (n.includes("iphone 12") || n.includes("iphone 11") || n.includes("iphone")) {
    return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop";
  }

  // Samsung Galaxy Phones
  if (n.includes("s24") || n.includes("s23") || n.includes("s22") || n.includes("galaxy s") || n.includes("ultra")) {
    return "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop";
  }
  if (n.includes("galaxy a") || (n.includes("samsung") && (n.includes("a55") || n.includes("a35") || n.includes("a25") || n.includes("a15") || n.includes("a05") || n.includes("smartfon")))) {
    return "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop";
  }

  // Xiaomi, Redmi, Poco Phones
  if (n.includes("redmi") || n.includes("poco") || (n.includes("xiaomi") && (n.includes("13") || n.includes("14") || n.includes("smartfon") || n.includes("telefon")))) {
    return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop";
  }

  // General Smartphones
  if (
    c.includes("smartfon") ||
    c.includes("telefon") ||
    c.includes("phone") ||
    n.includes("telefon") ||
    n.includes("smartfon") ||
    n.includes("tecno") ||
    n.includes("honor") ||
    n.includes("infinix")
  ) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop";
  }

  return null;
}
