import mongoose from "mongoose"
import {
  UserProfile,
  UserData,
  Portfolio,
  SocialLink,
  Project,
  Experience,
  Skill,
} from "../types/schema"

const DirectoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  size: { type: Number, required: true },
  lastModified: { type: Date, required: true },
})

const FileItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  content: { type: String, required: true },
  size: { type: Number, required: true },
  lastModified: { type: Date, required: true },
})

const UrlItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  lastModified: { type: Date, required: true },
})

const UserDataSchema = new mongoose.Schema<UserData>({
  directories: [DirectoryItemSchema],
  files: [FileItemSchema],
  urls: [UrlItemSchema],
})

const SocialLinkSchema = new mongoose.Schema<SocialLink>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String },
})

const ProjectSchema = new mongoose.Schema<Project>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  link: { type: String },
  image: { type: String },
})

const ExperienceSchema = new mongoose.Schema<Experience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true },
})

const SkillSchema = new mongoose.Schema<Skill>({
  name: { type: String, required: true },
  level: { type: String },
})

const PortfolioSchema = new mongoose.Schema<Portfolio>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  avatar: { type: String },
  email: { type: String },
  socialLinks: [SocialLinkSchema],
  skills: [SkillSchema],
  projects: [ProjectSchema],
  experiences: [ExperienceSchema],
})

const UserSchema = new mongoose.Schema<UserProfile>(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    data: UserDataSchema,
    portfolio: PortfolioSchema,
  },
  {
    timestamps: true,
  }
)

export const User =
  mongoose.models.User || mongoose.model<UserProfile>("User", UserSchema)
