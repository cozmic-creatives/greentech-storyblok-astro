/**
 * Date formatting utilities
 */

/**
 * Format Storyblok date string to readable format
 * @param dateString - Date in Storyblok format (YYYY-MM-DD HH:MM or YYYY-MM-DD)
 * @returns Formatted date string (e.g., "August 7, 2025")
 */
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    // Handle Storyblok date format: "2025-08-07 16:01" or "2025-08-07"
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    
    if (timePart) {
      // Full date with time
      const date = new Date(`${year}-${month}-${day}T${timePart}:00`);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      // Just date
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return dateString; // Return original if formatting fails
  }
}

/**
 * Format date for relative display (e.g., "2 days ago", "3 months ago")
 * @param dateString - Date in Storyblok format (YYYY-MM-DD HH:MM or YYYY-MM-DD)
 * @returns Relative time string
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    
    const date = timePart 
      ? new Date(`${year}-${month}-${day}T${timePart}:00`)
      : new Date(`${year}-${month}-${day}`);
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (error) {
    console.error('Error formatting relative date:', dateString, error);
    return dateString;
  }
}

/**
 * Format date in ISO format for datetime attributes
 * @param dateString - Date in Storyblok format (YYYY-MM-DD HH:MM or YYYY-MM-DD)
 * @returns ISO date string for HTML datetime attribute
 */
export function formatISODate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    
    if (timePart) {
      return `${year}-${month}-${day}T${timePart}:00`;
    } else {
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error formatting ISO date:', dateString, error);
    return dateString;
  }
}