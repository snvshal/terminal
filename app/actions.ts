"use server"

import dbConnect from "../lib/db"
import { User } from "../models/User"
import bcrypt from "bcrypt"
import {
  FileSystemNode,
  UserProfile,
  DirectoryItem,
  FileItem,
  UrlItem,
  UserData,
  Portfolio,
} from "@/types/schema"
import { PortfolioSchema, UserProfileSchema } from "@/lib/zod"
import { createSession, deleteSession, getUsername } from "@/lib/session"

export const signUp = async (
  username: string,
  password: string,
): Promise<{ success: boolean; message: string[] }> => {
  try {
    const validationResult = UserProfileSchema.safeParse({
      username,
      password,
      data: { directories: [], files: [], urls: [] },
      portfolio: {
        name: username,
        title: `${username}'s Portfolio`,
        bio: "Welcome to my portfolio!",
        socialLinks: [],
        skills: [],
        projects: [],
        experiences: [],
        hobbies: [],
        education: [],
      },
    })

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(
        (err) => "Error: " + err.message,
      )
      return { success: false, message: errorMessages }
    }

    await dbConnect()

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return { success: false, message: ["Username already taken"] }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      ...validationResult.data,
      password: hashedPassword,
    })

    await createSession(username)

    return { success: true, message: ["Your account has been created"] }
  } catch (error) {
    console.error("Error during sign up:", error)
    return {
      success: false,
      message: ["Error: An error occurred during sign up"],
    }
  }
}

export const signIn = async (
  username: string,
  password: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await dbConnect()

    const user = await User.findOne({ username })

    if (!user) {
      return {
        success: false,
        message: "Error: Login failed: user not found",
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Error: Login failed: invalid password",
      }
    }

    await createSession(username)

    return { success: true, message: user.username }
  } catch (error) {
    console.error("Error during sign in:", error)
    return {
      success: false,
      message: "Error: Login failed: error during sign in",
    }
  }
}

export const signOut = async (): Promise<{
  success: boolean
  message: string
}> => {
  try {
    await deleteSession()
    return { success: true, message: "You have been signed out!" }
  } catch (error) {
    console.error("Error during sign out:", error)
    return {
      success: false,
      message: "Error: An error occurred during sign out",
    }
  }
}

export const deleteAccount = async (
  username: string,
  password: string,
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const user = await getUser()

    if (!user) return { success: false, message: "Error: User not found" }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, message: "Error: Invalid password" }
    }

    await signOut()
    await User.deleteOne({ username })

    return { success: true, message: "Account deleted successfully" }
  } catch (error) {
    console.error("Error deleting account:", error)
    return {
      success: false,
      message: "Error: An error occurred while deleting the account",
    }
  }
}

export const getUser = async (): Promise<UserProfile | null> => {
  try {
    await dbConnect()
    const username = await getUsername()
    const user: UserProfile | null = await User.findOne({ username })
    return user
  } catch (error) {
    console.error("Error in getUserByUsername:", error)
    return null
  }
}

export const getUserByUsername = async (
  username: string,
): Promise<UserProfile | null> => {
  try {
    await dbConnect()
    const user: UserProfile | null = await User.findOne({ username })
    return user
  } catch (error) {
    console.error("Error in getUserByUsername:", error)
    return null
  }
}

export async function calculateSize(data: string): Promise<number> {
  try {
    if (typeof data !== "string") {
      throw new Error("Invalid input: data must be a string.")
    }

    return Buffer.byteLength(data, "utf-8")
  } catch (error) {
    console.error("Error calculating size:", error)
    throw error
  }
}

export const getDirNameByLocation = async (
  location: string,
): Promise<{ dirName: string; parentLocation: string }> => {
  const dirLocation = location.split("/")
  const dirName = dirLocation.pop() as string
  const parentLocation = dirLocation.join("/")

  return { dirName, parentLocation }
}

export const calculateDirectorySize = async (
  user: UserProfile,
  location: string,
  diff: number,
): Promise<void> => {
  try {
    if (location === `/${user.username}`) {
      await user.save()
      return
    }

    const { dirName, parentLocation } = await getDirNameByLocation(location)

    user.data.directories = user.data.directories.map((d) =>
      d.location === parentLocation && d.name === dirName
        ? { ...d, size: d.size + diff }
        : d,
    )

    await calculateDirectorySize(user, parentLocation, diff)
  } catch (error) {
    console.error("Error in calculateDirectorySize:", error)
  }
}

export async function searchUser(username: string): Promise<string[]> {
  try {
    if (!username) return ["Error: Please provide a username"]

    const user = await getUserByUsername(username)
    if (!user) return [`User not found: '${username}'`]

    const portfolio = user.portfolio
    return [
      `Portfolio Overview of ${username}:`,
      "                                                   ",
      `Name         ${portfolio.name}`,
      `Title        ${portfolio.title}`,
      `Bio          ${portfolio.bio}`,
      `Email        ${portfolio.email || "Not set"}`,
      `Avatar       ${portfolio.avatar || "Not set"}`,
      "                                                   ",
      `View ${portfolio.name}'s portfolio here: fileurl://${process.env.METADATA_BASE_URL}/${username}`,
    ]
  } catch (error) {
    console.error("Error searching for user:", error)
    return ["An error occurred while searching for the user"]
  }
}

export const createNode = async (
  username: string,
  location: string,
  name: string,
  type: "file" | "directory",
): Promise<string> => {
  try {
    const user = await getUser()
    if (!user) return "Error: User not found: " + username

    const existingItem = await findNodeByPath(user.data, location, name, "any")

    if (existingItem) {
      return `Error: A ${type} with the name '${name}' already exists in this location`
    }

    const now = new Date()
    const newNode = {
      name,
      location,
      size: 0,
      lastModified: now,
    }

    if (type === "file") {
      user.data.files.push({ ...newNode, content: "" } as FileItem)
    } else {
      user.data.directories.push(newNode as DirectoryItem)
    }

    await user.save()

    return `${type.charAt(0).toUpperCase() + type.slice(1)} created: ${name}`
  } catch (error) {
    console.error("Error during creating", type, ":", error)
    return `Error: An error occurred while creating the ${type}`
  }
}

export const listDirectory = async (location: string): Promise<string[]> => {
  try {
    const user = await getUser()
    if (!user) return ["Error: User not found"]

    const directories = user.data.directories.filter(
      (d) => d.location === location,
    )
    const files = user.data.files.filter((file) => file.location === location)
    const urls = user.data.urls.filter((url) => url.location === location)

    const allItems = [...directories, ...files, ...urls]

    if (allItems.length === 0) {
      return ["No items found in the directory"]
    }

    const output = [
      "Type                     LastWriteTime           Size  Name",
      "----                     -------------           ----  ----",
    ]
    allItems.forEach((node) => {
      const type = (
        "content" in node ? "File" : "url" in node ? "URL" : "Directory"
      ).padEnd(15)

      const size = `${node.size}`.padStart(15)

      // Format date as dd-mm-yyyy HH:MM:SS
      const date = new Date(node.lastModified)
      const pad = (num: number) => num.toString().padStart(2, "0")

      const formattedDate = [
        pad(date.getDate()),
        pad(date.getMonth() + 1),
        date.getFullYear(),
      ].join("-")
      const formattedTime = [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
      ].join(":")

      const lastModified = `${formattedDate}    ${formattedTime}`.padStart(23)

      const name = `  ${node.name}`

      output.push(`${type}${lastModified}${size}${name}`)
    })

    return output
  } catch (error) {
    console.error("Error in listDirectory:", error)
    return ["Error: An error occurred while listing the directory"]
  }
}

export const changeDirectory = async (
  newPath: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await getUser()
    if (!user) return { success: false, message: "Error: User not found" }

    const { dirName, parentLocation } = await getDirNameByLocation(newPath)

    const directory = await findNodeByPath(
      user.data,
      parentLocation,
      dirName,
      "directory",
    )

    if (!directory)
      return { success: false, message: "Error: Directory not found" }

    return { success: true, message: newPath }
  } catch (error) {
    console.error("Error in changeDirectory:", error)
    return {
      success: false,
      message: "Error: An error occurred while changing directory",
    }
  }
}

export const openFile = async (
  location: string,
  filename: string,
): Promise<{
  success: boolean
  message: string
  type: "file" | "url" | "not-found"
}> => {
  try {
    const user = await getUser()
    if (!user)
      return {
        success: false,
        message: "Error: User not found",
        type: "not-found",
      }

    const node = await findNodeByPath(user.data, location, filename, "any")

    if (!node)
      return {
        success: false,
        message: "Error: File not found",
        type: "not-found",
      }

    if ("url" in node) {
      return {
        success: true,
        message: (node as UrlItem).url,
        type: "url",
      }
    } else if ("content" in node) {
      return {
        success: true,
        message: (node as FileItem).content,
        type: "file",
      }
    }

    return {
      success: false,
      message: "Error: File not found",
      type: "not-found",
    }
  } catch (error) {
    console.error("Error in editFileContent:", error)
    return {
      success: false,
      message: "Error: An error occurred while preparing to edit file content",
      type: "not-found",
    }
  }
}

export const updateFileContent = async (
  location: string,
  filename: string,
  content: string,
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const user = await getUser()
    if (!user) return { success: false, message: "Error: User not found" }

    const fileIndex = user.data.files.findIndex(
      (f) => f.location === location && f.name === filename,
    )

    if (fileIndex === -1)
      return { success: false, message: "Error: File not found" }

    const file = user.data.files[fileIndex]
    file.content = content
    file.lastModified = new Date()

    const updatedSize = await calculateSize(file.content)
    const diff = updatedSize - file.size
    file.size = updatedSize

    await calculateDirectorySize(user, location, diff)

    return { success: true, message: "File content updated successfully" }
  } catch (error) {
    console.error("Error in updateFileContent:", error)
    return {
      success: false,
      message: "Error: An error occurred while updating file content",
    }
  }
}

export const setFileUrl = async (
  location: string,
  filename: string,
  url: string,
): Promise<string> => {
  try {
    const user = await getUser()
    if (!user) return "Error: User not found"

    const urlIndex = user.data.urls.findIndex(
      (u) => u.location === location && u.name === filename,
    )

    if (urlIndex !== -1) {
      const urlItem = user.data.urls[urlIndex]
      urlItem.url = url
      urlItem.lastModified = new Date()

      const updatedSize = await calculateSize(urlItem.url)
      const diff = updatedSize - urlItem.size

      urlItem.size = updatedSize

      await calculateDirectorySize(user, location, diff)

      return `${filename} (URL) updated successfully`
    }

    const nodeExists = await findNodeByPath(
      user.data,
      location,
      filename,
      "any",
    )

    if (nodeExists) {
      return `Error: An item with the name '${filename}' already exists in the current directory`
    }

    const urlSize = await calculateSize(url)

    const newUrlItem: UrlItem = {
      name: filename,
      location,
      url,
      size: urlSize,
      lastModified: new Date(),
    }

    user.data.urls.push(newUrlItem)
    await calculateDirectorySize(user, location, urlSize)

    return `${filename} (URL) created successfully`
  } catch (error) {
    console.error("Error in setFileUrl:", error)
    return "Error: An error occurred while setting file URL"
  }
}

export const removeNode = async (
  location: string,
  name: string,
  type: "file" | "directory",
): Promise<string> => {
  try {
    const user = await getUser()
    if (!user) return "Error: User not found"

    const node = await findNodeByPath(user.data, location, name, "any")
    if (!node) return `Error: '${name}' not found`

    if (("content" in node || "url" in node) && type === "directory") {
      return "Error: Directory not found"
    } else if (!("content" in node || "url" in node) && type === "file") {
      return "Error: File not found"
    }

    const removeItem = (items: FileSystemNode[]) =>
      items.filter(
        (item) => !(item.name === name && item.location === location),
      )

    if (type === "file") {
      user.data.files = removeItem(user.data.files) as FileItem[]
      user.data.urls = removeItem(user.data.urls) as UrlItem[]
    } else if (type === "directory") {
      const sm = (items: FileSystemNode[]) =>
        items.some((item) => item.location.startsWith(`${location}/${name}`))

      const hasChildren =
        sm(user.data.directories) || sm(user.data.files) || sm(user.data.urls)

      if (hasChildren) return "Error: Directory is not empty"

      user.data.directories = removeItem(
        user.data.directories,
      ) as DirectoryItem[]
    }

    await calculateDirectorySize(user, location, -node.size)

    return `${type.charAt(0).toUpperCase() + type.slice(1)} removed: ${name}`
  } catch (error) {
    console.error(`Error in remove ${type}:`, error)
    return `Error: An error occurred while deleting ${type}`
  }
}

export const renameFileOrDirectory = async (
  location: string,
  oldName: string,
  newName: string,
): Promise<string> => {
  try {
    const user = await getUser()
    if (!user) return "Error: User not found"

    // Check if the old item exists
    const oldItemExists = await findNodeByPath(
      user.data,
      location,
      oldName,
      "any",
    )
    if (!oldItemExists)
      return `Error: ${oldName} does not exist in the current directory`

    // Check if the new item name already exists
    const newItemExists = await findNodeByPath(
      user.data,
      location,
      newName,
      "any",
    )
    if (newItemExists)
      return `Error: An item with the name ${newName} already exists in the current directory`

    // Helper function to rename items and update child locations recursively
    const renameItem = (items: FileSystemNode[]) =>
      items.map((item) => {
        if (item.name === oldName && item.location === location) {
          // Update the item's name
          return { ...item, name: newName }
        }

        if (item.location.startsWith(`${location}/${oldName}`)) {
          // Update the location of child items
          const updatedLocation = item.location.replace(
            `${location}/${oldName}`,
            `${location}/${newName}`,
          )
          return { ...item, location: updatedLocation }
        }

        return item
      })

    // Rename items in all applicable collections
    user.data.directories = renameItem(user.data.directories) as DirectoryItem[]
    user.data.files = renameItem(user.data.files) as FileItem[]
    user.data.urls = renameItem(user.data.urls) as UrlItem[]

    await user.save()
    return "Item renamed successfully"
  } catch (error) {
    console.error(`Error in renaming ${oldName}:`, error)
    return `Error: An error occurred while renaming ${oldName}`
  }
}

export const moveFileOrDirectory = async (
  location: string,
  name: string,
  destination: string,
): Promise<string> => {
  try {
    const user = await getUser()
    if (!user) return "Error: User not found"

    const sourceNode = await findNodeByPath(user.data, location, name, "any")
    if (!sourceNode) return `Error: ${name} not found in the current directory`

    const { dirName, parentLocation } = await getDirNameByLocation(destination)
    const destinationNode = await findNodeByPath(
      user.data,
      parentLocation,
      dirName,
      "directory",
    )
    if (!destinationNode) return "Error: Destination not found"

    const existingItem = await findNodeByPath(
      user.data,
      destination,
      name,
      "any",
    )
    if (existingItem) {
      return `Error: An item with name ${name} already exists in the ${destination}`
    }

    const updateLocation = (node: FileSystemNode) => {
      if (node.name === name && node.location === location) {
        node.location = destination
      } else if (node.location.startsWith(`${location}/${name}`)) {
        node.location = node.location.replace(
          `${location}/${name}`,
          destination,
        )
      }
    }

    if ("content" in sourceNode) {
      user.data.files.forEach(updateLocation)
    } else if ("url" in sourceNode) {
      user.data.urls.forEach(updateLocation)
    } else {
      user.data.directories.forEach(updateLocation)
      user.data.files.forEach(updateLocation)
      user.data.urls.forEach(updateLocation)
    }

    const sizeDiff = sourceNode.size
    await calculateDirectorySize(user, location, -sizeDiff)
    await calculateDirectorySize(user, destination, sizeDiff)

    return `The item ${name} has been moved to the ${destination}`
  } catch (error) {
    console.error(`Error in moving file/directory:`, error)
    return "Error: An error occurred while moving file/directory"
  }
}

async function findNodeByPath(
  data: UserData,
  location: string,
  name: string,
  type: "file" | "directory" | "url" | "any",
): Promise<FileSystemNode | undefined> {
  // Check in directories
  const directory = data.directories.find(
    (d) => d.location === location && d.name === name,
  )
  if (directory && (type === "directory" || type === "any")) return directory

  // Check in files
  const file = data.files.find(
    (f) => f.location === location && f.name === name,
  )
  if (file && (type === "file" || type === "any")) return file

  // Check in urls
  const url = data.urls.find((u) => u.location === location && u.name === name)
  if (url && (type === "url" || type === "any")) return url

  return undefined
}

export const updatePortfolio = async (
  portfolioData: Portfolio,
): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const user = await getUser()
    if (!user) return { success: false, message: "Error: User not found" }

    const validationResult = PortfolioSchema.safeParse(portfolioData)
    if (!validationResult.success) {
      return { success: false, message: "Error: Invalid portfolio data" }
    }

    user.portfolio = validationResult.data
    await user.save()

    return { success: true, message: "Portfolio updated successfully" }
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return {
      success: false,
      message: "Error: An error occurred while updating the portfolio",
    }
  }
}

export const loadPortfolio = async (): Promise<Portfolio | null> => {
  try {
    const user = await getUser()
    if (!user) return null

    const portfolio = user.portfolio

    return JSON.parse(JSON.stringify(portfolio))
  } catch (error) {
    console.error("Error loading portfolio:", error)
    return null
  }
}
