import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "SAR") {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
