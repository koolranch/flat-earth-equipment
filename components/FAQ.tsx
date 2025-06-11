'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: [string, string][]
}

export default function FAQ({ items }: FAQProps) {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {items.map(([question, answer], index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{question}</span>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openItems.includes(index) ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {openItems.includes(index) && (
              <div className="px-4 pb-4 text-gray-600">
                {answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
} 