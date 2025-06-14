'use client'

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
  return (
    <video
      controls
      crossOrigin="anonymous"
      className={`w-full h-auto max-h-[600px] rounded-lg ${className}`}
      poster={poster}
      onEnded={onEnded}
      onError={onError}
    >
      <source src={src} type="video/mp4" />

      {/* English captions track (if present) */}
      <track
        kind="captions"
        srcLang="en"
        label="English"
        src={`/captions/module${moduleId}.en.vtt`}
        default={locale === 'en'}
      />

      {/* Spanish captions track (browser ignores if file 404s) */}
      <track
        kind="captions"
        srcLang="es"
        label="Español"
        src={`/captions/module${moduleId}.es.vtt`}
        default={locale === 'es'}
      />

      Your browser does not support the video tag.
    </video>
  )
} 