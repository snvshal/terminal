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
  openFile as openFileAction,
  setFileUrl as setFileUrlAction,
  removeNode as removeNodeAction,
  moveFileOrDirectory as moveFileOrDirectoryAction,
  renameFileOrDirectory as renameFileOrDirectoryAction,
  deleteAccount as deleteAccountAction,
} from "../app/actions"

export type FileSystemContextType = {
  currentDirectory: string
  setCurrentDirectory: React.Dispatch<React.SetStateAction<string>>
  executeCommand: (command: string) => Promise<string[]>
  getFullPath: (filename: string) => string
  currentUser: string | null
  setCurrentUser: (username: string | null) => void
  loading: string | null
  setLoading: React.Dispatch<React.SetStateAction<string | null>>
  openNotepad: boolean
  setOpenNotepad: React.Dispatch<React.SetStateAction<boolean>>
  editFile: { filename: string; content: string } | null
  setEditFile: React.Dispatch<
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
  const [loading, setLoading] = useState<string | null>(null)
  const [openNotepad, setOpenNotepad] = useState<boolean>(false)
  const [editFile, setEditFile] = useState<{
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
        return [await openFile(args[0])]
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
        return ["cmd:clear"]
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
      case "userdel":
        return await deleteAccount(args[0], args[1])
      case "search":
        return await searchUser(args[0])
      case "seturl":
        return [await setFileUrl(args[0], args[1])]
      case "portfolio":
        return [userPortfolio()]
      case "about":
        return ["cmd:about"]
      default:
        return [`Error: Command not found: ${cmd}`]
    }
  }

  const userPortfolio = (): string => {
    if (!currentUser) return "Signin to view your portfolio"
    setCurrentDirectory("portfolio")
    return "Entering portfolio environment. Type 'help' for available commands."
  }

  const listDirectory = async (): Promise<string[]> => {
    if (!currentUser) return ["Signin to list items"]
    if (currentDirectory) {
      setLoading("Listing")
      const list = await listDirectoryAction(currentDirectory)
      setLoading(null)

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

      setLoading("Changing directory")
      const { success, message } = await changeDirectoryAction(newPath)
      setLoading(null)

      if (!success) return message
      setCurrentDirectory(message)
      return ""
    }

    return "Error: Directory not found"
  }

  const createDirectory = async (directoryName: string): Promise<string> => {
    if (!currentUser) return "Signin to create directory"
    if (!directoryName) return "Error: No directory name specified"

    setLoading("Creating directory")
    const result = createNodeAction(
      currentUser,
      currentDirectory,
      directoryName,
      "directory",
    )
    setLoading(null)

    return result
  }

  const createFile = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to create file"
    if (!filename) return "Error: No file name specified"

    setLoading("Creating file")
    const result = createNodeAction(
      currentUser,
      currentDirectory,
      filename,
      "file",
    )
    setLoading(null)

    return result
  }

  const removeDirectory = async (directoryName: string): Promise<string> => {
    if (!currentUser) return "Signin to remove directory"
    if (!directoryName) return "Error: No directory specified"

    setLoading("Removing directory")
    const result = removeNodeAction(
      currentDirectory,
      directoryName,
      "directory",
    )
    setLoading(null)

    return result
  }

  const removeFile = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to remove file"
    if (!filename) return "Error: No file specified"

    setLoading("Removing file")
    const result = removeNodeAction(currentDirectory, filename, "file")
    setLoading(null)

    return result
  }

  const renameFileOrDirectory = async (
    oldName: string,
    newName: string,
  ): Promise<string> => {
    if (!currentUser) return "Signin to rename file/directory"
    if (!oldName || !newName)
      return "Error: Old name and new name must be specified"

    if (oldName === newName) {
      return "Error: The new name must be different from the current name."
    }

    setLoading(`Renaming ${oldName}`)
    const message = await renameFileOrDirectoryAction(
      currentDirectory,
      oldName,
      newName,
    )
    setLoading(null)

    return message
  }

  const printWorkingDirectory = (): string => {
    return currentDirectory
  }

  const moveFileOrDirectory = async (
    fileOrDirectoryName: string,
    destination: string,
  ): Promise<string> => {
    if (!currentUser) return "Signin to move file/directory"
    if (!fileOrDirectoryName || !destination)
      return "Error: Source and destination must be specified"

    if (fileOrDirectoryName === destination) {
      return "Error: Destination path cannot be the source path"
    }

    const destinationPath = destination.startsWith(`/${currentUser}`)
      ? destination
      : `${currentDirectory}/${destination}`.replace(/\/+/g, "/")

    if (!destinationPath.startsWith(`/${currentUser}`)) {
      return "Error: Cannot operate outside of user's directory"
    }

    setLoading(`Moving ${fileOrDirectoryName}`)
    const message = await moveFileOrDirectoryAction(
      currentDirectory,
      fileOrDirectoryName,
      destinationPath,
    )
    setLoading(null)

    return message
  }

  const helpCommand = (): string[] => {
    const commands: [string, string][] = [
      // Basic file and directory commands
      ["ls", "List directory contents"],
      ["pwd", "Print working directory"],
      ["cd [directory]", "Change the current directory"],
      ["mkdir [directory]", "Create a new directory"],
      ["rmdir [directory]", "Remove an empty directory"],
      ["touch [file]", "Create a new file"],
      ["open [file]", "Display file or url content"],
      // ["edit [file]", "Edit file content"],
      ["seturl [file] [url]", "Set and update URL content for a file"],
      ["rm [file]", "Remove a file or url"],
      ["mv [file/directory] [destination]", "Move a file or directory"],
      ["rename [old name] [new name]", "Rename a file or directory or url"],
      // ["chmod [permissions] [file/directory]", "Change file permissions"],

      // Account-related commands
      //  ["search [username]", "Search for a user portfolio"],
      ["signup [username] [password]", "Create a new user account"],
      ["signin [username] [password]", "Sign in to your account"],
      ["signout", "Sign out of your account"],
      ["userdel [username] [password]", "Delete your account"],
      ["portfolio", "View and edit your portfolio"],

      // Utility commands
      ["clear/cls", "Clear the terminal screen"],
      ["about", "Detailed explanation about the terminal"],
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

  const openFile = async (filename: string): Promise<string> => {
    if (!currentUser) return "Signin to open file"
    if (!filename) return "Error: No file specified"
    // if (openNotepad) return "Error: Notepad is already opened"
    const { success, message, type } = await openFileAction(
      currentDirectory,
      filename,
    )
    if (success) {
      if (type === "file") {
        setOpenNotepad(true)
        setEditFile({ filename, content: message })
        return `File opened: ${filename}`
      } else if (type === "url") {
        return `URL of ${filename}: fileurl://${message}`
      }
      return "Error: File not found"
    } else {
      return `Error: ${message}`
    }
  }

  const setFileUrl = async (filename: string, url: string): Promise<string> => {
    if (!currentUser) return "Signin to set url"
    if (!filename) return "Error: No file specified"
    if (!url) return "Error: No URL specified"

    const result = await setFileUrlAction(currentDirectory, filename, url)

    return result
  }

  const searchUser = async (username: string): Promise<string[]> => {
    if (!username) return ["Error: No username specified"]

    setLoading("Searching")
    const result = await searchUserAction(username)
    setLoading(null)

    return result
  }

  const signUp = async (
    username: string,
    password: string,
  ): Promise<string[]> => {
    if (!username || !password) {
      return ["Error: Login failed: username and password are required"]
    }
    if (currentUser) {
      return [
        "Error: You are already signed in!",
        "Sign out to create a new account",
      ]
    } else {
      setLoading("Creating your account")
      const { success, message } = await signUpAction(username, password)
      setLoading(null)
      if (success) {
        setCurrentUser(username)
        setCurrentDirectory(`/${username}`)
        return [`Signup successful. Welcome, ${username}!`]
      } else {
        return ["Error: Signup failed: ", ...message]
      }
    }
  }

  const signIn = async (
    username: string,
    password: string,
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
      setLoading("Authenticating")
      const { success, message } = await signInAction(username, password)
      setLoading(null)

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

  const deleteAccount = async (
    username: string,
    password: string,
  ): Promise<string[]> => {
    if (!currentUser) {
      return ["Error: You are not signed in!"]
    } else {
      const { success, message } = await deleteAccountAction(username, password)
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
        loading,
        setLoading,
        openNotepad,
        setOpenNotepad,
        setEditFile,
        editFile,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}
