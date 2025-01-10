import { FileSystemProvider } from "@/contexts/FileSystemContext"
import "./globals.css"
import { Geist_Mono } from "next/font/google"
import { getUsername } from "@/lib/session"

const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "OS Terminal Simulation",
  description: "A web-based OS terminal simulation",
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
