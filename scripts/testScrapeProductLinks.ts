async function test() {
  // 1. Asaxiy
  try {
    const res = await fetch('https://asaxiy.uz/product?key=Redmi%20A3', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('Asaxiy status:', res.status, 'HTML length:', html.length);
    const matches = html.match(/href="(\/product\/[^"]+)"/g);
    console.log('Asaxiy matches:', matches ? matches.slice(0, 5) : 'none');
  } catch (e: any) {
    console.error('Asaxiy error:', e.message);
  }

  // 2. Texnomart search or API
  try {
    const res = await fetch('https://texnomart.uz/katalog/?q=Redmi%20A3', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('Texnomart status:', res.status, 'HTML length:', html.length);
    const matches = html.match(/href="(\/katalog\/product\/[^"]+)"/g);
    console.log('Texnomart matches:', matches ? matches.slice(0, 5) : 'none');
    const allHrefs = html.match(/href="([^"]+)"/g);
    const productHrefs = (allHrefs || []).filter(h => h.includes('katalog') && !h.includes('?q=') && !h.includes('css') && !h.includes('js'));
    console.log('Texnomart product hrefs:', productHrefs.slice(0, 5));
  } catch (e: any) {
    console.error('Texnomart error:', e.message);
  }

  // 3. MediaPark
  try {
    const res = await fetch('https://mediapark.uz/search?q=Redmi%20A3', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('MediaPark status:', res.status, 'HTML length:', html.length);
    const matches = html.match(/href="(\/products\/view\/[^"]+|\/product\/[^"]+)"/g);
    console.log('MediaPark matches:', matches ? matches.slice(0, 5) : 'none');
  } catch (e: any) {
    console.error('MediaPark error:', e.message);
  }
}

test();
