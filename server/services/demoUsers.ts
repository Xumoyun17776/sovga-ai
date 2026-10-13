/**
 * Generates realistic-looking TEST accounts so the admin panel can be checked with lots of data.
 * Every account has isDemo: true, an @sovga.test e-mail (a reserved test domain), a +998 00 … phone
 * (no such operator code) and no password, so nobody can sign in with them. Remove them all with
 * DELETE /api/admin/demo-users.
 */
import type { PlanId } from "../../shared/plans.js";

const MALE = ["Aziz", "Bekzod", "Jasur", "Sardor", "Otabek", "Javohir", "Dilshod", "Shoxrux", "Sanjar", "Bobur", "Ulug'bek", "Rustam", "Akmal", "Farrux", "Islom", "Jahongir", "Komil", "Laziz", "Murod", "Nodir", "Oybek", "Ravshan", "Sherzod", "Temur", "Umid", "Xurshid", "Zafar", "Abdulla", "Doniyor", "Elyor"];
const FEMALE = ["Madina", "Malika", "Nilufar", "Dilnoza", "Gulnoza", "Shahnoza", "Zarina", "Sevara", "Kamola", "Feruza", "Nigora", "Mohira", "Laylo", "Munisa", "Sabina", "Dildora", "Gulsanam", "Iroda", "Mavluda", "Ozoda", "Rayhona", "Sitora", "Umida", "Yulduz", "Zuhra", "Nargiza", "Hilola", "Barno", "Charos", "Diyora"];
const LAST = ["Karimov", "Rahimov", "Toshmatov", "Yusupov", "Abdullayev", "Ismoilov", "Nazarov", "Qodirov", "Saidov", "Tursunov", "Umarov", "Xolmatov", "Ergashev", "Hasanov", "Mirzayev", "Normatov", "Olimov", "Sobirov", "Valiyev", "Zokirov", "Aliyev", "Botirov", "Davronov", "Fayzullayev", "G'aniyev"];

const DAY = 86_400_000;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ascii = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

export function buildDemoUsers(count: number, seed = Date.now()) {
  const r = rng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const now = Date.now();
  const rows: any[] = [];
  for (let i = 0; i < count; i++) {
    const female = r() < 0.5;
    const first = pick(female ? FEMALE : MALE);
    let last = pick(LAST);
    if (female) last = last.endsWith("v") ? last + "a" : last;
    const tag = Math.floor(r() * 90000 + 10000);
    // more sign-ups recently: square the random number
    const createdAt = new Date(now - Math.floor(r() * r() * 120 * DAY));

    const roll = r();
    let plan: PlanId = "free";
    if (roll > 0.94) plan = "premium";
    else if (roll > 0.82) plan = "plus";
    else if (roll > 0.7) plan = "start";

    let planExpiresAt: string | null = null;
    const planHistory: any[] = [];
    let role = r() < 0.01 ? "merchant" : "user";
    if (plan !== "free") {
      const s = r();
      // 10% already expired, 8% run out within 3 days, the rest 4–90 days ahead
      const ms = s < 0.1 ? -Math.ceil(r() * 40) * DAY : s < 0.18 ? Math.ceil(r() * 3) * DAY - 3600_000 : Math.ceil(4 + r() * 86) * DAY;
      planExpiresAt = new Date(now + ms).toISOString();
      const days = [7, 30, 30, 30, 90][Math.floor(r() * 5)];
      planHistory.push({
        plan,
        days,
        at: new Date(Math.max(createdAt.getTime(), now + ms - days * DAY)).toISOString(),
        expiresAt: planExpiresAt,
        source: r() < 0.6 ? "receipt" : "admin",
        note: "Test",
      });
      if (ms > 0 && role === "user") role = "pro";
    }

    rows.push({
      name: `${first} ${last}`,
      email: `${ascii(first)}.${ascii(last)}${tag}@sovga.test`,
      phone: r() < 0.7 ? `+99800${String(Math.floor(r() * 1e7)).padStart(7, "0")}` : undefined,
      password: null,
      role,
      plan,
      planExpiresAt,
      planHistory,
      createdAt,
      updatedAt: createdAt,
    });
  }
  return rows;
}
