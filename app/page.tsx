"use client"

import React from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import { FileSystemProvider } from "../contexts/FileSystemContext"
import { windowInitialSize } from "@/components/Window"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })

export type WindowProps = {
  id: string
  component: React.ReactElement
}

function HomeContent() {
  const [openWindows, setOpenWindows] = React.useState<WindowProps[]>([])
  const [windowCenter, setWindowCenter] = React.useState<{
    x: number
    y: number
  } | null>(null)

  React.useEffect(() => {
    const calculateCenter = () => {
      const x = (window.innerWidth - windowInitialSize.width) / 2
      const y = (window.innerHeight - windowInitialSize.height) / 2
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

  React.useEffect(() => {
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

  return (
    <Desktop>
      {openWindows.map(({ id, component }) => (
        <div key={id}>{component}</div>
      ))}
    </Desktop>
  )
}

export default function Home() {
  return (
    <FileSystemProvider>
      <HomeContent />
    </FileSystemProvider>
  )
}
