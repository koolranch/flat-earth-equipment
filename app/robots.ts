import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://www.flatearthequipment.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/_next/",
          "/test-*",
          "*.pdf$"
        ]
      }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
