import { useCallback, useEffect, useRef, useState } from "react"

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
  const [size, setSize] = useState({ width: 600, height: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)

  const [isFullScreen, setIsFullScreen] = useState(false)

  const terminalRef = useRef<HTMLDivElement>(null)

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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [
      dragOffset,
      isDragging,
      isResizing,
      position,
      resizeDirection,
      setSize,
      setPosition,
      size,
    ]
  )

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, handleMouseMove])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Request fullscreen on the document element
      document.documentElement
        .requestFullscreen()
        .catch((err) =>
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          )
        )
    } else {
      // Exit fullscreen mode
      document
        .exitFullscreen()
        .catch((err) =>
          console.error(
            `Error attempting to exit full-screen mode: ${err.message}`
          )
        )
    }
  }

  console.log(size)
  return (
    <div
      ref={terminalRef}
      className={`bg-zinc-950 border-green-50 rounded-lg min-w-80 min-h-60 shadow-lg overflow-hidden absolute ${
        isFullScreen ? "fixed inset-0 w-full h-full" : ""
      } `}
      style={
        isFullScreen
          ? {}
          : {
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
            }
      }
    >
      <div
        className="bg-zinc-800 sticky top-0 px-4 py-2 flex h-10 justify-between items-center cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(e, "drag")}
      >
        <span className="text-white font-semibold">{title}</span>
        <div className="flex space-x-2">
          <button
            onClick={toggleFullScreen}
            className="w-3 h-3 rounded-full bg-green-500 focus:outline-none"
          ></button>
          <button
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="w-3 h-3 rounded-full bg-yellow-500"
          ></button>
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 focus:outline-none"
          ></button>
        </div>
      </div>
      <div style={{ height: `${size.height - 40}px` }}>{children}</div>

      {!isFullScreen && (
        <>
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
        </>
      )}
    </div>
  )
}

export default Window
