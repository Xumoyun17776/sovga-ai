async function findUzumEndpoints() {
  try {
    const res = await fetch('https://uzum.uz/uz', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('Uzum homepage status:', res.status);
    const apiMatches = html.match(/https?:\/\/[a-zA-Z0-9.-]*uzum[a-zA-Z0-9.-]*\/[a-zA-Z0-9/_-]*/g);
    console.log('Uzum matches:', Array.from(new Set(apiMatches)).slice(0, 10));

    // Also look for product links on Uzum home page!
    const productLinks = html.match(/\/uz\/product\/[a-zA-Z0-9_.-]+/g);
    console.log('Uzum product links on homepage:', Array.from(new Set(productLinks)).slice(0, 10));
  } catch (e: any) {
    console.log('Error:', e.message);
  }
}

findUzumEndpoints();
