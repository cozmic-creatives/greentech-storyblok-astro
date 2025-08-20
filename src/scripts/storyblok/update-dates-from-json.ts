import fs from 'fs';
import path from 'path';
import { getStoryblokApi, getStoriesInFolder, updateStoryContent } from './utils.js';
import { logInfo, logSuccess, logError, logWarning, logProgress } from './wordpress-api.js';

// Configuration
const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const ARTICLES_FOLDER_SLUG = 'articles';
const WORDPRESS_DATES_FILE = 'public/wordpress-dates.json';

// Date data interface
interface WordPressDateData {
  slug: string;
  title: string;
  date: string;
  modified: string;
  wordpressId: number;
}

/**
 * Format WordPress ISO date to Storyblok format (YYYY-MM-DD HH:MM)
 */
function formatDateForStoryblok(isoDate: string): string {
  try {
    // WordPress gives us: "2025-08-07T16:01:37" 
    // Storyblok expects: "2025-08-07 16:01"
    const date = new Date(isoDate);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    logError(`Error formatting date: ${isoDate}`, error);
    return isoDate; // Return original if formatting fails
  }
}

// Storyblok story interface
interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: any;
  published: boolean;
}

/**
 * Load WordPress date data from JSON file
 */
function loadWordPressDateData(): WordPressDateData[] {
  try {
    const filePath = path.join(process.cwd(), WORDPRESS_DATES_FILE);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`WordPress dates file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const dateData = JSON.parse(fileContent);

    logSuccess(`Loaded ${dateData.length} WordPress date records from ${WORDPRESS_DATES_FILE}`);
    return dateData;
  } catch (error) {
    logError('Error loading WordPress date data', error);
    throw error;
  }
}

/**
 * Get all Storyblok articles from the Articles folder
 */
async function getStoryblokArticles(): Promise<StoryblokStory[]> {
  try {
    logInfo('Fetching Storyblok articles from Articles folder...');
    
    const articles = await getStoriesInFolder(ARTICLES_FOLDER_SLUG);
    
    logSuccess(`Found ${articles.length} Storyblok articles in Articles folder`);
    return articles;
  } catch (error) {
    logError('Error fetching Storyblok articles', error);
    throw error;
  }
}

/**
 * Match WordPress data to Storyblok articles by slug
 */
function matchArticles(
  wordpressData: WordPressDateData[],
  storyblokArticles: StoryblokStory[]
): Array<{ wordpressData: WordPressDateData; storyblokStory: StoryblokStory }> {
  const matches: Array<{ wordpressData: WordPressDateData; storyblokStory: StoryblokStory }> = [];
  const unmatchedWordPress: string[] = [];
  const unmatchedStoryblok: string[] = [];

  // Create lookup maps for efficient matching
  const wordpressMap = new Map(wordpressData.map(wp => [wp.slug, wp]));
  const storyblokMap = new Map(storyblokArticles.map(sb => [sb.slug, sb]));

  // Match by slug (primary strategy)
  for (const wp of wordpressData) {
    const storyblokArticle = storyblokMap.get(wp.slug);
    if (storyblokArticle) {
      matches.push({ wordpressData: wp, storyblokStory: storyblokArticle });
    } else {
      unmatchedWordPress.push(wp.slug);
    }
  }

  // Find unmatched Storyblok articles
  for (const sb of storyblokArticles) {
    if (!wordpressMap.has(sb.slug)) {
      unmatchedStoryblok.push(sb.slug);
    }
  }

  // Log matching results
  logSuccess(`Successfully matched ${matches.length} articles by slug`);
  
  if (unmatchedWordPress.length > 0) {
    logWarning(`Unmatched WordPress articles (${unmatchedWordPress.length}): ${unmatchedWordPress.slice(0, 5).join(', ')}${unmatchedWordPress.length > 5 ? '...' : ''}`);
  }
  
  if (unmatchedStoryblok.length > 0) {
    logWarning(`Unmatched Storyblok articles (${unmatchedStoryblok.length}): ${unmatchedStoryblok.slice(0, 5).join(', ')}${unmatchedStoryblok.length > 5 ? '...' : ''}`);
  }

  return matches;
}

/**
 * Get full story content with all fields intact
 */
async function getFullStoryContent(slug: string): Promise<any> {
  try {
    // Use the full slug with articles/ prefix
    const fullSlug = `articles/${slug}`;
    const { getStory } = await import('./utils.js');
    const story = await getStory(fullSlug);
    
    if (!story || !story.content) {
      logError(`Could not fetch full content for story: ${fullSlug}`);
      return null;
    }

    return story.content;
  } catch (error) {
    logError(`Error fetching story content for ${slug}`, error);
    return null;
  }
}

/**
 * SAFE update: Merge date into existing content without losing fields
 */
async function updateArticleWithDate(
  storyblokStory: StoryblokStory,
  wordpressData: WordPressDateData
): Promise<boolean> {
  try {
    // Get the complete current content
    const currentContent = await getFullStoryContent(storyblokStory.slug);
    
    if (!currentContent) {
      logError(`Could not retrieve current content for ${storyblokStory.name}`);
      return false;
    }

    // Format date for Storyblok (YYYY-MM-DD HH:MM format, not full ISO)
    const rawDate = wordpressData.modified || wordpressData.date;
    const formattedDate = formatDateForStoryblok(rawDate);

    // MERGE the date into existing content (don't replace!)
    const updatedContent = {
      ...currentContent, // Keep ALL existing fields
      dateModified: formattedDate, // Add/update just the date in correct format
    };

    // Update the story with merged content
    const success = await updateStoryContent(storyblokStory, updatedContent, false); // Don't publish, just save
    
    if (success) {
      logSuccess(`Updated "${storyblokStory.name}" with date: ${formattedDate}`);
      return true;
    } else {
      logError(`Failed to update "${storyblokStory.name}"`);
      return false;
    }
  } catch (error) {
    logError(`Error updating article "${storyblokStory.name}"`, error);
    return false;
  }
}

/**
 * Batch update articles with rate limiting
 */
async function batchUpdateArticles(
  matches: Array<{ wordpressData: WordPressDateData; storyblokStory: StoryblokStory }>
): Promise<{ success: number; failed: number }> {
  const results = { success: 0, failed: 0 };
  
  // PRODUCTION MODE: Process all matched articles
  const total = matches.length;

  logInfo(`🚀 PRODUCTION MODE: Starting batch update of ${total} articles...`);

  for (let i = 0; i < matches.length; i++) {
    const { wordpressData, storyblokStory } = matches[i];
    
    logProgress(i + 1, total, `Updating: ${storyblokStory.name}`);
    
    const success = await updateArticleWithDate(storyblokStory, wordpressData);
    
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }

    // Rate limiting: small delay between requests to be respectful to API
    if (i < matches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Slightly increased delay for production
    }
  }

  return results;
}

/**
 * Main update function
 */
async function updateArticleDatesFromJson(): Promise<void> {
  logInfo('Starting Storyblok article date update from JSON data...');

  try {
    // Load WordPress date data
    const wordpressData = loadWordPressDateData();

    // Get Storyblok articles
    const storyblokArticles = await getStoryblokArticles();

    // Match articles
    const matches = matchArticles(wordpressData, storyblokArticles);

    if (matches.length === 0) {
      logWarning('No matching articles found. Nothing to update.');
      return;
    }

    // Batch update with rate limiting
    const results = await batchUpdateArticles(matches);

    // Final summary
    logInfo('📊 Date Update Summary:');
    logSuccess(`✅ Successfully updated: ${results.success} articles`);
    
    if (results.failed > 0) {
      logWarning(`⚠️  Failed to update: ${results.failed} articles`);
    } else {
      logSuccess('🎉 All articles updated successfully!');
    }

    logSuccess(`📅 Date migration completed! All ${results.success} articles now have WordPress dates in Storyblok.`);
    
  } catch (error) {
    logError('Article date update failed', error);
    process.exit(1);
  }
}

// Run the update
updateArticleDatesFromJson();