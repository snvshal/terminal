import React from "react"

interface DesktopProps {
  children: React.ReactNode
  openNotepad: (filename: string) => void
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 overflow-hidden relative">
      {children}
    </div>
  )
}

export default Desktop
