/**
 * Tag analytics utilities
 */

export interface TagAnalytics {
  totalArticles: number;
  tags: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Load tag analytics from public/tag-analytics.json
 * @returns TagAnalytics object or null if not found
 */
export async function loadTagAnalytics(): Promise<TagAnalytics | null> {
  try {
    // In SSR mode, try multiple paths where the file might be located
    const fs = await import('fs');
    const path = await import('path');
    
    const possiblePaths = [
      path.resolve('./public/tag-analytics.json'),  // Development/build time
      path.resolve('../public/tag-analytics.json'), // From server directory
      '/usr/share/nginx/html/tag-analytics.json',   // Docker nginx path
    ];
    
    for (const analyticsPath of possiblePaths) {
      if (fs.existsSync(analyticsPath)) {
        const data = fs.readFileSync(analyticsPath, 'utf-8');
        return JSON.parse(data);
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Could not load tag analytics:', error);
    return null;
  }
}

/**
 * Split tags into top tags and remaining tags
 * @param tagAnalytics - Tag analytics data
 * @param topCount - Number of top tags to extract (default: 4)
 */
export function splitTags(tagAnalytics: TagAnalytics | null, topCount: number = 4) {
  const topTags = tagAnalytics?.tags?.slice(0, topCount) || [];
  const remainingTags = tagAnalytics?.tags?.slice(topCount) || [];
  
  return { topTags, remainingTags };
}