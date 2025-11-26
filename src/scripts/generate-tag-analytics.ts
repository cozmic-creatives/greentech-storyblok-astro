#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import Storyblok from 'storyblok-js-client';

// Load environment variables
config();

// Storyblok configuration
const IS_PRODUCTION = process.env.PUBLIC_ENV === 'production';
const TOKEN = IS_PRODUCTION
  ? process.env.STORYBLOK_TOKEN
  : process.env.STORYBLOK_PREVIEW_TOKEN;
const VERSION = IS_PRODUCTION ? 'published' : 'draft';

if (!TOKEN) {
  const requiredVar = IS_PRODUCTION ? 'STORYBLOK_TOKEN' : 'STORYBLOK_PREVIEW_TOKEN';
  throw new Error(`${requiredVar} environment variable is required`);
}

interface TagAnalytics {
  totalTags: number;
  totalArticles: number;
  tags: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  generatedAt: string;
}

interface Article {
  name: string;
  slug: string;
  content: {
    articleTags?: string;
    title?: string;
    [key: string]: any;
  };
}

/**
 * Extract and parse tags from a comma-separated string
 */
function extractTags(tagString: string): string[] {
  if (!tagString || typeof tagString !== 'string') {
    return [];
  }

  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Count tag frequency and calculate statistics
 */
function analyzeTagFrequency(articles: Article[]): TagAnalytics {
  const tagCounts = new Map<string, number>();
  let totalTags = 0;

  // Process each article
  articles.forEach(article => {
    const tags = extractTags(article.content.articleTags || '');
    tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      totalTags++;
    });
  });

  // Convert to sorted array with percentages
  const sortedTags = Array.from(tagCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalTags > 0 ? Number(((count / totalTags) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTags,
    totalArticles: articles.length,
    tags: sortedTags,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch all articles from Storyblok
 */
async function fetchArticles(): Promise<Article[]> {
  try {
    console.log('🔄 Fetching articles from Storyblok...');

    // Create Storyblok client
    const storyblokApi = new Storyblok({
      accessToken: TOKEN,
      region: '', // Use default region (EU)
    });

    const { data } = await storyblokApi.get('cdn/stories', {
      content_type: 'article',
      starts_with: 'articles/',
      per_page: 100, // Adjust if you have more than 100 articles
      version: VERSION,
    });

    const stories = data.stories || [];
    console.log(`📚 Found ${stories.length} articles`);

    return stories.map((story: any) => ({
      name: story.name,
      slug: story.slug,
      content: story.content || {},
    }));
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    throw error;
  }
}

/**
 * Save analytics to JSON file in public directory
 */
function saveAnalytics(analytics: TagAnalytics): void {
  try {
    // Get the current file's directory and navigate to project root
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(currentDir, '../..');
    const publicDir = path.join(projectRoot, 'public');
    const outputPath = path.join(publicDir, 'tag-analytics.json');

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write analytics to file
    fs.writeFileSync(outputPath, JSON.stringify(analytics, null, 2));

    console.log(`💾 Tag analytics saved to: ${outputPath}`);
    console.log(
      `📊 Generated analytics for ${analytics.totalArticles} articles with ${analytics.tags.length} unique tags`
    );

    // Log top 10 tags
    if (analytics.tags.length > 0) {
      console.log('\n🏆 Top 10 Most Popular Tags:');
      analytics.tags.slice(0, 10).forEach((tag, index) => {
        console.log(`${index + 1}. ${tag.name} - ${tag.count} articles (${tag.percentage}%)`);
      });
    }
  } catch (error) {
    console.error('❌ Error saving analytics:', error);
    throw error;
  }
}

/**
 * Main function to generate tag analytics
 */
async function generateTagAnalytics(): Promise<void> {
  try {
    console.log('🚀 Starting tag analytics generation...');

    // Fetch articles
    const articles = await fetchArticles();

    if (articles.length === 0) {
      console.log('⚠️ No articles found');
      return;
    }

    // Analyze tag frequency
    const analytics = analyzeTagFrequency(articles);

    // Save to file
    saveAnalytics(analytics);

    console.log('✅ Tag analytics generation completed successfully');
  } catch (error) {
    console.error('❌ Failed to generate tag analytics:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTagAnalytics();
}

export { generateTagAnalytics };
