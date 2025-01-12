import { getUserByUsername } from "@/app/actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PortfolioSchema } from "@/lib/zod"
import AboutPage from "./_about"

export default async function UserPortfolio({
  params,
}: {
  params: { username: string }
}) {
  const { username } = await params

  if (username === "about") return <AboutPage />

  const user = await getUserByUsername(username)

  if (!user) {
    notFound()
  }

  const portfolioResult = PortfolioSchema.safeParse(user.portfolio)

  if (!portfolioResult.success) {
    return <div>Error: Invalid portfolio data</div>
  }

  const portfolio = portfolioResult.data

  return (
    <div className="w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto min-h-screen max-w-4xl selection:bg-purple-500/30">
        <div className="fixed inset-0 z-0">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 px-16 py-12">
          {/* Hero Section */}
          <header className="-mt-20 flex min-h-screen items-center">
            <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="tracking-wider text-zinc-500">Hi, my name is</p>
                  <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
                    {portfolio.name}
                  </h1>
                  <p className="text-2xl text-zinc-400 sm:text-3xl lg:text-4xl">
                    {portfolio.title}
                  </p>
                </div>
                <p className="max-w-xl text-lg leading-relaxed text-zinc-400">
                  {portfolio.bio}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  {portfolio.email && (
                    <a
                      href={`mailto:${portfolio.email}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-3 transition-colors hover:border-purple-500/50"
                    >
                      Get in touch
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
              </div>
              {portfolio.avatar && (
                <div className="relative mx-auto aspect-square max-w-md">
                  <div className="absolute inset-0 -rotate-6 rounded-3xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10" />
                  <Image
                    src={portfolio.avatar}
                    alt={portfolio.name}
                    width={400}
                    height={400}
                    className="relative z-10 rounded-2xl object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          </header>

          {/* Projects Section */}
          <section className="py-20" id="projects">
            <h2 className="mb-12 flex items-center text-2xl font-semibold">
              <span className="mr-2 text-purple-500">#</span> Featured Projects
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.projects.map((project, index) => (
                <div
                  key={index}
                  className="group rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-6 transition-colors hover:border-purple-500/50"
                >
                  {project.image && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="mb-2 text-xl font-medium">{project.title}</h3>
                  <p className="mb-4 text-sm text-zinc-400">
                    {project.description}
                  </p>
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

          {/* Skills Section */}
          <section className="py-20" id="skills">
            <h2 className="mb-12 flex items-center text-2xl font-semibold">
              <span className="mr-2 text-purple-500">#</span> Skills
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

          {/* Experience Section */}
          <section className="py-20" id="experience">
            <h2 className="mb-12 flex items-center text-2xl font-semibold">
              <span className="mr-2 text-purple-500">#</span> Experience
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
                      {new Date(exp.startDate).toLocaleDateString()} -
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString()
                        : "Present"}
                    </p>
                    <p className="leading-relaxed text-zinc-400">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <footer className="py-20" id="contact">
            <h2 className="mb-12 flex items-center text-2xl font-semibold">
              <span className="mr-2 text-purple-500">#</span> Contact
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
        </div>
      </div>
    </div>
  )
}
