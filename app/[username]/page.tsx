import { getUserByUsername } from "@/app/actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import AboutPage from "./_components/About"
import DownloadResumeButton from "./_components/DownloadResumeButton"
import { Portfolio } from "@/types/schema"
import { dateFormatter, isValidImageUrl } from "@/lib/utils"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const username = (await params).username
  if (username === "about") return { title: "About" }

  const user = await getUserByUsername(username)

  if (!user) return { title: "Portfolio not found" }

  const { name, bio } = user.portfolio

  return {
    title: name,
    description: bio,
  }
}

export default async function UserPortfolio({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  if (username === "about") return <AboutPage />

  const user = await getUserByUsername(username)
  if (!user) notFound()
  const portfolio: Portfolio = user.portfolio

  return (
    <div className="w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto min-h-screen max-w-5xl selection:bg-purple-500/30">
        <div className="fixed inset-0 z-0">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 px-6 sm:px-16">
          {/* Hero Section */}
          <header className="flex min-h-screen items-center">
            <div className="flex w-full flex-col-reverse items-center gap-12 lg:flex-row lg:gap-16">
              {/* Left Section */}
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <p className="tracking-wider text-zinc-500">Hi, my name is</p>
                  <h1 className="text-4xl font-bold lg:text-5xl">
                    {portfolio.name}
                  </h1>
                  <p className="text-2xl text-zinc-400 lg:text-3xl">
                    {portfolio.title}
                  </p>
                </div>
                <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
                  {portfolio.bio}
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4 lg:justify-start">
                  <DownloadResumeButton username={username} />
                </div>
              </div>

              {/* Right Section (Image) */}
              <div className="relative mx-auto aspect-square max-w-xs sm:max-w-sm lg:max-w-md">
                <div className="absolute inset-0 -rotate-6 rounded-3xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10" />
                <Image
                  src={
                    portfolio.avatar &&
                    isValidImageUrl(portfolio.avatar as string)
                      ? portfolio.avatar
                      : "/placeholder-avatar.svg"
                  }
                  alt={`${portfolio.name}'s avatar`}
                  width={400}
                  height={400}
                  className="relative z-10 size-52 rounded-2xl object-cover sm:size-64 lg:size-80"
                  priority={true}
                />
              </div>
            </div>
          </header>

          {/* Projects Section */}
          {portfolio.projects && portfolio.projects.length > 0 && (
            <section className="py-20" id="projects">
              <h2 className="mb-12 flex items-center text-2xl font-semibold">
                <a href="#projects">
                  <span className="mr-2 text-purple-500">#</span> Projects
                </a>
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {portfolio.projects.map((project, index) => (
                  <div
                    key={index}
                    className="group rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6 transition-colors hover:border-purple-500/50"
                  >
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={
                          project.image &&
                          isValidImageUrl(project.image as string)
                            ? project.image
                            : "/placeholder-project.png"
                        }
                        alt={project.title}
                        className="object-cover transition-transform group-hover:scale-105"
                        priority={true}
                        fill={true}
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-medium">
                      {project.title}
                    </h3>
                    <p className="mb-4 text-sm text-zinc-400">
                      {project.description}
                    </p>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-purple-400 transition-colors hover:text-purple-300"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {portfolio.skills && portfolio.skills.length > 0 && (
            <section className="py-20" id="skills">
              <h2 className="mb-12 flex items-center text-2xl font-semibold">
                <a href="#skills">
                  <span className="mr-2 text-purple-500">#</span> Skills
                </a>
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {portfolio.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4 transition-colors hover:border-purple-500/50"
                  >
                    <div className="font-medium">{skill.name}</div>
                    {skill.level && (
                      <div className="text-sm text-zinc-500">{skill.level}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience Section */}
          {portfolio.experiences && portfolio.experiences.length > 0 && (
            <section className="py-20" id="experience">
              <h2 className="mb-12 flex items-center text-2xl font-semibold">
                <a href="#experience">
                  <span className="mr-2 text-purple-500">#</span> Experience
                </a>
              </h2>
              <div className="space-y-12">
                {portfolio.experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-purple-500"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">{exp.role}</h3>
                      <p className="text-purple-400">{exp.company}</p>
                      <p className="text-sm text-zinc-500">
                        {dateFormatter(exp.startDate)} -{" "}
                        {exp.endDate ? dateFormatter(exp.endDate) : "Present"}
                      </p>
                      <p className="leading-relaxed text-zinc-400">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {portfolio.education && portfolio.education.length > 0 && (
            <section className="py-20" id="education">
              <h2 className="mb-12 flex items-center text-2xl font-semibold">
                <a href="#education">
                  <span className="mr-2 text-purple-500">#</span> Education
                </a>
              </h2>
              <div className="space-y-12">
                {portfolio.education.map((edu, index) => (
                  <div
                    key={index}
                    className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-purple-500"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h3>
                      <p className="text-purple-400">{edu.institution}</p>
                      <p className="text-sm text-zinc-500">
                        {dateFormatter(edu.startDate)} -{" "}
                        {edu.endDate ? dateFormatter(edu.endDate) : "Present"}
                      </p>
                      {edu.description && (
                        <p className="leading-relaxed text-zinc-400">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hobbies Section */}
          {portfolio.hobbies && portfolio.hobbies.length > 0 && (
            <section className="py-20" id="hobbies">
              <h2 className="mb-12 flex items-center text-2xl font-semibold">
                <a href="#hobbies">
                  <span className="mr-2 text-purple-500">#</span> Hobbies
                </a>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.hobbies.map((hobby, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6 transition-colors hover:border-purple-500/50"
                  >
                    <h3 className="mb-2 text-xl font-medium">{hobby.name}</h3>
                    {hobby.description && (
                      <p className="text-sm text-zinc-400">
                        {hobby.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Connect Section */}
          {portfolio.socialLinks && portfolio.socialLinks.length > 0 && (
            <footer className="py-20" id="connect">
              <h2 className="mb-12 flex items-center text-2xl font-semibold">
                <a href="#connect">
                  <span className="mr-2 text-purple-500">#</span> Connect
                </a>
              </h2>
              <div className="flex flex-wrap gap-4">
                {portfolio.email && (
                  <a
                    href={`mailto:${portfolio.email}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-3 transition-colors hover:border-purple-500/50"
                  >
                    {portfolio.email}
                  </a>
                )}

                {portfolio.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-3 transition-colors hover:border-purple-500/50"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  )
}
