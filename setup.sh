#!/bin/bash
echo "=================================================="
echo "🚀 SOVG'A AI - SERVER ISHGA TUSHIRISH (AVTOMATIK)"
echo "=================================================="

# Go to httpdocs directory
cd "$(dirname "$0")" || cd ~/httpdocs || cd httpdocs
echo "📂 Joriy papka: $(pwd)"

# 1. Download & extract Node.js 20 Linux binary directly (bypassing SSL cert issues with -k)
if [ ! -f "$HOME/nodejs/bin/node" ]; then
  echo "📦 1/2: Node.js 20 Linux dvijogi yuklab olinmoqda..."
  curl -k -L https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.gz -o /tmp/node.tar.gz
  mkdir -p "$HOME/nodejs"
  tar -xzf /tmp/node.tar.gz -C "$HOME/nodejs" --strip-components=1
  rm -f /tmp/node.tar.gz
  echo "✅ Node.js o'rnatildi: $($HOME/nodejs/bin/node -v)"
else
  echo "✅ Node.js allaqachon mavjud: $($HOME/nodejs/bin/node -v)"
fi

# Add to PATH
export PATH="$HOME/nodejs/bin:$PATH"

# 2. Stop any existing instance
pkill -f "dist/server/index.js" 2>/dev/null || true

# 3. Start Server in background
echo "🚀 2/2: Sovg'a AI serveri ishga tushirilmoqda..."
NODE_ENV=production nohup "$HOME/nodejs/bin/node" dist/server/index.js > server.log 2>&1 &

sleep 2

# Check if running
if pgrep -f "dist/server/index.js" > /dev/null; then
  echo "=================================================="
  echo "🎉 SOVG'A AI SERVER MUVAFFAQIYATLI ISHGA TUSHDI!"
  echo "🌐 Sayt: https://sovgatop.uz"
  echo "=================================================="
  echo "Loglar:"
  tail -n 15 server.log
else
  echo "⚠️ Xatolik yuz berdi. Server logi:"
  cat server.log
fi
