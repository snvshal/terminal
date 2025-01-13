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
import {
  SkillSchema,
  ProjectSchema,
  ExperienceSchema,
  SocialLinkSchema,
} from "@/lib/zod"

type InputStep = {
  field: string
  prompt: string
  optional?: boolean
}

type InputMode = {
  type: "skill" | "project" | "experience" | "social"
  steps: InputStep[]
  currentStep: number
  data: Record<string, string>
}

export type PortfolioContextType = {
  portfolio: Portfolio | null
  setPortfolio: React.Dispatch<React.SetStateAction<Portfolio | null>>
  executePortfolioCommand: (command: string) => Promise<string[]>
  inputMode: InputMode | null
  setInputMode: React.Dispatch<React.SetStateAction<InputMode | null>>
  handleInputStep: (input: string) => Promise<string[]>
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
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
  const [inputMode, setInputMode] = useState<InputMode | null>(null)
  const { currentUser, setCurrentDirectory, setSearching } = useFileSystem()

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!currentUser) return
      try {
        const loadedPortfolio = await loadPortfolioAction()
        setPortfolio(loadedPortfolio)
      } catch (error) {
        console.error("Error fetching portfolio:", error)
      }
    }

    fetchPortfolio()
  }, [currentUser])

  const executePortfolioCommand = async (
    command: string,
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
        return startAddItem(args[0])
      case "remove":
        return removeItem(args[0], args.slice(1).join(" "))
      case "save":
        return savePortfolio()
      case "clear":
      case "cls":
        return ["clear"]
      case "help":
        return portfolioHelpCommand()
      case "exit":
        return exitPortfolio()
      default:
        return [`Error: Unknown portfolio command: ${cmd}`]
    }
  }

  const startAddItem = (section: string): string[] => {
    if (!section) {
      return ["Error: Section is required. Usage: add <section>"]
    }

    let steps: InputStep[] = []
    switch (section) {
      case "skill":
        steps = [
          { field: "name", prompt: "Enter skill name:" },
          {
            field: "level",
            prompt: "Enter skill level (optional):",
            optional: true,
          },
        ]
        break
      case "project":
        steps = [
          { field: "title", prompt: "Enter project title:" },
          { field: "description", prompt: "Enter project description:" },
          {
            field: "technologies",
            prompt: "Enter technologies (comma-separated):",
          },
          {
            field: "link",
            prompt: "Enter project link (optional):",
            optional: true,
          },
          {
            field: "image",
            prompt: "Enter project image link (optional):",
            optional: true,
          },
        ]
        break
      case "experience":
        steps = [
          { field: "role", prompt: "Enter role:" },
          { field: "company", prompt: "Enter company:" },
          { field: "description", prompt: "Enter description:" },
          { field: "startDate", prompt: "Enter start date (YYYY-MM-DD):" },
          {
            field: "endDate",
            prompt: "Enter end date (YYYY-MM-DD or 'present'):",
            optional: true,
          },
        ]
        break
      case "social":
        steps = [
          { field: "platform", prompt: "Enter social platform:" },
          { field: "url", prompt: "Enter social link URL:" },
        ]
        break
      default:
        return [`Error: Unknown section: ${section}`]
    }

    setInputMode({
      type: section as "skill" | "project" | "experience" | "social",
      steps,
      currentStep: 0,
      data: {},
    })

    return [steps[0].prompt]
  }

  const handleInputStep = async (input: string): Promise<string[]> => {
    if (!inputMode) return ["Error: Not in input mode"]

    const { type, steps, currentStep, data } = inputMode
    const currentField = steps[currentStep].field

    if (input.trim() || steps[currentStep].optional) {
      data[currentField] = input.trim()

      if (currentStep + 1 < steps.length) {
        setInputMode({
          ...inputMode,
          currentStep: currentStep + 1,
          data,
        })
        return [steps[currentStep + 1].prompt]
      } else {
        // All steps completed, validate and add the item
        const validationResult = validateItem(type, data)
        if (validationResult.success) {
          const result = await addItem(type, validationResult.data)
          setInputMode(null)
          return result
        } else {
          setInputMode(null)
          return [`Error: Invalid inputs. ${validationResult.error.message}`]
        }
      }
    } else {
      return ["Error: This field is required. Please enter a value."]
    }
  }

  const validateItem = (
    type: "skill" | "project" | "experience" | "social",
    data: Record<string, string>,
  ):
    | { success: true; data: Skill | Project | Experience | SocialLink }
    | { success: false; error: Error } => {
    switch (type) {
      case "skill":
        return SkillSchema.safeParse(data) as
          | { success: true; data: Skill }
          | { success: false; error: Error }
      case "project":
        const projectData = {
          ...data,
          technologies: data.technologies.split(",").map((t) => t.trim()),
          link: data.link || undefined,
          image: data.image || undefined,
        }
        return ProjectSchema.safeParse(projectData) as
          | { success: true; data: Project }
          | { success: false; error: Error }
      case "experience":
        return ExperienceSchema.safeParse({
          ...data,
          startDate: new Date(data.startDate),
          endDate:
            data.endDate === "present" ? undefined : new Date(data.endDate),
        }) as
          | { success: true; data: Experience }
          | { success: false; error: Error }
      case "social":
        return SocialLinkSchema.safeParse(data) as
          | { success: true; data: SocialLink }
          | { success: false; error: Error }
      default:
        return { success: false, error: new Error("Unknown item type") }
    }
  }

  const addItem = async (
    section: "skill" | "project" | "experience" | "social",
    data: Skill | Project | Experience | SocialLink,
  ): Promise<string[]> => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (section) {
      case "skill":
        setPortfolio({
          ...portfolio,
          skills: [...portfolio.skills, data as Skill],
        })
        return [`Skill "${(data as Skill).name}" submitted successfully`]
      case "project":
        setPortfolio({
          ...portfolio,
          projects: [...portfolio.projects, data as Project],
        })
        return [`Project "${(data as Project).title}" submitted successfully`]
      case "experience":
        setPortfolio({
          ...portfolio,
          experiences: [...portfolio.experiences, data as Experience],
        })
        return [
          `Experience "${(data as Experience).role} at ${(data as Experience).company}" submitted successfully`,
        ]
      case "social":
        setPortfolio({
          ...portfolio,
          socialLinks: [...portfolio.socialLinks, data as SocialLink],
        })
        return [
          `Social link for ${(data as SocialLink).platform} submitted successfully`,
        ]
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
        "                                                   ",
        `- Name:             ${portfolio.name}`,
        `- Title:            ${portfolio.title}`,
        `- Bio:              ${portfolio.bio}`,
        `- Email:            ${portfolio.email || "Not set"}`,
        `- Avatar:           ${portfolio.avatar ? "fileurl://" + portfolio.avatar : "Not set"}`,
        "                                                   ",
        "Use 'view <section>' to see details:",
        "example: view [skills, projects, experiences, or social links]",
      ]
    }

    switch (section) {
      case "skills":
        return [
          "Skills:",
          ...portfolio.skills.flatMap((skill) => [
            `- Name:             ${skill.name}`,
            `- Level:            ${skill.level ? `${skill.level}` : "Not set"}`,
          ]),
        ]
      case "projects":
        return [
          "Projects:",
          ...portfolio.projects.flatMap((project, index) => [
            `Project ${index + 1}:`,
            `- Title:            ${project.title}`,
            `- Description:      ${project.description}`,
            `- Technologies:     ${project.technologies}`,
            `- Link:             ${project.link ? "fileurl://" + project.link : "Not set"}`,
            `- Image:            ${project.image ? "fileurl://" + project.image : "Not set"}`,
            `                     `,
          ]),
        ]
      case "experiences":
        return [
          "Experiences:",
          ...portfolio.experiences.flatMap((exp) => [
            `- Role:             ${exp.role}`,
            `- Company:          ${exp.company}`,
            `- Description:      ${exp.description} `,
            `- Start Date:       ${exp.startDate}`,
            `- End Date:         ${exp.endDate || "Present"}`,
          ]),
        ]
      case "social":
        return [
          "Social Links:",
          ...portfolio.socialLinks.flatMap((link) => [
            `- ${link.platform}:      ${"fileurl://" + link.url}   `,
          ]),
        ]
      default:
        return [`Error: Unknown section: ${section}`]
    }
  }

  const editPortfolio = (field: string, value: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]
    if (!field) return [`Error: Field is required`]

    switch (field) {
      case "name":
      case "title":
      case "bio":
      case "email":
      case "avatar":
        if (!value) return [`Error: The value for '${field}' is required`]
        setPortfolio({ ...portfolio, [field]: value })
        return [`Updated ${field} to: ${value}`]
      default:
        return [`Error: Field '${field}' not found`]
    }
  }

  const removeItem = (section: string, itemIdentifier: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (section) {
      case "skill":
        setPortfolio({
          ...portfolio,
          skills: portfolio.skills.filter(
            (skill) => skill.name !== itemIdentifier,
          ),
        })
        return [`Removed skill: ${itemIdentifier}`]
      case "project":
        setPortfolio({
          ...portfolio,
          projects: portfolio.projects.filter(
            (project) => project.title !== itemIdentifier,
          ),
        })
        return [`Removed project: ${itemIdentifier}`]
      case "experience":
        setPortfolio({
          ...portfolio,
          experiences: portfolio.experiences.filter(
            (exp) => exp.role !== itemIdentifier,
          ),
        })
        return [`Removed experience: ${itemIdentifier}`]
      case "social":
        setPortfolio({
          ...portfolio,
          socialLinks: portfolio.socialLinks.filter(
            (link) => link.platform !== itemIdentifier,
          ),
        })
        return [`Removed social link: ${itemIdentifier}`]
      default:
        return [`Error: Unknown section: ${section}`]
    }
  }

  const preparePortfolioForSave = (portfolio: Portfolio): Portfolio => {
    return {
      ...portfolio,
      experiences: portfolio.experiences.map((experience) => ({
        ...experience,
        startDate: new Date(experience.startDate),
        endDate: experience.endDate ? new Date(experience.endDate) : undefined,
      })),
    }
  }

  const savePortfolio = async (): Promise<string[]> => {
    if (!portfolio) return ["Error: No changes to save"]
    try {
      setSearching("Saving portfolio")
      const preparedPortfolio = preparePortfolioForSave(portfolio)
      const { message } = await updatePortfolioAction(preparedPortfolio)
      setSearching(null)
      return [message]
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

  return (
    <PortfolioContext.Provider
      value={{
        executePortfolioCommand,
        portfolio,
        setPortfolio,
        inputMode,
        setInputMode,
        handleInputStep,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}
