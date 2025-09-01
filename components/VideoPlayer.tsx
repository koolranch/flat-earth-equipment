'use client'
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import TranscriptAccordion from '@/components/media/TranscriptAccordion'

interface VideoPlayerProps {
  src: string
  className?: string
  slug?: string
  poster?: string
  showTranscript?: boolean
}

export default function VideoPlayer({ src, className, slug, poster, showTranscript = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [locale, setLocale] = useState<'en' | 'es'>('en')

  // Get locale from cookie on client side
  useEffect(() => {
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as 'en' | 'es' || 'en'
    setLocale(cookieLocale)
  }, [])

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

  // Generate caption track URLs based on slug and locale
  const captionUrl = slug ? `/captions/${slug}.${locale}.vtt` : null
  const captionFallbackUrl = slug ? `/captions/${slug}.en.vtt` : null

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl overflow-hidden border bg-black">
        <video
          ref={videoRef}
          controls
          className={`w-full h-auto max-h-[600px] ${className || ''}`}
          playsInline
          poster={poster}
          crossOrigin="anonymous"
        >
          {/* Add caption tracks if slug is provided */}
          {slug ? (
            <>
              <track 
                kind="captions" 
                srcLang="en" 
                src={captionFallbackUrl || ''} 
                label="English" 
                default={locale === 'en'}
              />
              <track 
                kind="captions" 
                srcLang="es" 
                src={slug ? `/captions/${slug}.es.vtt` : ''} 
                label="Español" 
                default={locale === 'es'}
              />
            </>
          ) : (
            // Always provide at least one track for accessibility compliance
            <track kind="captions" srcLang="en" src="" label="No captions available" />
          )}
        </video>
        
        {/* Add transcript accordion if slug is provided and transcripts are enabled */}
        {slug && showTranscript && (
          <TranscriptAccordion slug={slug} locale={locale as 'en' | 'es'} />
        )}
      </div>
    </div>
  )
} 