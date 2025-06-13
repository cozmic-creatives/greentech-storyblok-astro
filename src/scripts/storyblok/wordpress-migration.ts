import { config } from 'dotenv';
import { createStory, uploadAsset, slugExists, getFolderByName } from './utils.js';
import { improveWordPressPost } from './robot.js';
import { convertToRichText } from '../../utils/richtext.js';

// Load environment variables
config();

// Configuration
const WP_API_BASE = 'https://greentechmachinery.co.za/wp-json/wp/v2';
const ENABLE_ASSET_UPLOAD = true; // Enable asset upload
const ENABLE_AI_IMPROVEMENT = true; // Enable AI content improvement

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  date_modified: string;
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
 * Fetch WordPress posts
 */
async function fetchWordPressPosts(
  perPage: number = 1,
  offset: number = 0
): Promise<WordPressPost[]> {
  try {
    const response = await fetch(`${WP_API_BASE}/posts?per_page=${perPage}&offset=${offset}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}

/**
 * Fetch WordPress media by ID
 */
async function fetchWordPressMedia(mediaId: number): Promise<WordPressMedia | null> {
  try {
    const response = await fetch(`${WP_API_BASE}/media/${mediaId}`);
    if (!response.ok) {
      console.error(`Failed to fetch media ${mediaId}: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching WordPress media ${mediaId}:`, error);
    return null;
  }
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
 * Process featured media and upload to Storyblok
 */
async function processFeaturedMedia(mediaId: number, postSlug: string): Promise<any> {
  if (!mediaId || mediaId <= 0) return null;

  const media = await fetchWordPressMedia(mediaId);
  if (!media || !media.source_url) return null;

  if (!ENABLE_ASSET_UPLOAD) {
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

  const uploadedAsset = await uploadAsset(media.source_url, filename, dimensions);

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
  excerpt?: string,
  articleTags?: string
): any {
  const articleContent: any = {
    component: 'article',
    title: post.title.rendered,
    body: convertToRichText(post.content.rendered),
    dateModified: post.date_modified,
    image: featuredImage,
  };

  // Add excerpt if provided
  if (excerpt) {
    articleContent.excerpt = excerpt;
  }

  // Add tags if provided
  if (articleTags) {
    articleContent.tags = articleTags;
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
async function processWordPressPost(post: WordPressPost, articlesFolder: any): Promise<boolean> {
  try {
    console.log(`\n🔄 Processing: ${post.title.rendered}`);

    // Check for slug existence including folder path
    const baseSlug = post.slug;
    const fullSlugPath = articlesFolder ? `articles/${baseSlug}` : baseSlug;

    // Generate unique slug based on the full path
    const finalSlug = await generateUniqueSlug(fullSlugPath);
    // Extract just the slug part for story creation (folder structure is handled by parent_id)
    const storySlug = finalSlug.replace('articles/', '');

    const featuredImage = await processFeaturedMedia(post.featured_media, storySlug);

    // Prepare content for potential AI improvement
    let title = post.title.rendered;
    let content = post.content.rendered;
    let summary = '';
    let articleTags = '';

    // AI content improvement if enabled
    if (ENABLE_AI_IMPROVEMENT) {
      try {
        console.log('🤖 Improving content with AI...');
        const improved = await improveWordPressPost({
          title: post.title.rendered,
          content: post.content.rendered,
        });

        title = improved.title;
        content = improved.content;
        summary = improved.summary;
        articleTags = improved.tags;
        console.log('✅ Content improved successfully');
      } catch (error) {
        console.log('⚠️  AI improvement failed, using original content');
        // Continue with original content if AI fails
      }
    }

    const articleContent = createArticleContent(
      { ...post, title: { rendered: title }, content: { rendered: content } },
      featuredImage,
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
      console.log(`✅ Successfully migrated: ${title}`);
      return true;
    } else {
      console.log(`❌ Failed to migrate: ${title}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${post.title.rendered}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration(): Promise<void> {
  console.log('🚀 Starting WordPress to Storyblok migration...\n');

  try {
    // Get the Articles folder
    console.log('📁 Finding Articles folder...');
    const articlesFolder = await getFolderByName('Articles');

    if (articlesFolder) {
      console.log(`✅ Found Articles folder (ID: ${articlesFolder.id})`);
    } else {
      console.log('⚠️  Articles folder not found, stories will be created in root');
    }

    const posts = await fetchWordPressPosts(1, 0);

    if (posts.length === 0) {
      console.log('❌ No posts found to migrate');
      return;
    }

    console.log(`📊 Found ${posts.length} post(s) to migrate`);

    const results = { success: 0, failed: 0 };

    for (const post of posts) {
      const success = await processWordPressPost(post, articlesFolder);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${results.success} posts`);
    console.log(`❌ Failed to migrate: ${results.failed} posts`);
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// Run the migration
runMigration();
