
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const REGISTRY_API = "http://localhost:9001/v2";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}