import React, { useState, useEffect, useRef } from "react"
import { useFileSystem } from "../contexts/FileSystemContext"
import Window from "./Window"

interface NotepadProps {
  filename: string
  initialPosition: { x: number; y: number }
  onClose: () => void
}

const Notepad: React.FC<NotepadProps> = ({
  filename,
  initialPosition,
  onClose,
}) => {
  const [content, setContent] = useState("")

  const { getFileContent, updateFileContent } = useFileSystem()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fileContent = getFileContent(filename)
    setContent(fileContent || "")
  }, [filename, getFileContent])

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      updateFileContent(filename, content)
    }, 500)

    return () => clearTimeout(saveTimeout)
  }, [content, filename, updateFileContent])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  return (
    <Window
      title={filename}
      onClose={onClose}
      initialPosition={initialPosition}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        className="w-full h-full p-4 bg-zinc-950 text-zinc-100 resize-none focus:outline-none"
      />
    </Window>
  )
}

export default Notepad
