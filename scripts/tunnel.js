import localtunnel from "localtunnel";

// Keep process active indefinitely
setInterval(() => {}, 1000 * 60 * 60);

async function startTunnel() {
  try {
    const ipRes = await fetch("https://api.ipify.org").catch(() => null);
    const ip = ipRes ? await ipRes.text() : "84.54.115.45";

    console.log("[Tunnel] Starting persistent localtunnel on port 3000...");
    const tunnel = await localtunnel({ port: 3000 });

    console.log("\n=======================================================");
    console.log("🚀 LOCALTUNNEL IS LIVE & STABLE:");
    console.log(`🔗 Public URL:       ${tunnel.url}`);
    console.log(`🔑 Tunnel Password:  ${ip.trim()}`);
    console.log("   (If loca.lt asks for an IP password, enter the key above)");
    console.log("=======================================================\n");

    tunnel.on("close", () => {
      console.warn("[Tunnel] Tunnel closed. Reconnecting in 3 seconds...");
      setTimeout(startTunnel, 3000);
    });

    tunnel.on("error", (err) => {
      console.error("[Tunnel] Tunnel error:", err?.message || err);
      setTimeout(startTunnel, 5000);
    });
  } catch (err) {
    console.error("[Tunnel] Failed to start tunnel:", err?.message || err);
    setTimeout(startTunnel, 5000);
  }
}

startTunnel();

