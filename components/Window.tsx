"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import useFullScreen from "@/hooks/useFullScreen"
import {
  GlassyBlurSkeletonProps,
  WindowProps,
  WindowSize,
  WindowHeaderProps,
} from "@/types/props"
// import { Circle } from 'lucide-react'

export const initialWindowSize = { width: 600, height: 400 }

const WindowHeader: React.FC<WindowHeaderProps> = ({
  title,
  onClose,
  toggleWindowFullScreen,
  toggleFullScreen,
  onMouseDown,
}) => (
  <div
    className="bg-zinc-800 selection:bg-transparent px-4 py-2 flex justify-between items-center cursor-grab active:cursor-grabbing"
    onMouseDown={onMouseDown}
  >
    <div className="group flex space-x-2.5">
      <button
        onClick={onClose}
        className="group w-3 h-3 rounded-full bg-gray-500 focus:outline-none group-hover:bg-red-500"
      />
      <button
        onClick={toggleWindowFullScreen}
        className="w-3 h-3 rounded-full bg-gray-500 focus:outline-none group-hover:bg-yellow-500"
      />
      <button
        onClick={toggleFullScreen}
        className="w-3 h-3 rounded-full bg-gray-500 focus:outline-none group-hover:bg-green-500"
      />
    </div>
    <span className="font-semibold text-gray-500">{title}</span>
    <span className="w-14 flex justify-end">
      {/* <Circle className="size-4" /> */}
    </span>
  </div>
)

const ResizeHandles: React.FC<{
  onMouseDown: (e: React.MouseEvent, direction: string) => void
}> = ({ onMouseDown }) => (
  <>
    <div
      className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize"
      onMouseDown={(e) => onMouseDown(e, "ne")}
    ></div>
    <div
      className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize"
      onMouseDown={(e) => onMouseDown(e, "se")}
    ></div>
    <div
      className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize"
      onMouseDown={(e) => onMouseDown(e, "sw")}
    ></div>
    <div
      className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize"
      onMouseDown={(e) => onMouseDown(e, "nw")}
    ></div>
    <div
      className="absolute top-0 left-0 right-0 h-1 cursor-n-resize"
      onMouseDown={(e) => onMouseDown(e, "n")}
    ></div>
    <div
      className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
      onMouseDown={(e) => onMouseDown(e, "s")}
    ></div>
    <div
      className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize"
      onMouseDown={(e) => onMouseDown(e, "w")}
    ></div>
    <div
      className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize"
      onMouseDown={(e) => onMouseDown(e, "e")}
    ></div>
  </>
)

const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  initialPosition,
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialWindowSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [lastPosition, setLastPosition] = useState(initialPosition) // Update 3
  const windowRef = useRef<HTMLDivElement>(null)
  const { toggleFullScreen } = useFullScreen()

  const toggleWindowFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev)
    if (!isFullScreen) {
      setLastPosition(position)
      setSize({ width: window.innerWidth, height: window.innerHeight })
      setPosition({ x: 0, y: 0 })
    } else {
      setSize(initialWindowSize)
      setPosition({
        x: Math.max(
          0,
          Math.min(lastPosition.x, window.innerWidth - initialWindowSize.width)
        ),
        y: Math.max(
          0,
          Math.min(
            lastPosition.y,
            window.innerHeight - initialWindowSize.height
          )
        ),
      })
    }
  }, [isFullScreen, position, lastPosition])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        if (isFullScreen) {
          const xPercentage = e.clientX / window.innerWidth
          const yPercentage = e.clientY / window.innerHeight
          setIsFullScreen(false)
          setSize(initialWindowSize)
          setPosition({
            x: e.clientX - initialWindowSize.width * xPercentage,
            y: e.clientY - initialWindowSize.height * yPercentage,
          })
        } else {
          setPosition({
            x: e.clientX - dragOffset.x,
            y: Math.max(0, e.clientY - dragOffset.y),
          })
        }
      } else if (isResizing && !isFullScreen) {
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
      if (isDragging) {
        if (position.y <= 0 && !isFullScreen) {
          toggleWindowFullScreen()
        } else if (position.y >= 10 && isFullScreen) {
          toggleWindowFullScreen()
        }
      }
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
  }, [
    isDragging,
    isResizing,
    dragOffset,
    position,
    size,
    resizeDirection,
    isFullScreen,
    toggleWindowFullScreen,
  ])

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
    } else if (action === "resize" && direction && !isFullScreen) {
      setIsResizing(true)
      setResizeDirection(direction)
    }
  }

  return (
    <>
      {position.y <= 2 && (
        <GlassyBlurSkeleton
          position={position}
          initialWindowSize={initialWindowSize}
        />
      )}

      <div
        ref={windowRef}
        className="absolute bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${
            isFullScreen
              ? window.innerWidth
              : size.width < 400
              ? 400
              : size.width
          }px`,
          height: `${
            isFullScreen
              ? window.innerHeight
              : size.height < 250
              ? 250
              : size.height
          }px`,
          borderRadius: isFullScreen ? "0" : undefined,
          transition: isDragging || isResizing ? "none" : "all 0.3s ease",
        }}
      >
        <WindowHeader
          title={title}
          onClose={onClose}
          toggleWindowFullScreen={toggleWindowFullScreen}
          toggleFullScreen={toggleFullScreen}
          onMouseDown={(e) => handleMouseDown(e, "drag")}
        />
        <div className="h-[calc(100%-2.5rem)] selection:bg-gray-500 overflow-auto">
          {children}
        </div>
        {!(position.x <= 0 && position.y <= 0) && (
          <ResizeHandles
            onMouseDown={(e, direction) =>
              handleMouseDown(e, "resize", direction)
            }
          />
        )}
      </div>
    </>
  )
}

const GlassyBlurSkeleton: React.FC<GlassyBlurSkeletonProps> = ({
  position,
  initialWindowSize,
  opacity = 0.2,
  blur = 16,
  borderRadius = "1rem",
}) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={`
        fixed
        transition-all
        duration-300
        ease-in-out
        bg-gradient-to-br
        from-white/40
        via-white/20
        to-transparent
        shadow-2xl
        backdrop-filter
        backdrop-blur-lg
        border
        border-white/25
      `}
      style={{
        ...(position.y > 0
          ? {
              top: position.y,
              left: position.x,
              width: initialWindowSize.width,
              height: initialWindowSize.height,
            }
          : {
              inset: 8,
              width: windowSize.width - 16,
              height: windowSize.height - 16,
            }),
        borderRadius,
        backdropFilter: `blur(${blur}px) saturate(150%)`,
        background: `
          linear-gradient(145deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1)),
          radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent 70%)
        `,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        boxShadow: `
          0 10px 30px rgba(0, 0, 0, 0.2),
          inset 0 0 30px rgba(255, 255, 255, 0.2),
          0 5px 10px rgba(0, 0, 0, 0.1)
        `,
      }}
    />
  )
}

export default Window
