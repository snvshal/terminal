import React from "react"
import Link from "next/link"

const AboutPage: React.FC = () => {
  return (
    <div className="w-full bg-zinc-950 text-zinc-100">
      <div className="container relative z-10 mx-auto max-w-4xl px-16 py-12">
        <h1 className="mb-8 text-4xl font-bold">
          About OS Terminal Simulation
        </h1>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p>
            Welcome to the OS Terminal Simulation! This web-based application
            provides a terminal interface for managing your portfolio and
            interacting with a simulated file system. It's designed to give you
            a hands-on experience with command-line interfaces while allowing
            you to create and manage your professional portfolio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            How to Use This Web Terminal
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              Open the terminal by double-clicking on the desktop or clicking
              the terminal icon.
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
              Type 'help' and press Enter to see a list of available commands.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            Creating Your Portfolio Using the Terminal
          </h2>
          <ol className="list-inside list-decimal space-y-2">
            <li>
              Sign up for an account: <code>signup username password</code>
            </li>
            <li>
              Sign in to your account: <code>signin username password</code>
            </li>
            <li>
              Enter portfolio mode: <code>portfolio</code>
            </li>
            <li>
              View your current portfolio: <code>view</code>
            </li>
            <li>
              Edit basic information: <code>edit name "Your Name"</code>
            </li>
            <li>
              Add a skill: <code>add skill "Skill Name, Skill Level"</code>
            </li>
            <li>
              Add a project:{" "}
              <code>
                add project "Project Name, Description, Technologies, Link,
                Image URL"
              </code>
            </li>
            <li>
              Add an experience:{" "}
              <code>
                add experience "Company, Role, Start Date, End Date,
                Description"
              </code>
            </li>
            <li>
              Save your changes: <code>save</code>
            </li>
            <li>
              Exit portfolio mode: <code>exit</code>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            What Can This Terminal Do?
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Simulate a file system with directories and files</li>
            <li>Create, edit, move, and delete files and directories</li>
            <li>Manage user accounts (signup, signin, signout)</li>
            <li>Create and manage a professional portfolio</li>
            <li>Set and manage URLs for files</li>
            <li>Navigate through directories</li>
            <li>View file contents</li>
            <li>Clear the terminal screen</li>
            <li>Provide help and command listings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Practice Terminal</h2>
          <p className="mb-4">
            To help you get familiar with the terminal commands, we've created a
            practice area. Here, you can try out commands without affecting your
            actual account or portfolio.
          </p>
          <Link
            href="/practice-terminal"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Go to Practice Terminal
          </Link>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Common Commands</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-zinc-950">
                <th className="border border-gray-300 p-2">Command</th>
                <th className="border border-gray-300 p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>ls</code>
                </td>
                <td className="border border-gray-300 p-2">
                  List directory contents
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>cd [directory]</code>
                </td>
                <td className="border border-gray-300 p-2">Change directory</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>mkdir [name]</code>
                </td>
                <td className="border border-gray-300 p-2">
                  Create a new directory
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>touch [name]</code>
                </td>
                <td className="border border-gray-300 p-2">
                  Create a new file
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>rm [name]</code>
                </td>
                <td className="border border-gray-300 p-2">Remove a file</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>portfolio</code>
                </td>
                <td className="border border-gray-300 p-2">
                  Enter portfolio management mode
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <code>help</code>
                </td>
                <td className="border border-gray-300 p-2">
                  Display help information
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            Tips for Effective Use
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              Always remember to save your changes after editing your portfolio.
            </li>
            <li>
              Use the up arrow key to quickly access and edit previous commands.
            </li>
            <li>
              Familiarize yourself with the 'help' command for a quick reference
              of available commands.
            </li>
            <li>
              Practice in the dedicated practice terminal before working on your
              actual portfolio.
            </li>
            <li>
              Regularly backup your portfolio data by exporting it (if this
              feature is available).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Need Help?</h2>
          <p>
            If you encounter any issues, experience difficulties, or have any
            questions regarding this platform or its functionality, please don't
            hesitate to reach out to me directly. Feel free to contact me
            anytime via my profile on{" "}
            <a
              href="https://x.com/snvshal"
              className="text-blue-500 hover:underline"
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
