"use client"

import React, { createContext, use, useEffect, useState } from "react"
import {
  searchUser as searchUserAction,
  signIn as signInAction,
  signUp as signUpAction,
  signOut as signOutAction,
  createNode as createNodeAction,
  listDirectory as listDirectoryAction,
  changeDirectory as changeDirectoryAction,
  readFileContent as readFileContentAction,
  editFileContent as editFileContentAction,
  setFileUrl as setFileUrlAction,
  removeNode as removeNodeAction,
  moveFileOrDirectory as moveFileOrDirectoryAction,
  renameFileOrDirectory as renameFileOrDirectoryAction,
} from "../app/actions"

export type FileSystemContextType = {
  currentDirectory: string
  setCurrentDirectory: React.Dispatch<React.SetStateAction<string>>
  executeCommand: (command: string) => Promise<string[]>
  getFullPath: (filename: string) => string
  currentUser: string | null
  setCurrentUser: (username: string | null) => void
  searching: string | null
  editMode: { filename: string; content: string } | null
  setEditMode: React.Dispatch<
    React.SetStateAction<{ filename: string; content: string } | null>
  >
}

export const FileSystemContext = createContext<
  FileSystemContextType | undefined
>(undefined)

export const useFileSystem = () => {
  const context = use(FileSystemContext)
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider")
  }
  return context
}

export const FileSystemProvider: React.FC<{
  children: React.ReactNode
  username: string | null
}> = ({ children, username }) => {
  const [currentDirectory, setCurrentDirectory] = useState("/")
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [searching, setSearching] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<{
    filename: string
    content: string
  } | null>(null)

  useEffect(() => {
    if (username && !currentUser) {
      setCurrentUser(username as string)
      setCurrentDirectory(`/${username}`)
    }
  }, [username])

  const executeCommand = async (command: string): Promise<string[]> => {
    const [cmd, ...args] = command
      .toLocaleLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    switch (cmd) {
      case "ls":
        return listDirectory()
      case "cd":
        return [await changeDirectory(args[0])]
      case "mkdir":
        return [await createDirectory(args[0])]
      case "touch":
        return [await createFile(args[0])]
      case "open":
        return [await readFileContent(args[0])]
      case "edit":
        return [await editFileContent(args[0])]
      case "rmdir":
        return [await removeDirectory(args[0])]
      case "rm":
        return [await removeFile(args[0])]
      case "pwd":
        return [printWorkingDirectory()]
      case "mv":
        return [await moveFileOrDirectory(args[0], args[1])]
      case "rename":
        return [await renameFileOrDirectory(args[0], args[1])]
      case "clear":
      case "cls":
        return ["clear"]
      case "help":
        return helpCommand()
      // case "chmod":
      //   return [changePermissions(args[0], args[1])]
      case "signup":
        return await signUp(args[0], args[1])
      case "signin":
        return await signIn(args[0], args[1])
      case "signout":
        return await signOut()
      case "search":
        return await searchUserAction(args[0])
      case "seturl":
        return [await setFileUrl(args[0], args[1])]
      case "portfolio":
        return [userPortfolio()]
      default:
        return [`Error: Command not found: ${cmd}`]
    }
  }

  const userPortfolio = (): string => {
    if (!currentUser) return "Signin to view your portfolio"
    setCurrentDirectory(`${currentUser}@portfolio`)
    return "Entering portfolio environment. Type 'help' for available commands."
  }

  const listDirectory = async (): Promise<string[]> => {
    if (!currentUser) return ["Signin to list items"]
    if (currentDirectory) {
      const list = await listDirectoryAction(currentUser, currentDirectory)
      return list
    }

    return ["Error: Not a directory"]
  }

  const changeDirectory = async (path: string): Promise<string> => {
    if (!currentUser) return "Signin to change directory"
    if (!path) return "Error: No directory specified"
    if (currentDirectory) {
      if (path.startsWith("..")) {
        // Early exit for root and home directory
        if (currentDirectory === "/") {
          return "Error: Cannot go back from root"
        }
        if (currentDirectory === `/${currentUser}`) {
          return "Error: Cannot go back from home directory without signing out"
        }

        // Validate the path format
        const parts = path.split("/").filter(Boolean)
        if (!parts.every((part) => part === "..")) {
          return "Error: Invalid path format. Must only contain '..'"
        }

        // Calculate new path
        const currentParts = currentDirectory.split("/").filter(Boolean)
        const levelsUp = parts.length

        if (levelsUp > currentParts.length) {
          return "Error: Cannot go back beyond root directory"
        }

        const newPath = "/" + currentParts.slice(0, -levelsUp).join("/")

        // Final safety check for protected directories
        if (newPath === "/") {
          return "Error: Cannot go back beyond root directory"
        }

        setCurrentDirectory(newPath)
        return ""
      }

      const newPath = `${currentDirectory}/${path}`.replace(/\/+/g, "/")

      const { success, message } = await changeDirectoryAction(
        currentUser,
        newPath
      )

      if (!success) return message
      setCurrentDirectory(message)
      return ""
    }

    return "Error: Directory not found"
  }

  const createDirectory = async (name: string): Promise<string> => {
    if (!currentUser) return "Signin to create directory"
    if (!name) return "Error: No directory name specified"
    return createNodeAction(currentUser, currentDirectory, name, "directory")
  }

  const createFile = async (name: string): Promise<string> => {
    if (!currentUser) return "Signin to create file"
    if (!name) return "Error: No file name specified"
    return createNodeAction(currentUser, currentDirectory, name, "file")
  }

  const readFileContent = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to read file"
    if (!filename) return "Error: No file specified"

    if (currentDirectory) {
      const message = await readFileContentAction(
        currentUser,
        currentDirectory,
        filename
      )
      return message
    }
    return `Error: File not found: ${filename}`
  }

  const removeDirectory = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to remove directory"
    if (!filename) return "Error: No directory specified"
    return removeNodeAction(
      currentUser,
      currentDirectory,
      filename,
      "directory"
    )
  }

  const removeFile = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to remove file"
    if (!filename) return "Error: No file specified"
    return removeNodeAction(currentUser, currentDirectory, filename, "file")
  }

  const renameFileOrDirectory = async (
    oldName: string,
    newName: string
  ): Promise<string> => {
    if (!currentUser) return "Signin to rename file/directory"
    if (!oldName || !newName)
      return "Error: Old name and new name must be specified"

    if (oldName === newName) {
      return "Error: The new name must be different from the current name."
    }

    const message = await renameFileOrDirectoryAction(
      currentUser,
      currentDirectory,
      oldName,
      newName
    )

    return message
  }

  const printWorkingDirectory = (): string => {
    return currentDirectory
  }

  const moveFileOrDirectory = async (
    name: string,
    destination: string
  ): Promise<string> => {
    if (!currentUser) return "Signin to move file/directory"
    if (!name || !destination)
      return "Error: Source and destination must be specified"

    if (name === destination) {
      return "Error: Destination path cannot be the source path"
    }

    const destinationPath = destination.startsWith(`/${currentUser}`)
      ? destination
      : `${currentDirectory}/${destination}`.replace(/\/+/g, "/")

    if (!destinationPath.startsWith(`/${currentUser}`)) {
      return "Error: Cannot operate outside of user's directory"
    }

    const message = await moveFileOrDirectoryAction(
      currentUser,
      currentDirectory,
      name,
      destinationPath
    )
    return message
  }

  const helpCommand = (): string[] => {
    const commands = [
      // Account-related commands
      ["search [username]", "Search for a user portfolio"],
      ["signup [username] [password]", "Create a new user account"],
      ["signin [username] [password]", "Sign in to your account"],
      ["signout", "Sign out of your account"],
      ["portfolio", "View and edit your portfolio"],

      // Basic file and directory commands
      ["ls", "List directory contents"],
      ["pwd", "Print working directory"],
      ["cd [directory]", "Change the current directory"],
      ["mkdir [directory]", "Create a new directory"],
      ["rmdir [directory]", "Remove an empty directory"],
      ["touch [file]", "Create a new file"],
      ["open [file]", "Display file or url content"],
      ["edit [file]", "Edit file content"],
      ["seturl [file] [url]", "Set and update URL content for a file"],
      ["rm [file]", "Remove a file or url"],
      ["mv [file/directory] [destination]", "Move a file or directory"],
      ["rename [old name] [new name]", "Rename a file or directory or url"],
      // ["chmod [permissions] [file/directory]", "Change file permissions"],

      // Utility commands
      ["clear/cls", "Clear the terminal screen"],
      ["help", "Display this help message"],
    ]

    const output = [
      "Command                            Description",
      "-------                            -----------",
    ]
    commands.forEach(([cmd, desc]) => {
      output.push(`${cmd.padEnd(35)}${desc}`)
    })

    return output
  }

  // const changePermissions = (permissions: string, name: string): string => {
  //   // Permissions are not applicable in this file system implementation
  //   return "Error: Changing permissions is not supported in this file system"
  // }

  const getFullPath = (filename: string): string => {
    return `${currentDirectory}/${filename}`.replace(/\/+/g, "/")
  }

  const editFileContent = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to edit file"
    if (!filename) return "Error: No file specified"
    if (currentDirectory) {
      const { success, message } = await editFileContentAction(
        currentUser,
        currentDirectory,
        filename
      )
      if (success) {
        setEditMode({ filename, content: message })
        return `EDIT_MODE:${filename}`
      } else {
        return `Error: ${message}`
      }
    }

    return "Error: File not found"
  }

  const setFileUrl = async (filename: string, url: string): Promise<string> => {
    if (!currentUser) return "Signin to set url"
    if (!filename) return "Error: No file specified"
    if (!url) return "Error: No URL specified"

    const result = await setFileUrlAction(
      currentUser,
      currentDirectory,
      filename,
      url
    )

    return result
  }

  const signUp = async (
    username: string,
    password: string
  ): Promise<string[]> => {
    if (!username.trim() || !password.trim()) {
      return ["Error: Login failed: username and password are required"]
    }
    if (currentUser) {
      return [
        "Error: You are already signed in!",
        "Sign out to create a new account",
      ]
    } else {
      setSearching("Creating your account")
      const { success, message } = await signUpAction(username, password)
      setSearching(null)
      if (success) {
        setCurrentUser(username)
        setCurrentDirectory(`/${username}`)
        return [`Signup successful. Welcome, ${username}!`]
      } else {
        return ["Signup failed: " + message]
      }
    }
  }

  const signIn = async (
    username: string,
    password: string
  ): Promise<string[]> => {
    if (!username || !password) {
      return ["Error: Login failed: username and password are required"]
    }
    if (currentUser) {
      return [
        "Error: You are already signed in!",
        "Sign out to sign in with a different account",
      ]
    } else {
      setSearching("Authenticating")
      const { success, message } = await signInAction(username, password)
      setSearching(null)

      if (success) {
        // const username = content
        setCurrentUser(username)
        setCurrentDirectory(`/${username}`)
        return [`Login successful. Welcome back, ${username}!`]
      } else {
        return [message]
      }
    }
  }

  const signOut = async (): Promise<string[]> => {
    if (!currentUser) {
      return ["Error: You are not signed in!"]
    } else {
      const { success, message } = await signOutAction()
      if (success) {
        setCurrentUser(null)
        setCurrentDirectory("/")
      }

      return [message]
    }
  }

  return (
    <FileSystemContext.Provider
      value={{
        currentDirectory,
        setCurrentDirectory,
        executeCommand,
        getFullPath,
        currentUser,
        setCurrentUser,
        searching,
        setEditMode,
        editMode,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}
