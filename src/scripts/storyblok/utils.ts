import { config } from 'dotenv';
import Storyblok from 'storyblok-js-client';

// Load environment variables
config();

// Management API token and space configuration
const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;
// Use preview token for scripts (need draft access for content management)
const PREVIEW_TOKEN = process.env.STORYBLOK_PREVIEW_TOKEN;
const SPACE_ID = process.env.STORYBLOK_SPACE_ID;

export interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: any;
  published: boolean;
  [key: string]: any;
}

/**
 * Get a Storyblok API instance configured for Management API
 * This creates a new instance using the same underlying library as useStoryblokApi
 * but configured for Management API usage
 */
export function getStoryblokApi() {
  return new Storyblok({
    oauthToken: MANAGEMENT_TOKEN!,
  });
}

/**
 * Get a Content Delivery API instance for reading content
 */
export function getContentApi() {
  return new Storyblok({
    accessToken: PREVIEW_TOKEN!,
    region: '', // Use default region (EU)
  });
}

/**
 * Fetch a story using Content Delivery API (for reading content)
 */
export async function getStory(fullSlug: string): Promise<StoryblokStory | null> {
  try {
    // Use Content Delivery API to get the full content
    const contentApi = getContentApi();
    const { data: contentData } = await contentApi.get(`cdn/stories/${fullSlug}`, {
      version: 'draft',
    });

    if (!contentData.story) {
      return null;
    }

    // Also get the Management API story for additional metadata
    const managementApi = getStoryblokApi();
    const { data: mgmtData } = await (managementApi as any).get(`spaces/${SPACE_ID}/stories`, {
      by_slugs: fullSlug,
    });

    const mgmtStory = mgmtData.stories?.[0];

    // Combine both to create a complete story object
    return {
      ...mgmtStory,
      content: contentData.story.content,
    } as StoryblokStory;
  } catch (error: any) {
    // 404 is expected when story doesn't exist, don't log as error
    if (error.status === 404) {
      return null;
    }
    console.error(`Error fetching story ${fullSlug}:`, error);
    return null;
  }
}

/**
 * Get all stories in a specific folder
 */
export async function getStoriesInFolder(folderSlug: string): Promise<StoryblokStory[]> {
  try {
    const api = getStoryblokApi();
    // Cast to any since we're using Management API endpoints
    const { data } = await (api as any).get(`spaces/${SPACE_ID}/stories`, {
      starts_with: folderSlug,
      per_page: 100, // Adjust as needed
    });

    return data.stories || [];
  } catch (error) {
    console.error(`Error fetching stories in folder ${folderSlug}:`, error);
    return [];
  }
}

/**
 * Update a story's content
 */
export async function updateStoryContent(
  story: StoryblokStory,
  newContent: any,
  publishAfterUpdate: boolean = false
): Promise<boolean> {
  try {
    const api = getStoryblokApi();

    // Update the story (cast to any for Management API)
    await (api as any).put(`spaces/${SPACE_ID}/stories/${story.id}`, {
      story: {
        name: story.name,
        slug: story.slug,
        content: newContent,
      },
    });

    // Publish if requested
    if (publishAfterUpdate) {
      await (api as any).put(`spaces/${SPACE_ID}/stories/${story.id}/publish`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating story ${story.id}:`, error);
    return false;
  }
}

/**
 * Copy content from one story to multiple target stories
 */
export async function copyContentToStories(
  sourceContent: any,
  targetStories: StoryblokStory[],
  publishAfterUpdate: boolean = false
): Promise<{ success: StoryblokStory[]; failed: StoryblokStory[] }> {
  const success: StoryblokStory[] = [];
  const failed: StoryblokStory[] = [];

  for (const story of targetStories) {
    const result = await updateStoryContent(story, sourceContent, publishAfterUpdate);
    if (result) {
      success.push(story);
      console.log(`✅ Successfully updated story ${story.name} (${story.id})`);
    } else {
      failed.push(story);
      console.log(`❌ Failed to update story ${story.name} (${story.id})`);
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return { success, failed };
}

/**
 * Get asset folder by name
 */
export async function getAssetFolderByName(folderName: string): Promise<any> {
  try {
    const api = getStoryblokApi();
    const { data } = await (api as any).get(`spaces/${SPACE_ID}/asset_folders`);

    const folder = data.asset_folders?.find(
      (folder: any) => folder.name.toLowerCase() === folderName.toLowerCase()
    );

    return folder || null;
  } catch (error) {
    console.error(`Error fetching asset folder '${folderName}':`, error);
    return null;
  }
}

/**
 * Step 1: Get signed response object from Storyblok (direct API call)
 */
export async function getSignedResponse(filename: string, dimensions: string, assetFolderId?: number): Promise<any> {
  try {
    const response = await fetch(`https://mapi.storyblok.com/v1/spaces/${SPACE_ID}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: MANAGEMENT_TOKEN!,
      },
      body: JSON.stringify({
        filename: filename,
        size: dimensions,
        validate_upload: 1,
        ...(assetFolderId && { asset_folder_id: assetFolderId }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Signed response error:', errorData);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting signed response:', error);
    return null;
  }
}

/**
 * Step 2: Upload file to the signed URL
 */
export async function uploadToSignedUrl(signedResponse: any, fileBuffer: ArrayBuffer): Promise<boolean> {
  try {
    const formData = new FormData();

    // Add all fields from the signed response
    for (const key in signedResponse.fields) {
      formData.append(key, signedResponse.fields[key]);
    }

    // Add the file (must be last)
    formData.append('file', new Blob([fileBuffer]));

    const uploadResponse = await fetch(signedResponse.post_url, {
      method: 'POST',
      body: formData,
    });

    return uploadResponse.ok;
  } catch (error) {
    console.error('Error uploading to signed URL:', error);
    return false;
  }
}

/**
 * Step 3: Finalize the upload process
 */
export async function finalizeUpload(signedResponseId: string): Promise<any> {
  try {
    const api = getStoryblokApi();
    const { data } = await (api as any).get(
      `spaces/${SPACE_ID}/assets/${signedResponseId}/finish_upload`
    );
    return data;
  } catch (error) {
    console.error('Error finalizing upload:', error);
    return null;
  }
}

/**
 * Upload an asset to Storyblok (3-step process)
 */
export async function uploadAsset(
  imageUrl: string,
  filename: string,
  dimensions: string = '1024x768',
  assetFolderId?: number
): Promise<any | null> {
  try {
    // Fetch the image data
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();

    // Step 1: Get signed response with actual dimensions and folder
    const signedResponse = await getSignedResponse(filename, dimensions, assetFolderId);
    if (!signedResponse) return null;

    // Step 2: Upload to signed URL
    const uploadSuccess = await uploadToSignedUrl(signedResponse, arrayBuffer);
    if (!uploadSuccess) return null;

    // Step 3: Finalize upload and get complete asset data
    const finalResult = await finalizeUpload(signedResponse.id);
    if (!finalResult) return null;

    console.log(`✅ Successfully uploaded asset: ${finalResult.filename}`);
    return finalResult; // Return the complete asset data, not just filename
  } catch (error) {
    console.error(`Error uploading asset ${filename}:`, error);
    return null;
  }
}

/**
 * Create a new story in Storyblok
 */
export async function createStory(
  name: string,
  slug: string,
  content: any,
  parentId?: number
): Promise<StoryblokStory | null> {
  try {
    const api = getStoryblokApi();

    const storyData = {
      story: {
        name,
        slug,
        content,
        parent_id: parentId || 0,
      },
    };

    const { data } = await (api as any).post(`spaces/${SPACE_ID}/stories`, storyData);

    if (data && data.story) {
      console.log(`✅ Successfully created story: ${name}`);
      return data.story as StoryblokStory;
    }

    return null;
  } catch (error) {
    console.error(`Error creating story ${name}:`, error);
    return null;
  }
}

/**
 * Get folder by name
 */
export async function getFolderByName(folderName: string): Promise<any> {
  try {
    const api = getStoryblokApi();
    const { data } = await (api as any).get(`spaces/${SPACE_ID}/stories`, {
      is_folder: true,
      per_page: 100,
    });

    const folder = data.stories?.find(
      (story: any) => story.name.toLowerCase() === folderName.toLowerCase() && story.is_folder
    );

    return folder || null;
  } catch (error) {
    console.error(`Error fetching folder '${folderName}':`, error);
    return null;
  }
}

/**
 * Check if a slug exists in Storyblok using Management API
 */
export async function slugExists(slug: string): Promise<boolean> {
  try {
    const api = getStoryblokApi();

    // Check for the full slug
    const { data: fullSlugData } = await (api as any).get(`spaces/${SPACE_ID}/stories`, {
      by_slugs: slug,
    });

    const fullSlugExists = fullSlugData.stories && fullSlugData.stories.length > 0;

    // Also check for just the slug part (without folder prefix)
    const slugPart = slug.includes('/') ? slug.split('/').pop() : slug;
    let slugPartExists = false;

    if (slugPart && slugPart !== slug) {
      const { data: slugPartData } = await (api as any).get(`spaces/${SPACE_ID}/stories`, {
        by_slugs: slugPart,
      });
      slugPartExists = slugPartData.stories && slugPartData.stories.length > 0;
    }

    return fullSlugExists || slugPartExists;
  } catch (error: any) {
    console.error(`Error checking slug '${slug}':`, error);
    return false;
  }
}
