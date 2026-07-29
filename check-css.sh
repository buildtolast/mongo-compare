#!/bin/bash

# Quick CSS verification for developers
# Run this before starting the app to catch CSS issues early

echo "Checking CSS build..."
cd mongo-diff-ui

if [ ! -d "dist" ]; then
    echo "❌ dist not found - run 'npm run build' first"
    exit 1
fi

CSS_FILE=$(ls dist/assets/*.css 2>/dev/null | head -1)

if [ -z "$CSS_FILE" ]; then
    echo "❌ No CSS file in dist/assets/"
    exit 1
fi

CSS_SIZE=$(stat -f%z "$CSS_FILE" 2>/dev/null || stat -c%s "$CSS_FILE" 2>/dev/null)

echo "CSS: $(basename $CSS_FILE) ($CSS_SIZE bytes)"

# Quick check for Tailwind
if ! grep -q "rounded-2xl" "$CSS_FILE"; then
    echo "❌ CSS missing Tailwind - rebuild with: npm run build"
    exit 1
fi

if [ "$CSS_SIZE" -lt 20000 ]; then
    echo "❌ CSS too small ($CSS_SIZE bytes) - expected >20KB"
    echo "   Rebuild with: npm run build"
    exit 1
fi

echo "✅ CSS OK"
cd ..
