/**
 * Storyblok utilities for data fetching and processing
 */

export interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  content: any;
}

export interface ArticleCardBlock {
  component: string;
  variant: string;
  title: string;
  excerpt?: string;
  image?: any;
  slug: string;
  cardClasses: string;
}

/**
 * Build query parameters for Storyblok API based on content type and filters
 * @param contentType - The content type to fetch (e.g., 'article')
 * @param searchQuery - Search query string
 * @param options - Additional query options
 */
export function buildStoryblokQuery(
  contentType: string, 
  searchQuery?: string | null,
  options: {
    perPage?: number;
    sortBy?: string;
  } = {}
) {
  const queryParams: any = {
    content_type: contentType,
    starts_with: `${contentType}s/`, // Convert 'article' to 'articles/'
    per_page: options.perPage || 100,
    sort_by: options.sortBy || 'content.dateModified:desc',
  };

  // Add search functionality using Storyblok's search_term parameter
  if (searchQuery && contentType === 'article') {
    queryParams.search_term = searchQuery;
  }

  return queryParams;
}

/**
 * Filter stories by tag (client-side filtering since Storyblok doesn't have tag search)
 * @param stories - Array of Storyblok stories
 * @param tagFilter - Tag to filter by
 * @param contentType - Content type (only applies to 'article')
 */
export function filterStoriesByTag(
  stories: StoryblokStory[], 
  tagFilter: string | null, 
  contentType: string
): StoryblokStory[] {
  if (!tagFilter || contentType !== 'article') {
    return stories;
  }

  return stories.filter(story => {
    const articleTags = story.content?.articleTags;
    if (!articleTags) return false;
    
    // Split tags by comma and check if any tag matches (case-insensitive)
    const tags = articleTags.split(',').map((tag: string) => tag.trim().toLowerCase());
    return tags.includes(tagFilter.toLowerCase());
  });
}

/**
 * Convert Storyblok stories to card blocks compatible with ArticleCard component
 * @param stories - Array of Storyblok stories
 */
export function storiesToCardBlocks(stories: StoryblokStory[]): ArticleCardBlock[] {
  return stories.map(story => ({
    component: 'card',
    variant: 'article',
    title: story.content?.title || story.name,
    excerpt: story.content?.excerpt,
    image: story.content?.image,
    slug: story.slug,
    cardClasses: '',
  }));
}

/**
 * Process stories with filtering and conversion to card blocks
 * @param stories - Array of Storyblok stories
 * @param tagFilter - Tag to filter by
 * @param contentType - Content type
 */
export function processStories(
  stories: StoryblokStory[], 
  tagFilter: string | null, 
  contentType: string
): ArticleCardBlock[] {
  const filteredStories = filterStoriesByTag(stories, tagFilter, contentType);
  return storiesToCardBlocks(filteredStories);
}