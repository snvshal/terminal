# SN Terminal — OS Terminal Simulation with Portfolio Management

A web-based operating-system-style terminal that combines a simulated Unix-like file system with a full portfolio management environment, all controlled from the command line. Create an account, organize files, build a professional portfolio, and share it on a public page with a downloadable PDF resume.

> Live demo: [sn-terminal.vercel.app](https://sn-terminal.vercel.app)

## Features

- Realistic terminal simulation with Unix-like commands (`ls`, `cd`, `mkdir`, `touch`, `open`, `mv`, `rename`, and more).
- Windowed desktop with draggable, resizable, maximizable Terminal and Notepad windows and click-to-focus z-index ordering.
- User authentication with secure session cookies (`signup`, `signin`, `signout`, `userdel`).
- Simulated file system backed by MongoDB, including files, directories, and URL shortcuts.
- Interactive portfolio builder driven entirely by terminal prompts.
- Public portfolio pages with SEO metadata, Open Graph images, and a sitemap.
- PDF resume generation from portfolio data.
- Animated desktop background and responsive layout.

## Tech Stack

- React 19 · Next.js 16 (App Router) · TypeScript
- Tailwind CSS · MongoDB + Mongoose · Zod
- Jose (JWT sessions) · @react-pdf/renderer (resumes) · lucide-react

## Getting Started

### Prerequisites

- **Node.js 20+**
- A **MongoDB** instance (local or Atlas)

### Environment Variables

Create a `.env.local` file in the project root:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/terminal
JWT_SECRET=your-secret-key-at-least-32-chars
METADATA_BASE_URL=http://localhost:3000
```

| Variable            | Required | Description                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `MONGODB_URI`       | Yes      | MongoDB connection string.                                                  |
| `JWT_SECRET`        | Yes      | Secret used to sign/verify session tokens.                                  |
| `METADATA_BASE_URL` | No       | Base URL used for `search`, Open Graph images, `robots.txt`, and `sitemap`. |

### Installation

```bash
git clone https://github.com/snvshal/terminal.git
cd terminal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the Terminal window opens automatically on the desktop.

## Scripts

| Script                 | Command              | Description                                |
| ---------------------- | -------------------- | ------------------------------------------ |
| `npm run dev`          | `next dev`           | Start the development server.              |
| `npm run build`        | `next build`         | Create a production build.                 |
| `npm run start`        | `next start`         | Start the production server.               |
| `npm run lint`         | `eslint .`           | Lint the entire project.                   |
| `npm run format`       | `prettier --write .` | Format the entire project with Prettier.   |
| `npm run format:check` | `prettier --check .` | Verify formatting without modifying files. |

## Usage

### Desktop & Windows

- The **Terminal** opens automatically on load; run `open <file>` to launch the **Notepad**.
- Windows can be **dragged** by their title bar, **resized** from any edge/corner, and **maximized** (yellow button or drag to the top of the screen).
- Clicking any window brings it to the front. On screens narrower than `768px`, windows expand to full screen.

### File System Commands

Every user gets a home directory at `/<username>`. Run `help` in the terminal to see the full list.

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `ls`                      | List directory contents.                       |
| `pwd`                     | Print the current working directory.           |
| `cd [directory]`          | Change the current directory.                  |
| `mkdir [directory]`       | Create a new directory.                        |
| `touch [file]`            | Create a new empty file.                       |
| `open [file]`             | Open a file in Notepad or show a URL shortcut. |
| `seturl [file] [url]`     | Create or update a URL shortcut.               |
| `rm [file]`               | Remove a file or URL shortcut.                 |
| `rmdir [directory]`       | Remove an empty directory.                     |
| `mv [item] [destination]` | Move a file, directory, or URL.                |
| `rename [old] [new]`      | Rename a file, directory, or URL.              |
| `clear` / `cls`           | Clear the terminal screen.                     |
| `help`                    | Show all available commands.                   |
| `about`                   | Detailed explanation of the terminal.          |

### Account Commands

| Command                         | Description                               |
| ------------------------------- | ----------------------------------------- |
| `signup [username] [password]`  | Create a new account.                     |
| `signin [username] [password]`  | Sign in to an existing account.           |
| `signout`                       | Sign out of the current account.          |
| `userdel [username] [password]` | Permanently delete your account.          |
| `search [username]`             | Preview any user's public portfolio card. |

> Usernames must be 2–20 characters (letters and numbers only). Passwords must be at least 8 characters.

### Portfolio Environment

Enter the portfolio builder with `portfolio`, then run `help` for the command list.

| Command                         | Description                                                     |
| ------------------------------- | --------------------------------------------------------------- |
| `view`                          | View your full portfolio.                                       |
| `view <section>`                | View a specific section.                                        |
| `edit <field> <value>`          | Edit a basic field (`name`, `title`, `bio`, `email`, `avatar`). |
| `add <section>`                 | Start an interactive wizard to add an item.                     |
| `remove <section> <identifier>` | Remove an item by identifier (e.g. `remove skill React`).       |
| `save`                          | Persist changes to the database.                                |
| `exit`                          | Leave portfolio mode.                                           |
| `clear` / `cls`                 | Clear the terminal screen.                                      |
| `help`                          | Show portfolio-mode commands.                                   |

**Portfolio sections:** `skill`, `project`, `experience`, `social`, `hobby`, `education`

Example:

```text
>_ add project
>_ Enter project title: My Portfolio
>_ Enter project description: A terminal-based portfolio.
>_ Enter technologies (comma-separated): React, Next.js, TypeScript
>_ Enter project link (optional): https://example.com
>_ Enter project image link (optional):
>_ save
```

## Public Portfolio Page

Each user gets a public page at `/{username}` with SEO metadata and sections for projects, skills, experience, education, hobbies, and social links. A **Download Resume** button streams a PDF built from the portfolio data via `GET /api/generate-pdf?username=<username>`.

## Deployment

Ready for [Vercel](https://vercel.com) (or any Node.js host):

1. Push the repository to GitHub and import it in Vercel.
2. Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `METADATA_BASE_URL`).
3. Deploy.

## Contributing

Contributions are welcome — open an issue for bugs/features or submit a PR against `main`. Run `npm run lint` and `npm run format:check` before submitting.

## License

MIT
