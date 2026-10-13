import fs from "fs";
import path from "path";

/** Real head-to-head votes, stored in data/duelVotes.json (small file, written with a short delay). */
type Tally = { a: number; b: number };

const FILE = path.resolve(process.cwd(), "data", "duelVotes.json");
let votes: Record<string, Tally> = {};
let saveTimer: NodeJS.Timeout | null = null;

try {
  if (fs.existsSync(FILE)) votes = JSON.parse(fs.readFileSync(FILE, "utf8")) || {};
} catch {
  votes = {};
}

const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim().slice(0, 200);

/** Same key for "A vs B" and "B vs A"; `flipped` tells which side is which. */
function keyOf(productA: string, productB: string): { key: string; flipped: boolean } {
  const a = norm(productA);
  const b = norm(productB);
  return a <= b ? { key: `${a}||${b}`, flipped: false } : { key: `${b}||${a}`, flipped: true };
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      const tmp = `${FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(votes));
      fs.renameSync(tmp, FILE);
    } catch (e: any) {
      console.warn("[DuelVotes] save failed:", e?.message);
    }
  }, 1000);
}

export function getDuelVotes(productA: string, productB: string): Tally {
  const { key, flipped } = keyOf(productA, productB);
  const t = votes[key] || { a: 0, b: 0 };
  return flipped ? { a: t.b, b: t.a } : { a: t.a, b: t.b };
}

export function addDuelVote(productA: string, productB: string, option: "A" | "B"): Tally {
  const { key, flipped } = keyOf(productA, productB);
  const t = votes[key] || { a: 0, b: 0 };
  const side = (option === "A") !== flipped ? "a" : "b";
  t[side] += 1;
  votes[key] = t;
  scheduleSave();
  return getDuelVotes(productA, productB);
}
