import { z } from "zod"

export const DirectoryItemSchema = z.object({
  name: z.string(),
  location: z.string(),
  size: z.number(),
  lastModified: z.date(),
})

export const FileItemSchema = z.object({
  name: z.string(),
  location: z.string(),
  content: z.string(),
  size: z.number(),
  lastModified: z.date(),
})

export const UrlItemSchema = z.object({
  name: z.string(),
  location: z.string(),
  url: z.string().url(),
  size: z.number(),
  lastModified: z.date(),
})

export const UserDataSchema = z.object({
  directories: z.array(DirectoryItemSchema),
  files: z.array(FileItemSchema),
  urls: z.array(UrlItemSchema),
})

export const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
})

export const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().url().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
})

export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string(),
})

export const SkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
})

export const HobbySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string().optional(),
})

export const PortfolioSchema = z.object({
  name: z.string(),
  title: z.string(),
  bio: z.string(),
  avatar: z.string().optional(),
  email: z.string().email().optional(),
  socialLinks: z.array(SocialLinkSchema),
  skills: z.array(SkillSchema),
  projects: z.array(ProjectSchema),
  experiences: z.array(ExperienceSchema),
  hobbies: z.array(HobbySchema),
  education: z.array(EducationSchema),
})

export const UserProfileSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters long." })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username must only contain letters and numbers.",
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  data: UserDataSchema,
  portfolio: PortfolioSchema,
})
