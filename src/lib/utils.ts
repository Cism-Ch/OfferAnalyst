import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates that a string is a valid MongoDB ObjectId (24 hex characters).
 */
export function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
