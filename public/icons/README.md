# PWA Icons for /an-gi

## Required Files

Create the following icon files in this directory:

- `angi-192.png` - 192x192 pixels
- `angi-512.png` - 512x512 pixels

## Design Specifications

### Colors
- **Background**: #A3C68C (avocado green) or #FAF8F4 (cream)
- **Accent**: #6F8F5F (deep avocado)
- **Text/Icon**: #4A4F3B (dark olive) or white

### Design Elements
- Avocado emoji 🥑 or stylized avocado illustration
- Optional text: "Ăn gì" in Vietnamese
- Rounded corners (iOS-friendly)
- Maskable icon support (safe zone for Android)

### Quick Generation

#### Option 1: Online Tools
1. Visit [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
2. Or use [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Upload a 512x512 source image
4. Generate all sizes

#### Option 2: ImageMagick (Command Line)
```bash
# Create 192x192 icon with avocado emoji
convert -size 192x192 xc:#A3C68C \
  -gravity center \
  -pointsize 96 \
  -font Arial \
  -annotate +0+0 "🥑" \
  public/icons/angi-192.png

# Create 512x512 icon
convert -size 512x512 xc:#A3C68C \
  -gravity center \
  -pointsize 256 \
  -font Arial \
  -annotate +0+0 "🥑" \
  public/icons/angi-512.png
```

#### Option 3: Design Tools
1. Use Figma, Sketch, or Canva
2. Create 512x512 canvas
3. Background: #A3C68C
4. Add avocado emoji or illustration
5. Export as PNG
6. Resize to 192x192 for smaller icon

## File Verification

After creating icons, verify they're accessible:
- http://localhost:3000/icons/angi-192.png
- http://localhost:3000/icons/angi-512.png

## Notes

- Icons must be PNG format
- Use square aspect ratio
- Ensure icons are clear at small sizes
- Test on actual devices for best results

