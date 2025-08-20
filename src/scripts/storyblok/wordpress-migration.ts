import { config } from 'dotenv';
import { createStory, slugExists, getFolderByName, getAssetFolderByName } from './utils.ts';
import { improveWordPressPost } from './robot.ts';

// Load environment variables
config();

// Node.js HTTPS module for custom Host header support
import https from 'https';
import { URL } from 'url';

// Enhanced logging utilities
function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function logInfo(message: string): void {
  console.log(`[${formatTimestamp()}] ℹ️  ${message}`);
}

// Note: SSL certificate validation is handled in customFetch() function

// Migration Configuration
interface MigrationConfig {
  wpApiBase: string;
  enableAssetUpload: boolean;
  enableAiImprovement: boolean;
  perPage: number;
  offset: number;
  rateLimitDelay: number;
  maxRetries: number;
}

const MIGRATION_CONFIG: MigrationConfig = {
  wpApiBase: 'https://156.38.250.198/wp-json/wp/v2', // Old server IP
  enableAssetUpload: true,
  enableAiImprovement: true,
  perPage: 39, // Process remaining 39 articles (79 - 40)
  offset: 40,
  rateLimitDelay: 1000,
  maxRetries: 3,
};

// Validation utilities
function validateMigrationConfig(config: MigrationConfig): void {
  if (!config.wpApiBase || !config.wpApiBase.startsWith('http')) {
    throw new Error('Invalid WordPress API base URL');
  }
  if (config.perPage < 1 || config.perPage > 100) {
    throw new Error('Per page must be between 1 and 100');
  }
  if (config.offset < 0) {
    throw new Error('Offset must be non-negative');
  }
  if (config.rateLimitDelay < 0) {
    throw new Error('Rate limit delay must be non-negative');
  }
  if (config.maxRetries < 1) {
    throw new Error('Max retries must be at least 1');
  }
}

function validateWordPressPost(post: WordPressPost): string[] {
  const errors: string[] = [];

  if (!post.title?.rendered?.trim()) {
    errors.push('Post title is required');
  }
  if (!post.content?.rendered?.trim()) {
    errors.push('Post content is required');
  }
  if (!post.slug?.trim()) {
    errors.push('Post slug is required');
  }
  if (!post.date_modified && !post.modified && !post.date) {
    errors.push('Post date is required (date_modified, modified, or date)');
  }

  return errors;
}

function validateSEOContent(
  title: string,
  content: string,
  excerpt?: string,
  tags?: string
): string[] {
  const seoErrors: string[] = [];

  // Title validation
  if (title.length < 10) {
    seoErrors.push('Title too short (minimum 10 characters for SEO)');
  }
  if (title.length > 60) {
    seoErrors.push('Title too long (maximum 60 characters for SEO)');
  }

  // Content validation
  if (content.length < 300) {
    seoErrors.push('Content too short (minimum 300 characters for SEO)');
  }

  // Excerpt validation
  if (excerpt && excerpt.length > 160) {
    seoErrors.push('Excerpt too long (maximum 160 characters for meta description)');
  }

  // Tags validation
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    if (tagArray.length < 2) {
      seoErrors.push('Need at least 2 tags for better SEO');
    }
    if (tagArray.length > 10) {
      seoErrors.push('Too many tags (maximum 10 for optimal SEO)');
    }
  }

  return seoErrors;
}

// Additional logging functions
function logSuccess(message: string): void {
  console.log(`[${formatTimestamp()}] ✅ ${message}`);
}

function logWarning(message: string): void {
  console.log(`[${formatTimestamp()}] ⚠️  ${message}`);
}

function logError(message: string, error?: any): void {
  const errorDetails = error ? ` - ${error.message || error}` : '';
  console.error(`[${formatTimestamp()}] ❌ ${message}${errorDetails}`);
}

function logProgress(current: number, total: number, message: string): void {
  const percentage = Math.round((current / total) * 100);
  console.log(`[${formatTimestamp()}] 🔄 [${percentage}%] ${message} (${current}/${total})`);
}

// Retry utility function
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MIGRATION_CONFIG.maxRetries,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        logError(`Operation failed after ${maxRetries} attempts`, error);
        throw error;
      }

      logWarning(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError;
}

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  date_modified?: string;
  modified?: string;
  date?: string;
  slug: string;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  title: { rendered: string };
  alt_text: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
  };
}

/**
 * Shared HTTPS request function for old WordPress server access
 * Handles Host header override that Node.js fetch() cannot do properly
 */
async function makeWordPressRequest(url: string, returnBinary = false): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const options = {
      hostname: '156.38.250.198', // Direct IP
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        Host: 'greentechmachinery.co.za', // Virtual host header
        'User-Agent': 'Migration-Script/1.0',
      },
      rejectUnauthorized: false, // Ignore SSL certificate issues
    };

    const req = https.request(options, res => {
      if (returnBinary) {
        // For images - return ArrayBuffer
        const chunks: Buffer[] = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const buffer = Buffer.concat(chunks);
            resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
          } else {
            logError(`Request failed: ${res.statusCode} ${res.statusMessage}`);
            resolve(null);
          }
        });
      } else {
        // For JSON/text data
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage || '',
              json: () => Promise.resolve(jsonData),
              text: () => Promise.resolve(data),
            });
          } catch (error) {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage || '',
              json: () => Promise.reject(new Error('Invalid JSON')),
              text: () => Promise.resolve(data),
            });
          }
        });
      }
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Custom fetch function for WordPress API calls
 */
async function customFetch(url: string): Promise<any> {
  return makeWordPressRequest(url, false);
}

/**
 * Get total count of WordPress articles from API headers
 */
async function getWordPressArticleCount(): Promise<number> {
  try {
    logInfo('Getting total WordPress article count...');

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(`${MIGRATION_CONFIG.wpApiBase}/posts?per_page=1`);

      const options = {
        hostname: '156.38.250.198', // Direct IP
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          Host: 'greentechmachinery.co.za', // Virtual host header
          'User-Agent': 'Migration-Script/1.0',
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, res => {
        // WordPress API sends total count in X-WP-Total header
        const totalCount = res.headers['x-wp-total'];

        if (totalCount) {
          const count = parseInt(totalCount as string, 10);
          logSuccess(`Found ${count} total WordPress articles`);
          resolve(count);
        } else {
          logWarning('X-WP-Total header not found, counting manually...');
          // Fallback: consume response and count pages
          let data = '';
          res.on('data', chunk => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const posts = JSON.parse(data);
              resolve(posts.length > 0 ? posts.length : 0);
            } catch (error) {
              resolve(0);
            }
          });
        }
      });

      req.on('error', error => {
        logError('Error getting article count', error);
        resolve(0);
      });

      req.end();
    });
  } catch (error) {
    logError('Error getting WordPress article count', error);
    return 0;
  }
}

/**
 * Test connection to WordPress API
 */
async function testWordPressConnection(): Promise<boolean> {
  try {
    logInfo('Testing connection to WordPress API...');
    logInfo(`Using custom fetch with IP and Host header`);

    const response = await customFetch(`${MIGRATION_CONFIG.wpApiBase}/posts?per_page=1`);

    logInfo(`Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const posts = await response.json();
      logSuccess(`Connection successful! Found ${posts.length} posts available`);
      return true;
    } else {
      const errorText = await response.text();
      logError(`Connection failed: ${response.status} ${response.statusText}`);
      logError(`Response body: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    logError('Connection test failed', error);
    return false;
  }
}

/**
 * Fetch WordPress posts
 */
async function fetchWordPressPosts(
  perPage: number = MIGRATION_CONFIG.perPage,
  offset: number = MIGRATION_CONFIG.offset
): Promise<WordPressPost[]> {
  return withRetry(async () => {
    const response = await customFetch(
      `${MIGRATION_CONFIG.wpApiBase}/posts?per_page=${perPage}&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return await response.json();
  }).catch(error => {
    logError('Error fetching WordPress posts after retries', error);
    return [];
  });
}

/**
 * Fetch WordPress media by ID
 */
async function fetchWordPressMedia(mediaId: number): Promise<WordPressMedia | null> {
  return withRetry(async () => {
    const response = await customFetch(`${MIGRATION_CONFIG.wpApiBase}/media/${mediaId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch media ${mediaId}: ${response.statusText}`);
    }
    return await response.json();
  }).catch(error => {
    logError(`Error fetching WordPress media ${mediaId} after retries`, error);
    return null;
  });
}

/**
 * Create a Storyblok asset object from uploaded asset and WordPress media data
 */
function createAssetObject(uploadedAsset: any, media: WordPressMedia): any {
  return {
    fieldtype: 'asset',
    id: uploadedAsset.id,
    filename: uploadedAsset.filename,
    alt: media.alt_text || media.title.rendered || '',
    name: media.title.rendered || 'WordPress Image',
    title: media.title.rendered || null,
    focus: null,
    width: media.media_details.width || null,
    height: media.media_details.height || null,
    content_type: media.mime_type || null,
  };
}

/**
 * Custom image fetch that handles old WordPress server
 */
async function fetchImageWithCustomHost(imageUrl: string): Promise<ArrayBuffer | null> {
  try {
    // Use shared helper with binary mode
    return await makeWordPressRequest(imageUrl, true);
  } catch (error) {
    logError('Image fetch error', error);
    return null;
  }
}

/**
 * Upload WordPress image to Storyblok using custom fetch
 */
async function uploadWordPressImage(
  imageUrl: string,
  filename: string,
  dimensions: string,
  assetFolderId?: number
): Promise<any | null> {
  try {
    logInfo(`Fetching image: ${imageUrl}`);

    // Use our custom fetch to get the image
    const arrayBuffer = await fetchImageWithCustomHost(imageUrl);
    if (!arrayBuffer) {
      logError(`Failed to fetch image from old server: ${imageUrl}`);
      return null;
    }

    logSuccess(`Successfully fetched image (${arrayBuffer.byteLength} bytes)`);

    // Import the required functions from utils
    const { getSignedResponse, uploadToSignedUrl, finalizeUpload } = await import('./utils.ts');

    // Step 1: Get signed response with folder
    const signedResponse = await getSignedResponse(filename, dimensions, assetFolderId);
    if (!signedResponse) return null;

    // Step 2: Upload to signed URL
    const uploadSuccess = await uploadToSignedUrl(signedResponse, arrayBuffer);
    if (!uploadSuccess) return null;

    // Step 3: Finalize upload
    const finalResult = await finalizeUpload(signedResponse.id);
    if (!finalResult) return null;

    logSuccess(`Image uploaded successfully: ${filename}`);
    return finalResult;
  } catch (error) {
    logError(`Failed to upload WordPress image: ${filename}`, error);
    return null;
  }
}

/**
 * Process featured media and upload to Storyblok
 */
async function processFeaturedMedia(
  mediaId: number,
  postSlug: string,
  assetFolderId?: number
): Promise<any> {
  if (!mediaId || mediaId <= 0) return null;

  const media = await fetchWordPressMedia(mediaId);
  if (!media || !media.source_url) return null;

  if (!MIGRATION_CONFIG.enableAssetUpload) {
    return {
      id: null,
      filename: media.source_url,
      alt: media.alt_text || media.title.rendered || '',
      name: media.title.rendered || 'WordPress Image',
    };
  }

  // Get file extension
  let extension = '.jpg'; // default
  if (media.mime_type === 'image/png') {
    extension = '.png';
  } else if (media.mime_type === 'image/jpeg') {
    extension = '.jpg';
  }

  // Create simple timestamp-based filename
  const timestamp = Date.now();
  let filename = `image-${timestamp}${extension}`;

  // Get actual image dimensions from WordPress
  const dimensions = `${media.media_details.width}x${media.media_details.height}`;

  const uploadedAsset = await uploadWordPressImage(
    media.source_url,
    filename,
    dimensions,
    assetFolderId
  );

  if (uploadedAsset) {
    return createAssetObject(uploadedAsset, media);
  }

  return null;
}

/**
 * Create article content structure for Storyblok
 */
function createArticleContent(
  post: WordPressPost,
  featuredImage: any,
  improvedContent?: string,
  excerpt?: string,
  articleTags?: string
): any {
  const articleContent: any = {
    component: 'article',
    title: post.title.rendered,
    body: improvedContent || post.content.rendered, // Use improved markdown content if available
    dateModified: post.date_modified || post.modified || post.date,
    image: featuredImage,
  };

  // Add excerpt if provided
  if (excerpt) {
    articleContent.excerpt = excerpt;
  }

  // Add tags if provided
  if (articleTags) {
    articleContent.articleTags = articleTags;
  }

  return articleContent;
}

/**
 * Generate a unique slug by checking if it exists
 */
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 100) throw new Error('Could not generate unique slug');
  }

  return slug;
}

/**
 * Process a single WordPress post and create a Storyblok story
 */
async function processWordPressPost(
  post: WordPressPost,
  articlesFolder: any,
  assetFolder?: any
): Promise<boolean> {
  try {
    logInfo(`Processing: ${post.title.rendered}`);

    // Check for slug existence including folder path
    const baseSlug = post.slug;
    const fullSlugPath = articlesFolder ? `articles/${baseSlug}` : baseSlug;

    // Generate unique slug based on the full path
    const finalSlug = await generateUniqueSlug(fullSlugPath);
    // Extract just the slug part for story creation (folder structure is handled by parent_id)
    const storySlug = finalSlug.replace('articles/', '');

    const featuredImage = await processFeaturedMedia(
      post.featured_media,
      storySlug,
      assetFolder?.id
    );

    // Prepare content for potential AI improvement
    let title = post.title.rendered;
    let content = post.content.rendered;
    let summary = '';
    let articleTags = '';

    // AI content improvement if enabled
    if (MIGRATION_CONFIG.enableAiImprovement) {
      try {
        logInfo('Improving content with AI...');
        const improved = await improveWordPressPost({
          title: post.title.rendered,
          content: post.content.rendered,
        });

        title = improved.title;
        content = improved.content;
        summary = improved.summary;
        articleTags = improved.tags;
        logSuccess('Content improved successfully');
        logInfo(`Generated tags: ${articleTags}`);
      } catch (error) {
        logWarning('AI improvement failed, using original content');
        logError('AI improvement error details', error);
        // Continue with original content if AI fails
      }
    }

    // Validate SEO content
    const seoErrors = validateSEOContent(title, content, summary, articleTags);
    if (seoErrors.length > 0) {
      logWarning(`SEO issues found for "${title}": ${seoErrors.join(', ')}`);
    } else {
      logSuccess('SEO validation passed');
    }

    const articleContent = createArticleContent(
      { ...post, title: { rendered: title } },
      featuredImage,
      content, // Pass the improved markdown content
      summary,
      articleTags
    );

    // Create story in the Articles folder
    let createdStory = await createStory(
      title,
      storySlug,
      articleContent,
      articlesFolder?.id || undefined
    );

    // Fallback with timestamp if needed
    if (!createdStory) {
      const timestamp = Date.now();
      const fallbackSlug = `${baseSlug}-${timestamp}`;
      createdStory = await createStory(
        title,
        fallbackSlug,
        articleContent,
        articlesFolder?.id || undefined
      );
    }

    if (createdStory) {
      logSuccess(`Successfully migrated: ${title}`);
      return true;
    } else {
      logError(`Failed to migrate: ${title}`);
      return false;
    }
  } catch (error) {
    logError(`Error processing ${post.title.rendered}`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration(): Promise<void> {
  logInfo('Starting WordPress to Storyblok migration...');

  try {
    // Validate configuration
    validateMigrationConfig(MIGRATION_CONFIG);
    logSuccess('Configuration validated');

    // Test WordPress connection
    const connectionOk = await testWordPressConnection();
    if (!connectionOk) {
      throw new Error('Cannot connect to WordPress API');
    }

    // Get total article count
    const totalArticles = await getWordPressArticleCount();
    logInfo(
      `Migration will process ${MIGRATION_CONFIG.perPage} of ${totalArticles} total articles`
    );

    // Get the Articles folder
    logInfo('Finding Articles folder...');
    const articlesFolder = await getFolderByName('Articles');

    if (articlesFolder) {
      logSuccess(`Found Articles folder (ID: ${articlesFolder.id})`);
    } else {
      logWarning('Articles folder not found, stories will be created in root');
    }

    // Get the Articles asset folder
    logInfo('Finding Articles asset folder...');
    const articlesAssetFolder = await getAssetFolderByName('Articles');

    if (articlesAssetFolder) {
      logSuccess(`Found Articles asset folder (ID: ${articlesAssetFolder.id})`);
    } else {
      logWarning('Articles asset folder not found, images will be uploaded to root');
    }

    const posts = await fetchWordPressPosts();

    if (posts.length === 0) {
      logWarning('No posts found to migrate');
      return;
    }

    logInfo(`Found ${posts.length} post(s) to migrate`);

    const results = { success: 0, failed: 0 };

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      // Validate post data
      const validationErrors = validateWordPressPost(post);
      if (validationErrors.length > 0) {
        logError(
          `Skipping invalid post "${post.title?.rendered || 'Unknown'}"`,
          validationErrors.join(', ')
        );
        results.failed++;
        continue;
      }

      logProgress(i + 1, posts.length, `Processing: ${post.title.rendered}`);
      const success = await processWordPressPost(post, articlesFolder, articlesAssetFolder);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.rateLimitDelay));
    }

    logInfo('Migration Summary:');
    logSuccess(`Successfully migrated: ${results.success} posts`);
    if (results.failed > 0) {
      logWarning(`Failed to migrate: ${results.failed} posts`);
    }
    logSuccess('Migration completed!');
  } catch (error) {
    logError('Migration failed', error);
  }
}

// Run the migration
runMigration();
