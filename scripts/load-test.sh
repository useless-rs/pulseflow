#!/bin/bash
# Simple load smoke: 50 concurrent /health
set -e
URL=${1:-http://localhost:3000/health}
echo "Hitting $URL x50..."
for i in $(seq 1 50); do curl -sf "$URL" > /dev/null & done
wait
echo "Load smoke done"
