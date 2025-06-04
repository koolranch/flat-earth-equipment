import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'
import fs from 'fs'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Create simple SVG assets for the game
const createSVGAsset = (emoji: string, color: string = '#f97316') => {
  return `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="60" fill="${color}" stroke="#ffffff" stroke-width="4"/>
    <text x="64" y="80" text-anchor="middle" font-size="48" font-family="Arial">${emoji}</text>
  </svg>`
}

const assets = {
  'vest.svg': createSVGAsset('🦺', '#ff6b35'),
  'fork_down.svg': createSVGAsset('⬇️', '#3b82f6'),
  'brake.svg': createSVGAsset('🛑', '#dc2626'),
  'bg.svg': `<svg width="400" height="225" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="warehouse" patternUnits="userSpaceOnUse" width="50" height="50">
        <rect width="50" height="50" fill="#f3f4f6"/>
        <rect x="0" y="0" width="25" height="25" fill="#e5e7eb"/>
        <rect x="25" y="25" width="25" height="25" fill="#e5e7eb"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#warehouse)"/>
    <text x="200" y="120" text-anchor="middle" font-size="24" font-family="Arial" fill="#6b7280">WAREHOUSE FLOOR</text>
  </svg>`
}

async function uploadGameAssets() {
  try {
    console.log('🎨 Creating and uploading game assets...')
    
    // Create temp directory
    if (!fs.existsSync('./temp-assets')) {
      fs.mkdirSync('./temp-assets')
    }
    
    for (const [filename, svgContent] of Object.entries(assets)) {
      const filepath = `./temp-assets/${filename}`
      
      // Write SVG file
      fs.writeFileSync(filepath, svgContent)
      console.log(`✅ Created ${filename}`)
      
      // Upload to Supabase
      const fileBuffer = fs.readFileSync(filepath)
      const pngFilename = filename.replace('.svg', '.png')
      
      const { error } = await supabase.storage
        .from('game')
        .upload(pngFilename, fileBuffer, {
          contentType: 'image/svg+xml',
          upsert: true
        })
      
      if (error) {
        console.error(`❌ Error uploading ${pngFilename}:`, error)
      } else {
        console.log(`🚀 Uploaded ${pngFilename} to Supabase`)
      }
      
      // Clean up temp file
      fs.unlinkSync(filepath)
    }
    
    // Clean up temp directory
    fs.rmdirSync('./temp-assets')
    
    console.log('\n✨ All game assets created and uploaded!')
    console.log('\n🎮 Module 1 should now work with fallback emojis and proper styling.')
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

uploadGameAssets() 