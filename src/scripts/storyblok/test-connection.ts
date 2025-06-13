import { getStory, getStoriesInFolder } from './utils.js';

/**
 * Test script to verify Storyblok Management API connection
 */
async function testConnection() {
  console.log('🔧 Testing Storyblok Management API connection...');

  try {
    // Test 1: Try to fetch stories from brands folder
    console.log('\n📁 Test 1: Fetching stories from /brands folder...');
    const brandStories = await getStoriesInFolder('brands/');

    if (brandStories.length > 0) {
      console.log(`✅ Found ${brandStories.length} brand stories:`);
      brandStories.forEach(story => {
        console.log(`  - ${story.name} (${story.full_slug})`);
      });
    } else {
      console.log('📭 No stories found in /brands folder');
    }

    // Test 2: Try to fetch a specific story
    console.log('\n📖 Test 2: Fetching specific story: brands/engel...');
    const engelStory = await getStory('brands/engel');

    if (engelStory) {
      console.log(`✅ Found story: ${engelStory.name}`);
      console.log(`📝 Content keys: ${Object.keys(engelStory.content || {}).join(', ')}`);
    } else {
      console.log('❌ Story not found: brands/engel');
      console.log("💡 This might be expected if the story doesn't exist yet");
    }

    console.log('\n✅ Connection test completed!');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your STORYBLOK_MANAGEMENT_TOKEN in .env');
    console.log('2. Verify the token has read permissions');
    console.log('3. Ensure the space ID (332224) is correct');
  }
}

// Run the test
testConnection();
