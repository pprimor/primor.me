/**
 * Formats a Date object to a string like "Mar. 2023"
 */
export function formatDate(date: Date): string {
  const monthNames = [
    "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
    "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
}

/**
 * Formats a date for display, handling "Present" case
 */
export function formatDateRange(start: Date, end: Date | null): string {
  const startStr = formatDate(start);
  const endStr = end ? formatDate(end) : "Present";
  return `${startStr} - ${endStr}`;
}

/**
 * Calculates the duration between two dates
 * Returns a formatted string like "1 yr 8 mos" or "2 yrs 3 mos"
 * Returns empty string if calculation fails
 */
export function calculateDuration(start: Date, end: Date | null): string {
  try {
    const endDate = end || new Date();
    
    const years = endDate.getFullYear() - start.getFullYear();
    const months = endDate.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    
    if (totalMonths < 0) return "";
    
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;
    
    if (yearsPart > 0 && monthsPart > 0) {
      return `${yearsPart} yr${yearsPart > 1 ? "s" : ""} ${monthsPart} mo${monthsPart > 1 ? "s" : ""}`;
    } else if (yearsPart > 0) {
      return `${yearsPart} yr${yearsPart > 1 ? "s" : ""}`;
    } else if (monthsPart > 0) {
      return `${monthsPart} mo${monthsPart > 1 ? "s" : ""}`;
    }
    return "";
  } catch {
    return "";
  }
}

