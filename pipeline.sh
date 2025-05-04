#!/bin/bash

cd ~/Documents/flat-earth-equipment || { echo "❌ repo path not found"; exit 1; }

mkdir -p logs                         # keep logs tidy

run() {                               # helper to run & log
  CMD="$1"; SHIFTED="${@:2}"
  LOG="logs/${CMD//[: \/]/_}.log"
  echo -e "\n▶️  Running: $CMD $SHIFTED"
  { eval "$CMD $SHIFTED"; } 2>&1 | tee "$LOG"
  if [ "${PIPESTATUS[0]}" -ne 0 ]; then
    echo -e "\n🚨  '$CMD' failed. Full log → $LOG"
    exit 1
  else
    echo "✅  '$CMD' succeeded."
  fi
}

# 1) JSON → CSV
run "npm run convert:json-to-csv"

echo -e "\n⏩ Skipping Supabase import (needs Prisma schema)"

# 3) Rebuild Google‑Merchant feed
run "node scripts/build-merchant-feed.js"

# 4) Restart dev server (background)
echo -e "\n⏩ Skipping dev server restart"
# pkill -f "npm run dev" 2>/dev/null || true
# npm run dev --silent &
# sleep 5

echo -e "\n🌐  Open these URLs in your browser when dev server is running:"
echo "   • http://localhost:3000/parts/charger-modules/electrical"
echo "   • http://localhost:3000/feed/google-merchant.json"
echo -e "\n🎉  Pipeline complete. Logs saved in ./logs/" 