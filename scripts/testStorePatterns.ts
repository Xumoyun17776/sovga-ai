async function testMorePatterns() {
  const queries = [
    "site:texnomart.uz iphone 15 pro",
    "site:texnomart.uz artel televizor",
    "site:asaxiy.uz redmi a3",
    "site:asaxiy.uz iphone 15",
    "site:mediapark.uz redmi a3",
    "site:mediapark.uz iphone 15",
    "site:uzum.uz/uz/product iphone 15",
    "site:uzum.uz/uz/product artel televizor",
    "site:uzum.uz/uz/product macbook air"
  ];
  for (const q of queries) {
    try {
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const matches = html.match(/uddg=([^&"]+)/g);
      if (matches) {
        const decoded = matches.map(m => decodeURIComponent(m.replace('uddg=', '')));
        const clean = decoded.filter(u => !u.includes('duckduckgo') && !u.includes('/search?') && !u.includes('?q='));
        console.log(`\n=== [${q}] ===`);
        console.log(clean.slice(0, 3));
      }
    } catch (e: any) {
      console.error(q, e.message);
    }
  }
}

testMorePatterns();
