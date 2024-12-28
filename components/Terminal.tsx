import React, { useState, useRef, useEffect, useCallback } from "react"
import { useFileSystem } from "../contexts/FileSystemContext"

interface TerminalProps {
  initialPosition: { x: number; y: number }
  onClose: () => void
}

const Terminal: React.FC<TerminalProps> = ({ initialPosition, onClose }) => {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<string[]>([
    'Welcome to the OS Terminal. Type "help" for available commands.',
  ])
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState({ width: 600, height: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const { currentDirectory, executeCommand } = useFileSystem()

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isExecuting) {
      setIsExecuting(true)
      setOutput((prev) => [...prev, `${currentDirectory}$ ${input}`])
      setCommandHistory([...commandHistory, input])
      setHistoryIndex(-1)

      const result = executeCommand(input)
      if (result[0] === "clear") {
        setOutput([])
      } else {
        for (const line of result) {
          await new Promise((resolve) => setTimeout(resolve, 50)) // Delay between lines
          setOutput((prev) => [...prev, line])
        }
      }

      setInput("")
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1)
        setInput(commandHistory[commandHistory.length - 1 - historyIndex - 1])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > -1) {
        setHistoryIndex(historyIndex - 1)
        setInput(
          historyIndex === 0
            ? ""
            : commandHistory[commandHistory.length - 1 - historyIndex + 1]
        )
      }
    } else if (e.key === "ArrowRight") {
      const lastCommand = commandHistory[commandHistory.length - 1] || ""
      if (input.length < lastCommand.length) {
        setInput(lastCommand.slice(0, input.length + 1))
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Implement tab completion here
    }
  }

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
    setIsFullScreen((prev) => !prev)

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

  return (
    <div
      ref={terminalRef}
      className={`bg-gray-800 rounded-lg min-w-80 min-h-40 shadow-lg overflow-hidden absolute ${
        isFullScreen ? "fixed inset-0 w-full h-full" : ""
      }`}
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
        className="bg-gray-700 px-4 py-2 flex justify-between items-center cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => handleMouseDown(e, "drag")}
      >
        <span className="text-white font-semibold">Terminal</span>
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
      <div
        className="p-4 overflow-auto text-green-400 font-mono text-sm h-full"
        ref={outputRef}
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre ${
              line.startsWith("Error:") ? "text-red-500" : ""
            }`}
          >
            {line}
          </div>
        ))}
        {!isExecuting && (
          <div className="flex items-center">
            <span>{currentDirectory}$&nbsp;</span>
            <form onSubmit={handleInputSubmit} className="flex-grow relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent outline-none caret-terminal caret-w-[16px] focus:outline-none"
                autoFocus
              />
              {/* <div className="absolute left-0 top-0 w-2 h-5 bg-green-400 animate-blink"></div> */}
            </form>
          </div>
        )}
      </div>
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

export default Terminal
