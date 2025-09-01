'use client'

import { useEffect, useRef } from 'react'
import TranscriptToggle from './TranscriptToggle'

interface TrainingVideoProps {
  src: string
  poster?: string
  moduleId: number
  locale?: 'en' | 'es'
  className?: string
  onEnded?: () => void
  onError?: (e: any) => void
}

export default function TrainingVideo({
  src,
  poster,
  moduleId,
  locale = 'en',
  className = '',
  onEnded,
  onError
}: TrainingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Map module order to correct subtitle files
  const getSubtitleModuleId = (moduleId: number): number | string | null => {
    // Module mapping based on the database structure:
    // Order 1 (Introduction) -> intro.vtt (intro.mp4)
    // Order 2 (Module 1) -> module1.vtt (moduleone.mp4)
    // Order 3 (Module 2) -> module2.vtt (moduletwo.mp4)
    // Order 4 (Module 3) -> module3.vtt (modulethree.mp4)
    // Order 5 (Module 4) -> module4.vtt (modulefour.mp4)
    // Order 6 (Module 5) -> module5.vtt (modulefive.mp4)
    // Order 7 (Course Completion) -> outro.vtt (outro.mp4)
    
    switch (moduleId) {
      case 1: return 'intro'  // Introduction - intro.vtt
      case 2: return 1        // Module 1
      case 3: return 2        // Module 2
      case 4: return 3        // Module 3
      case 5: return 4        // Module 4
      case 6: return 5        // Module 5
      case 7: return 'outro'  // Course Completion - outro.vtt
      default: return null
    }
  }

  const subtitleModuleId = getSubtitleModuleId(moduleId)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !subtitleModuleId) return

    const handleLoadedMetadata = () => {
      const subtitleFileName = typeof subtitleModuleId === 'string' ? subtitleModuleId : `module${subtitleModuleId}`
      console.log(`🎬 Video loaded, setting ${locale} subtitles for module ${moduleId} (subtitle file: ${subtitleFileName})`)
      
      // Force the correct subtitle track to show
      const tracks = video.textTracks
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        if (track.language === locale) {
          track.mode = 'showing'
          console.log(`✅ Enabled ${locale} track: ${track.label}`)
        } else {
          track.mode = 'disabled'
        }
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    
    // Also try to set immediately if metadata is already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [locale, moduleId, subtitleModuleId])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <video
        ref={videoRef}
        controls
        crossOrigin="anonymous"
        className={`w-full h-auto max-h-[600px] rounded-lg ${className}`}
        poster={poster}
        onEnded={onEnded}
        onError={onError}
      >
        <source src={src} type="video/mp4" />

        {/* Only add tracks if subtitles exist for this module */}
        {subtitleModuleId && (
          <>
            {/* English captions track */}
            <track
              kind="captions"
              srcLang="en"
              label="English"
              src={`/captions/${typeof subtitleModuleId === 'string' ? subtitleModuleId : `module${subtitleModuleId}`}.en.vtt`}
              default={locale === 'en'}
            />

            {/* Spanish captions track */}
            <track
              kind="captions"
              srcLang="es"
              label="Español"
              src={`/captions/${typeof subtitleModuleId === 'string' ? subtitleModuleId : `module${subtitleModuleId}`}.es.vtt`}
              default={locale === 'es'}
            />
          </>
        )}

        Your browser does not support the video tag.
      </video>
      
      {/* Add transcript toggle if subtitles exist for this module */}
      {subtitleModuleId && (
        <TranscriptToggle 
          url={`/content/transcripts/${typeof subtitleModuleId === 'string' ? subtitleModuleId : `module${subtitleModuleId}`}.${locale}.txt`}
        />
      )}
    </div>
  )
} 