import mongoose from "mongoose"
import {
  UserProfile,
  AboutUser,
  DirectoryItem,
  FileItem,
  UrlItem,
} from "../types/schema"

const DirectoryItemSchema = new mongoose.Schema<DirectoryItem>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  size: { type: Number, required: true },
  lastModified: { type: Date, required: true },
})

const FileItemSchema = new mongoose.Schema<FileItem>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  content: { type: String, required: true },
  size: { type: Number, required: true },
  lastModified: { type: Date, required: true },
})

const UrlItemSchema = new mongoose.Schema<UrlItem>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  lastModified: { type: Date, required: true },
})

const AboutUserSchema = new mongoose.Schema<AboutUser>({
  directories: [DirectoryItemSchema],
  files: [FileItemSchema],
  urls: [UrlItemSchema],
})

const UserSchema = new mongoose.Schema<UserProfile>({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  image: { type: String },
  password: { type: String, required: true },
  about: AboutUserSchema,
})

UserSchema.index({ username: 1, email: 1 }, { unique: true })

export const User =
  mongoose.models.User || mongoose.model<UserProfile>("User", UserSchema)
