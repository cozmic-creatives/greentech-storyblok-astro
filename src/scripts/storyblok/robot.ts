import { createClaudeClient } from '../../utils/claude.ts';

const SYSTEM_PROMPT = `You are a skilled content writer with expertise in injection molding technologies, specializing in creating engaging, conversational content that feels natural and human. Your writing style is:

TONE & VOICE:
- Conversational but professional - like an expert friend explaining complex topics
- Natural flow that's easy to read and engaging
- Avoid robotic, overly formal, or AI-sounding language
- Use active voice and relatable analogies when appropriate
- Write as if speaking directly to the reader

TECHNICAL EXPERTISE:
- Deep understanding of injection molding processes, equipment, and industry terminology
- Strong knowledge of manufacturing, plastic materials, and industrial automation
- Ability to make complex technical concepts accessible and interesting

CONTENT APPROACH:
1. Lead with value - what's in it for the reader?
2. Use storytelling elements to make technical content engaging
3. Include practical insights and real-world applications
4. Break down complex concepts into digestible, relatable parts
5. End with actionable takeaways or next steps

FORMAT GUIDELINES:
- Use markdown formatting (H2-H6 for headings, - for bullets, etc.)
- NEVER use H1 (#) - reserved for article titles
- Structure content with compelling headings that promise value
- Use bullet points and numbered lists for clarity
- Keep paragraphs concise and scannable
- Include transition phrases for smooth flow

COMPANY CONTEXT: 
You're writing for GreenTech, a company that imports, installs, and services best-in-class European-designed plastics machinery and ancillary equipment. Our expert sales team guides customers from machine selection and project planning through to commissioning. We support customers across Southern and East African regions, helping manufacturers achieve their production goals with reliable, high-quality equipment.`;

const claude = createClaudeClient();

export async function improveContent(content: string): Promise<string> {
  const prompt = `Transform this WordPress HTML content into engaging, conversational writing that flows naturally while maintaining technical accuracy. Write like a knowledgeable friend explaining injection molding concepts - professional but approachable.

FORMATTING REQUIREMENTS:
- Convert HTML to clean markdown format
- NEVER use H1 headers (#) - article title is already H1
- Start with H2 (##) as largest heading in body
- Use H2-H6, bullet points, numbered lists appropriately
- Preserve original content length (short stays short, detailed stays detailed)

CONTENT FOCUS:
- Natural, conversational tone (avoid robotic AI language)
- Engaging flow that keeps readers interested  
- Clear value propositions for the reader
- Practical insights and real-world applications
- Smooth transitions between ideas
- Match original article's scope and depth

TAG GENERATION:
At the end, include relevant tags in this exact format:
<tags>InjectionMolding,Manufacturing,PlasticProcessing,ProductionEfficiency,QualityControl,TechnicalInnovation</tags>

Use tags related to: injection molding, manufacturing, sustainability, materials, processes, business benefits, specific technologies mentioned.

WORDPRESS HTML CONTENT:
${content}

OUTPUT: Return improved markdown content followed by tags.`;

  return await claude.generateText(prompt, SYSTEM_PROMPT);
}

export async function extractTags(content: string): Promise<string> {
  const tagMatch = content.match(/<tags>(.*?)<\/tags>/);
  return tagMatch ? tagMatch[1] : '';
}

export async function removeTagsFromContent(content: string): Promise<string> {
  return content.replace(/<tags>.*?<\/tags>/g, '').trim();
}

export async function improveTitle(title: string, contentPreview: string): Promise<string> {
  const prompt = `Create an improved, engaging title for this injection molding technology article.

REQUIREMENTS:
- Maximum 60 characters for optimal SEO
- Professional and captivating
- Clearly communicate the main value/benefit
- Use action words and benefit-focused language
- Target manufacturing professionals

EXAMPLES OF GOOD TITLES:
- "5 Ways to Boost Injection Molding Efficiency"
- "New Recycling Tech Cuts Costs by 40%"
- "Smart Dosing Systems: Game-Changer for Quality"

Original Title: "${title}"

Article Content Preview:
${contentPreview.substring(0, 500)}...

Return ONLY the improved title (under 60 chars) - no formatting, quotes, or extra text.`;

  const improvedTitle = await claude.generateText(prompt, SYSTEM_PROMPT);
  return improvedTitle.replace(/^#+\s*/, '').replace(/['"]/g, '').trim();
}

export async function generateSummary(content: string): Promise<string> {
  const prompt = `Create a compelling meta description for this injection molding article.

REQUIREMENTS:
- Exactly 150-160 characters for optimal SEO
- Include main benefit or value proposition
- Use active voice and compelling language
- Target manufacturing professionals
- Include a call-to-action phrase

GOOD EXAMPLES:
- "Discover how smart dosing systems improve injection molding quality by 30%. Learn the key benefits and implementation tips from GreenTech experts."
- "Boost your plastic recycling efficiency with NGR technology. See how 27 production lines transformed manufacturing operations worldwide."

Article Content:
${content.substring(0, 800)}...

Return ONLY the meta description (150-160 chars) - no quotes or extra text.`;

  const summary = await claude.generateText(prompt, SYSTEM_PROMPT);
  return summary.replace(/['"]/g, '').trim().substring(0, 160);
}

export async function improveWordPressPost(post: { title: string; content: string }) {
  console.log(`🤖 Improving: "${post.title}"`);

  const [rawContent, title] = await Promise.all([
    improveContent(post.content),
    improveTitle(post.title, post.content),
  ]);

  // Extract tags and clean content
  const tags = await extractTags(rawContent);
  const content = await removeTagsFromContent(rawContent);
  const summary = await generateSummary(content);

  return { title, content, summary, tags };
}
