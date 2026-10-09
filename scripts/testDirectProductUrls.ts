async function testDirectUrls() {
  const testCases = [
    { store: "Texnomart", url: "https://texnomart.uz/katalog/redmi-a3/" },
    { store: "Texnomart", url: "https://texnomart.uz/katalog/smartfony/xiaomi-redmi-a3/" },
    { store: "Asaxiy", url: "https://asaxiy.uz/product/telefony-i-gadzhety/telefony/smartfony/xiaomi-redmi-a3-364gb-forest-green" },
    { store: "Asaxiy", url: "https://asaxiy.uz/product/xiaomi-redmi-a3-364gb" },
    { store: "MediaPark", url: "https://mediapark.uz/products/view/dyson-v8-absolute" },
    { store: "Idea", url: "https://idea.uz/products/delonghi-mini-me" }
  ];

  for (const tc of testCases) {
    try {
      const res = await fetch(tc.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow'
      });
      console.log(`${tc.store} [${tc.url}] -> status: ${res.status}`);
    } catch (e: any) {
      console.log(`${tc.store} error:`, e.message);
    }
  }
}

testDirectUrls();
