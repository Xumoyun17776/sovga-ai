async function testSearchEngine() {
  const query = "site:uzum.uz/uz/product Redmi A3";
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('DDG status:', res.status, 'HTML length:', html.length);
    // Find links in uddg format
    const matches = html.match(/uddg=([^&"]+)/g);
    if (matches) {
      const decoded = matches.map(m => decodeURIComponent(m.replace('uddg=', '')));
      console.log('Decoded URLs:', decoded.filter(u => u.includes('uzum.uz/uz/product')).slice(0, 5));
    }
  } catch (e: any) {
    console.error('DDG error:', e.message);
  }
}

testSearchEngine();
