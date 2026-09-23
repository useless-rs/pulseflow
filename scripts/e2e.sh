#!/bin/bash
# E2E smoke: boot api, hit health + login + tasks
set -e
cd apps/api
(npm run dev > /tmp/pf-api.log 2>&1 & echo $! > /tmp/pf-api.pid)
sleep 6
curl -sf http://localhost:3000/health
TOKEN=$(curl -sf -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"demo@pulseflow.io","password":"password123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")
curl -sf http://localhost:3000/api/tasks -H "Authorization: Bearer $TOKEN" | head -c 200; echo
kill $(cat /tmp/pf-api.pid)
echo "E2E smoke OK"
