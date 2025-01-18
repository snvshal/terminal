import type { MetadataRoute } from "next"
import { getUsers } from "./actions"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const URL = process.env.METADATA_BASE_URL || ""

  const users = await getUsers()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ]

  const dynamicRoutes: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${URL}/${user.username}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  }))

  return [...staticRoutes, ...dynamicRoutes]
}
