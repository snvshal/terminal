import "./globals.css"
import { getUsername } from "@/lib/session"
import { Geist_Mono } from "next/font/google"
import { FileSystemProvider } from "@/contexts/FileSystemContext"

const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: {
    default: "SN Terminal",
    template: "%s | SN Terminal",
  },
  description:
    "A web-based terminal simulation that features a personalized file system and portfolio management, allowing users to interact with a simulated command-line interface.",
  applicationName: "SN Terminal",
  keywords: [
    "terminal",
    "simulation",
    "portfolio",
    "web terminal",
    "command line",
    "file system",
    "react",
    "nextjs",
    "typescript",
    "mongodb",
    "portfolio management",
    "resume builder",
    "toy terminal",
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getUsername()

  return (
    <html lang="en">
      <body className={geistMono.className}>
        <FileSystemProvider username={currentUser}>
          {children}
        </FileSystemProvider>
      </body>
    </html>
  )
}
