import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openExternalLink(url: string, target: string = '_blank') {
  if (url) {
    window.open(url, target);
  } else {
    console.warn('No URL provided for external link');
  }
}
