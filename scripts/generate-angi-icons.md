# Generate Avocado-Themed Icons for /an-gi PWA

## Required Icons

Create the following icons in `/public/icons/`:

1. **angi-192.png** (192x192px)
2. **angi-512.png** (512x512px)

## Design Guidelines

- **Theme**: Avocado warm colors
- **Background**: #FAF8F4 (cream) or #A3C68C (avocado green)
- **Icon**: Avocado emoji 🥑 or stylized avocado illustration
- **Text**: Optional "Ăn gì" text in Vietnamese
- **Style**: Rounded corners, iOS-friendly design

## Quick Generation Options

### Option 1: Use Online Tools
- Use [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- Or [RealFaviconGenerator](https://realfavicongenerator.net/)

### Option 2: Create Simple Placeholder
You can create simple colored squares with avocado emoji as placeholders:

```bash
# Using ImageMagick (if installed)
convert -size 192x192 xc:#A3C68C -gravity center -pointsize 96 -annotate +0+0 "🥑" public/icons/angi-192.png
convert -size 512x512 xc:#A3C68C -gravity center -pointsize 256 -annotate +0+0 "🥑" public/icons/angi-512.png
```

### Option 3: Use Design Tools
- Figma, Sketch, or Canva
- Export as PNG with exact dimensions
- Use avocado green (#A3C68C) background
- Add avocado emoji or illustration

## File Locations

```
/public/icons/
  ├── angi-192.png  (192x192px)
  └── angi-512.png  (512x512px)
```

## Verification

After creating icons, verify they're accessible at:
- `/icons/angi-192.png`
- `/icons/angi-512.png`

