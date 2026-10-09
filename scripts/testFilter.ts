const query = "iPhone 16 Pro Max";
const qLower = query.toLowerCase();
const tokens = qLower.split(/\s+/).filter((t) => t.length > 1);

const sampleItems = [
  { name: "Anker Original Type-C to Lightning Kabel", price: 96000 },
  { name: "Apple iPhone 16 Pro Max 256 GB Desert Titanium", price: 15684000 },
  { name: "Chehol Mercedes dlya iPhone 16 Pro", price: 180000 },
  { name: "Apple iPhone 16 Pro Max", price: 15056640 },
  { name: "Xiaomi Redmi 13C", price: 1400000 },
];

function score(name: string): number {
  const n = name.toLowerCase();
  // Penalize accessories if query is not asking for accessory
  const isAccessory = /chehol|kabel|shnur|adapter|steklo|plenka|case|cable|cover/i.test(n);
  const queryWantsAccessory = /chehol|kabel|shnur|adapter|steklo|plenka|case|cable|cover/i.test(qLower);
  if (isAccessory && !queryWantsAccessory) return -10;

  let s = 0;
  for (const t of tokens) {
    if (n.includes(t)) s += 2;
  }
  return s;
}

const scored = sampleItems.map(item => ({ item, s: score(item.name) }));
scored.sort((a, b) => b.s - a.s || a.item.price - b.item.price);

console.log("Ranked results for:", query);
scored.forEach((r, idx) => {
  console.log(`${idx + 1}. [Score ${r.s}] ${r.item.name} -> ${r.item.price.toLocaleString()} UZS`);
});
