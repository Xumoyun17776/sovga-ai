import { storage } from "../storage.js";
import { searchLiveMarketplaces } from "./liveStoreScanner.js";
import { generateTelegramNotification } from "./telegramBotService.js";

export function startPriceTrackerWorker() {
  console.log("[Price Tracker] Worker initialized. Will check prices every 6 hours.");
  
  // Run every 6 hours
  const INTERVAL = 6 * 60 * 60 * 1000; 

  setInterval(async () => {
    console.log("[Price Tracker] Starting scheduled price check...");
    try {
      const activeTrackers = storage.getAllPriceTrackers();
      if (activeTrackers.length === 0) return;

      for (const tracker of activeTrackers) {
        if (!tracker.active) continue;

        // Perform live scrape to get current price
        const liveResults = await searchLiveMarketplaces(tracker.productName);
        if (liveResults.length > 0) {
          // Find the lowest price among results
          const lowestPriceResult = liveResults.reduce((min, curr) => 
            (curr.price && min.price && curr.price < min.price) ? curr : min
          , liveResults[0]);

          const currentPrice = lowestPriceResult.price;
          
          if (currentPrice && currentPrice <= tracker.targetPrice) {
            console.log(`[Price Tracker] TARGET MET for ${tracker.productName}! Target: ${tracker.targetPrice}, Current: ${currentPrice}`);
            
            // Mark as inactive so we don't duplicate notifications
            storage.updatePriceTracker(tracker.id, { active: false, notified: true });

            // Fire Telegram Notification
            const user = storage.getUserById(tracker.userId);
            if (user && user.telegramChatId) {
              await generateTelegramNotification(user.telegramChatId, {
                type: "price_drop",
                productName: tracker.productName,
                oldPrice: tracker.currentPrice || tracker.targetPrice * 1.2,
                newPrice: currentPrice,
                store: lowestPriceResult.store,
                url: lowestPriceResult.url
              });
            }
          }
        }
        
        // Wait 5 seconds between products to avoid IP ban from stores
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (err) {
      console.error("[Price Tracker] Worker error:", err);
    }
  }, INTERVAL);
}
