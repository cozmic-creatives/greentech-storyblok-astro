import { getStory } from './utils.js';

/**
 * Debug script to inspect the content structure of the ENGEL story
 */
async function debugContent() {
  console.log('🔍 Inspecting ENGEL story content structure...\n');

  try {
    const engelStory = await getStory('brands/engel');

    if (!engelStory) {
      console.log('❌ ENGEL story not found');
      return;
    }

    console.log('📊 Complete Story Object:');
    console.log('All story fields:', Object.keys(engelStory));
    console.log('');

    console.log('📊 Story Overview:');
    console.log(`- Name: ${engelStory.name}`);
    console.log(`- Slug: ${engelStory.full_slug}`);
    console.log(`- ID: ${engelStory.id}`);
    console.log(`- Published: ${engelStory.published}`);
    console.log(`- Content Type: ${engelStory.content?.component || 'N/A'}`);
    console.log('');

    console.log('📝 Content Object:');
    if (engelStory.content === undefined) {
      console.log('⚠️  Content is undefined');
    } else if (engelStory.content === null) {
      console.log('⚠️  Content is null');
    } else if (Object.keys(engelStory.content).length === 0) {
      console.log('⚠️  Content is empty object');
    } else {
      console.log('✅ Content exists:');
      console.log(JSON.stringify(engelStory.content, null, 2));

      if (engelStory.content.body) {
        console.log(`\n🧩 Body field found with ${engelStory.content.body.length} blocks:`);
        engelStory.content.body.forEach((block: any, index: number) => {
          console.log(`  ${index + 1}. ${block.component} (${block._uid})`);
        });
      }
    }

    // Try to fetch with published version
    console.log('\n🔄 Trying to fetch published version...');
    try {
      const { getStoryblokApi } = await import('./utils.js');
      const api = getStoryblokApi();
      const { data } = await api.get(`spaces/${process.env.STORYBLOK_SPACE_ID}/stories`, {
        by_slugs: 'brands/engel',
        version: 'published',
      });

      const publishedStory = data.stories?.[0];
      if (publishedStory && publishedStory.content) {
        console.log('✅ Published version has content:');
        console.log(JSON.stringify(publishedStory.content, null, 2));
      } else {
        console.log('⚠️  Published version also has no content');
      }
    } catch (publishedError) {
      console.log('❌ Error fetching published version:', publishedError.message);
    }
  } catch (error) {
    console.error('💥 Error during debug:', error);
  }
}

// Run the debug
debugContent();
