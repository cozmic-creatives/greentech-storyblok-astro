import { useStoryblokApi } from '@storyblok/astro';
import { env } from './utils';
import type { ISbStoriesParams, ISbStoryParams, ISbStory, ISbStoryData } from '@storyblok/astro';

/**
 * Get a story from Storyblok by its slug
 * @param slug The slug of the story to fetch
 * @param options Additional options to pass to the Storyblok API
 * @returns The story data
 */
export async function getStoryblokStory<T = any>(
  slug: string,
  options: Partial<ISbStoryParams> = {}
): Promise<ISbStoryData<T>> {
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
    version: env.getStoryblokVersion(),
    resolve_links_level: 2,
    cv: Date.now(),
    ...options,
  });

  return data.story as unknown as ISbStoryData<T>;
}

/**
 * Get multiple stories from Storyblok
 * @param options Filter and pagination options
 * @returns Array of stories
 */
export async function getStoryblokStories<T = any>(
  options: Partial<ISbStoriesParams> = {}
): Promise<ISbStoryData<T>[]> {
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get('cdn/stories', {
    version: env.getStoryblokVersion(),
    cv: Date.now(),
    ...options,
  });

  return data.stories as unknown as ISbStoryData<T>[];
}

/**
 * Get Storyblok API instance
 * @returns Configured Storyblok API instance
 */
export function getStoryblokApi() {
  return useStoryblokApi();
}
