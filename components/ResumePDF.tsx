import React from "react"
import { Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer"
import type { Portfolio } from "@/types/schema"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column" as const,
    backgroundColor: "#FFFFFF",
    padding: "40 50",
  },
  sidebar: {
    width: "30%",
    backgroundColor: "#f8f9fa",
    position: "absolute" as const,
    top: 0,
    left: 0,
    bottom: 0,
    padding: "40 20 40 30",
  },
  mainContent: {
    width: "70%",
    marginLeft: "30%",
    padding: "0 0 0 30",
  },
  headerContainer: {
    marginBottom: 25,
  },
  nameTitle: {
    fontSize: 32,
    color: "#1a1a1a",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: "#2563eb",
    marginBottom: 12,
    letterSpacing: 0.5,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 0.5,
    paddingBottom: 4,
    borderBottom: "1pt solid #e5e7eb",
  },
  sidebarSectionTitle: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  section: {
    marginBottom: 25,
  },
  bio: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
    marginBottom: 15,
  },
  contactInfo: {
    marginBottom: 4,
    fontSize: 9,
    color: "#4b5563",
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  experienceBlock: {
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  companyRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "bold",
  },
  dateRange: {
    fontSize: 10,
    color: "#6b7280",
  },
  description: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },
  skillsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 8,
  },
  skillBadge: {
    fontSize: 9,
    color: "#4b5563",
    backgroundColor: "#ffffff",
    padding: "3 8",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  projectBlock: {
    marginBottom: 15,
  },
  projectHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  projectLink: {
    fontSize: 9,
    color: "#2563eb",
  },
  techBadge: {
    fontSize: 8,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "2 6",
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  educationBlock: {
    marginBottom: 12,
  },
  degreeTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  institution: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 2,
  },
  hobbiesContainer: {
    marginTop: 6,
  },
  hobbyItem: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  divider: {
    borderBottom: "1pt solid #e5e7eb",
    marginVertical: 15,
  },
})

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

export interface ResumePDFProps {
  portfolio: Portfolio
}

// Group skills by level if it exists
const groupSkills = (skills: Array<{ name: string; level?: string }>) => {
  const grouped = skills.reduce(
    (acc, skill) => {
      const level = skill.level || "Other"
      if (!acc[level]) acc[level] = []
      acc[level].push(skill)
      return acc
    },
    {} as Record<string, typeof skills>,
  )

  return Object.entries(grouped)
}

const ResumePDF: React.FC<ResumePDFProps> = ({ portfolio }) => (
  <Page size="A4" style={styles.page}>
    {/* Sidebar */}
    <View style={styles.sidebar}>
      <View style={styles.section}>
        <Text style={styles.sidebarSectionTitle}>Contact</Text>
        {portfolio.email && (
          <Text style={styles.contactInfo}>{portfolio.email}</Text>
        )}
        {portfolio.socialLinks.map((link, index) => (
          <Link key={index} src={link.url} style={styles.contactInfo}>
            {link.platform}
          </Link>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sidebarSectionTitle}>Skills</Text>
        {groupSkills(portfolio.skills).map(([level, skills]) => (
          <View key={level} style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>{level}</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={styles.skillBadge}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sidebarSectionTitle}>Education</Text>
        {portfolio.education.map((edu, index) => (
          <View key={index} style={styles.educationBlock}>
            <Text style={styles.degreeTitle}>
              {edu.degree} in {edu.fieldOfStudy}
            </Text>
            <Text style={styles.institution}>{edu.institution}</Text>
            <Text style={styles.dateRange}>
              {formatDate(edu.startDate)} -{" "}
              {edu.endDate ? formatDate(edu.endDate) : "Present"}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sidebarSectionTitle}>Interests</Text>
        <View style={styles.hobbiesContainer}>
          {portfolio.hobbies.map((hobby, index) => (
            <Text key={index} style={styles.hobbyItem}>
              • {hobby.name}
              {hobby.description && `: ${hobby.description}`}
            </Text>
          ))}
        </View>
      </View>
    </View>

    {/* Main Content */}
    <View style={styles.mainContent}>
      <View style={styles.headerContainer}>
        <Text style={styles.nameTitle}>{portfolio.name}</Text>
        <Text style={styles.jobTitle}>{portfolio.title}</Text>
        <Text style={styles.bio}>{portfolio.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {portfolio.experiences.map((exp, index) => (
          <View key={index} style={styles.experienceBlock}>
            <Text style={styles.roleTitle}>{exp.role}</Text>
            <View style={styles.companyRow}>
              <Text style={styles.companyName}>{exp.company}</Text>
              <Text style={styles.dateRange}>
                {formatDate(exp.startDate)} -{" "}
                {exp.endDate ? formatDate(exp.endDate) : "Present"}
              </Text>
            </View>
            <Text style={styles.description}>{exp.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notable Projects</Text>
        {portfolio.projects.map((project, index) => (
          <View key={index} style={styles.projectBlock}>
            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              {project.link && (
                <Link src={project.link} style={styles.projectLink}>
                  View Project
                </Link>
              )}
            </View>
            <Text style={styles.description}>{project.description}</Text>
            <View style={styles.skillsContainer}>
              {project.technologies.map((tech, index) => (
                <Text key={index} style={styles.techBadge}>
                  {tech}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  </Page>
)

export default ResumePDF
