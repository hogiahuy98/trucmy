#!/usr/bin/env node

/**
 * Generate PNG icons from SVG for /an-gi PWA
 * 
 * Requirements:
 * - sharp: npm install sharp
 * - Or ImageMagick: brew install imagemagick (macOS) / apt-get install imagemagick (Linux)
 */

const fs = require('fs')
const path = require('path')

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
const svg192 = path.join(iconsDir, 'angi-192.svg')
const svg512 = path.join(iconsDir, 'angi-512.svg')
const png192 = path.join(iconsDir, 'angi-192.png')
const png512 = path.join(iconsDir, 'angi-512.png')

// Try to use sharp first (faster, better quality)
async function convertWithSharp() {
  try {
    const sharp = require('sharp')
    
    console.log('Converting icons with sharp...')
    
    // Convert 192x192
    await sharp(svg192)
      .resize(192, 192)
      .png()
      .toFile(png192)
    console.log('✓ Created angi-192.png')
    
    // Convert 512x512
    await sharp(svg512)
      .resize(512, 512)
      .png()
      .toFile(png512)
    console.log('✓ Created angi-512.png')
    
    console.log('\n✅ Icons generated successfully!')
    return true
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('sharp not found, trying ImageMagick...')
      return false
    }
    throw error
  }
}

// Fallback to ImageMagick
function convertWithImageMagick() {
  const { execSync } = require('child_process')
  
  try {
    console.log('Converting icons with ImageMagick...')
    
    // Convert 192x192
    execSync(
      `convert -background none -resize 192x192 "${svg192}" "${png192}"`,
      { stdio: 'inherit' }
    )
    console.log('✓ Created angi-192.png')
    
    // Convert 512x512
    execSync(
      `convert -background none -resize 512x512 "${svg512}" "${png512}"`,
      { stdio: 'inherit' }
    )
    console.log('✓ Created angi-512.png')
    
    console.log('\n✅ Icons generated successfully!')
    return true
  } catch (error) {
    console.error('❌ ImageMagick conversion failed:', error.message)
    console.log('\n💡 Alternative options:')
    console.log('1. Install sharp: npm install sharp')
    console.log('2. Install ImageMagick: brew install imagemagick')
    console.log('3. Use online tool: https://cloudconvert.com/svg-to-png')
    return false
  }
}

// Main execution
async function main() {
  // Check if SVG files exist
  if (!fs.existsSync(svg192) || !fs.existsSync(svg512)) {
    console.error('❌ SVG files not found!')
    console.log('Expected:', svg192)
    console.log('Expected:', svg512)
    process.exit(1)
  }
  
  // Try sharp first, then ImageMagick
  const success = await convertWithSharp() || convertWithImageMagick()
  
  if (!success) {
    process.exit(1)
  }
}

main().catch(console.error)

