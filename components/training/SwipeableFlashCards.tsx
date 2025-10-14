"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

export type FlashCard = {
  id: string | number;
  front: React.ReactNode;
  back: React.ReactNode;
  img?: React.ReactNode;
  icon?: string;
};

interface SwipeableFlashCardsProps {
  cards: FlashCard[];
  onComplete: () => void;
  title?: string;
  autoAdvanceDelay?: number; // seconds until auto-navigate to quiz
}

export default function SwipeableFlashCards({
  cards,
  onComplete,
  title = "Flash Cards",
  autoAdvanceDelay = 3
}: SwipeableFlashCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const currentCard = cards[currentIndex];
  const allViewed = viewedCards.size === cards.length;
  const progress = Math.round((viewedCards.size / cards.length) * 100);

  // Mark current card as viewed when flipped
  useEffect(() => {
    if (isFlipped && currentCard) {
      setViewedCards(prev => new Set(prev).add(currentIndex));
    }
  }, [isFlipped, currentIndex, currentCard]);

  // Show completion screen when all cards viewed
  useEffect(() => {
    if (allViewed && !showCompletion) {
      setShowCompletion(true);
      setCountdown(autoAdvanceDelay);
    }
  }, [allViewed, showCompletion, autoAdvanceDelay]);

  // Countdown timer for auto-advance
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      if (countdown === 1) {
        onComplete();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - go to previous card
      if (currentIndex > 0) {
        setDirection('right');
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
      }
    } else if (info.offset.x < -threshold) {
      // Swiped left - go to next card
      if (currentIndex < cards.length - 1) {
        setDirection('left');
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    }
  }, [currentIndex, cards.length]);

  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setDirection('left');
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('right');
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, flipCard]);

  if (showCompletion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 text-center shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-emerald-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-3">All Cards Reviewed!</h2>
          <p className="text-lg text-slate-700 mb-6">
            Great job! You've reviewed all {cards.length} flashcards.
          </p>

          {countdown !== null && countdown > 0 ? (
            <div className="space-y-4">
              <motion.div
                key={countdown}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-[#F76511]"
              >
                {countdown}
              </motion.div>
              <p className="text-sm text-slate-600">Starting quiz automatically...</p>
              <button
                onClick={() => setCountdown(null)}
                className="text-sm text-slate-600 underline hover:text-slate-900"
              >
                Cancel auto-start
              </button>
            </div>
          ) : (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 bg-[#F76511] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Take Quiz Now →
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">
            Swipe or tap arrows • Tap card to flip
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#F76511]">{currentIndex + 1}</div>
          <div className="text-sm text-slate-600">of {cards.length}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-2">
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F76511] to-orange-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          {viewedCards.size} of {cards.length} cards reviewed
        </p>
      </div>

      {/* Swipeable Card Stack */}
      <div className="relative h-[500px] sm:h-[600px] flex items-center justify-center px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ 
              x: direction === 'left' ? 300 : direction === 'right' ? -300 : 0,
              opacity: 0
            }}
            animate={{ 
              x: 0, 
              opacity: 1
            }}
            exit={{ 
              x: direction === 'left' ? -300 : 300,
              opacity: 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            className="absolute w-full max-w-xl cursor-grab active:cursor-grabbing"
            onClick={flipCard}
          >
            <div className="relative">
              {/* Card */}
              <div 
                className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-8 sm:p-12 min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center"
              >
                {/* Question/Answer Badge */}
                <motion.div 
                  key={isFlipped ? 'answer' : 'question'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold ${
                    isFlipped 
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                      : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  }`}
                >
                  {isFlipped ? '💡 Answer' : '❓ Question'}
                </motion.div>

                {/* Card Content with Flip Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isFlipped ? 'back' : 'front'}
                    initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-6 w-full"
                  >
                    {/* Icon/Image */}
                    {(currentCard.img || currentCard.icon) && !isFlipped && (
                      <div className="mb-4">
                        {currentCard.img || (currentCard.icon && (
                          <img 
                            src={currentCard.icon} 
                            alt="Flashcard illustration" 
                            className="w-32 h-32 sm:w-40 sm:h-40 mx-auto object-contain drop-shadow-lg"
                          />
                        ))}
                      </div>
                    )}

                    {/* Text Content */}
                    <div className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed px-4">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </div>

                    {/* Flip Hint */}
                    <p className="text-sm text-slate-500 mt-6">
                      👆 Tap card to {isFlipped ? 'see question' : 'reveal answer'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Swipe indicators */}
              {currentIndex > 0 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-50">
                  <div className="bg-slate-700 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              )}
              
              {currentIndex < cards.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-50">
                  <div className="bg-slate-700 text-white rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Previous card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>

        <button
          onClick={flipCard}
          className={`px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-md ${
            isFlipped 
              ? 'bg-slate-100 border-2 border-slate-300 text-slate-700' 
              : 'bg-blue-600 border-2 border-blue-700 text-white hover:bg-blue-700'
          }`}
        >
          {isFlipped ? '🔄 Show Question' : '🔍 Reveal Answer'}
        </button>

        <button
          onClick={goToNext}
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F76511] border-2 border-orange-600 text-white font-semibold hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Next card"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 px-4">
        {cards.map((card, idx) => {
          const isViewed = viewedCards.has(idx);
          const isCurrent = idx === currentIndex;
          
          return (
            <button
              key={card.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsFlipped(false);
                setDirection(idx > currentIndex ? 'left' : 'right');
              }}
              className={`h-3 rounded-full transition-all ${
                isCurrent 
                  ? 'w-8 bg-[#F76511]' 
                  : isViewed 
                    ? 'w-3 bg-orange-300' 
                    : 'w-3 bg-slate-300'
              }`}
              aria-label={`Go to card ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Skip to Quiz Button - Always Visible */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-slate-900 text-lg">Ready for the quiz?</h3>
              <p className="text-sm text-slate-600 mt-1">
                {allViewed 
                  ? "You've reviewed all cards - great work!" 
                  : `Review ${cards.length - viewedCards.size} more card${cards.length - viewedCards.size === 1 ? '' : 's'} or skip ahead`
                }
              </p>
            </div>
            <button
              onClick={() => {
                console.log('📝 Taking quiz from flashcards');
                setCountdown(null); // Cancel auto-start
                onComplete();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F76511] text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Take Quiz →
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tips */}
      <div className="sm:hidden bg-blue-50 border border-blue-200 rounded-xl p-4 mx-4">
        <p className="text-sm text-blue-800 text-center">
          💡 <strong>Tip:</strong> Swipe left/right to navigate • Tap card to flip
        </p>
      </div>
    </div>
  );
}

