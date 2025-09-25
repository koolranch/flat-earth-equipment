# Tabbed/Flashcard Regression Report

Generated: 2025-09-25T01:03:04.977Z

## Which TabbedModuleLayout is imported by page.tsx?

`import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';`

## File Snapshots (top excerpts)

### components/training/module/TabbedModuleLayout.tsx

Top(40):
'use client';
import React from 'react';
import FlashCardDeck, { type FlashCard } from '@/components/training/FlashCardDeck';
import { getModuleFlashcards } from '@/lib/training/flashcards';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';
import { useModuleTabs } from '@/hooks/useModuleTabs';
import { isStepDone } from '@/lib/trainingProgress';
import { useModuleGate } from '@/components/training/useModuleGate';
import { TabCompleteButton } from '@/components/training/TabCompleteButton';
import StepContinue from '@/components/training/module/StepContinue';
import { ModuleFooterCTA } from '@/components/training/ModuleFooterCTA';
import { toRouteIndex, nextRouteIndexFromCurrent } from '@/lib/training/routeIndex';

type Props = {
  courseSlug: string;
  moduleSlug?: string; // Optional now, can be overridden by contentSlug
  contentSlug?: string; // NEW: explicit content slug override
  moduleKey?: 'm1'|'m2'|'m3'|'m4'|'m5'; // NEW: for progress tracking
  title: string;
  order?: number; // NEW: module order for routing
  nextHref?: string; // Optional now, can be computed from order
  flashCards?: any[];
  flashModuleKey?: string; // NEW: runtime fetch key like 'module-2'
  flashCardCount?: number; // NEW: show count in tab label
  onFlashSeen?: () => void;
  osha?: React.ReactNode; // Optional for intro/outro
  practice?: (opts: { onComplete: () => void }) => React.ReactNode; // Optional
  quizMeta?: { questions: number; passPct: number };
  children?: React.ReactNode; // For fallback content when no contentSlug
};

function StatusDot({ state }: { state: 'locked' | 'todo' | 'done' }) {
  if (state === 'locked') return <span className='ml-2 inline-flex items-center text-slate-400' aria-label='locked'>🔒</span>;
  if (state === 'done')   return <span className='ml-2 inline-block w-2.5 h-2.5 rounded-full bg-emerald-500' aria-label='complete' />;
  return <span className='ml-2 inline-block w-2.5 h-2.5 rounded-full bg-slate-300' aria-label='incomplete' />;
}

export default function TabbedModuleLayout({
  courseSlug, moduleSlug, contentSlug, moduleKey, title, order, nextHref, flashCards, flashModuleKey, flashCardCount, onFlashSeen, osha, practice,
  quizMeta = { questions: 8, passPct: 80 }, children

Flags: effectiveSlug=false flashDeps=true earlyNull=false


### components/training/unified/TabbedModuleLayout.tsx

MISSING


## UnifiedQuizFlow flags

Top(60):


Flags: renderNull=false

## Grep for risky patterns (early returns, placeholders, slug lookups)

**/Users/christopherray/Documents/flat-earth-equipment/app/api/case-lookup/route.ts**
- L32: if (pin.length !== 17) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/cat-lookup/route.ts**
- L28: if (vin.length !== 17) return null;
- L41: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/clark-lookup/route.ts**
- L28: if (vin.length !== 17) return null;
- L41: return null;
- L89: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/crown-lookup/route.ts**
- L29: if (vin.length !== 17) return null;
- L42: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/doosan-lookup/route.ts**
- L18: if(vin.length !== 17) return null;
- L25: if(!model) return null;
- L28: if(!m) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/ep-lookup/route.ts**
- L18: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/factorycat-lookup/route.ts**
- L15: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/gehl-lookup/route.ts**
- L15: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/hangcha-lookup/route.ts**
- L18: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/haulotte-lookup/route.ts**
- L17: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/hyundai-lookup/route.ts**
- L16: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/jcb-lookup/route.ts**
- L29: if (pin.length !== 17) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/jlg-lookup/route.ts**
- L27: if(vin.length !== 17) return null;
- L30: if(error) return null;
- L60: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/jungheinrich-lookup/route.ts**
- L18: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/komatsu-lookup/route.ts**
- L14: if (vin.length !== 17) return null;
- L27: return null;
- L35: if (!model) return null;
- L40: if (!match) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/kubota-lookup/route.ts**
- L18: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/linde-lookup/route.ts**
- L17: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/lull-lookup/route.ts**
- L14: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/manitou-lookup/route.ts**
- L18: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/mitsubishi-lookup/route.ts**
- L19: if(vin.length !== 17) return null;
- L26: if(!model) return null;
- L28: if(!m) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/practical/[id]/sign/route.ts**
- L7: if (!m) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/quiz/[filename]/route.ts**
- L29: if (!fs.existsSync(filePath)) return null
- L35: return null

**/Users/christopherray/Documents/flat-earth-equipment/app/api/skyjack-lookup/route.ts**
- L16: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/takeuchi-lookup/route.ts**
- L17: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/tennant-lookup/route.ts**
- L16: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/toro-lookup/route.ts**
- L29: if (!input) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/toyota-lookup/route.ts**
- L8: if (!cleaned) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/api/unicarriers-lookup/route.ts**
- L20: if(vin.length !== 17) return null;
- L27: if(!model) return null;
- L29: if(!m) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/category/[slug]/page.tsx**
- L74: if (!brand) return null;
- L129: if (!related) return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/chargers/[slug]/page.tsx**
- L38: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/cheyenne-wy/page.tsx**
- L6: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/components/FeaturedProducts.tsx**
- L26: return null

**/Users/christopherray/Documents/flat-earth-equipment/app/karcher-serial-number-lookup/page.tsx**
- L131: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/training/TrainingHub.tsx**
- L271: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/training/module-1/page.tsx**
- L160: cards={getModuleFlashcards('module-1')}

**/Users/christopherray/Documents/flat-earth-equipment/app/verify/[code]/opengraph-image.tsx**
- L21: if (!cert) return null;
- L52: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/verify/[code]/page-old.tsx**
- L42: return null;
- L96: return null;

**/Users/christopherray/Documents/flat-earth-equipment/app/verify/[code]/page.tsx**
- L6: if (!res.ok) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/ActiveCampaignQuoteModal.tsx**
- L57: if (!open) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/BMSCompatibilityChecker.tsx**
- L55: if (!result) return null

**/Users/christopherray/Documents/flat-earth-equipment/components/ChargerHelpModal.tsx**
- L33: if (!open) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/CrispChat.tsx**
- L27: return null

**/Users/christopherray/Documents/flat-earth-equipment/components/FeaturedParts.tsx**
- L91: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/FeaturedProducts.tsx**
- L14: if (!products || products.length === 0) return null

**/Users/christopherray/Documents/flat-earth-equipment/components/FeaturedRentalEquipment.tsx**
- L19: return null
- L21: if (!items || items.length === 0) return null

**/Users/christopherray/Documents/flat-earth-equipment/components/FilterChips.tsx**
- L27: if (chips.length === 0) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/HandbookSection.tsx**
- L401: return null
- L407: if (!handbookContent) return null

**/Users/christopherray/Documents/flat-earth-equipment/components/Pagination.tsx**
- L18: if (pages <= 1) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/PrelaunchBanner.tsx**
- L8: if (!PRELAUNCH_PREVIEW || hidden) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/QuizModal.tsx**
- L209: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/QuoteModal.tsx**
- L21: if (!open) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/RecommendedChargerCard.tsx**
- L14: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/RelatedChargers.tsx**
- L16: if (!current) return null;
- L29: if (error || !all) return null;
- L52: if (items.length === 0) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/SelectorDebugPanel.tsx**
- L18: if(process.env.NEXT_PUBLIC_DEBUG_SELECTOR !== '1') return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/SimpleQuoteModal.tsx**
- L75: if (!open) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/StickyBottomCTA.tsx**
- L37: if (!isVisible) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/StickyFooterCTA.tsx**
- L23: if (!isVisible) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/TopPickCard.tsx**
- L13: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/TrainingVideo.tsx**
- L46: default: return null

**/Users/christopherray/Documents/flat-earth-equipment/components/brand/BrandFAQBlock.tsx**
- L7: if (!faq) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/brand/BrandGuideBlock.tsx**
- L8: if (!guide) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/brand/BrandHubCTA.tsx**
- L32: if (!mounted) return null; // Prevent hydration mismatch

**/Users/christopherray/Documents/flat-earth-equipment/components/brand/CommunityNotes.tsx**
- L17: if (error || !data || !data.length) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/brand/RecentCommunityNotes.tsx**
- L12: if (!data || !data.length) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/debug/CTADebugProbe.tsx**
- L41: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/debug/ClickShieldProbe.tsx**
- L43: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/dev/QAEventListener.tsx**
- L15: return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/guides/GuideSection.tsx**
- L7: if (!guides?.length) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/guides/GuidesPanel.tsx**
- L27: if (!data) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/seo/BrandFaqJsonLd.tsx**
- L4: if (!faqs?.length) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/seo/HowToRetrievalJsonLd.tsx**
- L4: if (!steps?.length) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/training/module/TabbedModuleLayout.tsx**
- L68: return getModuleFlashcards(moduleSlugForCards);
- L73: if (!effectiveContentSlug) return;
- L82: if (!effectiveContentSlug) return;
- L89: if (!effectiveContentSlug) return;
- L197: await markDone("cards");

**/Users/christopherray/Documents/flat-earth-equipment/components/training/orientation/InteractiveChips.tsx**
- L30: if (!open) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/ui/AccessibleModal.tsx**
- L52: if (!open) return null;

**/Users/christopherray/Documents/flat-earth-equipment/components/ui/Modal.tsx**
- L29: if (!open) return null

**/Users/christopherray/Documents/flat-earth-equipment/components/ui/tabs.tsx**
- L70: if (context.value !== value) return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/api.ts**
- L12: if (error || !data) return null

**/Users/christopherray/Documents/flat-earth-equipment/lib/brandFaqs.ts**
- L8: if (!fs.existsSync(p)) return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/brandGuides.ts**
- L15: if (!fs.existsSync(file)) return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/brands.ts**
- L26: return null;
- L32: return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/chargers.ts**
- L41: return null;
- L43: if (Number.isNaN(n) || n <= 0) return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/mdx-utils.ts**
- L14: return null
- L30: return null
- L43: return null

**/Users/christopherray/Documents/flat-earth-equipment/lib/mdx.ts**
- L52: return null;
- L100: return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/modules/registry.ts**
- L115: if (!current) return null;
- L124: if (!current) return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/recsUtil.ts**
- L3: if(!voltage) return null; const map: Record<number, number> = {24:600,36:750,48:750,80:1000};
- L7: const ah = assumedAh(voltage); if(!ah) return null; const denom = speed==='overnight'?10:5; return Math.max(10, Math.round(ah/denom));

**/Users/christopherray/Documents/flat-earth-equipment/lib/shippo.ts**
- L223: return null;

**/Users/christopherray/Documents/flat-earth-equipment/lib/training/flashcards.ts**
- L4: export function getModuleFlashcards(slug: string): FlashCard[] {

**/Users/christopherray/Documents/flat-earth-equipment/lib/training/progress-write.ts**
- L13: return null;
- L62: if (!moduleSlug) return { ok: false, error: 'missing_moduleSlug', status: 400 } as const;

## Recent Git history (last 15 commits for key files)

`
commit 28b82efe217bee165f16547a730e800ff58c85b8
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-24 20:47:58 -0400

    fix: restore TabbedModuleLayout original behavior with DB content_slug
    
    - Remove early return that prevented tabbed layout rendering
    - Add proper computed slug logic that prefers DB content_slug
    - Ensure all content loaders use effective slug with fallbacks
    - Add E2E test for module flashcards functionality
    - Preserve all existing tabs, gating, and UI behavior

commit 0be06b180ada0b34cd0f7b234363a09e7c4cbd3b
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-24 20:25:41 -0400

    feat: implement DB-driven module routing with correct resume logic
    
    - Create getCourseModules.ts and getResumeOrder.ts utilities
    - Add IntroOrOutro component for modules without content_slug
    - Update TabbedModuleLayout to handle contentSlug override
    - Create dynamic module/[order]/page.tsx with proper DB routing
    - Update training hub to use DB order for Start button links
    - Add E2E tests for training routing and intro page
    - Ensure Resume button computes correct next module from resume_state/quiz_attempts

commit 37a4839e2a0d2780fb2b03bedd4662b6704cbef3
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-22 12:21:23 -0400

    Normalize module routing: 1-based DB order → 0-based route index
    
    - Create routeIndex utility for proper DB order to route mapping:
      * toRouteIndex(order) converts 1-based DB order to 0-based route index
      * nextRouteIndexFromCurrent() for sequential navigation
    - Update StartModuleButton to use normalized route index:
      * Introduction (order 1) → /training/module/0
      * Module 1 (order 2) → /training/module/1
      * Module 2 (order 3) → /training/module/2
    - Enhance TrainingHub with proper route index calculation:
      * Extract DB order from module data
      * Convert to 0-based route index for navigation
      * Maintain existing unlock logic and visual states
    - Update resolveResumeHref to use 0-based indexing:
      * Check resume_state.moduleIndex first (0-based)
      * Convert DB order to route index for consistency
      * Fallback to /training/module/0 (Introduction)
    - All navigation now uses consistent 0-based indexing
    - Preserved existing href routing for slug-based navigation

commit e0f455fc04155235a431fbf72d18e37bc7469940
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-21 09:10:55 -0400

    Implement training resume + unlock logic with Start button navigation
    
    - Create getResumeInfoServer utility for server-side progress calculation:
      * Determines next incomplete module from quiz_attempts.passed
      * Calculates unlocked modules based on sequential completion
      * Resolves resume path using content_slug or module order
      * Provides module list with unlock status
    - Add /api/training/progress/resume endpoint for state persistence:
      * Stores moduleIndex and tab in enrollments.resume_state
      * Updates on tab changes and module navigation
      * Non-blocking API calls for smooth UX
    - Update HeaderProgress to show X/Y completion format:
      * Primary: '{completed}/{total} complete'
      * Thinner progress bar (h-2) for visual balance
      * Downplayed percentage in smaller text
      * Enhanced ARIA labels with module context
    - Enhance TrainingHub module list with unlock logic:
      * Start buttons navigate to correct module URLs
      * Locked modules show disabled state with lock icon
      * Proper test IDs for reliable button targeting
    - Update TabbedModuleLayout to persist resume state:
      * Tracks current module and tab position
      * Updates enrollments.resume_state on tab changes
      * Ensures resume functionality works across sessions

commit d4f73b9895f48d569b182f9de32747e007d2e2de
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-20 21:55:44 -0400

    Implement fractional progress tracking with reliable gate recording
    
    - Create markGateClient.ts for client-side gate completion tracking
    - Add fractional progress calculation: 25% per gate per module (osha/practice/cards/quiz)
    - Update useModuleGate to support moduleSlug parameter for proper gate tracking
    - Enhance TabbedModuleLayout to pass moduleSlug for accurate progress persistence
    - Progress now updates incrementally as each gate is completed (not just full modules)
    - Maintain backward compatibility with existing moduleKey-based tracking
    - Database remains authoritative source with enrollments.progress_pct sync
    - All existing UI preserved, enhanced with reliable server-side persistence

commit 9a9653c91ea0a1ede02a9710b7f6abbda982d473
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-19 22:14:37 -0400

    Module UX: Add 'Mark reviewed & continue' button with inline 'Saved' feedback
    
    - Create StepContinue component with brief 'Saved' confirmation and auto-advance
    - Replace TabCompleteButton with StepContinue in OSHA and Practice tabs
    - DB-only persistence (no localStorage) with idempotent server calls
    - Consistent UX across all modules via shared TabbedModuleLayout
    - Button text adapts: 'Mark reviewed & continue' vs 'Mark practiced & continue' vs 'Continue' if already done
    - Add E2E test to verify button shows and advances to next tab
    - Non-blocking error handling - still advances on server errors

commit e4303b1b667b8bb7fd71dfa1d87590c92f8cdbbb
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-19 21:45:26 -0400

    Remove pre-launch preview banners from training dashboard
    
    - Add PRELAUNCH_PREVIEW flag in lib/training/flags.ts (defaults to false)
    - Update PrelaunchBanner component to respect the flag
    - Conditionally hide inline 'Training preview is available' banner
    - Add E2E test to verify banners are hidden by default
    - Banners can be re-enabled with NEXT_PUBLIC_TRAINING_PRELAUNCH=true

commit 90a6a455dfad7a7380ed26ee08f239618e491268
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-17 16:47:01 -0400

    feat: auth-aware Safety CTA + flashcards DB-only + legacy redirect
    
    - Add server-side auth detection for Safety Get Started CTA
    - Anonymous users → /login?next=/training, authed users → /training directly
    - Remove localStorage from flashcards, use DB as single source of truth
    - Add legacy redirect /training/modules/[slug] → /training
    - Add E2E tests for auth flow and flashcard persistence
    - Preserve accessibility and existing styling

commit 207a3c7ef075416e48e2a254f3ddf9333316b2ac
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-14 10:07:47 -0400

    feat: Flash Cards overhaul with Question→Answer UX and curated content for Modules 1–5
    
    - Replace FlashCardDeck with improved Question→Answer interface
    - Add Question/Answer badges with visual state indicators
    - Implement safer timing: 12s dwell with 4.5s minimum hold after reveal
    - Add auto-advance toggle for user control (Auto: On/Off)
    - Create curated Q&A content for all modules 1-5 with domain expertise
    - Add flashcards resolver (lib/training/flashcards.ts) for module routing
    - Unify Flash Cards experience across all modules with consistent UX
    - Move CTA to bottom-right: 'Mark Flash Cards done → Quiz'
    - Preserve all existing progress tracking and quiz handoff behavior
    - Add proper accessibility with aria-live regions and keyboard controls

commit 528d07839c9e753be13bfd96292091abc0b08a42
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-13 13:32:54 -0400

    refactor: unify Flash Cards with shared deck component, bottom CTA only, 8s auto-advance, keyboard/mobile UX, Modules 1–5 wired
    
    - Create new FlashCardDeck component with unified UI/UX across all modules
    - Replace old FlashDeck implementations with single shared component
    - Move CTA to bottom-right position, enabled only when all cards viewed
    - Implement fixed 8000ms auto-advance with pause-while-flipped behavior
    - Add keyboard controls: Space=flip, ←/→=prev/next navigation
    - Ensure mobile-friendly button sizes (≥44px) and responsive layout
    - Convert all card data to CardItem format with optional media support
    - Wire onComplete/onCtaClick handlers for progress tracking and quiz routing
    - Remove duplicate CTA implementations and consolidate flash card logic
    - Update Modules 1-5 to use consistent FlashCardDeck component

commit 2dabb0c7a9390b2608baf9c5100a3f53c1110906
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-13 12:28:40 -0400

    feat(ui): move Flash Cards "Done → Quiz" CTA below controls for clearer flow
    
    - Move CTA from top header to footer below Back/Flip/Next controls
    - Add proper aria-labels for accessibility (Back card, Flip card, Next card)
    - Implement responsive layout: stacked on mobile, inline on desktop
    - Add light divider above footer for visual separation
    - Preserve existing behavior: CTA enabled only after all cards viewed
    - Update TabbedModuleLayout and FlashCardsPanel to use new footer layout
    - Maintain all existing analytics events and quiz gating logic

commit c8d5f3ff432392fb2ba786c1e57727dc1f7d58c6
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-13 11:57:52 -0400

    feat: Implement content-aware timing system for FlashDeck
    
    - Add readSecondsHint to Card type for per-card timing control
    - Replace fixed autoAdvanceMs with intelligent autoMode system
    - Add visual progress bar with pause/resume on hover/touch
    - Implement sophisticated timer management with performance.now()
    - Default to 9 seconds with customizable hints per card
    - Maintain fade mode as default for better readability
    - Update TabbedModuleLayout and FlashCardsPanel to use new API

commit 22205bacc5dcbe2cf653f2b30b017501d35ca591
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-13 11:14:50 -0400

    feat: Add enhanced FlashCard and FlashDeck components with animations and progress tracking

commit 7ef9ccd701116ab03e67657b6618fed8f20a87e4
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-12 16:59:48 -0400

    feat: Establish brand tokens and improve design system
    
    🎨 Brand Tokens & Design System:
    - Add Barlow Semi Condensed + Inter font stack via Google Fonts
    - Establish comprehensive color palette (accent, gray scale, success, danger)
    - Create brand tokens: #F76511 accent with hover/active states
    - Add typography utilities (.h1, .h2, .h3) with proper font-family + spacing
    - Implement card shadows, border radius, and focus ring styles
    
    🔧 UI Components:
    - Create reusable Button component with 5 variants (primary, secondary, outline, ghost, danger)
    - Add Badge component for success states
    - Create TabPills component for consistent tab styling
    - Update TabCompleteButton + ModuleFooterCTA to use new Button component
    
    ⚡ Training Module Improvements:
    - Apply new typography classes (.h2, .h3) to module titles and OSHA headings
    - Update tab styling with rounded corners and improved hover states
    - Add card shadows for better depth and visual hierarchy
    - Implement consistent button styling across all training interfaces
    
    🎯 Design Consistency:
    - Replace hardcoded colors with semantic tokens
    - Unified border radius (14px xl, 18px 2xl)
    - Consistent focus states and accessibility improvements
    - Better contrast and readability across dark/light surfaces
    
    This establishes a solid foundation for consistent UI/UX across the training system.

commit 1898e9930d54d7a62b7ce6bfdf0a67fefad7ef11
Author: Christopher Ray <cr525@gmail.com>
Date:   2025-09-12 16:02:34 -0400

    feat: Complete tab-specific completion system with UX refinements
    
    🎯 Tab Completion System:
    - Add useModuleGate hook for optimistic progress tracking
    - Add TabCompleteButton component with arrow icon and accessibility
    - Add ModuleFooterCTA component for module navigation gating
    
    🔄 Enhanced Tab Flow:
    - OSHA Basics → 'Mark OSHA Basics done → Practice' button
    - Practice → 'Mark Practice done → Flash Cards' button
    - Flash Cards → 'Mark Flash Cards done → Quiz' button
    - Quiz → Auto-marks complete on pass (existing logic)
    
    ✅ Progress Features:
    - Optimistic UI updates with server sync to /api/training/progress
    - Green completion dots on finished tabs
    - Enhanced gating: OSHA + Practice + Flash Cards → Quiz unlock
    - Footer CTA disabled until all steps complete
    
    🎮 UX Improvements:
    - No page reloads - smooth tab transitions
    - URL state: ?tab=practice for shareable links
    - Accessibility: aria-labels, keyboard navigation
    - Consistent styling with amber primary buttons
    
    🔧 Module 5 Fix:
    - OSHA Continue now switches to Practice tab (not route away)
    - Proper tab sequence maintained across all modules
    - Footer CTA shows 'Finish Course' for Module 5
    
    Resolves: Tab completion flow with visual feedback and progress persistence

`
