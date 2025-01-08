import "./globals.css"
import { Geist_Mono } from "next/font/google"

const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "OS Terminal Simulation",
  description: "A web-based OS terminal simulation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geistMono.className}>{children}</body>
    </html>
  )
}
