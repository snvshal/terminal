"use client"

import React, { createContext, use, useEffect, useState } from "react"
import {
  Portfolio,
  Skill,
  Project,
  Experience,
  SocialLink,
  Hobby,
  Education,
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
  HobbySchema,
  EducationSchema,
} from "@/lib/zod"

type InputStep = {
  field: string
  prompt: string
  optional?: boolean
}

type InputMode = {
  type: "skill" | "project" | "experience" | "social" | "hobby" | "education"
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
  const { currentUser, currentDirectory, setCurrentDirectory, setLoading } =
    useFileSystem()

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
    const [cmd, ...args] = command.trim().split(/\s+/).filter(Boolean)
    const fcmd = cmd.toLowerCase()
    const field = args.length > 0 ? args[0].toLowerCase() : ""

    switch (fcmd) {
      case "view":
        return viewPortfolio(field)
      case "edit":
        return editPortfolio(field, args.slice(1).join(" "))
      case "add":
        return startAddItem(field)
      case "remove":
        return removeItem(field, args.slice(1).join(" "))
      case "save":
        return savePortfolio()
      case "clear":
      case "cls":
        return ["cmd:clear"]
      case "help":
        return portfolioHelpCommand()
      case "exit":
        return exitPortfolio()
      case "about":
        return ["cmd:about"]
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
            prompt:
              "Enter skill level (Beginner, Intermediate etc) (optional):",
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
      case "hobby":
        steps = [
          { field: "name", prompt: "Enter hobby name:" },
          {
            field: "description",
            prompt: "Enter hobby description (optional):",
            optional: true,
          },
        ]
        break
      case "education":
        steps = [
          { field: "institution", prompt: "Enter institution name:" },
          { field: "degree", prompt: "Enter degree:" },
          { field: "fieldOfStudy", prompt: "Enter field of study:" },
          { field: "startDate", prompt: "Enter start date (YYYY-MM-DD):" },
          {
            field: "endDate",
            prompt: "Enter end date (YYYY-MM-DD or 'present'):",
            optional: true,
          },
          {
            field: "description",
            prompt: "Enter description (optional):",
            optional: true,
          },
        ]
        break
      default:
        return [`Error: Unknown section: ${section}`]
    }

    setInputMode({
      type: section as
        | "skill"
        | "project"
        | "experience"
        | "social"
        | "hobby"
        | "education",
      steps,
      currentStep: 0,
      data: {},
    })

    return []
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
        return [
          `${steps[currentStep].prompt} ${input}`,
          // steps[currentStep + 1].prompt,
        ]
      } else {
        // All steps completed, validate and add the item
        const validationResult = validateItem(type, data)
        if (validationResult.success) {
          const result = await addItem(type, validationResult.data)
          setInputMode(null)
          return [
            `${steps[steps.length - 1].prompt} ${input}`,
            ...result,
            "Enter command 'save' to save changes",
          ]
        } else {
          setInputMode(null)
          return [
            `${steps[steps.length - 1].prompt} ${input}`,
            `Error: Invalid inputs. ${formatZodError(validationResult.error)}`,
          ]
        }
      }
    } else {
      return ["Error: This field is required. Please enter a value."]
    }
  }

  const formatZodError = (error: any): string => {
    return error.issues
      .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ")
  }

  const validateItem = (
    type: "skill" | "project" | "experience" | "social" | "hobby" | "education",
    data: Record<string, string>,
  ):
    | {
        success: true
        data: Skill | Project | Experience | SocialLink | Hobby | Education
      }
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
      case "hobby":
        return HobbySchema.safeParse(data) as
          | { success: true; data: Hobby }
          | { success: false; error: Error }
      case "education":
        return EducationSchema.safeParse({
          ...data,
          startDate: new Date(data.startDate),
          endDate:
            data.endDate === "present" ? undefined : new Date(data.endDate),
        }) as
          | { success: true; data: Education }
          | { success: false; error: Error }
      default:
        return { success: false, error: new Error("Unknown item type") }
    }
  }

  const addItem = async (
    section:
      | "skill"
      | "project"
      | "experience"
      | "social"
      | "hobby"
      | "education",
    data: Skill | Project | Experience | SocialLink | Hobby | Education,
  ): Promise<string[]> => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (section) {
      case "skill":
        setPortfolio({
          ...portfolio,
          skills: [...portfolio.skills, data as Skill],
        })
        return [`Skill "${(data as Skill).name}" added successfully`]
      case "project":
        setPortfolio({
          ...portfolio,
          projects: [...portfolio.projects, data as Project],
        })
        return [`Project "${(data as Project).title}" added successfully`]
      case "experience":
        setPortfolio({
          ...portfolio,
          experiences: [...portfolio.experiences, data as Experience],
        })
        return [
          `Experience "${(data as Experience).role} at ${(data as Experience).company}" added successfully`,
        ]
      case "social":
        setPortfolio({
          ...portfolio,
          socialLinks: [...portfolio.socialLinks, data as SocialLink],
        })
        return [
          `Social link for ${(data as SocialLink).platform} added successfully`,
        ]
      case "hobby":
        setPortfolio({
          ...portfolio,
          hobbies: [...portfolio.hobbies, data as Hobby],
        })
        return [`Hobby "${(data as Hobby).name}" added successfully`]
      case "education":
        setPortfolio({
          ...portfolio,
          education: [...portfolio.education, data as Education],
        })
        return [
          `Education at "${(data as Education).institution}" added successfully`,
        ]
    }
  }

  const exitPortfolio = (): string[] => {
    setCurrentDirectory(`/${currentUser}`)
    return ["You have exited the portfolio environment"]
  }

  const viewPortfolio = (section?: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]
    const baseURL = window.location.origin

    if (!section) {
      const profileData = {
        name: portfolio.name,
        title: portfolio.title,
        bio: portfolio.bio,
        email: portfolio.email || "Not set",
        avatar: portfolio.avatar || "/placeholder-avatar.svg",
        portfolioUrl: `${baseURL}/${currentUser}`,
      }

      return [
        `profile://${JSON.stringify(profileData)}`,
        "Use 'view <section>' to see details. Example: 'view projects'",
      ]
    }

    switch (section) {
      case "skills":
        if (!portfolio.skills.length) {
          return ["Skills section is empty"]
        }
        return [
          "Skills:",
          ...portfolio.skills.flatMap((skill) => [
            `- ${skill.name}:       ${skill.level ? `${skill.level}` : ""}`,
          ]),
        ]

      case "projects":
        if (!portfolio.projects.length) {
          return ["Projects section is empty"]
        }
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
        if (!portfolio.experiences.length) {
          return ["Experiences section is empty"]
        }
        return [
          "Experiences:",
          ...portfolio.experiences.flatMap((exp) => [
            `${exp.role} at ${exp.company}:`,
            `- Role:             ${exp.role}`,
            `- Company:          ${exp.company}`,
            `- Description:      ${exp.description} `,
            `- Start Date:       ${exp.startDate}`,
            `- End Date:         ${exp.endDate || "Present"}`,
            `                     `,
          ]),
        ]

      case "social":
        if (!portfolio.socialLinks.length) {
          return ["Social Links section is empty"]
        }
        return [
          "Social Links:",
          ...portfolio.socialLinks.flatMap((link) => [
            `- ${link.platform}:      ${"fileurl://" + link.url}`,
          ]),
        ]

      case "hobbies":
        if (!portfolio.hobbies.length) {
          return ["Hobbies section is empty"]
        }
        return [
          "Hobbies:",
          ...portfolio.hobbies.flatMap((hobby) => [
            `- ${hobby.name}:       ${hobby.description || ""}`,
          ]),
        ]

      case "education":
        if (!portfolio.education.length) {
          return ["Education section is empty"]
        }
        return [
          "Education:",
          ...portfolio.education.flatMap((edu) => [
            `${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}:`,
            `- Institution:      ${edu.institution}`,
            `- Degree:           ${edu.degree}`,
            `- Field of Study:   ${edu.fieldOfStudy}`,
            `- Start Date:       ${edu.startDate}`,
            `- End Date:         ${edu.endDate || "Present"}`,
            `- Description:      ${edu.description || "Not provided"}`,
            `                     `,
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
        return [
          `Updated ${field} to: ${value}`,
          "Enter command 'save' to save changes",
        ]
      default:
        return [`Error: Field '${field}' not found`]
    }
  }

  const removeItem = (section: string, itemIdentifier: string): string[] => {
    if (!portfolio) return ["Error: Portfolio not loaded"]

    switch (section) {
      case "skill":
        const skillExists = portfolio.skills.some(
          (skill) => skill.name === itemIdentifier,
        )

        if (!skillExists) {
          return [`Error: Identifier not found in skills: ${itemIdentifier}`]
        }

        setPortfolio({
          ...portfolio,
          skills: portfolio.skills.filter(
            (skill) => skill.name !== itemIdentifier,
          ),
        })
        return [
          `Removed skill: ${itemIdentifier}`,
          "Enter command 'save' to save changes",
        ]

      case "project":
        const projectExists = portfolio.projects.some(
          (project) => project.title === itemIdentifier,
        )

        if (!projectExists) {
          return [`Error: Identifier not found in projects: ${itemIdentifier}`]
        }

        setPortfolio({
          ...portfolio,
          projects: portfolio.projects.filter(
            (project) => project.title !== itemIdentifier,
          ),
        })
        return [
          `Removed project: ${itemIdentifier}`,
          "Enter command 'save' to save changes",
        ]

      case "experience":
        const experienceExists = portfolio.experiences.some(
          (exp) => exp.role === itemIdentifier,
        )

        if (!experienceExists) {
          return [
            `Error: Identifier not found in experiences: ${itemIdentifier}`,
          ]
        }

        setPortfolio({
          ...portfolio,
          experiences: portfolio.experiences.filter(
            (exp) => exp.role !== itemIdentifier,
          ),
        })
        return [
          `Removed experience: ${itemIdentifier}`,
          "Enter command 'save' to save changes",
        ]

      case "social":
        const socialExists = portfolio.socialLinks.some(
          (link) => link.platform === itemIdentifier,
        )

        if (!socialExists) {
          return [
            `Error: Identifier not found in social links: ${itemIdentifier}`,
          ]
        }

        setPortfolio({
          ...portfolio,
          socialLinks: portfolio.socialLinks.filter(
            (link) => link.platform !== itemIdentifier,
          ),
        })
        return [
          `Removed social link: ${itemIdentifier}`,
          "Enter command 'save' to save changes",
        ]

      case "hobby":
        const hobbyExists = portfolio.hobbies.some(
          (hobby) => hobby.name === itemIdentifier,
        )

        if (!hobbyExists) {
          return [`Error: Identifier not found in hobbies: ${itemIdentifier}`]
        }

        setPortfolio({
          ...portfolio,
          hobbies: portfolio.hobbies.filter(
            (hobby) => hobby.name !== itemIdentifier,
          ),
        })
        return [
          `Removed hobby: ${itemIdentifier}`,
          "Enter command 'save' to save changes",
        ]

      case "education":
        const educationExists = portfolio.education.some(
          (edu) => edu.institution === itemIdentifier,
        )

        if (!educationExists) {
          return [`Error: Identifier not found in education: ${itemIdentifier}`]
        }

        setPortfolio({
          ...portfolio,
          education: portfolio.education.filter(
            (edu) => edu.institution !== itemIdentifier,
          ),
        })
        return [
          `Removed education: ${itemIdentifier}`,
          "Enter command 'save' to save changes",
        ]

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
      education: portfolio.education.map((edu) => ({
        ...edu,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      })),
    }
  }

  const savePortfolio = async (): Promise<string[]> => {
    if (!portfolio) return ["Error: No changes to save"]
    try {
      setLoading("Saving portfolio")
      const preparedPortfolio = preparePortfolioForSave(portfolio)
      const { message } = await updatePortfolioAction(preparedPortfolio)
      setLoading(null)
      return [message]
    } catch (error) {
      return [`Error saving portfolio: ${error}`]
    }
  }

  const portfolioHelpCommand = (): string[] => {
    const commands: [string, string][] = [
      ["view [section]", "View portfolio or specific section"],
      ["edit <field> <value>", "Edit basic portfolio fields"],
      ["add <section> <data>", "Add item to a section"],
      ["remove <section> <identifier>", "Remove item from a section"],
      ["save", "Save changes to the portfolio"],
      ["exit", "Exit the portfolio environment"],
      ["clear/cls", "Clear the terminal screen"],
      ["about", "For more details about portfolio"],
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
