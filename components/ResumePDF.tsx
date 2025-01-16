// components/ResumePDF.tsx
import React from "react"
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Portfolio } from "@/types/schema"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column" as const,
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
})

export interface ResumePDFProps {
  portfolio: Portfolio
}

const ResumePDF: React.FC<ResumePDFProps> = ({ portfolio }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.section}>
      <Text style={styles.title}>{portfolio.name}</Text>
      <Text style={styles.subtitle}>{portfolio.title}</Text>
      <Text style={styles.text}>{portfolio.bio}</Text>
    </View>
    <View style={styles.section}>
      <Text style={styles.subtitle}>Skills</Text>
      {portfolio.skills.map((skill, index) => (
        <Text key={index} style={styles.text}>
          {skill.name} {skill.level && `(${skill.level})`}
        </Text>
      ))}
    </View>
    <View style={styles.section}>
      <Text style={styles.subtitle}>Experience</Text>
      {portfolio.experiences.map((exp, index) => (
        <View key={index}>
          <Text style={styles.text}>
            {exp.role} at {exp.company}
          </Text>
          <Text style={styles.text}>
            {new Date(exp.startDate).toLocaleDateString()} -
            {exp.endDate
              ? new Date(exp.endDate).toLocaleDateString()
              : "Present"}
          </Text>
          <Text style={styles.text}>{exp.description}</Text>
        </View>
      ))}
    </View>
    <View style={styles.section}>
      <Text style={styles.subtitle}>Projects</Text>
      {portfolio.projects.map((project, index) => (
        <View key={index}>
          <Text style={styles.text}>{project.title}</Text>
          <Text style={styles.text}>{project.description}</Text>
        </View>
      ))}
    </View>
  </Page>
)

export default ResumePDF
