import { useState, useEffect, useRef, useCallback } from 'react'

interface LazyGameAssetsOptions {
  /** Images to preload when component becomes visible */
  images?: string[]
  /** Audio files to preload when component becomes visible */
  audio?: string[]
  /** Background images to load lazily */
  backgrounds?: string[]
  /** Enable intersection observer for lazy loading */
  useIntersectionObserver?: boolean
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Threshold for intersection observer */
  threshold?: number
}

interface LazyGameAssetsReturn {
  /** Whether assets are loaded */
  assetsLoaded: boolean
  /** Whether component is visible (if using intersection observer) */
  isVisible: boolean
  /** Ref to attach to the component for intersection observer */
  ref: React.RefObject<HTMLDivElement>
  /** Preloaded audio elements */
  audioElements: Record<string, HTMLAudioElement>
  /** Function to play audio with error handling */
  playAudio: (key: string) => Promise<void>
  /** Function to manually trigger asset loading */
  loadAssets: () => void
}

export function useLazyGameAssets(options: LazyGameAssetsOptions = {}): LazyGameAssetsReturn {
  const {
    images = [],
    audio = [],
    backgrounds = [],
    useIntersectionObserver = true,
    rootMargin = '50px',
    threshold = 0.1
  } = options

  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(!useIntersectionObserver)
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})
  
  const ref = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingPromiseRef = useRef<Promise<void> | null>(null)

  // Set up intersection observer
  useEffect(() => {
    if (!useIntersectionObserver || !ref.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observerRef.current?.disconnect()
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )

    observerRef.current.observe(ref.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [useIntersectionObserver, rootMargin, threshold])

  // Load assets when component becomes visible
  const loadAssets = useCallback(async () => {
    if (loadingPromiseRef.current) return loadingPromiseRef.current

    loadingPromiseRef.current = (async () => {
      try {
        const loadPromises: Promise<any>[] = []

        // Preload images
        if (images.length > 0) {
          const imagePromises = images.map(src => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = reject
              img.src = src
            })
          })
          loadPromises.push(...imagePromises)
        }

        // Preload background images
        if (backgrounds.length > 0) {
          const bgPromises = backgrounds.map(src => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = reject
              img.src = src
            })
          })
          loadPromises.push(...bgPromises)
        }

        // Load audio files
        if (audio.length > 0) {
          const audioPromises = audio.map(src => {
            return new Promise<[string, HTMLAudioElement]>((resolve, reject) => {
              const audioElement = new Audio(src)
              audioElement.preload = 'auto'
              audioElement.oncanplaythrough = () => resolve([src, audioElement])
              audioElement.onerror = reject
              audioElement.load()
            })
          })
          
          const audioResults = await Promise.allSettled(audioPromises)
          const loadedAudio: Record<string, HTMLAudioElement> = {}
          
          audioResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const [src, audioElement] = result.value
              const key = audio[index].split('/').pop()?.split('.')[0] || `audio_${index}`
              loadedAudio[key] = audioElement
            } else {
              console.warn('Failed to load audio:', audio[index], result.reason)
            }
          })
          
          setAudioElements(loadedAudio)
        }

        // Wait for all assets to load
        await Promise.allSettled(loadPromises)
        setAssetsLoaded(true)
      } catch (error) {
        console.warn('Some assets failed to load:', error)
        setAssetsLoaded(true) // Still mark as loaded to prevent blocking
      }
    })()

    return loadingPromiseRef.current
  }, [images, audio, backgrounds])

  // Trigger asset loading when component becomes visible
  useEffect(() => {
    if (isVisible && !assetsLoaded) {
      loadAssets()
    }
  }, [isVisible, assetsLoaded, loadAssets])

  // Play audio helper with error handling
  const playAudio = useCallback(async (key: string): Promise<void> => {
    const audioElement = audioElements[key]
    if (!audioElement) {
      console.warn(`Audio element '${key}' not found`)
      return
    }

    try {
      audioElement.currentTime = 0
      await audioElement.play()
    } catch (error) {
      // Ignore autoplay policy errors
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.log(`Audio '${key}' blocked by autoplay policy`)
      } else {
        console.warn(`Error playing audio '${key}':`, error)
      }
    }
  }, [audioElements])

  return {
    assetsLoaded,
    isVisible,
    ref,
    audioElements,
    playAudio,
    loadAssets
  }
} 