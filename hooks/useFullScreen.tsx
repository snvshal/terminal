"use client"

import { useState, useEffect } from "react"

const useFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(false)

  const toggleFullScreen = async () => {
    try {
      if (!isFullScreen) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error(`Failed to toggle fullscreen mode: ${err}`)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return { isFullScreen, toggleFullScreen }
}

export default useFullScreen
