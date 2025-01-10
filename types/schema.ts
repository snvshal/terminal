import { z } from "zod"
import { Document } from "mongoose"
import {
  DirectoryItemSchema,
  ExperienceSchema,
  FileItemSchema,
  PortfolioSchema,
  ProjectSchema,
  SkillSchema,
  SocialLinkSchema,
  UrlItemSchema,
  UserDataSchema,
  UserProfileSchema,
} from "@/lib/zod"

export type UserProfile = z.infer<typeof UserProfileSchema> & Document
export type UserData = z.infer<typeof UserDataSchema>
export type DirectoryItem = z.infer<typeof DirectoryItemSchema>
export type FileItem = z.infer<typeof FileItemSchema>
export type UrlItem = z.infer<typeof UrlItemSchema>
export type SocialLink = z.infer<typeof SocialLinkSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Skill = z.infer<typeof SkillSchema>
export type Portfolio = z.infer<typeof PortfolioSchema>

export type FileSystemNode = DirectoryItem | FileItem | UrlItem
