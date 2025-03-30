import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Environment utility functions for Storyblok and app settings
 */
export const env = {
  /**
   * Check if the current environment is preview mode
   */
  isPreview: () => import.meta.env.PUBLIC_ENV === 'preview',

  /**
   * Check if the current environment is development mode
   */
  isDev: () => import.meta.env.PUBLIC_ENV === 'development',

  /**
   * Check if the current environment is production mode
   */
  isProd: () => import.meta.env.PUBLIC_ENV === 'production',

  /**
   * Get the appropriate Storyblok content version based on environment
   */
  getStoryblokVersion: () => (env.isPreview() ? 'draft' : 'published'),
};
