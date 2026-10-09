async function testUzumApi() {
  const urls = [
    "https://api.uzum.uz/api/main/search?query=iphone",
    "https://api.uzum.uz/api/v2/catalog/search?query=iphone",
    "https://api.uzum.uz/api/v2/search?query=iphone",
    "https://api.uzum.uz/api/v2/products/search?query=iphone"
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });
      console.log(u, "-> status:", res.status);
      if (res.ok) {
        const d = await res.json();
        console.log("Success keys:", Object.keys(d));
      }
    } catch (e: any) {
      console.log(u, "-> error:", e.message);
    }
  }
}

testUzumApi();
