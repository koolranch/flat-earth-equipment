export const PRELAUNCH_PREVIEW = (() => {
  // Default OFF. Toggle with NEXT_PUBLIC_TRAINING_PRELAUNCH=true if you ever need to show the banners again.
  const v = (process.env.NEXT_PUBLIC_TRAINING_PRELAUNCH ?? 'false').toString().trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
})();
