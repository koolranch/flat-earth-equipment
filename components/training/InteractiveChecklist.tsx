"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface InteractiveChecklistProps {
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
  onComplete: () => void;
  requireAllChecked?: boolean;
  storageKey?: string; // Unique key per module
  hideButton?: boolean; // Hide the completion button (when parent handles it)
}

export default function InteractiveChecklist({
  title,
  subtitle,
  items,
  onComplete,
  requireAllChecked = true,
  storageKey = 'osha-checklist',
  hideButton = false
}: InteractiveChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const totalItems = items.length;
  // Only count items that exist in current module
  const validCheckedItems = Array.from(checkedItems).filter(id => 
    items.some(item => item.id === id)
  );
  const checkedCount = validCheckedItems.length;
  const progress = Math.round((checkedCount / totalItems) * 100);
  const allChecked = checkedCount === totalItems;

  // Load saved progress from localStorage (module-specific key)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedIds = JSON.parse(saved);
        // Only restore IDs that exist in current items
        const validIds = savedIds.filter((id: string) => 
          items.some(item => item.id === id)
        );
        setCheckedItems(new Set(validIds));
      }
    } catch {}
  }, [storageKey, items]);

  // Save progress to localStorage
  useEffect(() => {
    try {
      // Only save valid items for current module
      localStorage.setItem(storageKey, JSON.stringify(validCheckedItems));
    } catch {}
  }, [checkedItems, storageKey, validCheckedItems]);

  // Show confetti when all items checked
  useEffect(() => {
    if (allChecked && !showConfetti) {
      setShowConfetti(true);
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [allChecked, showConfetti]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="text-base sm:text-lg text-slate-600 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Your Progress</span>
          <span className="text-lg font-bold text-[#F76511]">{checkedCount}/{totalItems}</span>
        </div>
        <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F76511] to-orange-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          {allChecked ? "🎉 All requirements reviewed!" : "Tap each item to mark as reviewed"}
        </p>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  scale: Math.random() * 2 + 1,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.05
                }}
                className="absolute text-2xl"
              >
                {['🎉', '✨', '⭐', '🎊'][i % 4]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Checklist Items */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isChecked = checkedItems.has(item.id);
          
          return (
            <motion.button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all active:scale-98 ${
                isChecked
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-300 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-1">
                  <motion.div
                    initial={false}
                    animate={{ 
                      scale: isChecked ? 1 : 1,
                      backgroundColor: isChecked ? '#10b981' : '#ffffff'
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-3 flex items-center justify-center ${
                      isChecked 
                        ? 'border-emerald-500' 
                        : 'border-slate-300'
                    }`}
                  >
                    <AnimatePresence>
                      {isChecked && (
                        <motion.svg
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {item.icon && (
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                  )}
                  <h3 className={`font-semibold text-base sm:text-lg mb-1 ${
                    isChecked ? 'text-emerald-900' : 'text-slate-900'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm sm:text-base leading-relaxed ${
                    isChecked ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {/* Check Badge */}
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Completion CTA - Only show if not hidden by parent */}
      {!hideButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 border-2 ${
            allChecked
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-slate-900 text-lg">
                {allChecked ? '✅ All Requirements Reviewed!' : '📋 Review All Requirements'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {allChecked 
                  ? 'Great job! Continue to the practice section.' 
                  : requireAllChecked 
                    ? `Check ${totalItems - checkedCount} more item${totalItems - checkedCount === 1 ? '' : 's'} to continue`
                    : 'You can continue anytime'
                }
              </p>
            </div>
            <button
              onClick={onComplete}
              disabled={requireAllChecked && !allChecked}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 ${
                allChecked || !requireAllChecked
                  ? 'bg-[#F76511] text-white hover:bg-orange-600 hover:shadow-xl'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {allChecked ? 'Continue to Practice →' : 'Mark OSHA Complete'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> This is a plain-language summary to help you pass and operate safely. 
          Always follow your site policy and the manufacturer's manual.
        </p>
      </div>
    </div>
  );
}

