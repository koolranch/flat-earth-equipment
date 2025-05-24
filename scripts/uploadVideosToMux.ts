/*
  node scripts/uploadVideosToMux.ts ./assets/videos/
  ─ uploads every mp4 in a local folder to Mux
  ─ writes (url, module_title) rows to public.modules
*/
import fs from 'fs'
import path from 'path'
import Mux from '@mux/mux-node'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
})
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main(dir: string) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4'))
  let order = 1
  
  // Get the forklift course ID
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'forklift')
    .single()
    
  if (!course) {
    console.error('Forklift course not found!')
    return
  }
  
  for (const file of files) {
    console.log(`Uploading ${file}...`)
    
    try {
      // Create a direct upload
      const upload = await mux.video.uploads.create({
        cors_origin: '*',
        new_asset_settings: {
          playback_policy: ['public']
        }
      })
      
      console.log(`Upload created with URL: ${upload.url}`)
      
      // For direct uploads, you need to upload the file to the URL provided by Mux
      // This would typically be done by the client/browser
      // For server-side uploads, we'd need a different approach
      
      // Instead, let's use the asset creation directly
      const asset = await mux.video.assets.create({
        inputs: [{
          url: `file://${path.resolve(dir, file)}`  // This assumes local file access
        }],
        playback_policy: ['public']
      })
      
      // Wait for asset to be ready
      let assetReady = false
      while (!assetReady) {
        const checkAsset = await mux.video.assets.retrieve(asset.id)
        if (checkAsset.status === 'ready') {
          assetReady = true
          const playbackId = checkAsset.playback_ids?.[0]?.id
          
          if (!playbackId) {
            console.error('No playback ID for', file)
            continue
          }
          
          await supabase.from('modules').insert({
            course_id: course.id,
            order,
            title: path.parse(file).name.replace(/-/g, ' ').replace(/_/g, ' '),
            video_url: `https://stream.mux.com/${playbackId}.m3u8`
          })
          
          order++
          console.log(`✅ ${file} → ${playbackId}`)
        } else if (checkAsset.status === 'errored') {
          console.error(`Asset creation failed for ${file}`)
          break
        } else {
          console.log(`Asset status: ${checkAsset.status}, waiting...`)
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }
}

// Note: For production use, you'd typically:
// 1. Upload videos to a cloud storage (S3, etc)
// 2. Provide the public URL to Mux
// 3. Or use Mux's direct upload feature with signed URLs

console.log(`
Note: This script assumes you have video files locally.
For production, consider:
1. Uploading to cloud storage first
2. Using Mux direct uploads with signed URLs
3. Or manually creating assets in Mux dashboard
`)

main(process.argv[2] ?? './assets/videos').catch(console.error) 