import { Document } from "mongoose"

export type UserProfile = Document & {
  username: string
  name: string
  email: string
  image?: string
  password: string
  about: AboutUser
}

export type AboutUser = {
  directories: DirectoryItem[]
  files: FileItem[]
  urls: UrlItem[]
}

export type DirectoryItem = {
  name: string
  location: string
  size: number
  lastModified: Date
}

export type FileItem = {
  name: string
  location: string
  content: string
  size: number
  lastModified: Date
}

export type UrlItem = {
  name: string
  location: string
  url: string
  size: number
  lastModified: Date
}

export type FileSystemNode = DirectoryItem | FileItem | UrlItem
