
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCurrencySymbol = (currency: 'SAR' | 'AED' | 'EGP' | 'USD') => {
  switch (currency) {
    case 'SAR':
      return 'ر.س'
    case 'AED':
      return 'د.إ'
    case 'EGP':
      return 'ج.م'
    case 'USD':
        return '$'
  }
}
