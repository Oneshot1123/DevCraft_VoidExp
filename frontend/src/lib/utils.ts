import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind's merge utility to handle conflicts
 * @param inputs - The class names or expressions to combine
 * @returns A string of merged class names
 */
export function cn(...inputs: ClassValue[]) {
    // Use clsx to combine classes and twMerge to handle Tailwind conflicts
    return twMerge(clsx(inputs));
}
