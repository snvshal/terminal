"use client"

import React, { useState, useRef, useEffect } from "react"
import { useFileSystem } from "../contexts/FileSystemContext"
import { usePortfolio } from "@/contexts/PortfolioContext"
import { cn } from "@/lib/utils"
import Window from "./Window"
import { useRouter } from "next/navigation"
import { AnimatedLoading } from "./Animations"
import ProfileCard from "./ProfileCard"

export type TerminalProps = {
  initialPosition: { x: number; y: number }
  onClose: () => void
}

type TerminalInputProps = {
  name: string
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  caretIndex: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onCaretUpdate: () => void
  onSubmit: (e: React.FormEvent) => void
}

const TerminalInput: React.FC<TerminalInputProps> = ({
  name,
  inputRef,
  value,
  caretIndex,
  onChange,
  onKeyDown,
  onCaretUpdate,
  onSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const before = value.slice(0, caretIndex)
  const activeChar = value[caretIndex]
  const after = value.slice(caretIndex + 1)

  return (
    <form onSubmit={onSubmit} className="flex-grow">
      <div className="relative w-full">
        <span className="whitespace-pre">
          {before}
          <span
            className={cn(
              isFocused
                ? "bg-zinc-100 text-zinc-900"
                : "outline outline-1 outline-zinc-300",
            )}
          >
            {activeChar ?? " "}
          </span>
          {after}
        </span>
        <input
          ref={inputRef}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onClick={onCaretUpdate}
          onKeyUp={onCaretUpdate}
          onSelect={onCaretUpdate}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full cursor-text bg-transparent p-0 opacity-0"
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>
    </form>
  )
}

const Terminal: React.FC<TerminalProps> = ({ initialPosition, onClose }) => {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<string[]>([
    'Welcome to the SN Terminal. Type "help" for available commands.',
  ])

  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [caretIndex, setCaretIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { currentDirectory, executeCommand, currentUser, loading } =
    useFileSystem()
  const { executePortfolioCommand, inputMode, handleInputStep } = usePortfolio()

  const router = useRouter()

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    updateCaretFromInput()
  }

  const updateCaretFromInput = () => {
    const el = inputRef.current
    if (!el) return
    setCaretIndex(
      Math.min(el.selectionStart ?? el.value.length, el.value.length),
    )
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim() && !isExecuting) {
      setIsExecuting(true)
      setOutput((prev) => [
        ...prev,
        `${currentUser ?? ""}@${currentDirectory} $ ${input}`,
      ])
      setCommandHistory([...commandHistory, input])
      setHistoryIndex(-1)

      try {
        let result: string[]
        const penv = currentDirectory === "portfolio"
        if (penv) {
          result = await executePortfolioCommand(input)
        } else {
          result = await executeCommand(input)
        }

        for (const line of result) {
          if (line === "cmd:clear") {
            setOutput([])
          } else if (line === "cmd:about") {
            router.push(penv ? "/about#portfolio" : "/about")
          } else {
            await new Promise((resolve) => setTimeout(resolve, 10))
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
      setCaretIndex(0)
    }
  }

  const handleInputModeSubmit = async () => {
    if (!inputMode) return

    try {
      const result = await handleInputStep(input)
      setOutput((prev) => [...prev, ...result])
    } catch (error) {
      if (error instanceof Error) {
        setOutput((prev) => [...prev, `Error: ${error.message}`])
      } else {
        setOutput((prev) => [...prev, `Error: ${String(error)}`])
      }
    }

    setInput("")
    setCaretIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputMode) {
        handleInputModeSubmit()
      } else {
        handleInputSubmit(e)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (!inputMode && historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1)
        const nextCommand =
          commandHistory[commandHistory.length - 1 - historyIndex - 1]
        setInput(nextCommand)
        setCaretIndex(nextCommand.length)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!inputMode && historyIndex > -1) {
        setHistoryIndex(historyIndex - 1)
        const nextCommand =
          historyIndex === 0
            ? ""
            : commandHistory[commandHistory.length - 1 - historyIndex + 1]
        setInput(nextCommand)
        setCaretIndex(nextCommand.length)
      }
    } else if (e.key === "ArrowRight") {
      if (!inputMode) {
        const lastCommand = commandHistory[commandHistory.length - 1] || ""
        if (input.length < lastCommand.length) {
          const nextCommand = lastCommand.slice(0, input.length + 1)
          setInput(nextCommand)
          setCaretIndex(nextCommand.length)
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
    }
  }

  const renderLine = (line: string): React.JSX.Element => {
    if (line.startsWith("profile://")) {
      const profileData = JSON.parse(line.replace("profile://", ""))
      return <ProfileCard {...profileData} />
    }

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
      title={currentUser ?? "Terminal"}
      onClose={onClose}
      initialPosition={initialPosition}
    >
      <div
        className="window-scrollbar h-full w-full overflow-y-auto p-4 text-sm text-zinc-100"
        ref={outputRef}
        onMouseDown={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={cn(
              "whitespace-pre leading-6",
              line.startsWith("Error:") && "text-red-500",
            )}
          >
            {renderLine(line)}
          </div>
        ))}

        {!loading ? (
          !isExecuting && (
            <div className="flex items-center whitespace-pre leading-6">
              {inputMode ? (
                <>
                  <span>{inputMode.steps[inputMode.currentStep].prompt} </span>
                  <TerminalInput
                    name="input"
                    inputRef={inputRef}
                    value={input}
                    caretIndex={caretIndex}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onCaretUpdate={updateCaretFromInput}
                    onSubmit={handleInputModeSubmit}
                  />
                </>
              ) : (
                <>
                  <span>{`${currentUser ?? ""}@${currentDirectory} $ `}</span>
                  <TerminalInput
                    name="command"
                    inputRef={inputRef}
                    value={input}
                    caretIndex={caretIndex}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onCaretUpdate={updateCaretFromInput}
                    onSubmit={handleInputSubmit}
                  />
                </>
              )}
            </div>
          )
        ) : (
          <AnimatedLoading text={loading} />
        )}
      </div>
    </Window>
  )
}

export default Terminal
