import { expect, test, devices } from '@playwright/test';

test.describe('Spanish /es/safety landing page', () => {
  test('loads Spanish canonical page with hreflang and localized content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/es/safety');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { name: /certificación de montacargas/i }).first()).toBeVisible();
    await expect(page.getByText('Descarga la app gratis').first()).toBeVisible();
    await expect(page.getByText('Entrena gratis en la app. Paga $49 cuando estés listo').first()).toBeVisible();
    await expect(page.getByText('Bilingüe (próximamente)')).toHaveCount(0);
    await expect(page.getByText('Actualmente disponible en inglés')).toHaveCount(0);

    const alternates = await page.locator('link[rel="alternate"]').evaluateAll((links) =>
      links.map((link) => ({
        hreflang: link.getAttribute('hreflang'),
        href: link.getAttribute('href'),
      })),
    );

    expect(alternates).toEqual(
      expect.arrayContaining([
        { hreflang: 'es', href: 'https://www.flatearthequipment.com/es/safety' },
        { hreflang: 'en', href: 'https://www.flatearthequipment.com/safety' },
        { hreflang: 'x-default', href: 'https://www.flatearthequipment.com/safety' },
      ]),
    );
  });

  test('personalizes ad state and noindexes parameterized Spanish URLs', async ({ page }) => {
    await page.goto('/es/safety?state=texas&gclid=test123');

    await expect(page.getByRole('heading', { name: /Texas.*menos de 30 minutos/i }).first()).toBeVisible();
    await expect(page.locator('meta[name="robots"][content="noindex, nofollow"]').first()).toHaveCount(1);

    await page.goto('/es/safety?state=invalid');
    await expect(page.getByRole('heading', { name: /obtén tu certificación de montacargas en línea/i }).first()).toBeVisible();
  });

  test('legacy Spanish certification URL permanently redirects to /es/safety', async ({ request }) => {
    const response = await request.get('/certificacion-montacargas-espanol', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe('/es/safety');
  });

  test('mobile app CTA preserves Spanish campaign attribution', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['Pixel 5'] });
    const page = await context.newPage();
    const consoleMessages: string[] = [];

    page.on('console', (message) => consoleMessages.push(message.text()));
    await page.route('https://play.google.com/**', (route) => route.abort());

    await page.goto(
      '/es/safety?state=texas&gclid=test123&utm_source=google&utm_medium=cpc&utm_campaign=es_test&utm_content=ad_a&utm_term=certificacion%20de%20montacargas',
    );

    await page.evaluate(() => {
      window.gtag = (...args: unknown[]) => {
        const maybeOptions = args[2] as { event_callback?: () => void } | undefined;
        if (maybeOptions?.event_callback) window.setTimeout(maybeOptions.event_callback, 0);
      };
      window.dataLayer = [];
    });

    await page.getByRole('button', { name: /Descarga la app gratis/i }).click();
    await page.waitForTimeout(1500);

    const navigationLog = consoleMessages.find((message) =>
      message.includes('[app_download_click] navigating to https://play.google.com'),
    );

    expect(navigationLog).toContain('gclid=test123');
    expect(navigationLog).toContain('utm_source=google');
    expect(navigationLog).toContain('utm_medium=cpc');
    expect(navigationLog).toContain('utm_campaign=es_test');
    expect(navigationLog).toContain('utm_content=ad_a');
    expect(navigationLog).toContain('utm_term=certificacion+de+montacargas');
    expect(consoleMessages.join('\n')).toContain('source: safety_hero_es');

    await context.close();
  });
});
