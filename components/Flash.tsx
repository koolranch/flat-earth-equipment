'use client'

interface FlashProps {
  q: string
  a: string
}

export default function Flash({ q, a }: FlashProps) {
  return (
    <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">?</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {q}
          </h4>
          <div className="text-sm text-blue-800">
            {a}
          </div>
        </div>
      </div>
    </div>
  )
} 