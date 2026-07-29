#!/bin/bash

# CSS Verification Script
# Checks that CSS is properly bundled with Tailwind classes

set -e

echo "=========================================="
echo "Verifying CSS Build"
echo "=========================================="
echo ""

# Check if dist exists
if [ ! -d "mongo-diff-ui/dist" ]; then
    echo "❌ dist directory not found"
    exit 1
fi

# Find CSS file
CSS_FILE=$(ls mongo-diff-ui/dist/assets/*.css 2>/dev/null | head -1)
if [ -z "$CSS_FILE" ]; then
    echo "❌ No CSS file found in dist/assets/"
    exit 1
fi

echo "CSS file: $CSS_FILE"
CSS_SIZE=$(stat -f%z "$CSS_FILE" 2>/dev/null || stat -c%s "$CSS_FILE" 2>/dev/null)
echo "CSS size: $CSS_SIZE bytes"

# Check for Tailwind classes
echo ""
echo "Checking for Tailwind classes..."

if grep -q "rounded-2xl" "$CSS_FILE"; then
    echo "✅ rounded-2xl found"
else
    echo "❌ rounded-2xl NOT found - Tailwind not bundled!"
    exit 1
fi

if grep -q "bg-gradient-to-r" "$CSS_FILE"; then
    echo "✅ bg-gradient-to-r found"
else
    echo "❌ bg-gradient-to-r NOT found - Tailwind not bundled!"
    exit 1
fi

if grep -q "from-emerald-500" "$CSS_FILE"; then
    echo "✅ from-emerald-500 found"
else
    echo "❌ from-emerald-500 NOT found - Tailwind not bundled!"
    exit 1
fi

if grep -q "from-cyan-500" "$CSS_FILE"; then
    echo "✅ from-cyan-500 found"
else
    echo "❌ from-cyan-500 NOT found - Tailwind not bundled!"
    exit 1
fi

# Check CSS size is reasonable (Tailwind CSS is ~25KB+)
MIN_SIZE=20000
if [ "$CSS_SIZE" -lt "$MIN_SIZE" ]; then
    echo "❌ CSS size ($CSS_SIZE bytes) is too small - expected > $MIN_SIZE bytes"
    echo "   This likely means Tailwind CSS is not being bundled!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ CSS verification passed!"
echo "=========================================="
echo ""
echo "CSS contains all required Tailwind classes"
echo "Size: $CSS_SIZE bytes (expected > $MIN_SIZE bytes)"
