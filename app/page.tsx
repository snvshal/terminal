"use client"

import React from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import { FileSystemProvider } from "../contexts/FileSystemContext"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })

interface WindowProps {
  id: string
  component: React.ReactElement
}

function HomeContent() {
  const [openWindows, setOpenWindows] = React.useState<WindowProps[]>([
    {
      id: "terminal",
      component: (
        <Terminal
          initialPosition={{ x: 100, y: 100 }}
          onClose={() => closeWindow("terminal")}
        />
      ),
    },
  ])

  const closeWindow = (id: string) => {
    setOpenWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    )
  }

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
