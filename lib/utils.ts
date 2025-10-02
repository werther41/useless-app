import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  // Use dynamic import to avoid build issues
  const { twMerge } = require("tailwind-merge")
  return twMerge(clsx(inputs))
}
