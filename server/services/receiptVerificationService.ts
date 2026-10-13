import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage.js";
import type { SubscriptionReceiptRecord } from "../../shared/types.js";
import { PLANS, normalizePlanId, type PlanId } from "../../shared/plans.js";
import { activatePlan, paymentCards } from "./planService.js";

export interface ReceiptVerificationInput {
  userId: number;
  receiptImageBase64: string;
  plan?: string;
}

export interface ReceiptVerificationResult {
  verified: boolean;
  pending?: boolean;
  plan?: string;
  expiresAt?: string | null;
  role?: string;
  message: string;
  reason?: string;
  receipt?: Partial<SubscriptionReceiptRecord>;
  rawAnalysis?: any;
}

export class ReceiptVerificationService {
  private getGeminiKey(): string | null {
    const raw = (process.env.GEMINI_API_KEY || "").trim();
    return raw.length > 20 ? raw : null;
  }

  public async verifyAndActivate(input: ReceiptVerificationInput): Promise<ReceiptVerificationResult> {
    const { userId, receiptImageBase64 } = input;
    const planId: PlanId = normalizePlanId(input.plan) || "plus";
    const plan = planId;
    const user = storage.getUserById(userId);
    if (!user) {
      return { verified: false, message: "Foydalanuvchi topilmadi", reason: "User not found" };
    }

    if (planId === "free") {
      return { verified: false, message: "Bepul tarif uchun to'lov kerak emas", reason: "Free plan" };
    }
    const expectedAmount = PLANS[planId].price;
    const planNameUz = `${PLANS[planId].name.uz} (${expectedAmount.toLocaleString("en-US")} UZS / oy)`;

    const geminiKey = this.getGeminiKey();
    // The money has to land on one of our cards: receipts show the recipient card masked, e.g. "4466 **** **** 8688".
    const ourLast4 = paymentCards().map((c) => c.number.slice(-4));
    const recipientRule = ourLast4.length
      ? `\n- Recipient card MUST end in: ${ourLast4.join(" or ")}`
      : "";

    const queueForAdmin = (why: string, extra: Record<string, any> = {}) => {
      const rec = storage.saveReceiptRecord({
        userId,
        userEmail: user.email,
        userName: user.name,
        plan,
        amount: expectedAmount,
        expectedAmount,
        currency: "UZS",
        bankOrApp: "—",
        transactionId: null,
        paymentDate: null,
        verificationConfidence: "low",
        ...extra,
        status: "manual_review",
        reason: why,
        receiptImage: receiptImageBase64.length <= 3_000_000 ? receiptImageBase64 : receiptImageBase64.slice(0, 3_000_000),
      } as any);
      return { verified: false, pending: true, message: "Chek tekshiruvga yuborildi", reason: why, receipt: rec } as any;
    };

    let analysisResult: {
      isValidReceipt: boolean;
      amount: number;
      status: string;
      bankOrApp: string;
      transactionId: string | null;
      date: string | null;
      recipient: string | null;
      recipientLast4?: string | null;
      confidence: "high" | "medium" | "low";
      reason: string;
    } | null = null;

    if (geminiKey) {
      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest"];
      const genAI = new GoogleGenerativeAI(geminiKey);

      for (const modelName of modelsToTry) {
        if (analysisResult) break;
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          });

        const prompt = `You are Sovg'a AI's automated financial auditor for Uzbekistan P2P payment receipts (Click, Payme, Uzum Bank, Anorbank, Humo, Uzcard, Apelsin, Upay, Oson, etc.).
Analyze this payment receipt screenshot carefully.

EXPECTED PAYMENT:
- Plan: ${planNameUz}
- Target Expected Amount: ${expectedAmount} UZS (or more)${recipientRule}

VERIFICATION RULES:
1. Is this a genuine electronic payment transfer receipt or successful banking transaction confirmation?
2. Extract the exact numerical amount in UZS (e.g. 49000, 50000, 450000). Convert any sums into pure integers.
3. Check status: it must be a COMPLETED/SUCCESSFUL transaction (e.g., "O'tkazildi", "Muvaffaqiyatli", "To'landi", "Оплачено", "Успешно"). If it is pending, failed, or cancelled, isValidReceipt MUST be false.
4. Extract bank or application name (e.g., "Payme", "Click", "Uzum Bank", "Anorbank", "Apelsin", "Infinbank").
5. Extract transaction ID / chek raqami (or null if not found).
6. Extract transaction date / time (or null if not found).
7. Extract recipient card or name (or null if not found). Put the LAST 4 DIGITS of the recipient (receiver) card into "recipientLast4" — only digits that are actually visible on the receipt, never the sender's card; null if not shown.
8. If the extracted amount is at least ${expectedAmount} UZS and the status is SUCCESS, set isValidReceipt to true.
9. Provide a clear, polite explanation in Uzbek in "reason" (e.g., "49,000 UZS to'lov Payme orqali muvaffaqiyatli o'tkazilganligi tasdiqlandi").

Return ONLY a valid JSON object matching this schema:
{
  "isValidReceipt": true | false,
  "amount": number,
  "status": "success" | "failed" | "pending" | "not_a_receipt",
  "bankOrApp": string,
  "transactionId": string | null,
  "date": string | null,
  "recipient": string | null,
  "recipientLast4": string | null,
  "confidence": "high" | "medium" | "low",
  "reason": string
}`;

        let parts: any[] = [{ text: prompt }];

        if (receiptImageBase64.startsWith("data:")) {
          const match = receiptImageBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts = [
              { inlineData: { mimeType: match[1], data: match[2] } },
              { text: prompt },
            ];
          }
        }

        const res = await model.generateContent({ contents: [{ role: "user", parts }] });
        const text = res.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        }
      } catch (err: any) {
        console.warn("[Receipt AI] Gemini Vision OCR call notice:", err?.message);
        // Fall through to next model or heuristic auditor
      }
    }
  }

    // AI couldn't read the receipt (no key / service down): never auto-approve — queue it for the admin.
    if (!analysisResult) {
      const isImage = receiptImageBase64.startsWith("data:image/") && receiptImageBase64.length > 500;
      if (!isImage) {
        return {
          verified: false,
          message: "Yuklangan fayl yaroqli to'lov cheki tasviri emas",
          reason: "Iltimos, Click, Payme yoki bank ilovasidan olingan to'lov cheki skrinshotini (PNG, JPG) yuklang.",
        };
      }
      return queueForAdmin("Chek qabul qilindi va admin tomonidan tekshirilmoqda. Odatda bir necha soat ichida tarif yoqiladi.");
    }

    const {
      isValidReceipt,
      amount = 0,
      status = "unknown",
      bankOrApp = "Bank App",
      transactionId,
      date: paymentDate,
      reason,
      confidence = "high",
    } = analysisResult;

    // Strict validation verification checks
    const isAmountSufficient = amount >= expectedAmount * 0.98;
    const isStatusOk = status === "success" || status === "o'tkazildi" || status === "completed";

    // ─── REPLAY ATTACK PREVENTION (Check for duplicate transactionId) ───
    if (transactionId && typeof transactionId === "string" && transactionId.trim().length > 3) {
      const cleanTxId = transactionId.trim().toLowerCase();
      const existingReceipts = storage.getReceipts();
      const isDuplicate = existingReceipts.some(
        (r) =>
          r.status === "verified" &&
          r.transactionId &&
          r.transactionId.trim().toLowerCase() === cleanTxId
      );

      if (isDuplicate) {
        const replayReason = `Ushbu to'lov cheki (Tranzaksiya ID: ${transactionId}) allaqachon faollashtirilgan. Bitta to'lov chekidan takroran foydalanish taqiqlanadi!`;
        storage.saveReceiptRecord({
          userId,
          userEmail: user.email,
          userName: user.name,
          plan,
          amount,
          expectedAmount,
          currency: "UZS",
          bankOrApp,
          transactionId,
          paymentDate: paymentDate || null,
          status: "rejected",
          verificationConfidence: confidence,
          reason: replayReason,
          receiptImage: receiptImageBase64.slice(0, 800),
        });

        return {
          verified: false,
          message: "To'lov cheki allaqachon ishlatilgan",
          reason: replayReason,
          receipt: {
            amount,
            bankOrApp,
            transactionId,
            status: "rejected",
            reason: replayReason,
          },
          rawAnalysis: analysisResult,
        };
      }
    }

    if (!isValidReceipt || !isAmountSufficient || !isStatusOk) {
      let failureReason = reason || "Chek tasdiqlanmadi.";
      if (!isAmountSufficient) {
        failureReason = `To'lov summasi yetarli emas. Aniqlandi: ${amount.toLocaleString()} UZS. Zarur summa: ${expectedAmount.toLocaleString()} UZS.`;
      } else if (!isStatusOk) {
        failureReason = `To'lov holati muvaffaqiyatli emas ('${status}'). Iltimos, muvaffaqiyatli yakunlangan to'lov chekini yuklang.`;
      }

      // Record rejected attempt in storage for safety auditing
      storage.saveReceiptRecord({
        userId,
        userEmail: user.email,
        userName: user.name,
        plan,
        amount,
        expectedAmount,
        currency: "UZS",
        bankOrApp,
        transactionId: transactionId || null,
        paymentDate: paymentDate || null,
        status: "rejected",
        verificationConfidence: confidence,
        reason: failureReason,
        receiptImage: receiptImageBase64.slice(0, 800),
      });

      return {
        verified: false,
        message: "To'lov cheki tasdiqlanmadi",
        reason: failureReason,
        receipt: {
          amount,
          bankOrApp,
          status: "rejected",
          reason: failureReason,
        },
        rawAnalysis: analysisResult,
      };
    }

    // ─── RECIPIENT CHECK: the transfer must have gone to our card ───
    if (ourLast4.length) {
      const seen = String(analysisResult.recipientLast4 || "").replace(/[^0-9]/g, "").slice(-4);
      if (seen.length === 4 && !ourLast4.includes(seen)) {
        const wrongReason = `To'lov boshqa kartaga o'tkazilgan (…${seen}). Iltimos, saytda ko'rsatilgan kartaga o'tkazing.`;
        storage.saveReceiptRecord({
          userId,
          userEmail: user.email,
          userName: user.name,
          plan,
          amount,
          expectedAmount,
          currency: "UZS",
          bankOrApp,
          transactionId: transactionId || null,
          paymentDate: paymentDate || null,
          status: "rejected",
          verificationConfidence: confidence,
          reason: wrongReason,
          receiptImage: receiptImageBase64.slice(0, 800),
        });
        return { verified: false, message: "To'lov cheki tasdiqlanmadi", reason: wrongReason, receipt: { amount, bankOrApp, status: "rejected", reason: wrongReason }, rawAnalysis: analysisResult };
      }
      if (seen.length !== 4) {
        return queueForAdmin("Chekda qabul qiluvchi karta ko'rinmadi — admin tekshiradi. Odatda bir necha soat ichida tarif yoqiladi.", {
          amount,
          bankOrApp,
          transactionId: transactionId || null,
          paymentDate: paymentDate || null,
          verificationConfidence: confidence,
        });
      }
    }

    // ─── VERIFICATION SUCCESS ───
    // 1. Switch the plan on (30 days, stacking on any time left)
    const updatedUser = activatePlan(userId, planId, undefined, { source: "receipt", note: "AI chek tekshiruvi" });

    // 2. Save approved receipt record
    const savedRecord = storage.saveReceiptRecord({
      userId,
      userEmail: user.email,
      userName: user.name,
      plan,
      amount,
      expectedAmount,
      currency: "UZS",
      bankOrApp,
      transactionId: transactionId || "TRX-" + Date.now().toString().slice(-8),
      paymentDate: paymentDate || new Date().toISOString(),
      status: "verified",
      verificationConfidence: confidence,
      reason: reason || "AI tomonidan to'lov to'liq tasdiqlandi",
      receiptImage: receiptImageBase64.length <= 3_000_000 ? receiptImageBase64 : receiptImageBase64.slice(0, 1000),
    });

    return {
      verified: true,
      role: "pro",
      plan: planId,
      expiresAt: updatedUser?.planExpiresAt || null,
      message: `Tabriklaymiz! To'lov tasdiqlandi — ${PLANS[planId].name.uz} tarifi 30 kunga yoqildi.`,
      receipt: savedRecord,
      rawAnalysis: analysisResult,
    };
  }
}

export const receiptVerificationService = new ReceiptVerificationService();
