async function test() {
  const start = Date.now();
  console.log("Sending POST /api/research/search via fetch...");
  try {
    const res = await fetch("http://127.0.0.1:3000/api/research/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "iPhone 16 Pro Max" }),
    });

    console.log(`[${Date.now() - start}ms] Status: ${res.status}`);
    const json = await res.json();
    console.log("Success:", json.success);
    if (json.data) {
      console.log("Products returned:", json.data.products?.length);
      json.data.products.slice(0, 5).forEach((p: any, idx: number) => {
        console.log(`  ${idx + 1}. [${p.store}] ${p.name} -> ${p.price?.toLocaleString()} UZS`);
        console.log(`     URL: ${p.url}`);
      });
    }
  } catch (err: any) {
    console.error("Fetch error:", err.message);
  }
}

test();
