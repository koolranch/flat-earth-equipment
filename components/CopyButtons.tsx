'use client';

interface CopyButtonsProps {
  sku?: string | null;
  slug: string;
}

export default function CopyButtons({ sku, slug }: CopyButtonsProps) {
  return (
    <>
      <button
        onClick={() => navigator.clipboard.writeText(sku ?? "")}
        className="rounded-xl border px-3 py-2 text-sm"
        disabled={!sku}
        title={sku ? "Copy SKU" : "No SKU"}
      >
        Copy SKU
      </button>
      <button
        onClick={() => navigator.clipboard.writeText(slug)}
        className="rounded-xl border px-3 py-2 text-sm"
        title="Copy slug"
      >
        Copy Slug
      </button>
    </>
  );
}
