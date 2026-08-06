import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCycleStart(activeUntil: Date | null | undefined, masaAktifBulan: number = 30): Date {
  if (!activeUntil) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  const now = new Date();
  const cycleStart = new Date(activeUntil);
  
  // Backtrack from activeUntil to find the start of the current cycle
  while (cycleStart > now) {
    cycleStart.setDate(cycleStart.getDate() - masaAktifBulan);
  }
  
  return cycleStart;
}
