import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dateFormatter = (date: Date) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return formattedDate
}

export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)

    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i

    return imageExtensions.test(parsedUrl.pathname)
  } catch {
    return false
  }
}
