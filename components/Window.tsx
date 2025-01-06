import React, { useState, useEffect, useRef } from "react"

interface WindowProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  initialPosition: { x: number; y: number }
}

const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  initialPosition,
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState({ width: 600, height: 300 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      } else if (isResizing) {
        const newSize = { ...size }
        if (resizeDirection?.includes("e")) {
          newSize.width = e.clientX - position.x
        }
        if (resizeDirection?.includes("s")) {
          newSize.height = e.clientY - position.y
        }
        if (resizeDirection?.includes("w")) {
          const newWidth = size.width + (position.x - e.clientX)
          setPosition((prev) => ({ ...prev, x: e.clientX }))
          newSize.width = newWidth
        }
        if (resizeDirection?.includes("n")) {
          const newHeight = size.height + (position.y - e.clientY)
          setPosition((prev) => ({ ...prev, y: e.clientY }))
          newSize.height = newHeight
        }
        setSize(newSize)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, position, size, resizeDirection])

  const handleMouseDown = (
    e: React.MouseEvent,
    action: "drag" | "resize",
    direction?: string
  ) => {
    if (action === "drag") {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    } else if (action === "resize" && direction) {
      setIsResizing(true)
      setResizeDirection(direction)
    }
  }

  return (
    <div
      ref={windowRef}
      className="absolute bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width < 400 ? 400 : size.width}px`,
        height: `${size.height < 400 ? 400 : size.height}px`,
      }}
    >
      <div
        className="bg-zinc-800 px-4 py-2 flex justify-between items-center cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(e, "drag")}
      >
        <span className="text-zinc-200 font-semibold">{title}</span>
        <div className="flex space-x-2">
          <button className="w-3 h-3 rounded-full bg-green-500 focus:outline-none hover:bg-green-600" />
          <button className="w-3 h-3 rounded-full bg-yellow-500 focus:outline-none hover:bg-yellow-600" />
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 focus:outline-none hover:bg-red-600"
          />
        </div>
      </div>
      <div className="h-[calc(100%-2.5rem)] overflow-auto">{children}</div>
      <div
        className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "ne")}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "se")}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "sw")}
      ></div>
      <div
        className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "nw")}
      ></div>
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-n-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "n")}
      ></div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "s")}
      ></div>
      <div
        className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "w")}
      ></div>
      <div
        className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize", "e")}
      ></div>
    </div>
  )
}

export default Window
