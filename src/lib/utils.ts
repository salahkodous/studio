import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCurrencySymbol = (currency: 'SAR' | 'QAR' | 'AED') => {
  switch (currency) {
    case 'SAR':
      return 'ر.س'
    case 'QAR':
      return 'ر.ق'
    case 'AED':
      return 'د.إ'
  }
}
