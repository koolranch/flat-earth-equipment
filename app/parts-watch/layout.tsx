/**
 * Internal tooling gets no storefront chrome. The root layout wraps the site nav and
 * footers in `[data-fee-chrome]` (the same hook the Forklift Certified host uses), so
 * hiding that here keeps this route a full-bleed dashboard without touching any other page.
 */
export default function PartsWatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: '[data-fee-chrome]{display:none !important}',
        }}
      />
      {children}
    </>
  );
}
