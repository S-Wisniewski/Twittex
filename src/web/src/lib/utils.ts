import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoDate: string) {
  const date = new Date(isoDate);

  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function isoMinus({
  seconds = 0,
  minutes = 0,
  hours = 0,
  days = 0,
  years = 0,
} = {}) {
  const date = new Date();

  date.setSeconds(date.getSeconds() - seconds);
  date.setMinutes(date.getMinutes() - minutes);
  date.setHours(date.getHours() - hours);
  date.setDate(date.getDate() - days);
  date.setFullYear(date.getFullYear() - years);

  return date.toISOString();
}
