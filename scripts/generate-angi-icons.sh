#!/bin/bash

# Generate PNG icons from SVG for /an-gi PWA
# Requires ImageMagick: brew install imagemagick (macOS)

ICONS_DIR="$(cd "$(dirname "$0")/../public/icons" && pwd)"

echo "Generating PNG icons from SVG..."

# Convert 192x192
if command -v convert &> /dev/null; then
    convert -background none -resize 192x192 "$ICONS_DIR/angi-192.svg" "$ICONS_DIR/angi-192.png"
    echo "✓ Created angi-192.png"
    
    # Convert 512x512
    convert -background none -resize 512x512 "$ICONS_DIR/angi-512.svg" "$ICONS_DIR/angi-512.png"
    echo "✓ Created angi-512.png"
    
    echo ""
    echo "✅ Icons generated successfully!"
else
    echo "❌ ImageMagick not found!"
    echo "Install with: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    exit 1
fi

