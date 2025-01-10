"use client"

import React, { createContext, use, useEffect, useState } from "react"
import {
  Portfolio,
  Skill,
  Project,
  Experience,
  SocialLink,
} from "@/types/schema"
import {
  updatePortfolio as updatePortfolioAction,
  loadPortfolio as loadPortfolioAction,
} from "@/app/actions"
import { useFileSystem } from "./FileSystemContext"

export type PortfolioContextType = {
  portfolio: Portfolio | null
  setPortfolio: React.Dispatch<React.SetStateAction<Portfolio | null>>
  executePortfolioCommand: (command: string) => Promise<string[]>
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
)

export const usePortfolio = () => {
  const context = use(PortfolioContext)
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider")
  }
  return context
}

export const PortfolioProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const { currentUser, setCurrentDirectory } = useFileSystem()

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!currentUser) return // Ensure there's a current user
      try {
        const loadedPortfolio = await loadPortfolioAction(currentUser as string)
        setPortfolio(loadedPortfolio)
        console.log("Loaded portfolio:", loadedPortfolio)
      } catch (error) {
        console.error("Error fetching portfolio:", error)
      }
    }

    fetchPortfolio()
  }, [currentUser])

  const executePortfolioCommand = async (
    command: string
  ): Promise<string[]> => {
    const [cmd, ...args] = command
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    switch (cmd) {
      case "view":
        return viewPortfolio(args[0])
      case "edit":
        return editPortfolio(args[0], args.slice(1).join(" "))
      case "add":
        return addItem(args[0], args.slice(1).join(" "))
      case "remove":
        return removeItem(args[0], args.slice(1).join(" "))
      case "save":
        return savePortfolio()
      case "help":
        return portfolioHelpCommand()
      case "exit":
        return exitPortfolio()
      default:
        return [`Error: Unknown portfolio command: ${cmd}`]
    }
  }

  const exitPortfolio = (): string[] => {
    setCurrentDirectory(`/${currentUser}`)
    return []
  }

  const viewPortfolio = (section?: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    if (!section) {
      return [
        "Portfolio Overview:",
        `Name: ${portfolio.name}`,
        `Title: ${portfolio.title}`,
        `Bio: ${portfolio.bio}`,
        `Email: ${portfolio.email || "Not set"}`,
        `Avatar: ${portfolio.avatar || "Not set"}`,
        "Use 'view <section>' to see details of skills, projects, experiences, or social links.",
      ]
    }

    switch (section) {
      case "skills":
        return [
          "Skills:",
          ...portfolio.skills.map(
            (skill) =>
              `- ${skill.name}${skill.level ? ` (${skill.level})` : ""}`
          ),
        ]
      case "projects":
        return [
          "Projects:",
          ...portfolio.projects.map(
            (project) => `- ${project.title}: ${project.description}`
          ),
        ]
      case "experiences":
        return [
          "Experiences:",
          ...portfolio.experiences.map(
            (exp) => `- ${exp.role} at ${exp.company}`
          ),
        ]
      case "social":
        return [
          "Social Links:",
          ...portfolio.socialLinks.map(
            (link) => `- ${link.platform}: ${link.url}`
          ),
        ]
      default:
        return [`Error: Unknown section: ${section}`]
    }
  }

  const editPortfolio = (field: string, value: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (field) {
      case "name":
      case "title":
      case "bio":
      case "email":
      case "avatar":
        setPortfolio({ ...portfolio, [field]: value })
        return [`Updated ${field} to: ${value}`]
      default:
        return [
          `Error: Cannot edit ${field} directly. Use 'add' or 'remove' commands for complex fields.`,
        ]
    }
  }

  const addItem = (section: string, itemData: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (section) {
      case "skill":
        const [skillName, skillLevel] = itemData.split(",").map((s) => s.trim())
        const newSkill: Skill = { name: skillName, level: skillLevel }
        setPortfolio({ ...portfolio, skills: [...portfolio.skills, newSkill] })
        return [
          `Added skill: ${skillName}${skillLevel ? ` (${skillLevel})` : ""}`,
        ]
      case "project":
        const [projectTitle, ...projectDesc] = itemData
          .split(",")
          .map((s) => s.trim())
        const newProject: Project = {
          title: projectTitle,
          description: projectDesc.join(", "),
          technologies: [],
        }
        setPortfolio({
          ...portfolio,
          projects: [...portfolio.projects, newProject],
        })
        return [`Added project: ${projectTitle}`]
      case "experience":
        const [role, company, description] = itemData
          .split(",")
          .map((s) => s.trim())
        const newExperience: Experience = {
          role,
          company,
          description,
          startDate: new Date(),
        }
        setPortfolio({
          ...portfolio,
          experiences: [...portfolio.experiences, newExperience],
        })
        return [`Added experience: ${role} at ${company}`]
      case "social":
        const [platform, url] = itemData.split(",").map((s) => s.trim())
        const newSocialLink: SocialLink = { platform, url }
        setPortfolio({
          ...portfolio,
          socialLinks: [...portfolio.socialLinks, newSocialLink],
        })
        return [`Added social link: ${platform}`]
      default:
        return [`Error: Unknown section: ${section}`]
    }
  }

  const removeItem = (section: string, itemIdentifier: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (section) {
      case "skill":
        setPortfolio({
          ...portfolio,
          skills: portfolio.skills.filter(
            (skill) => skill.name !== itemIdentifier
          ),
        })
        return [`Removed skill: ${itemIdentifier}`]
      case "project":
        setPortfolio({
          ...portfolio,
          projects: portfolio.projects.filter(
            (project) => project.title !== itemIdentifier
          ),
        })
        return [`Removed project: ${itemIdentifier}`]
      case "experience":
        setPortfolio({
          ...portfolio,
          experiences: portfolio.experiences.filter(
            (exp) => exp.role !== itemIdentifier
          ),
        })
        return [`Removed experience: ${itemIdentifier}`]
      case "social":
        setPortfolio({
          ...portfolio,
          socialLinks: portfolio.socialLinks.filter(
            (link) => link.platform !== itemIdentifier
          ),
        })
        return [`Removed social link: ${itemIdentifier}`]
      default:
        return [`Error: Unknown section: ${section}`]
    }
  }

  const savePortfolio = async (): Promise<string[]> => {
    if (!currentUser) return ["Signin to save portfolio"]
    if (!portfolio) return ["Error: No changes to save"]
    try {
      await updatePortfolioAction(currentUser, portfolio)
      return ["Portfolio saved successfully"]
    } catch (error) {
      return [`Error saving portfolio: ${error}`]
    }
  }

  const portfolioHelpCommand = (): string[] => {
    const commands = [
      [
        "view [section]",
        "View portfolio or specific section (skills, projects, experiences, social)",
      ],
      [
        "edit <field> <value>",
        "Edit basic portfolio fields (name, title, bio, email, avatar)",
      ],
      [
        "add <section> <data>",
        "Add item to a section (skill, project, experience, social)",
      ],
      ["remove <section> <identifier>", "Remove item from a section"],
      ["save", "Save changes to the portfolio"],
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

  return (
    <PortfolioContext.Provider
      value={{ executePortfolioCommand, portfolio, setPortfolio }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}
