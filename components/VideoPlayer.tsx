'use client'
import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  className?: string
}

export default function VideoPlayer({ src, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Check if this is an HLS stream
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(video)
        
        return () => {
          hls.destroy()
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // iOS Safari native HLS support
        video.src = src
      }
    } else {
      // Regular video file
      video.src = src
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      controls
      className={className}
      playsInline
    />
  )
} 