import { getStory, getStoriesInFolder, copyContentToStories } from './utils.js';

/**
 * Main function to copy content from source story to target stories
 */
async function copyBrandContent() {
  console.log('🚀 Starting brand content copy process...');

  try {
    // Step 1: Fetch the source story content
    console.log('📖 Fetching source story: /brands/engel');
    const sourceStory = await getStory('brands/engel');

    if (!sourceStory) {
      console.error('❌ Source story not found: /brands/engel');
      console.log('Please check if the story exists and the slug is correct.');
      return;
    }

    console.log(`✅ Source story found: ${sourceStory.name}`);

    // Safe content preview
    const contentPreview = sourceStory.content
      ? JSON.stringify(sourceStory.content).substring(0, 200)
      : 'No content';
    console.log(`📝 Content preview: ${contentPreview}...`);

    // Step 2: Get all stories in the /brands folder
    console.log('📁 Fetching all stories in /brands folder...');
    const allBrandStories = await getStoriesInFolder('brands/');

    if (allBrandStories.length === 0) {
      console.log('📭 No stories found in /brands folder');
      return;
    }

    console.log(`📊 Found ${allBrandStories.length} brand stories total`);

    // Step 3: Filter out the source story to get target stories
    const targetStories = allBrandStories.filter(story => story.full_slug !== 'brands/engel');

    if (targetStories.length === 0) {
      console.log('📭 No target stories found (only source story exists)');
      return;
    }

    console.log(`🎯 Target stories to update (${targetStories.length}):`);
    targetStories.forEach(story => {
      console.log(`  - ${story.name} (${story.full_slug})`);
    });

    // Step 4: Confirm the operation
    console.log(
      `\n⚠️  This will copy content from "${sourceStory.name}" to ${targetStories.length} other brand stories.`
    );
    console.log('⚠️  This operation will overwrite the existing content in the target stories.');

    // For safety, you might want to add a confirmation step here in a real script
    // For now, we'll proceed automatically

    // Step 5: Copy the content
    console.log('\n🔄 Starting content copy...');
    const result = await copyContentToStories(
      sourceStory.content,
      targetStories,
      false // Set to true if you want to publish after update
    );

    // Step 6: Report results
    console.log('\n📊 Copy operation completed!');
    console.log(`✅ Successfully updated: ${result.success.length} stories`);
    console.log(`❌ Failed to update: ${result.failed.length} stories`);

    if (result.success.length > 0) {
      console.log('\n✅ Successfully updated stories:');
      result.success.forEach(story => {
        console.log(`  - ${story.name} (${story.full_slug})`);
      });
    }

    if (result.failed.length > 0) {
      console.log('\n❌ Failed to update stories:');
      result.failed.forEach(story => {
        console.log(`  - ${story.name} (${story.full_slug})`);
      });
    }

    console.log('\n🎉 Process completed!');
  } catch (error) {
    console.error('💥 An error occurred during the copy process:', error);
    console.log('\nPlease check:');
    console.log('1. Your STORYBLOK_MANAGEMENT_TOKEN is set in .env');
    console.log('2. The token has the necessary permissions');
    console.log('3. The story paths are correct');
  }
}

// Run the script
copyBrandContent();
