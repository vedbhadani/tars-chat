import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx — keeps existing shadcn/ui compatibility.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a timestamp into a human-readable relative or absolute string.
 * TODO: Implement with date-fns or dayjs once connected to Convex.
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatMessageTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format timestamp for the chat date dividers (e.g., "Today", "Yesterday", "Mar 5")
 */
export function formatDateSeparator(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (!isThisYear) {
    options.year = "numeric";
  }

  return date.toLocaleDateString("en-US", options);
}

/**
 * Truncate text to a given length, appending an ellipsis if needed.
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Format timestamp into a human readable "relative" time (e.g. "5m ago", "2h ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((timestamp - Date.now()) / (1000 * 60));

  if (Math.abs(minutesDifference) < 1) return "just now";
  if (Math.abs(minutesDifference) < 60) return rtf.format(minutesDifference, 'minute');
  if (Math.abs(hoursDifference) < 24) return rtf.format(hoursDifference, 'hour');

  if (Math.abs(daysDifference) === 1) return "yesterday";
  if (Math.abs(daysDifference) < 7) return rtf.format(daysDifference, 'day');

  return new Date(timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
}
