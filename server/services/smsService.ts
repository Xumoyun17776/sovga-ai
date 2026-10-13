/**
 * SMS sending for login codes via Eskiz.uz (https://eskiz.uz), the common SMS gateway in Uzbekistan.
 *
 * Set in .env:
 *   ESKIZ_EMAIL=you@example.com
 *   ESKIZ_PASSWORD=your-eskiz-password
 *   ESKIZ_FROM=4546                      # sender name/number from your Eskiz cabinet
 *   ESKIZ_OTP_TEMPLATE="Sovg'a.uz: tasdiqlash kodi {code}"   # must match a template approved in Eskiz
 *
 * Without these, login codes are only shown on screen in development (or with OTP_DEMO_MODE=true).
 */

const BASE = "https://notify.eskiz.uz/api";
let token: string | null = null;
let tokenAt = 0;
let lastError: string | null = null;
let lastSentAt: number | null = null;

const eskizEmail = () => process.env.ESKIZ_EMAIL || process.env.ESKIZ_SMS_EMAIL || "";
const eskizPassword = () => process.env.ESKIZ_PASSWORD || process.env.ESKIZ_SMS_PASSWORD || "";

export function smsConfigured(): boolean {
  return !!(eskizEmail() && eskizPassword());
}

export function smsStatus() {
  return {
    provider: smsConfigured() ? "eskiz" : "none",
    configured: smsConfigured(),
    demoMode: process.env.NODE_ENV !== "production" || process.env.OTP_DEMO_MODE === "true",
    lastError,
    lastSentAt: lastSentAt ? new Date(lastSentAt).toISOString() : null,
  };
}

async function login(): Promise<string> {
  const form = new FormData();
  form.append("email", eskizEmail());
  form.append("password", eskizPassword());
  const res = await fetch(`${BASE}/auth/login`, { method: "POST", body: form, signal: AbortSignal.timeout(10000) });
  const data: any = await res.json().catch(() => ({}));
  const t = data?.data?.token;
  if (!res.ok || !t) throw new Error(`Eskiz login failed (${res.status}): ${data?.message || res.statusText}`);
  token = t;
  tokenAt = Date.now();
  return t;
}

async function getToken(force = false): Promise<string> {
  // Eskiz tokens live 30 days; refresh after 25
  if (!force && token && Date.now() - tokenAt < 25 * 86400000) return token;
  return login();
}

/** Send one SMS. `phone` like +998901234567. Throws with a readable message on failure. */
export async function sendSms(phone: string, message: string): Promise<void> {
  if (!smsConfigured()) throw new Error("SMS provider is not configured");
  const mobile = phone.replace(/\D/g, "");
  const send = async (t: string) => {
    const form = new FormData();
    form.append("mobile_phone", mobile);
    form.append("message", message);
    form.append("from", process.env.ESKIZ_FROM || "4546");
    return fetch(`${BASE}/message/sms/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
      body: form,
      signal: AbortSignal.timeout(10000),
    });
  };
  try {
    let res = await send(await getToken());
    if (res.status === 401) res = await send(await getToken(true));
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || (data?.status && !/waiting|success|ok/i.test(String(data.status)))) {
      throw new Error(`Eskiz send failed (${res.status}): ${data?.message || data?.status || res.statusText}`);
    }
    lastError = null;
    lastSentAt = Date.now();
  } catch (e: any) {
    lastError = String(e?.message || e).slice(0, 300);
    throw e;
  }
}

export function otpMessage(code: string): string {
  const tpl = process.env.ESKIZ_OTP_TEMPLATE || "Sovg'a.uz: tasdiqlash kodi {code}";
  return tpl.replace("{code}", code);
}
