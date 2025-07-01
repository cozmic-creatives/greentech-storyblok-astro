import { config } from 'dotenv';
import { createClaudeClient } from '../../utils/claude.js';
import { writeFileSync } from 'fs';
import { load } from 'cheerio';

// Load environment variables
config();

// Configuration
const BASE_URL = 'https://greentechmachinery.co.za';
const OUTPUT_FILE = 'portfolio-extraction-data.json';

// Portfolio pages to extract
const PORTFOLIO_PAGES = [
  '/portfolio/engel',
  // '/portfolio/automotive',
  // '/portfolio/injection-moulding',
  // '/portfolio/ancillaries',
  // '/portfolio/automation-grippers',
  // '/portfolio/extrusion',
  // '/portfolio/wintec',
  // '/portfolio/battenfeld-cincinnati',
  // '/portfolio/motan',
  // '/portfolio/hb-therm',
  // '/portfolio/tampoprint',
  // '/portfolio/tig',
  // '/portfolio/tantec',
  // Add more portfolio pages as needed
];

interface TabData {
  title: string;
  content: string;
}

interface PortfolioData {
  url: string;
  title: string;
  slug: string;
  introText: string;
  tabs: {
    tabTitles: string[];
    tabItems: TabData[];
  };
  extractedAt: string;
}

interface ExtractionResult {
  success: boolean;
  data: PortfolioData[];
  errors: string[];
}

/**
 * Fetch HTML content from a URL
 */
async function fetchPageContent(url: string): Promise<string | null> {
  try {
    console.log(`📄 Fetching: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    return null;
  }
}

/**
 * Extract the page title from HTML
 */
function extractPageTitle($: ReturnType<typeof load>): string {
  // Try different selectors for title
  const titleSelectors = ['h1', '.page-title', '.entry-title', 'title'];

  for (const selector of titleSelectors) {
    const title = $(selector).first().text().trim();
    if (title && title !== 'WordPress' && !title.includes('–')) {
      return title;
    }
  }

  return 'Untitled Page';
}

/**
 * Extract introduction text from the intro section
 */
function extractIntroText($: ReturnType<typeof load>): string {
  const mainContent = $('#page-content');
  if (!mainContent.length) {
    console.warn('⚠️  Main content container (#page-content) not found');
    return '';
  }

  // Look for the intro section with specific WordPress classes
  const introSection = mainContent.find('section.l-section.wpb_row, .l-section.wpb_row').first();

  if (!introSection.length) {
    console.warn('⚠️  Intro section (.l-section.wpb_row) not found');
    return '';
  }

  // Extract text from the intro section, cleaning up HTML
  let introText = '';

  // Get main heading (h1, h2)
  const heading = introSection.find('h1, h2').first().text().trim();
  if (heading) {
    introText += heading + '\n\n';
  }

  // Get all paragraph text
  const paragraphs = introSection
    .find('p')
    .map((_, el) => $(el).text().trim())
    .get();
  introText += paragraphs.filter(p => p.length > 10).join('\n\n');

  return introText.trim();
}

/**
 * Extract tabs data from the tabs section
 */
function extractTabsData($: ReturnType<typeof load>): { tabTitles: string[]; tabItems: TabData[] } {
  const mainContent = $('#page-content');
  if (!mainContent.length) {
    console.warn('⚠️  Main content container (#page-content) not found');
    return { tabTitles: [], tabItems: [] };
  }

  // Look for the w-tabs container
  const tabsContainer = mainContent.find('.w-tabs').first();

  if (!tabsContainer.length) {
    console.warn('⚠️  Tabs container (.w-tabs) not found');
    return { tabTitles: [], tabItems: [] };
  }

  const tabTitles: string[] = [];
  const tabItems: TabData[] = [];

  // Extract tab titles from .w-tabs-list .w-tabs-item .w-tabs-item-title
  tabsContainer.find('.w-tabs-list .w-tabs-item .w-tabs-item-title').each((_, el) => {
    const title = $(el).text().trim();
    if (title) {
      tabTitles.push(title);
    }
  });

  // Extract tab content from .w-tabs-sections .w-tabs-section
  tabsContainer.find('.w-tabs-sections .w-tabs-section').each((index, el) => {
    const $section = $(el);

    // Get the title from the corresponding tab or section header
    let title = tabTitles[index] || '';
    if (!title) {
      // Fallback: try to get title from section header
      const sectionTitle = $section.find('.w-tabs-section-title').text().trim();
      title = sectionTitle || `Tab ${index + 1}`;
    }

    // Extract content from the section, focusing on text content
    const contentDiv = $section.find('.w-tabs-section-content');
    let content = '';

    // Get headings and paragraphs, maintaining structure
    contentDiv.find('h1, h2, h3, h4, h5, h6, p').each((_, textEl) => {
      const text = $(textEl).text().trim();
      if (text && text.length > 5) {
        // Add extra spacing for headings
        const tagName = $(textEl).prop('tagName').toLowerCase();
        if (tagName.match(/h[1-6]/)) {
          content += '\n' + text + '\n';
        } else {
          content += text + '\n\n';
        }
      }
    });

    // If no structured content found, get all text
    if (!content.trim()) {
      content = contentDiv.text().trim();
    }

    if (content.trim()) {
      tabItems.push({
        title,
        content: content.trim(),
      });
    }
  });

  return { tabTitles, tabItems };
}

/**
 * Use AI to clean and structure the extracted data
 */
async function cleanDataWithAI(rawData: Partial<PortfolioData>): Promise<PortfolioData> {
  const claude = createClaudeClient();

  const systemPrompt = `You are a data cleaning specialist for content migration. Your ONLY task is to clean and format the provided content while maintaining the exact JSON structure.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no explanations, no markdown, no extra text
2. Clean HTML artifacts, excessive whitespace, and navigation clutter
3. Keep content concise but informative
4. Maintain the exact structure provided
5. Remove any "Contact us", cookie notices, or navigation text

EXPECTED JSON STRUCTURE:
{
  "title": "cleaned title",
  "introText": "cleaned intro text with proper paragraphs",
  "tabs": {
    "tabTitles": ["title1", "title2"],
    "tabItems": [
      {"title": "title1", "content": "cleaned content"},
      {"title": "title2", "content": "cleaned content"}
    ]
  }
}`;

  const prompt = `Clean this portfolio data and return ONLY the JSON:

Raw Data:
- Title: ${rawData.title}
- Intro: ${rawData.introText}
- Tab Titles: ${JSON.stringify(rawData.tabs?.tabTitles || [])}
- Tab Items: ${JSON.stringify(rawData.tabs?.tabItems || [], null, 2)}

Return cleaned JSON only:`;

  try {
    const response = await claude.generateText(prompt, systemPrompt);

    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : response.trim();

    try {
      const cleanedData = JSON.parse(jsonString);

      // Validate structure
      if (!cleanedData.title || !cleanedData.introText || !cleanedData.tabs) {
        throw new Error('Invalid structure in AI response');
      }

      console.log('✅ AI cleaning successful');
      return {
        url: rawData.url || '',
        title: cleanedData.title,
        slug: rawData.slug || '',
        introText: cleanedData.introText,
        tabs: {
          tabTitles: cleanedData.tabs.tabTitles || [],
          tabItems: cleanedData.tabs.tabItems || [],
        },
        extractedAt: new Date().toISOString(),
      };
    } catch (parseError) {
      console.warn('⚠️  AI response was not valid JSON, attempting manual cleaning...');
      console.log('AI Response:', response.substring(0, 200) + '...');

      // Fallback: manual cleaning
      return manualCleanData(rawData);
    }
  } catch (error) {
    console.error('❌ Error with AI cleaning:', error);
    return manualCleanData(rawData);
  }
}

/**
 * Fallback manual cleaning function
 */
function manualCleanData(rawData: Partial<PortfolioData>): PortfolioData {
  console.log('🔧 Applying manual cleaning...');

  // Basic cleaning function
  const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Clean double newlines
      .replace(/Contact.*?us.*?\n?/gi, '') // Remove contact prompts
      .replace(/Find out more.*?\n?/gi, '') // Remove "find out more"
      .trim();
  };

  const cleanTitle = rawData.title ? cleanText(rawData.title) : 'Untitled';
  const cleanIntro = rawData.introText ? cleanText(rawData.introText) : '';

  // Clean tab items
  const cleanTabItems = (rawData.tabs?.tabItems || []).map(item => ({
    title: cleanText(item.title),
    content: cleanText(item.content),
  }));

  return {
    url: rawData.url || '',
    title: cleanTitle,
    slug: rawData.slug || '',
    introText: cleanIntro,
    tabs: {
      tabTitles: rawData.tabs?.tabTitles || [],
      tabItems: cleanTabItems,
    },
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Extract data from a single portfolio page
 */
async function extractPortfolioPage(pagePath: string): Promise<PortfolioData | null> {
  const fullUrl = `${BASE_URL}${pagePath}`;
  const html = await fetchPageContent(fullUrl);

  if (!html) {
    return null;
  }

  const $ = load(html);

  // Extract raw data
  const rawData: Partial<PortfolioData> = {
    url: fullUrl,
    title: extractPageTitle($),
    slug: pagePath.split('/').pop() || '',
    introText: extractIntroText($),
    tabs: extractTabsData($),
  };

  console.log(`📊 Raw extraction completed for ${pagePath}`);
  console.log(`   - Title: ${rawData.title}`);
  console.log(`   - Intro length: ${rawData.introText?.length || 0} chars`);
  console.log(`   - Tabs found: ${rawData.tabs?.tabItems.length || 0}`);

  // Clean data with AI
  console.log(`🤖 Cleaning data with AI...`);
  const cleanedData = await cleanDataWithAI(rawData);

  return cleanedData;
}

/**
 * Main extraction function
 */
async function extractPortfolioData(): Promise<ExtractionResult> {
  console.log('🚀 Starting portfolio data extraction...\n');

  const results: PortfolioData[] = [];
  const errors: string[] = [];

  for (const pagePath of PORTFOLIO_PAGES) {
    try {
      const data = await extractPortfolioPage(pagePath);
      if (data) {
        results.push(data);
        console.log(`✅ Successfully extracted data from ${pagePath}\n`);
      } else {
        const error = `Failed to extract data from ${pagePath}`;
        errors.push(error);
        console.log(`❌ ${error}\n`);
      }

      // Add delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      const errorMsg = `Error processing ${pagePath}: ${error}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}\n`);
    }
  }

  return {
    success: results.length > 0,
    data: results,
    errors,
  };
}

/**
 * Save results to JSON file
 */
function saveResults(results: ExtractionResult): void {
  const output = {
    extractedAt: new Date().toISOString(),
    totalPages: PORTFOLIO_PAGES.length,
    successfulExtractions: results.data.length,
    errors: results.errors,
    data: results.data,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`💾 Results saved to ${OUTPUT_FILE}`);
}

/**
 * Run the extraction
 */
async function runExtraction(): Promise<void> {
  try {
    console.log('Portfolio Data Extractor');
    console.log('========================\n');

    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable is required');
    }

    const results = await extractPortfolioData();

    saveResults(results);

    console.log('\n📊 Extraction Summary:');
    console.log(`   - Total pages: ${PORTFOLIO_PAGES.length}`);
    console.log(`   - Successful: ${results.data.length}`);
    console.log(`   - Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log(`\n✅ Extraction complete! Check ${OUTPUT_FILE} for results.`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExtraction();
}

export { runExtraction, extractPortfolioData };
export type { PortfolioData };
