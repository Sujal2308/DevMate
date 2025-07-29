#!/bin/bash

echo "🧪 Testing DevMate Deployment on Render..."

# Replace with your actual Render URL
RENDER_URL="https://your-service-name.onrender.com"

echo "Testing health endpoint..."
curl -s "$RENDER_URL/api/health" | jq '.'

echo -e "\nTesting cache stats..."
curl -s "$RENDER_URL/api/cache-stats" | jq '.'

echo -e "\nTesting posts endpoint..."
curl -s "$RENDER_URL/api/posts?page=1&limit=5" | jq '.posts | length'

echo -e "\n✅ All tests completed!"
