'use client'
import { useEffect, useState } from 'react'

export default function GuidePane({
  mdx,
  enrollmentId,
  onReady
}: {
  mdx: React.ReactNode
  enrollmentId: string
  onReady: () => void
}) {
  const [sec, setSec] = useState(0)
  const [hasUnlocked, setHasUnlocked] = useState(false)
  
  console.log('📖 GuidePane rendering, enrollmentId:', enrollmentId)

  /* 15-s timer */
  useEffect(() => {
    const id = setInterval(() => setSec(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  /* unlock + record */
  useEffect(() => {
    if (sec >= 15 && !hasUnlocked) {
      console.log('🔓 Guide reading complete, unlocking video...')
      setHasUnlocked(true)
      onReady()
      fetch('/api/guide-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, seconds: sec })
      }).catch(error => {
        console.error('Error recording guide reading time:', error)
      })
    }
  }, [sec, enrollmentId, onReady, hasUnlocked])

  return (
    <div className="prose mx-auto pb-16">
      {/* HERO BANNER */}
      <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 p-4 text-sm leading-tight">
        <strong className="text-orange-700">
          OSHA §1910.178 (l)(2)(iii)
        </strong>{' '}
        requires written instruction. Read for{' '}
        <span className="font-semibold text-orange-700">{Math.max(0, 15 - sec)}</span>{' '}
        seconds to unlock the video.
      </div>
      {mdx}
    </div>
  )
} 