import Image from "next/image"
import Link from "next/link"
import { Mail, Globe } from "lucide-react"
import { cn, isValidImageUrl } from "@/lib/utils"

export type ProfileCardProps = {
  name: string
  title: string
  bio: string
  email: string
  avatar: string
  portfolioUrl: string
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  title,
  bio,
  email,
  avatar,
  portfolioUrl,
}) => {
  return (
    <div className="my-2 w-full max-w-2xl border border-zinc-700 p-4 font-mono text-sm text-zinc-100 shadow-lg">
      <div className="flex flex-col md:flex-row md:gap-8">
        <div className="mb-4 md:mb-0">
          <div className="w-48 border border-zinc-700 bg-zinc-800">
            <div className="relative aspect-square">
              <Image
                src={
                  avatar && isValidImageUrl(avatar as string)
                    ? avatar
                    : "/placeholder-avatar.svg"
                }
                alt={`${name}'s avatar`}
                sizes="160px"
                fill
                className="object-cover"
              />
            </div>
            <div className="border-t border-zinc-700 p-2">
              <div className="truncate font-bold">{name}</div>
              <div className="truncate text-xs text-zinc-400">{title}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between space-y-4 text-wrap">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <p>{bio}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <span className={cn(email === "Not set" && "italic")}>
                {email !== "Not set" ? email : "Email not set"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-yellow-400" />
              <Link
                href={portfolioUrl}
                className="text-blue-400 hover:text-blue-300 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {portfolioUrl}
              </Link>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Type &apos;help&apos; for available commands
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
