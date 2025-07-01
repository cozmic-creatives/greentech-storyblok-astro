import { config } from 'dotenv';
import { createClaudeClient } from '../../utils/claude.js';

// Load environment variables
config();

/**
 * Test the Claude API connection
 */
async function testClaudeConnection(): Promise<boolean> {
  try {
    console.log('🤖 Testing Claude AI connection...');

    if (!process.env.CLAUDE_API_KEY) {
      console.error('❌ CLAUDE_API_KEY environment variable not found');
      return false;
    }

    const claude = createClaudeClient();
    const response = await claude.generateText('Say "Hello, portfolio extractor test successful!"');

    console.log('✅ Claude AI response:', response.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error('❌ Claude AI connection failed:', error);
    return false;
  }
}

/**
 * Test fetching a sample page
 */
async function testPageFetch(url: string): Promise<boolean> {
  try {
    console.log(`🌐 Testing page fetch: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`✅ Successfully fetched page (${html.length} characters)`);

    // Check for key elements
    const hasMainContent = html.includes('id="page-content"');
    const hasTabs = html.includes('w-tabs');

    console.log(`   - Has main content container: ${hasMainContent ? '✅' : '❌'}`);
    console.log(`   - Has tabs structure: ${hasTabs ? '✅' : '❌'}`);

    return response.ok;
  } catch (error) {
    console.error(`❌ Page fetch failed for ${url}:`, error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests(): Promise<void> {
  console.log('Portfolio Extractor Test Suite');
  console.log('==============================\n');

  const tests = [
    { name: 'Claude AI Connection', test: () => testClaudeConnection() },
    {
      name: 'Sample Page Fetch',
      test: () => testPageFetch('https://greentechmachinery.co.za/portfolio/engel'),
    },
  ];

  let passedTests = 0;

  for (const { name, test } of tests) {
    console.log(`🧪 Running test: ${name}`);
    const passed = await test();

    if (passed) {
      console.log(`✅ Test passed: ${name}\n`);
      passedTests++;
    } else {
      console.log(`❌ Test failed: ${name}\n`);
    }
  }

  console.log('📊 Test Results:');
  console.log(`   - Passed: ${passedTests}/${tests.length}`);
  console.log(`   - Failed: ${tests.length - passedTests}/${tests.length}`);

  if (passedTests === tests.length) {
    console.log('\n🎉 All tests passed! You can now run the portfolio extractor.');
    console.log(
      '   Run: npm run extract-portfolio (or tsx src/scripts/storyblok/portfolio-extractor.ts)'
    );
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before running the extractor.');
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
