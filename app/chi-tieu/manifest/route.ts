// Route handler to serve manifest.json at /chi-tieu/manifest
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'chi-tieu', 'manifest.json')
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving finance manifest:', error)
    // Return a fallback manifest if file doesn't exist
    return NextResponse.json(
      {
        name: 'Chi tiêu Huy My',
        short_name: 'Chi tiêu',
        start_url: '/chi-tieu',
        scope: '/chi-tieu',
        display: 'standalone',
        background_color: '#FAF8F4',
        theme_color: '#A3C68C',
        icons: [
          {
            src: '/icons/rabbit-svgrepo-com.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/rabbit-svgrepo-com.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
        ],
        apple: [
          {
            src: '/icons/rabbit-svgrepo-com.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/manifest+json',
        },
      }
    )
  }
}

