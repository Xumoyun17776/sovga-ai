// This is a simulated Telegram Bot Service. 
// In a real $1B startup, this would use 'telegraf' or 'node-telegram-bot-api' with a real BOT_TOKEN.

export async function generateTelegramNotification(chatId: string, data: any) {
  console.log(`[Telegram Bot] Sending message to ${chatId}:`);
  
  if (data.type === "price_drop") {
    const savings = data.oldPrice - data.newPrice;
    const message = `
🚨 **NARX TUSHDI!** 🚨

Siz kuzatayotgan **${data.productName}** narxi maqsadli ko'rsatkichdan tushdi!

💰 Oldingi narx: ${data.oldPrice.toLocaleString()} UZS
🔥 Yangi narx: **${data.newPrice.toLocaleString()} UZS**
💸 Tejov: ${savings.toLocaleString()} UZS!

🏪 Do'kon: ${data.store}
🔗 Xarid qilish: ${data.url}

Shoshiling, mahsulot tugab qolishi mumkin!
`;
    console.log(message);
    // Real implementation would be: await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    return true;
  }

  if (data.type === "login_code") {
    const message = `🔑 Sovg'a.uz tizimiga kirish uchun tasdiqlash kodi: **${data.code}**`;
    console.log(message);
    return true;
  }
}

export function generateTelegramAuthLink(userId: number) {
  // Generate a unique token for the user to link their account
  const token = Buffer.from(`user_${userId}_${Date.now()}`).toString('base64');
  return `https://t.me/SovgaUzBot?start=${token}`;
}
