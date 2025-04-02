import { clsx, type ClassValue } from "clsx"
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export  const formatCheckInDate = (dateString: string) => {
//   const date = new Date(dateString);
//   // Check if the date is valid
//   if (isNaN(date.getTime())) {
//     // If the date is invalid, return a fallback string or handle the error appropriately
//     return 'Invalid date';
//   }
//   return formatDistanceToNow(date, { addSuffix: true });
// };

export const formatCheckInDate = (dateString: string): string => {
  if (!dateString) return "Unknown date";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHrs < 24) return `${diffHrs} hrs ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};