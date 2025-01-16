"use client"

import { useState } from "react"

export default function DownloadResumeButton({
  username,
}: {
  username: string
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/generate-pdf?username=${username}`)
      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${username}_resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading resume:", error)
      alert("Failed to download resume. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-3 transition-colors hover:border-purple-500/50 disabled:opacity-50"
    >
      {isLoading ? "Generating..." : "Download Resume"}
    </button>
  )
}
