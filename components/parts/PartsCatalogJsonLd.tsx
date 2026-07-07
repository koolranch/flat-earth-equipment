import type { CatalogPart } from '@/lib/parts/catalogQuery';
import {
  buildCatalogFaqJsonLd,
  buildCatalogItemListJsonLd,
} from '@/lib/parts/catalogSeo';

type Props = {
  parts: CatalogPart[];
  showFaq?: boolean;
};

export default function PartsCatalogJsonLd({ parts, showFaq = false }: Props) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCatalogItemListJsonLd(parts)),
        }}
      />
      {showFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildCatalogFaqJsonLd()),
          }}
        />
      )}
    </>
  );
}
