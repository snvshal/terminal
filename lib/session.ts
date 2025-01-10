import "server-only"
import { JWTPayload, SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { cache } from "react"

const secretKey = process.env.JWT_SECRET!

if (!secretKey) throw new Error("JWT_SECRET is not set")

const encodedKey = new TextEncoder().encode(secretKey)

type SessionPayload = JWTPayload & { username: string }

export const encrypt = async (payload: SessionPayload): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export const decrypt = async (
  session: string | undefined = ""
): Promise<SessionPayload | null> => {
  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
      clockTolerance: 60,
    })

    if (typeof payload.username !== "string") {
      console.error("Invalid session payload structure")
      return null
    }

    return payload as SessionPayload
  } catch (error) {
    if (error instanceof Error && error.message.includes("exp")) {
      console.error("Session token has expired")
    } else {
      console.error("Failed to verify session:", error)
    }
    return null
  }
}

export const createSession = async (username: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ username, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export const deleteSession = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export const verifySession = cache(
  async (): Promise<{ username: string } | null> => {
    const cookie = (await cookies()).get("session")?.value
    const session = await decrypt(cookie)

    if (!session?.username) return null

    return { username: session.username as string }
  }
)

export const getUsername = cache(async (): Promise<string | null> => {
  const session = await verifySession()
  if (!session) return null
  return session.username
})
