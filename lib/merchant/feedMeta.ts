/**
 * Sidecar written by `scripts/build-merchant-feed.ts` next to the committed Merchant XML.
 * The XML itself carries no build timestamp, and Google reads only the committed file, so
 * this is how internal tooling knows when Shopping last caught up with catalog changes.
 */
export const MERCHANT_FEED_META_PATH = 'public/feed/google-merchant.meta.json';

export type MerchantFeedMeta = {
  built_at: string;
  item_count: number;
};
