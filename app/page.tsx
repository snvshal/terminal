"use client"

import React, { useState, useContext } from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import {
  FileSystemProvider,
  FileSystemContext,
  FileSystemContextType,
} from "../contexts/FileSystemContext"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })
const Notepad = dynamic(() => import("../components/Notepad"), { ssr: false })

interface WindowProps {
  id: string
  component: React.ReactElement
}

function HomeContent() {
  const fileSystemContext = useContext(FileSystemContext)
  const { executeCommand, openFile } =
    fileSystemContext as FileSystemContextType

  const closeWindow = (id: string) => {
    setOpenWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    )
  }

  const openNotepad = (filename: string) => {
    const id = `notepad-${filename}-${Date.now()}`
    setOpenWindows((prevWindows) => [
      ...prevWindows,
      {
        id,
        component: (
          <Notepad
            filename={filename}
            initialPosition={{ x: 150, y: 150 }}
            onClose={() => closeWindow(id)}
          />
        ),
      },
    ])
  }

  const handleExecuteCommand = (command: string) => {
    const result = executeCommand(command)
    if (result[0].startsWith("Opening ")) {
      const filename = result[0].split(" ")[1]
      if (openFile(filename)) {
        openNotepad(filename)
      }
    }
    return result
  }

  const [openWindows, setOpenWindows] = useState<WindowProps[]>([
    {
      id: "terminal",
      component: (
        <Terminal
          initialPosition={{ x: 100, y: 100 }}
          onClose={() => closeWindow("terminal")}
          executeCommand={handleExecuteCommand}
        />
      ),
    },
  ])

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
