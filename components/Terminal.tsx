import React, { useState, useRef, useEffect, useContext } from "react"
import { FileSystemContext } from "../contexts/FileSystemContext"
import Window from "./Window"
import { updateFileContent as updateFileContentAction } from "@/app/actions"

interface TerminalProps {
  initialPosition: { x: number; y: number }
  onClose: () => void
}

const Terminal: React.FC<TerminalProps> = ({ initialPosition, onClose }) => {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<string[]>([
    'Welcome to the OS Terminal. Type "help" for available commands.',
  ])

  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const {
    currentDirectory,
    executeCommand,
    currentUser,
    handleAuthInput,
    isAuthMode,
    authStep,
    authType,
    searching,
    setEditMode,
    editMode,
  } = useContext(FileSystemContext)!

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
      if (!isAuthMode) {
        setOutput((prev) => [...prev, `${currentDirectory}$ ${input}`])
        setCommandHistory([...commandHistory, input])
        setHistoryIndex(-1)
      }

      try {
        let result: string[]
        if (isAuthMode) {
          result = await handleAuthInput(input)
        } else {
          result = await executeCommand(input)
        }
        for (const line of result) {
          if (line === "clear") {
            setOutput([])
          } else {
            setOutput((prev) => [...prev, line])
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          setOutput((prev) => [...prev, `Error: ${error.message}`])
        } else {
          setOutput((prev) => [...prev, `Error: ${String(error)}`])
        }
      }

      setInput("")
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isAuthMode) return // Disable history navigation during auth

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

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleEditSubmit()
    }
  }

  const handleEditSubmit = async () => {
    if (editMode) {
      // updateFileContent(editMode.filename, editMode.content)
      const message = await updateFileContentAction(
        currentUser!,
        currentDirectory,
        editMode.filename,
        editMode.content
      )

      setOutput((prev) => [...prev, message])
      setEditMode(null)
    }
  }

  const renderLine = (line: string): React.JSX.Element => {
    if (line.includes("fileurl://")) {
      const parts = line.split(/(fileurl:\/\/\S+)/)

      return (
        <span>
          {parts.map((part, i) => {
            if (part.startsWith("fileurl://")) {
              return (
                <a
                  key={i}
                  href={part.replace("fileurl://", "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {part.replace("fileurl://", "")}
                </a>
              )
            }
            return <span key={i}>{part}</span>
          })}
        </span>
      )
    }

    return <span>{line}</span>
  }

  return (
    <Window
      title={`Terminal${currentUser ? ` - ${currentUser}` : ""}`}
      onClose={onClose}
      initialPosition={initialPosition}
    >
      <div
        className="p-4 w-full overflow-y-auto text-zinc-100 font-mono text-sm h-full"
        ref={outputRef}
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre ${
              line.startsWith("Error:") ? "text-red-500" : ""
            }`}
          >
            {renderLine(line)}
          </div>
        ))}

        {editMode ? (
          <div className="mt-2">
            <div>Editing {editMode.filename}:</div>
            <textarea
              ref={textareaRef}
              value={editMode.content}
              onChange={(e) =>
                setEditMode({
                  ...editMode,
                  content: e.target.value,
                })
              }
              onKeyDown={handleEditKeyDown}
              className="w-full bg-zinc-800 text-zinc-100 p-2 mt-1 rounded resize-none"
              rows={10}
            />
            {/* <button
              onClick={handleEditSubmit}
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
            >
              Save
            </button> */}
          </div>
        ) : !searching ? (
          !isExecuting && (
            <div className="flex items-center whitespace-pre">
              <span>
                {isAuthMode
                  ? authType === "signup"
                    ? authStep === 0
                      ? "Enter username: "
                      : authStep === 1
                      ? "Enter email: "
                      : "Enter password: "
                    : authStep === 0
                    ? "Enter email/username: "
                    : "Enter password: "
                  : `${currentDirectory}$ `}
              </span>
              <form onSubmit={handleInputSubmit} className="flex-grow">
                <input
                  ref={inputRef}
                  name="command"
                  type={
                    isAuthMode &&
                    ((authType === "signup" && authStep === 2) ||
                      (authType === "signin" && authStep === 1))
                      ? "password"
                      : "text"
                  }
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent outline-none"
                  spellCheck={false}
                  autoComplete="off"
                  autoFocus
                />
              </form>
            </div>
          )
        ) : (
          <SearchingAnimation text={searching} />
        )}
      </div>
    </Window>
  )
}

const SearchingAnimation = ({ text }: { text: string }) => {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : "."))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      {text}
      {dots}
    </span>
  )
}

export default Terminal
