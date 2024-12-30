import React from 'react'

interface DesktopProps {
  children: React.ReactNode
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden relative">
      {children}
    </div>
  )
}

export default Desktop

