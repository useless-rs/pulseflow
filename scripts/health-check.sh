#!/bin/bash
set -e
curl -sf http://localhost:3000/health && echo "API OK"
