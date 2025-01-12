"use client"

import Window from "./Window"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { LoaderIcon, CircleDotIcon, CircleCheckIcon } from "lucide-react"
import { useFileSystem } from "@/contexts/FileSystemContext"
import { updateFileContent as updateFileContentAction } from "@/app/actions"

interface NotepadProps {
  initialPosition: { x: number; y: number }
  onClose: () => void
}

const Notepad: React.FC<NotepadProps> = ({ initialPosition, onClose }) => {
  const [content, setContent] = useState("")
  const [lineCount, setLineCount] = useState(1)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "saving" | "saved">(
    "saved",
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { editFile, currentUser, currentDirectory } = useFileSystem()

  useEffect(() => {
    setContent(editFile?.content || "")
  }, [editFile])

  const updateCounts = useCallback(() => {
    setLineCount(content.split("\n").length)
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length)
    setCharCount(content.length)
  }, [content])

  useEffect(() => {
    updateCounts()
  }, [content, updateCounts])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setSaveStatus("unsaved")
  }

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prevZoom) => {
      const newZoom = direction === "in" ? prevZoom + 10 : prevZoom - 10
      return Math.max(50, Math.min(200, newZoom))
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newContent =
        content.substring(0, start) + "  " + content.substring(end)
      setContent(newContent)
      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const handleSave = async () => {
    if (!editFile) return null
    setSaveStatus("saving")
    await updateFileContentAction(
      currentUser!,
      currentDirectory,
      editFile.filename,
      content,
    )
    // Simulate API call or file system operation
    setTimeout(() => {
      setSaveStatus("saved")
    }, 1000)
  }

  return (
    <Window
      title={editFile?.filename ?? "Notepad"}
      onClose={onClose}
      initialPosition={initialPosition}
      status={
        <>
          {saveStatus === "unsaved" && (
            <CircleDotIcon className="h-4 w-4 text-yellow-500" />
          )}
          {saveStatus === "saving" && (
            <LoaderIcon className="h-4 w-4 animate-spin text-blue-500" />
          )}
          {saveStatus === "saved" && (
            <CircleCheckIcon className="h-4 w-4 text-green-500" />
          )}
        </>
      }
    >
      <div className="flex h-full flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full flex-grow resize-none bg-zinc-900 p-4 font-mono text-zinc-100 outline-none"
          style={{ fontSize: `${zoom}%` }}
        />
        <div className="flex items-center justify-between bg-zinc-800 p-2 text-xs text-zinc-300">
          <div className="flex space-x-4">
            <span>Lines: {lineCount}</span>
            <span>Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoom("out")}
                className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600"
              >
                -
              </button>
              <span>{zoom}%</span>
              <button
                onClick={() => handleZoom("in")}
                className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600"
              >
                +
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600"
                disabled={saveStatus === "saved"}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Window>
  )
}

export default Notepad
