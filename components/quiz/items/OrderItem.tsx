// components/quiz/items/OrderItem.tsx
"use client";
import React, { useState } from "react";
import type { OrderItem as OrderItemType } from "@/types/quiz";
import { useT } from "@/lib/i18n";

interface OrderItemProps {
  item: OrderItemType;
  onAnswer: (result: { correct: boolean; choice: any }) => void;
}

export function OrderItem({ item, onAnswer }: OrderItemProps) {
  const t = useT();
  const [currentOrder, setCurrentOrder] = useState<string[]>([...item.options]);
  const [submitted, setSubmitted] = useState(false);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (submitted) return;
    
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setCurrentOrder(newOrder);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveItem(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < currentOrder.length - 1) {
      moveItem(index, index + 1);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;
    
    setSubmitted(true);
    const correct = JSON.stringify(currentOrder) === JSON.stringify(item.correctOrder);
    
    onAnswer({
      correct,
      choice: currentOrder
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, action: 'up' | 'down') => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (action === 'up') {
        moveUp(index);
      } else {
        moveDown(index);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#0F172A]">{item.question}</h3>
      
      <div className="space-y-2">
        {currentOrder.map((option, index) => (
          <div
            key={`${option}-${index}`}
            className={`
              flex items-center gap-3 p-3 rounded-lg border
              ${submitted ? 'bg-slate-50 border-slate-200' : 'bg-white border-gray-300'}
            `}
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveUp(index)}
                onKeyDown={(e) => handleKeyDown(e, index, 'up')}
                disabled={submitted || index === 0}
                className="
                  w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-[#F76511]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center text-sm font-bold
                "
                aria-label={t('order.move_up', 'Move {item} up').replace('{item}', option)}
                tabIndex={0}
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(index)}
                onKeyDown={(e) => handleKeyDown(e, index, 'down')}
                disabled={submitted || index === currentOrder.length - 1}
                className="
                  w-8 h-8 rounded bg-gray-100 hover:bg-gray-200
                  focus:outline-none focus:ring-2 focus:ring-[#F76511]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center text-sm font-bold
                "
                aria-label={t('order.move_down', 'Move {item} down').replace('{item}', option)}
                tabIndex={0}
              >
                ↓
              </button>
            </div>
            
            <div className="flex-1 font-medium text-slate-800">
              {index + 1}. {option}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="
            px-6 py-2 rounded-lg bg-[#F76511] text-white font-medium
            hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#F76511]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {submitted ? t('quiz.submitted', 'Submitted') : t('quiz.submit_order', 'Submit Order')}
        </button>
      </div>

      {submitted && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100">
          <div className="text-sm text-slate-700">
            {t('order.your_order', 'Your order:')} {currentOrder.map((item, i) => `${i + 1}. ${item}`).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
