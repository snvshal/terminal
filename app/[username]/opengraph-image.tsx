import { ImageResponse } from "next/og"
import { Portfolio } from "@/types/schema"
import { getUserByUsername } from "@/app/actions"

export const alt = "SN Terminal Portfolio"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" })
    const contentType = response.headers.get("content-type")
    return response.ok && contentType ? contentType.startsWith("image/") : false
  } catch (error) {
    console.error("Error validating image URL:", error)
    return false
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const username = (await params).username
  const user = await getUserByUsername(username)

  const { name, title, avatar } = user?.portfolio as Portfolio

  const validAvatar =
    avatar && (await isValidImageUrl(avatar))
      ? avatar
      : `${process.env.METADATA_BASE_URL}/opengraph-image.png`

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={validAvatar}
          alt={`${name}'s portfolio avatar`}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
        />
        <p
          style={{
            position: "absolute",
            backgroundColor: "white",
            borderRadius: "8px",
            bottom: "4px",
          }}
        >
          {name} - {title}
        </p>
      </div>
    ),
    {
      ...size,
    },
  )
}
