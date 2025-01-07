"use client"

import React, { useState, useEffect, useRef } from "react"
import useFullScreen from "@/hooks/useFullScreen"
// import { Circle } from 'lucide-react'

export type WindowProps = {
  title: string
  children: React.ReactNode
  onClose: () => void
  initialPosition: { x: number; y: number }
}

export const windowInitialSize = { width: 600, height: 400 }

const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  initialPosition,
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(windowInitialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [wasFullScreen, setWasFullScreen] = useState(false)
  const [lastPosition, setLastPosition] = useState(initialPosition)
  const [showGlassyAnimation, setShowGlassyAnimation] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const { toggleFullScreen } = useFullScreen()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        if (isFullScreen) {
          const xPercentage = e.clientX / window.innerWidth
          setIsFullScreen(false)
          setSize(windowInitialSize)
          setPosition({
            x: e.clientX - windowInitialSize.width * xPercentage,
            y: e.clientY,
          })
        } else {
          const newY = Math.max(0, e.clientY - dragOffset.y)
          setPosition({
            x: e.clientX - dragOffset.x,
            y: newY,
          })
          setShowGlassyAnimation(newY <= 0)
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
        } else if (isFullScreen) {
          toggleWindowFullScreen()
        }
      }
      setIsDragging(false)
      setIsResizing(false)
      setWasFullScreen(isFullScreen)
      setShowGlassyAnimation(false)
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
  ])

  useEffect(() => {
    const disableTextSelection = (e: Event) => {
      e.preventDefault()
    }

    if (isDragging) {
      document.body.style.userSelect = "none"
      document.addEventListener("selectstart", disableTextSelection)
    }

    return () => {
      document.body.style.userSelect = ""
      document.removeEventListener("selectstart", disableTextSelection)
    }
  }, [isDragging])

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

  const toggleWindowFullScreen = () => {
    setIsFullScreen(!isFullScreen)
    if (!isFullScreen) {
      setLastPosition(position)
      setSize({ width: window.innerWidth, height: window.innerHeight })
      setPosition({ x: 0, y: 0 })
    } else {
      setSize(windowInitialSize)
      setPosition({
        x: Math.max(
          0,
          Math.min(lastPosition.x, window.innerWidth - windowInitialSize.width)
        ),
        y: Math.max(
          0,
          Math.min(
            lastPosition.y,
            window.innerHeight - windowInitialSize.height
          )
        ),
      })
    }
  }

  const GlassyBlurSkeleton = () => (
    <div
      className={`fixed inset-2 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm transition-all duration-300 rounded-xl ${
        showGlassyAnimation ? "opacity-100" : "opacity-0"
      }`}
      // style={{
      //   clipPath: showGlassyAnimation
      //     ? "inset(0)"
      //     : `inset(${position.y}px ${
      //         window.innerWidth - (position.x + size.width)
      //       }px ${window.innerHeight - (position.y + size.height)}px ${
      //         position.x
      //       }px round 0.75rem)`,
      // }}
    />
  )

  return (
    <>
      <GlassyBlurSkeleton />
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
          transition: isDragging ? "none" : "all 0.3s ease",
        }}
      >
        <div
          className="bg-zinc-800 px-4 py-2 flex justify-between items-center cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleMouseDown(e, "drag")}
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
          <span className="text-zinc-200 font-semibold">{title}</span>
          <span className="w-14 flex justify-end">
            {/* <Circle className="size-4" /> */}
          </span>
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
    </>
  )
}

export default Window
