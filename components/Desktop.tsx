import React from 'react'

const Desktop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 overflow-hidden relative">
      {children}
    </div>
  )
}

export default Desktop

