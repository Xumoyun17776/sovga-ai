const fs = require('fs');
let content = fs.readFileSync('client/src/components/CyberCommandPalette.tsx', 'utf8');
content = content.replace(/<div className="fixed inset-0[^>]+>/, '<div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/85 backdrop-blur-xs animate-fade-in" onClick={onClose}>');
fs.writeFileSync('client/src/components/CyberCommandPalette.tsx', content);
