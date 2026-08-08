"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import { initialWindowSize } from "@/components/Window"
import { PortfolioProvider } from "@/contexts/PortfolioContext"
import { useFileSystem } from "@/contexts/FileSystemContext"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })
const Notepad = dynamic(() => import("../components/Notepad"), { ssr: false })

type WindowProps = {
  id: string
  zIndex: number
  component: React.ReactElement
}

function HomeContent() {
  const [openWindows, setOpenWindows] = useState<WindowProps[]>([])
  const [windowCenter, setWindowCenter] = useState<{
    x: number
    y: number
  } | null>(null)

  const zCounterRef = useRef(1)

  const { openNotepad, setOpenNotepad } = useFileSystem()

  useEffect(() => {
    const calculateCenter = () => {
      const x = (window.innerWidth - initialWindowSize.width) / 2
      const y = (window.innerHeight - initialWindowSize.height) / 2
      setWindowCenter({ x, y })
    }

    calculateCenter()
    // Optionally add resize listener if needed:
    // window.addEventListener("resize", calculateCenter);
    // return () => window.removeEventListener("resize", calculateCenter);
  }, [])

  const closeWindow = useCallback(
    (id: string) => {
      setOpenWindows((prevWindows) =>
        prevWindows.filter((window) => window.id !== id),
      )

      if (id === "notepad") setOpenNotepad(false)
    },
    [setOpenNotepad],
  )

  const focusWindow = useCallback((id: string) => {
    const zIndex = zCounterRef.current++
    setOpenWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, zIndex } : window,
      ),
    )
  }, [])

  const openTerminal = useCallback(() => {
    if (!windowCenter) return

    const zIndex = zCounterRef.current++
    setOpenWindows((prevWindows) => {
      if (prevWindows.some((window) => window.id === "terminal")) {
        return prevWindows
      }
      return [
        ...prevWindows,
        {
          id: "terminal",
          zIndex,
          component: (
            <Terminal
              initialPosition={windowCenter}
              onClose={() => closeWindow("terminal")}
            />
          ),
        },
      ]
    })
  }, [windowCenter, closeWindow])

  const handleOpenNotepad = useCallback(() => {
    if (!windowCenter) return

    const zIndex = zCounterRef.current++
    setOpenWindows((prevWindows) => {
      if (prevWindows.some((window) => window.id === "notepad")) {
        return prevWindows
      }
      return [
        ...prevWindows,
        {
          id: "notepad",
          zIndex,
          component: (
            <Notepad
              initialPosition={{
                x: windowCenter.x / 2,
                y: windowCenter.y / 2,
              }}
              onClose={() => closeWindow("notepad")}
            />
          ),
        },
      ]
    })
  }, [windowCenter, closeWindow])

  useEffect(() => {
    if (openNotepad) handleOpenNotepad()
  }, [openNotepad, handleOpenNotepad])

  useEffect(() => openTerminal(), [windowCenter, openTerminal])

  return (
    <Desktop>
      {openWindows.map(({ id, component, zIndex }) => (
        <div
          key={id}
          className="relative"
          style={{ zIndex }}
          onMouseDownCapture={() => focusWindow(id)}
        >
          {component}
        </div>
      ))}
      {!openWindows.length && (
        <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
          <button
            onDoubleClick={openTerminal}
            className="text-gray-500 selection:bg-gray-700"
          >
            Double Click
          </button>
        </div>
      )}
    </Desktop>
  )
}

export default function Home() {
  return (
    <PortfolioProvider>
      <HomeContent />
    </PortfolioProvider>
  )
}
