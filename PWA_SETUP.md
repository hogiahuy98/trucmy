# PWA Setup for /an-gi Route

## Overview

This project contains a standalone PWA specifically for the `/an-gi` route, completely isolated from the main app.

## File Structure

```
/app/an-gi/
  ├── layout.tsx              # PWA-specific layout with meta tags
  ├── page.tsx                # Main meal planning page
  ├── manifest/
  │   └── route.ts            # Route handler for manifest.json
  └── components/
      └── ServiceWorkerRegistration.tsx

/public/
  ├── an-gi/
  │   ├── manifest.json       # PWA manifest (also served via route)
  │   └── angi-sw.js          # Service worker for /an-gi scope
  └── icons/
      ├── angi-192.png        # 192x192 icon (needs to be created)
      └── angi-512.png        # 512x512 icon (needs to be created)
```

## Setup Steps

### 1. Create Icons

Create avocado-themed icons in `/public/icons/`:

- **angi-192.png** (192x192px)
- **angi-512.png** (512x512px)

See `scripts/generate-angi-icons.md` for instructions.

### 2. Verify Manifest

The manifest is accessible at:
- `/an-gi/manifest` (via route handler)
- `/an-gi/manifest.json` (via public file)

Both should return the same JSON.

### 3. Service Worker

The service worker is registered automatically when visiting `/an-gi`:
- Scope: `/an-gi` only
- Caches only routes under `/an-gi`
- Does not interfere with main app

### 4. Testing

1. **Development**: 
   - Visit `http://localhost:3000/an-gi`
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered with scope `/an-gi`

2. **Production**:
   - Build: `npm run build`
   - Start: `npm start`
   - Visit `/an-gi` on mobile device
   - Test "Add to Home Screen" functionality

3. **PWA Installation**:
   - On Chrome/Edge: Look for install prompt
   - On iOS Safari: Share → Add to Home Screen
   - On Android Chrome: Install prompt or menu → Install

## Verification Checklist

- [ ] Icons created in `/public/icons/`
- [ ] Manifest accessible at `/an-gi/manifest`
- [ ] Service worker registered with scope `/an-gi`
- [ ] PWA installs separately from main app
- [ ] PWA opens directly at `/an-gi` when launched
- [ ] Service worker only caches `/an-gi/*` routes
- [ ] Main app continues to work normally

## Important Notes

1. **Scope Isolation**: The service worker ONLY handles `/an-gi/*` routes. Other routes are not intercepted.

2. **Main App**: The main app (expense tracker) has its own PWA setup via `next-pwa`. These two PWAs are completely independent.

3. **iOS Safari**: Requires HTTPS in production for service worker to work. Use `apple-mobile-web-app-capable` meta tag for standalone mode.

4. **Manifest**: The manifest is served both as a static file and via route handler for maximum compatibility.

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `/an-gi/angi-sw.js` is accessible
- Ensure you're on `/an-gi` route (not root)

### Manifest Not Loading
- Check Network tab for `/an-gi/manifest` request
- Verify route handler is working
- Check manifest.json syntax

### Icons Not Showing
- Verify icons exist in `/public/icons/`
- Check icon paths in manifest.json
- Ensure icons are PNG format

### PWA Not Installing
- Must be served over HTTPS (or localhost)
- Check manifest validity
- Verify start_url and scope match `/an-gi`

