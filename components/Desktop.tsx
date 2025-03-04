"use client"

import React from "react"
import { AnimatedBackground } from "@/components/Animations"

export type DesktopProps = {
  children: React.ReactNode
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}

export default Desktop
