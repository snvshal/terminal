import React, { useState, useRef, useEffect, useContext } from "react"
import { FileSystemContext } from "../contexts/FileSystemContext"
import Window from "./Window"

interface TerminalProps {
  initialPosition: { x: number; y: number }
  onClose: () => void
  executeCommand: (command: string) => string[]
}

const Terminal: React.FC<TerminalProps> = ({
  initialPosition,
  onClose,
  executeCommand,
}) => {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<string[]>([
    'Welcome to the OS Terminal. Type "help" for available commands.',
  ])

  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const fileSystemContext = useContext(FileSystemContext)
  const currentDirectory = fileSystemContext?.currentDirectory

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
          await new Promise((resolve) => setTimeout(resolve, 10)) // Delay between lines
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

  return (
    <Window
      title={"Terminal"}
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
            {line}
          </div>
        ))}
        {!isExecuting && (
          <div className="flex items-center">
            <span>{currentDirectory}$&nbsp;</span>
            <form onSubmit={handleInputSubmit} className="flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                // onBlur={() => inputRef.current?.focus()}
                className="w-full bg-transparent outline-none"
                spellCheck={false}
                autoFocus
              />
            </form>
            {/* <div className="w-2 h-5 bg-green-400 animate-blink"></div> */}
          </div>
        )}
      </div>
    </Window>
  )
}

export default Terminal

