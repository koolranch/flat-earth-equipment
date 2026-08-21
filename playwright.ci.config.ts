// playwright.ci.config.ts
//
// CI runs the hermetic subset of the suite: tests that pass against a
// production build with only publishable Supabase credentials (no service
// role key, no seeded session/DB state, placeholder Stripe/Resend keys).
//
// The files listed in testIgnore need an authenticated session, service-role
// database access, or seeded training data. Deliberately NOT giving CI the
// production service role key: several of these tests write to the database,
// and CI must never mutate production data. Run the full suite locally with
// `npx playwright test` against a dev environment instead.
//
// If you fix one of these specs to be hermetic, remove it from the list.
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testIgnore: [
    'tests/brand-hub.spec.ts',
    'tests/demos.spec.ts',
    'tests/hub-resume.spec.ts',
    'tests/locale.spec.ts',
    'tests/progress.smoke.spec.ts',
    'tests/e2e/a11y.axe.spec.ts',
    'tests/e2e/a11y.smoke.spec.ts',
    'tests/e2e/a11y.spec.ts',
    'tests/e2e/axe.spec.ts',
    'tests/e2e/claim.smoke.spec.ts',
    'tests/e2e/eval.smoke.spec.ts',
    'tests/e2e/evaluation.spec.ts',
    'tests/e2e/evaluation.ui.spec.ts',
    'tests/e2e/exam.generator.spec.ts',
    'tests/e2e/exam.resume.spec.ts',
    'tests/e2e/exam.smoke.spec.ts',
    'tests/e2e/final-exam-route.spec.ts',
    'tests/e2e/final-exam.spec.ts',
    'tests/e2e/final.exam.flow.spec.ts',
    'tests/e2e/final.gate.spec.ts',
    'tests/e2e/flashcards-db-only.spec.ts',
    'tests/e2e/hub-start-resume.spec.ts',
    'tests/e2e/i18n.es.spec.ts',
    'tests/e2e/importer.smoke.spec.ts',
    'tests/e2e/legacy-redirect.spec.ts',
    'tests/e2e/login-loop-fixed.spec.ts',
    'tests/e2e/login-loop.spec.ts',
    'tests/e2e/marketing.smoke.spec.ts',
    'tests/e2e/mdx.modules.extra.spec.ts',
    'tests/e2e/mdx.modules.spec.ts',
    'tests/e2e/module-flashcards.spec.ts',
    'tests/e2e/module-intro.spec.ts',
    'tests/e2e/module-step-continue.spec.ts',
    'tests/e2e/module1-flash.spec.ts',
    'tests/e2e/module1.quiz.negative.spec.ts',
    'tests/e2e/module1.quiz.spec.ts',
    'tests/e2e/module1.spec.ts',
    'tests/e2e/module3.spec.ts',
    'tests/e2e/module4-hazard-hunt.spec.ts',
    'tests/e2e/module5-shutdown.spec.ts',
    'tests/e2e/modules.m3m4.spec.ts',
    'tests/e2e/modules.phase8.spec.ts',
    'tests/e2e/modules.phase9.spec.ts',
    'tests/e2e/osha_tabs.spec.ts',
    'tests/e2e/preop-continue.spec.ts',
    'tests/e2e/quiz.api.spec.ts',
    'tests/e2e/safety-cta-auth.spec.ts',
    'tests/e2e/safety-no-buy.spec.ts',
    'tests/e2e/seats_recert.spec.ts',
    'tests/e2e/security.spec.ts',
    'tests/e2e/spanish-safety.spec.ts',
    'tests/e2e/study.spec.ts',
    'tests/e2e/trainer-gate.spec.ts',
    'tests/e2e/trainer.dashboard.spec.ts',
    'tests/e2e/trainer.smoke.spec.ts',
    'tests/e2e/trainer.tools.spec.ts',
    'tests/e2e/training-auth-gates.spec.ts',
    'tests/e2e/training-hub.spec.ts',
    'tests/e2e/training-modules.spec.ts',
    'tests/e2e/training-routing.spec.ts',
    'tests/e2e/training.osha-basics.spec.ts',
    'tests/e2e/verify.cert.spec.ts',
    'tests/integration/exam-paper-insert.spec.ts',
    'tests/integration/exam-session-insert.spec.ts',
    'tests/integration/exam-smoke.spec.ts',
  ],
});
