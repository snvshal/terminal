"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import Desktop from "../components/Desktop"
import { FileSystemProvider } from "../contexts/FileSystemContext"

const Terminal = dynamic(() => import("../components/Terminal"), { ssr: false })
// const Notepad = dynamic(() => import("../components/Notepad"), { ssr: false })

export default function Home() {
  const [openWindows, setOpenWindows] = useState<
    { id: string; component: React.ReactNode }[]
  >([
    {
      id: "terminal",
      component: <Terminal initialPosition={{ x: 100, y: 100 }} />,
    },
  ])

  const closeWindow = (id: string) => {
    setOpenWindows(openWindows.filter((window) => window.id !== id))
  }

  // const openNotepad = (filename: string) => {
  //   setOpenWindows([
  //     ...openWindows,
  //     {
  //       id: `notepad-${filename}`,
  //       component: (
  //         <Notepad filename={filename} initialPosition={{ x: 150, y: 150 }} />
  //       ),
  //     },
  //   ])
  // }

  return (
    <FileSystemProvider>
      <Desktop>
        {openWindows.map((window) => (
          <div key={window.id}>
            {React.cloneElement(window.component as React.ReactElement, {
              onClose: () => closeWindow(window.id),
            })}
          </div>
        ))}
      </Desktop>
    </FileSystemProvider>
  )
}
