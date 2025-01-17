import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const URL = process.env.METADATA_BASE_URL || ""
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${URL}/sitemap.xml`,
    host: URL,
  }
}
