#!/bin/bash
set -e
echo "⚡ PulseFlow setup"
npm install
cp -n .env.example apps/api/.env || true
echo "Run: npm run dev"
