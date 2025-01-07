"use server"

// import { calculateObjectSize } from "bson"
import dbConnect from "../lib/db"
import { User } from "../models/User"
import bcrypt from "bcrypt"
import {
  FileSystemNode,
  UserProfile,
  DirectoryItem,
  FileItem,
  UrlItem,
  AboutUser,
} from "@/types/schema"

// export async function calculateSize(data: any) {
//   return calculateObjectSize(data)
// }

export async function searchUser(username: string) {
  try {
    if (!username.trim()) {
      return ["Please provide a username"]
    }
    await dbConnect()

    const user: UserProfile | null = await User.findOne({ username })
    if (!user) {
      return ["Error: User not found: " + username]
    }
    return [
      "Username: " + user.username,
      "Name: " + user.name,
      "Email: " + user.email,
      // "About: " + JSON.stringify(user.about)
    ]
  } catch (error) {
    console.error("Error searching for user:", error)
    return ["An error occurred while searching for the user"]
  }
}

export const signUp = async (
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return { success: false, message: "Please provide all fields" }
    }

    await dbConnect()

    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return { success: false, message: "Username or email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username,
      name: username,
      email,
      password: hashedPassword,
      about: {
        directories: [],
        files: [],
        urls: [],
      },
    })
    await newUser.save()

    return { success: true, message: "User created successfully" }
  } catch (error) {
    console.error("Error during sign up:", error)
    return { success: false, message: "An error occurred during sign up" }
  }
}

export const signIn = async (
  identifier: string,
  password: string
): Promise<{ success: boolean; content: string }> => {
  try {
    if (!identifier.trim() || !password.trim()) {
      return {
        success: false,
        content: "Login failed: username/email and password are required",
      }
    }

    await dbConnect()

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    })

    if (!user) {
      return {
        success: false,
        content: "Login failed: user not found",
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { success: false, content: "Login failed: invalid password" }
    }

    return { success: true, content: user.username }
  } catch (error) {
    console.error("Error during sign in:", error)
    return { success: false, content: "Login failed: error during sign in" }
  }
}

export const getUserByUsername = async (
  username: string
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

export const createNode = async (
  username: string,
  location: string,
  name: string,
  type: "file" | "directory"
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found: " + username

    const existingItem = await findNodeByPath(user.about, location, name, "any")

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
      user.about.files.push({ ...newNode, content: " " } as FileItem)
    } else {
      user.about.directories.push(newNode as DirectoryItem)
    }

    await user.save()

    return `${type.charAt(0).toUpperCase() + type.slice(1)} created: ${name}`
  } catch (error) {
    console.error("Error during creating", type, ":", error)
    return `Error: An error occurred while creating the ${type}`
  }
}

export const listDirectory = async (
  username: string,
  location: string
): Promise<string[]> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return ["Error: User not found"]

    const directories = user.about.directories.filter(
      (dir) => dir.location === location
    )
    const files = user.about.files.filter((file) => file.location === location)
    const urls = user.about.urls.filter((url) => url.location === location)

    const allItems = [...directories, ...files, ...urls]

    if (allItems.length === 0) {
      return ["No items found in the directory"]
    }

    const output = ["Size       Last Modified         Name"]
    allItems.forEach((node) => {
      const size = `${node.size} B`.padEnd(11)
      const lastModified = new Date(node.lastModified)
        .toLocaleString()
        .padEnd(22)
      const name =
        "url" in node
          ? `${node.name} (URL)`
          : "content" in node
          ? node.name
          : `${node.name}/`
      output.push(`${size}${lastModified}${name}`)
    })

    return output
  } catch (error) {
    console.error("Error in listDirectory:", error)
    return ["Error: An error occurred while listing the directory"]
  }
}

export const changeDirectory = async (
  username: string,
  currentPath: string,
  newPath: string
): Promise<{ success: boolean; content: string }> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return { success: false, content: "Error: User not found" }

    const dir = await findNodeByPath(
      user.about,
      currentPath,
      newPath,
      "directory"
    )

    if (!dir) return { success: false, content: "Error: Directory not found" }

    return { success: true, content: `${currentPath}/${newPath}` }
  } catch (error) {
    console.error("Error in changeDirectory:", error)
    return {
      success: false,
      content: "Error: An error occurred while changing directory",
    }
  }
}

// fix this
export const readFileContent = async (
  username: string,
  location: string,
  filename: string
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found"

    const file = await findNodeByPath(user.about, location, filename, "file")
    const url = await findNodeByPath(user.about, location, filename, "url")

    if (!file && !url) return "Error: File not found"

    if (file) {
      return `Content of ${file.name}:\n${(file as FileItem).content}`
    }

    return `URL of ${url?.name}: fileurl://${(url as UrlItem).url}`
  } catch (error) {
    console.error("Error in readFileContent:", error)
    return "Error: An error occurred while reading file content"
  }
}

export const editFileContent = async (
  username: string,
  location: string,
  filename: string
): Promise<{ success: boolean; content: string }> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return { success: false, content: "Error: User not found" }

    const file = await findNodeByPath(user.about, location, filename, "file")
    if (!file) return { success: false, content: "Error: File not found" }

    return {
      success: true,
      content: (file as FileItem).content,
    }
  } catch (error) {
    console.error("Error in editFileContent:", error)
    return {
      success: false,
      content: "Error: An error occurred while preparing to edit file content",
    }
  }
}

export const updateFileContent = async (
  username: string,
  location: string,
  filename: string,
  content: string
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found"

    const file = await findNodeByPath(user.about, location, filename, "file")

    if (!file) return "Error: File not found"

    user.about.files = user.about.files.map((f) =>
      f.location === location && f.name === filename
        ? { ...f, content, lastModified: new Date() }
        : f
    )

    await user.save()

    return "File content updated successfully"
  } catch (error) {
    console.error("Error in updateFileContent:", error)
    return "Error: An error occurred while updating file content"
  }
}

export const setFileUrl = async (
  username: string,
  location: string,
  filename: string,
  url: string
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found"

    const urlItem = await findNodeByPath(user.about, location, filename, "url")

    if (urlItem) {
      user.about.urls = user.about.urls.map((u) =>
        u.location === location && u.name === filename ? { ...u, url } : u
      )
      await user.save()
      return `${filename} (URL) updated successfully`
    }

    const node = await findNodeByPath(user.about, location, filename, "any")
    if (node) {
      return `Error: An item with the name '${filename}' already exist in current directory`
    }

    const newUrlItem: UrlItem = {
      name: filename,
      location,
      url,
      size: 0,
      lastModified: new Date(),
    }

    user.about.urls.push(newUrlItem)
    await user.save()

    return `${filename} (URL) created successfully`
  } catch (error) {
    console.error("Error in setFileUrl:", error)
    return "Error: An error occurred while setting file URL"
  }
}

export const removeNode = async (
  username: string,
  location: string,
  name: string,
  type: "file" | "directory"
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found"

    const node = await findNodeByPath(user.about, location, name, "any")
    if (!node) return `Error: '${name}' not found`

    const removeItem = (collection: FileSystemNode[]) =>
      collection.filter(
        (item) => !(item.name === name && item.location === location)
      )

    if (type === "file") {
      user.about.files = removeItem(user.about.files) as FileItem[]
      user.about.urls = removeItem(user.about.urls) as UrlItem[]
    } else if (type === "directory") {
      const sm = (items: FileSystemNode[]) =>
        items.some((item) => item.location.startsWith(`${location}/${name}`))

      const hasChildren =
        sm(user.about.directories) ||
        sm(user.about.files) ||
        sm(user.about.urls)

      if (hasChildren) return "Error: Directory is not empty"

      user.about.directories = removeItem(
        user.about.directories
      ) as DirectoryItem[]
    }

    await user.save()

    return `${type.charAt(0).toUpperCase() + type.slice(1)} removed: ${name}`
  } catch (error) {
    console.error(`Error in remove ${type}:`, error)
    return `Error: An error occurred while deleting ${type}`
  }
}

export const renameFileOrDirectory = async (
  username: string,
  location: string,
  oldName: string,
  newName: string
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found"

    // Check if the old item exists
    const oldItemExists = await findNodeByPath(
      user.about,
      location,
      oldName,
      "any"
    )
    if (!oldItemExists)
      return `Error: ${oldName} does not exist in the current directory`

    // Check if the new item name already exists
    const newItemExists = await findNodeByPath(
      user.about,
      location,
      newName,
      "any"
    )
    if (newItemExists)
      return `Error: An item with the name ${newName} already exists in the current directory`

    // Helper function to rename items and update child locations recursively
    const renameItem = (collection: FileSystemNode[]) =>
      collection.map((item) => {
        if (item.name === oldName && item.location === location) {
          // Update the item's name
          return { ...item, name: newName }
        }

        if (item.location.startsWith(`${location}/${oldName}`)) {
          // Update the location of child items
          const updatedLocation = item.location.replace(
            `${location}/${oldName}`,
            `${location}/${newName}`
          )
          return { ...item, location: updatedLocation }
        }

        return item
      })

    // Rename items in all applicable collections
    user.about.directories = renameItem(
      user.about.directories
    ) as DirectoryItem[]
    user.about.files = renameItem(user.about.files) as FileItem[]
    user.about.urls = renameItem(user.about.urls) as UrlItem[]

    await user.save()
    return "Item renamed successfully"
  } catch (error) {
    console.error(`Error in renaming ${oldName}:`, error)
    return `Error: An error occurred while renaming ${oldName}`
  }
}

export const moveFileOrDirectory = async (
  username: string,
  location: string,
  name: string,
  destination: string
): Promise<string> => {
  try {
    const user = await getUserByUsername(username)
    if (!user) return "Error: User not found"

    const sourceNode = await findNodeByPath(user.about, location, name, "any")
    if (!sourceNode) return `Error: ${name} not found in the current directory`

    const destinationNode = await findNodeByPath(
      user.about,
      location,
      destination,
      "directory"
    )
    if (!destinationNode) return "Error: Destination not found"

    const existingItem = await findNodeByPath(
      user.about,
      destination,
      name,
      "any"
    )

    if (existingItem) {
      return `Error: An item with name ${name} already exists in the ${destination}`
    }

    // CHANGE THE LOCATION OF SOURCE ITEM
    user.about.directories = user.about.directories.map((d) =>
      d.name === name && d.location === destination
        ? { ...d, location: destination }
        : d
    )
    user.about.files = user.about.files.map((f) =>
      f.name === name && f.location === destination
        ? { ...f, location: destination }
        : f
    )
    user.about.urls = user.about.urls.map((u) =>
      u.name === name && u.location === destination
        ? { ...u, location: destination }
        : u
    )

    await user.save()

    return `The item ${name} has been moved to the ${destination}`
  } catch (error) {
    console.error(`Error in moving file/directory:`, error)
    return "Error: An error occurred while moving file/directory"
  }
}

async function findNodeByPath(
  about: AboutUser,
  location: string,
  name: string,
  type: "file" | "directory" | "url" | "any"
): Promise<FileSystemNode | undefined> {
  // Check in directories
  const directory = about.directories.find(
    (d) => d.location === location && d.name === name
  )
  if (directory && (type === "directory" || type === "any")) return directory

  // Check in files
  const file = about.files.find(
    (f) => f.location === location && f.name === name
  )
  if (file && (type === "file" || type === "any")) return file

  // Check in urls
  const url = about.urls.find((u) => u.location === location && u.name === name)
  if (url && (type === "url" || type === "any")) return url

  return undefined
}
