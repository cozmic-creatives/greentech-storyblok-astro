import fs from 'fs';
import path from 'path';
import {
  getWordPressArticleCount,
  fetchWordPressPosts,
  testWordPressConnection,
  logInfo,
  logSuccess,
  logError,
  logProgress,
  type WordPressPost,
} from './wordpress-api.js';

/**
 * Extract date data from WordPress posts
 */
function extractDateData(posts: WordPressPost[]): any[] {
  return posts.map(post => ({
    slug: post.slug,
    title: post.title?.rendered || 'Untitled',
    date: post.date, // Publication date
    modified: post.modified, // Last modified date
    wordpressId: post.id,
  }));
}

/**
 * Save date data to JSON file
 */
async function saveDateData(dateData: any[]): Promise<void> {
  try {
    const outputPath = path.join(process.cwd(), 'public', 'wordpress-dates.json');
    
    // Ensure public directory exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write formatted JSON
    fs.writeFileSync(outputPath, JSON.stringify(dateData, null, 2), 'utf8');
    
    logSuccess(`Saved ${dateData.length} article dates to ${outputPath}`);
  } catch (error) {
    logError('Error saving date data to file', error);
    throw error;
  }
}

/**
 * Main extraction function
 */
async function extractWordPressDates(): Promise<void> {
  logInfo('Starting WordPress date extraction...');

  try {
    // Test connection first
    const connectionOk = await testWordPressConnection();
    if (!connectionOk) {
      throw new Error('Cannot connect to WordPress API');
    }

    // Get total article count
    const totalArticles = await getWordPressArticleCount();
    if (totalArticles === 0) {
      throw new Error('No articles found or could not connect to WordPress');
    }

    logInfo(`Extracting dates from ${totalArticles} articles...`);

    // Fetch all posts in batches
    const allPosts: WordPressPost[] = [];
    const batchSize = 100;
    
    for (let offset = 0; offset < totalArticles; offset += batchSize) {
      const remaining = Math.min(batchSize, totalArticles - offset);
      logProgress(offset + 1, totalArticles, `Fetching batch: ${offset + 1}-${offset + remaining}`);
      
      const posts = await fetchWordPressPosts(remaining, offset);
      allPosts.push(...posts);
      
      // Small delay to be respectful to the server
      if (offset + batchSize < totalArticles) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    logSuccess(`Fetched ${allPosts.length} posts successfully`);

    // Extract date data
    const dateData = extractDateData(allPosts);
    
    // Save to JSON file
    await saveDateData(dateData);

    logSuccess('WordPress date extraction completed successfully!');
    logInfo(`Data saved to: public/wordpress-dates.json`);
    
  } catch (error) {
    logError('Date extraction failed', error);
    process.exit(1);
  }
}

// Run the extraction
extractWordPressDates();