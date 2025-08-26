/* Wrapper to ensure the Parts form has a stable anchor id and sticky-header offset */
import React from 'react';

export default function BrandPartsFormSection({ children }: { children: React.ReactNode }) {
  return (
    <section id='parts-request' className='scroll-mt-28'>
      {children}
    </section>
  );
}
