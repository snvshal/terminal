import { ImageResponse } from "next/og"
import { Portfolio } from "@/types/schema"
import { getUserByUsername } from "@/app/actions"

const CONFIG = {
  width: 1200,
  height: 630,
  defaultImage: process.env.METADATA_BASE_URL + "/opengraph-image.png",
  baseStyles: {
    fontSize: 48,
    background: "white",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textStyles: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: "8px",
    bottom: "4px",
    padding: "8px 16px",
  },
} as const

export const alt = "SN Terminal Portfolio"
export const size = { width: CONFIG.width, height: CONFIG.height }
export const contentType = "image/png"

const DefaultView = ({ message }: { message: string }) => (
  <div style={CONFIG.baseStyles}>{message}</div>
)

const PortfolioView = ({
  imageUrl,
  name,
  title,
}: {
  imageUrl: string
  name: string
  title: string
}) => (
  <div style={CONFIG.baseStyles}>
    {/* eslint-disable @next/next/no-img-element */}
    <img
      src={imageUrl}
      alt={`${name}'s portfolio avatar`}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "cover",
      }}
    />
    <p style={CONFIG.textStyles}>
      {name} - {title}
    </p>
  </div>
)

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type")
    return (response.ok && contentType?.startsWith("image/")) || false
  } catch {
    return false
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  try {
    const username = (await params).username

    if (username === "about") {
      return new ImageResponse(
        (
          <div style={CONFIG.baseStyles}>
            <img
              src={CONFIG.defaultImage}
              alt="SN Terminal About Page"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "cover",
              }}
            />
            <p style={CONFIG.textStyles}>SN Terminal About Page</p>
          </div>
        ),
        size,
      )
    }

    const user = await getUserByUsername(username)

    if (!user) {
      return new ImageResponse(<DefaultView message="User not found" />, size)
    }

    const { name, title, avatar } = user.portfolio as Portfolio

    const validAvatar =
      avatar && (await isValidImageUrl(avatar)) ? avatar : CONFIG.defaultImage

    return new ImageResponse(
      <PortfolioView imageUrl={validAvatar} name={name} title={title} />,
      size,
    )
  } catch (error) {
    console.error("Error generating OG image:", error)
    return new ImageResponse(
      <DefaultView message="Error generating image" />,
      size,
    )
  }
}
