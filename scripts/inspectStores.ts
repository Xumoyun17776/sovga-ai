async function inspectStores() {
  // Test Asaxiy
  try {
    const res = await fetch('https://asaxiy.uz/product/telefony-i-gadzhety/telefony/smartfony/xiaomi-redmi-a3-364gb-forest-green', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log('Asaxiy direct slug status:', res.status);
  } catch (e: any) {
    console.log('Asaxiy error:', e.message);
  }

  // Test Uzum API
  try {
    const res = await fetch('https://api.uzum.uz/api/v2/products/1123490', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    console.log('Uzum API status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Uzum API data title:', data?.payload?.data?.title);
    }
  } catch (e: any) {
    console.log('Uzum API error:', e.message);
  }

  // Test Uzum search API
  try {
    const res = await fetch('https://api.uzum.uz/api/v2/search?query=Redmi+A3&size=5', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    console.log('Uzum Search API status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Uzum Search API payload:', JSON.stringify(data).slice(0, 300));
    }
  } catch (e: any) {
    console.log('Uzum Search API error:', e.message);
  }
}

inspectStores();
