import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div className="container relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center underline-offset-2 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Terminal
        </Link>

        <h1 className="mb-8 text-4xl font-bold">
          About OS Terminal Simulation
        </h1>

        <section className="mb-12 space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p className="leading-relaxed text-zinc-300">
            Welcome to the OS Terminal Simulation! This web-based application
            provides a terminal interface for managing your portfolio and
            interacting with a simulated file system. It&#39;s designed to give
            you a hands-on experience with command-line interfaces while
            allowing you to create and manage your portfolio.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Key Features</h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-300">
            <li>
              Realistic terminal simulation with common Unix-like commands
            </li>
            <li>User authentication system (signup, signin, signout)</li>
            <li>Portfolio creation and management through terminal commands</li>
            <li>Simulated file system for organizing your work and projects</li>
            {/* <li>Multiple portfolio templates to choose from</li> */}
            <li>PDF resume generation based on your portfolio data</li>
            <li>Animated desktop background for a more immersive experience</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            How to Use This Web Terminal
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-zinc-300">
            <li>
              Open the terminal by double-clicking on the desktop (if it&#39;s
              closed).
            </li>
            <li>
              Type commands in the input area at the bottom of the terminal
              window.
            </li>
            <li>Press Enter to execute a command.</li>
            <li>
              View the output in the terminal window above the input area.
            </li>
            <li>
              Use the up and down arrow keys to navigate through your command
              history.
            </li>
            <li>
              Type &#39;help&#39; and press Enter to see a list of available
              commands.
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Terminal Capabilities</h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-300">
            <li>Simulate a file system with directories and files</li>
            <li>Create, edit, move, and delete files and directories</li>
            <li>Manage user accounts (signup, signin, signout)</li>
            <li>Create and manage a comprehensive portfolio</li>
            <li>Set and manage URLs for files</li>
            <li>Navigate through directories</li>
            <li>View and edit file contents</li>
            <li>Generate a downloadable PDF resume</li>
            {/* <li>Switch between different portfolio templates</li> */}
            <li>Clear the terminal screen</li>
            <li>Provide help and command listings</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Common Commands</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-700">
              <thead>
                <tr className="bg-zinc-800">
                  <th className="border border-zinc-700 p-2 text-left">
                    Command
                  </th>
                  <th className="border border-zinc-700 p-2 text-left">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>ls</code>
                  </td>
                  <td className="border border-zinc-700 p-2">
                    List directory contents
                  </td>
                </tr>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>cd [directory]</code>
                  </td>
                  <td className="border border-zinc-700 p-2">
                    Change directory
                  </td>
                </tr>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>mkdir [name]</code>
                  </td>
                  <td className="border border-zinc-700 p-2">
                    Create a new directory
                  </td>
                </tr>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>touch [name]</code>
                  </td>
                  <td className="border border-zinc-700 p-2">
                    Create a new file
                  </td>
                </tr>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>rm [name]</code>
                  </td>
                  <td className="border border-zinc-700 p-2">Remove a file</td>
                </tr>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>portfolio</code>
                  </td>
                  <td className="border border-zinc-700 p-2">
                    Enter portfolio management mode
                  </td>
                </tr>
                <tr>
                  <td className="border border-zinc-700 p-2">
                    <code>help</code>
                  </td>
                  <td className="border border-zinc-700 p-2">
                    Display help information
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="portfolio" className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            Creating Your Portfolio
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-zinc-300">
            <li>
              Sign up for an account:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">
                signup username password
              </code>
            </li>
            <li>
              Sign in to your account:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">
                signin username password
              </code>
            </li>
            <li>
              Enter portfolio mode:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">portfolio</code>
            </li>
            <li>
              View your current portfolio:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">view</code>
            </li>
            <li>
              Edit basic information:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">
                edit name &lt;Your Name&gt;
              </code>
            </li>
            <li>
              Add a skill:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">add skill</code>
            </li>
            <li>
              Add a project:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">add project</code>
            </li>
            <li>
              Add an experience:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">
                add experience
              </code>
            </li>
            <li>
              Add education:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">
                add education
              </code>
            </li>
            <li>
              Add a hobby:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">add hobby</code>
            </li>
            <li>
              Save your changes:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">save</code>
            </li>
            <li>
              Exit portfolio mode:{" "}
              <code className="rounded bg-zinc-800 px-2 py-1">exit</code>
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            Portfolio Items and Commands
          </h2>
          <p className="mb-4 text-zinc-300">
            Your portfolio consists of several sections, each with specific
            commands for viewing, adding, editing, and removing items.
            Here&#39;s a detailed explanation of each portfolio item and its
            related commands:
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-xl font-semibold">Basic Information</h3>
              <p className="mb-2 text-zinc-300">
                This includes your name, title, bio, avatar, and email.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">view</code>
                </li>
                <li>
                  Edit:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    edit &lt;field&gt; &lt;value&gt;
                  </code>{" "}
                  (e.g.,{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    edit name John Doe
                  </code>
                  )
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">Skills</h3>
              <p className="mb-2 text-zinc-300">
                Your professional skills and their proficiency levels.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    view skills
                  </code>
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    add skill
                  </code>
                </li>
                <li>
                  Remove:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    remove skill &lt;skill name&gt;
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">Projects</h3>
              <p className="mb-2 text-zinc-300">
                Your completed or ongoing projects, including title,
                description, technologies used, and optional link and image.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    view projects
                  </code>
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    add project
                  </code>
                </li>
                <li>
                  Remove:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    remove project &lt;project title&gt;
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">Experience</h3>
              <p className="mb-2 text-zinc-300">
                Your work experience, including role, company, start and end
                dates, and description.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    view experience
                  </code>
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    add experience
                  </code>
                </li>
                <li>
                  Remove:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    remove experience &lt;role&gt;
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">Social Links</h3>
              <p className="mb-2 text-zinc-300">
                Your social media profiles or personal websites.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    view socials
                  </code>
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    add social
                  </code>
                </li>
                <li>
                  Remove:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    remove social &lt;platform&gt;
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">Hobbies</h3>
              <p className="mb-2 text-zinc-300">
                Your personal interests and hobbies.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    view hobbies
                  </code>
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    add hobby
                  </code>
                </li>
                <li>
                  Remove:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    remove hobby &lt;hobby name&gt;
                  </code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">Education</h3>
              <p className="mb-2 text-zinc-300">
                Your educational background, including institution, degree,
                field of study, dates, and optional description.
              </p>
              <ul className="list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  View:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    view education
                  </code>
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    add education
                  </code>
                </li>
                <li>
                  Remove:{" "}
                  <code className="rounded bg-zinc-800 px-2 py-1">
                    remove education &lt;institution&gt;
                  </code>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-xl font-semibold">
              General Portfolio Commands
            </h3>
            <ul className="list-inside list-disc space-y-1 text-zinc-300">
              <li>
                <code className="rounded bg-zinc-800 px-2 py-1">portfolio</code>
                : Enter portfolio management mode
              </li>
              <li>
                <code className="rounded bg-zinc-800 px-2 py-1">view</code>:
                View entire portfolio
              </li>
              <li>
                <code className="rounded bg-zinc-800 px-2 py-1">save</code>:
                Save all changes to your portfolio
              </li>
              <li>
                <code className="rounded bg-zinc-800 px-2 py-1">exit</code>:
                Exit portfolio management mode
              </li>
            </ul>
          </div>

          <p className="mt-4 text-zinc-300">
            Use the <code className="rounded bg-zinc-800 px-2 py-1">help</code>{" "}
            command in portfolio mode for a quick reference.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            Tips for Effective Use
          </h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-300">
            <li>
              Always remember to save your changes after editing your portfolio.
            </li>
            <li>
              Use the up arrow key to quickly access and edit previous commands.
            </li>
            <li>
              Use the &#39;help&#39; command for quick reference to available
              commands.
            </li>
            <li>Try different portfolio templates to showcase your skills.</li>
            <li>Update your portfolio regularly with your latest projects.</li>
            <li>
              Generate a PDF resume for a downloadable version of your
              portfolio.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Need Help?</h2>
          <p className="text-zinc-300">
            If you encounter any issues, experience difficulties, or have any
            questions regarding this platform or its functionality, please
            don&#39;t hesitate to reach out. You can contact the developer
            directly via Twitter at{" "}
            <a
              href="https://x.com/snvshal"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @snvshal
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
