"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import { initialWindowSize } from "@/components/Window"
import { PortfolioProvider } from "@/contexts/PortfolioContext"
import { useFileSystem } from "@/contexts/FileSystemContext"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })
const Notepad = dynamic(() => import("../components/Notepad"), { ssr: false })

type WindowProps = {
  id: string
  component: React.ReactElement
}

function HomeContent() {
  const [openWindows, setOpenWindows] = useState<WindowProps[]>([])
  const [windowCenter, setWindowCenter] = useState<{
    x: number
    y: number
  } | null>(null)

  const { openNotepad, setOpenNotepad } = useFileSystem()

  useEffect(() => {
    const calculateCenter = () => {
      const x = (window.innerWidth - initialWindowSize.width) / 2
      const y = (window.innerHeight - initialWindowSize.height) / 2
      setWindowCenter({ x, y })
    }

    calculateCenter()

    // window.addEventListener("resize", calculateCenter)
    // return () => window.removeEventListener("resize", calculateCenter)
  }, [])

  const closeWindow = (id: string) => {
    setOpenWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id),
    )

    if ((id = "notepad")) setOpenNotepad(false)
  }

  useEffect(() => {
    if (windowCenter) {
      openTerminal()
    }
  }, [windowCenter])

  useEffect(() => {
    if (openNotepad) {
      setOpenWindows([
        ...openWindows,
        {
          id: "notepad",
          component: (
            <Notepad
              initialPosition={{ x: 100, y: 100 }}
              onClose={() => closeWindow("notepad")}
            />
          ),
        },
      ])
    } else {
      closeWindow("notepad")
    }
  }, [openNotepad])

  const openTerminal = () => {
    // console.log("✨ Double clicked ✨")
    setOpenWindows([
      {
        id: "terminal",
        component: (
          <Terminal
            initialPosition={windowCenter!}
            onClose={() => closeWindow("terminal")}
          />
        ),
      },
    ])
  }

  return (
    <Desktop>
      {openWindows.map(({ id, component }) => (
        <div key={id}>{component}</div>
      ))}
      {!openWindows.length && (
        <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
          <button onDoubleClick={openTerminal} className="text-gray-500">
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
