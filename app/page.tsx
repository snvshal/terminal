"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import { FileSystemProvider } from "../contexts/FileSystemContext"
import { initialWindowSize } from "@/components/Window"
import { PortfolioProvider } from "@/contexts/PortfolioContext"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })

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

  useEffect(() => {
    const calculateCenter = () => {
      const x = (window.innerWidth - initialWindowSize.width) / 2
      const y = (window.innerHeight - initialWindowSize.height) / 2
      setWindowCenter({ x, y })
    }

    calculateCenter()

    window.addEventListener("resize", calculateCenter)
    return () => window.removeEventListener("resize", calculateCenter)
  }, [])

  const closeWindow = (id: string) => {
    setOpenWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    )
  }

  useEffect(() => {
    if (windowCenter) {
      setOpenWindows([
        {
          id: "terminal",
          component: (
            <Terminal
              initialPosition={windowCenter}
              onClose={() => closeWindow("terminal")}
            />
          ),
        },
      ])
    }
  }, [windowCenter])

  const handleDoubleClick = () => {
    console.log("✨ Double clicked ✨")
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
        <div className="h-screen w-full flex items-center text-muted-foreground justify-center">
          <button onDoubleClick={handleDoubleClick} className="text-gray-500">
            Double Click
          </button>
        </div>
      )}
    </Desktop>
  )
}

export default function Home() {
  return (
    <FileSystemProvider>
      <PortfolioProvider>
        <HomeContent />
      </PortfolioProvider>
    </FileSystemProvider>
  )
}
