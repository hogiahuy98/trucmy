// Route handler to serve manifest.json at /an-gi/manifest.json
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'an-gi', 'manifest.json')
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving manifest:', error)
    // Return a fallback manifest if file doesn't exist
    return NextResponse.json(
      {
        name: 'Ăn gì hôm nay',
        short_name: 'Ăn gì',
        start_url: '/an-gi',
        scope: '/an-gi',
        display: 'standalone',
        background_color: '#FAF8F4',
        theme_color: '#A3C68C',
        icons: [
          {
            src: '/icons/trai-bo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/trai-bo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
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

