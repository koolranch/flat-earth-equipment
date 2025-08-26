// lib/analytics.ts
export const analytics = {
  track: async (event: string, props?: Record<string, unknown>) => {
    try {
      if (process.env.NEXT_PUBLIC_ANALYTICS_OFF === "1") return;
      if (typeof window !== "undefined") {
        console.debug("[analytics]", event, props ?? {});
      }
    } catch {
      // swallow
    }
  }
};
