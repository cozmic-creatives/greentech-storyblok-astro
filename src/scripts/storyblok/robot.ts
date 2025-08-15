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
- Always use markdown formatting (# for headings, - for bullets, etc.)
- Structure content with compelling headings that promise value
- Use bullet points and numbered lists for clarity
- Keep paragraphs concise and scannable
- Include transition phrases for smooth flow

COMPANY CONTEXT: 
You're writing for GreenTech, a company that imports, installs, and services best-in-class European-designed plastics machinery and ancillary equipment. Our expert sales team guides customers from machine selection and project planning through to commissioning. We support customers across Southern and East African regions, helping manufacturers achieve their production goals with reliable, high-quality equipment.`;

const claude = createClaudeClient();

export async function improveContent(content: string): Promise<string> {
  const prompt = `Transform this content into engaging, conversational writing that flows naturally while maintaining all technical accuracy. Make it feel like a knowledgeable friend explaining injection molding concepts - professional but approachable.

Focus on:
- Natural, conversational tone (avoid robotic AI language)
- Engaging flow that keeps readers interested
- Clear value propositions for the reader
- Practical insights and real-world applications
- Smooth transitions between ideas

Format as clean markdown with headings, bullet points, and numbered lists where appropriate.

IMPORTANT: At the end of your response, include relevant tags for this article wrapped in this exact format:
<tags>InjectionMolding,Manufacturing,PlasticProcessing,ProductionEfficiency,QualityControl,TechnicalInnovation</tags>

Use relevant tags related to injection molding, manufacturing, sustainability, materials, processes, or business benefits mentioned in the content.

Original Content:
${content}

Return only the improved content in markdown format followed by the tags.`;

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
  const prompt = `Based on the following article content, please create an improved, more engaging title for this injection molding technology article. The title should be professional, captivating, and clearly communicate the main value or benefit to the reader.

Original Title: ${title}

Article Content Preview:
${contentPreview.substring(0, 500)}...

Return ONLY the improved title as plain text - no markdown formatting, no # symbols, no quotes.`;

  const improvedTitle = await claude.generateText(prompt, SYSTEM_PROMPT);
  return improvedTitle.replace(/^#+\s*/, '').trim();
}

export async function generateSummary(content: string): Promise<string> {
  const prompt = `Please create a compelling meta description/summary for this injection molding technology article. The summary should be 160 characters or less, engaging, and clearly communicate the main value proposition for GreenTech's audience.

Article Content:
${content}

Please return only the summary text without any additional commentary.`;

  const summary = await claude.generateText(prompt, SYSTEM_PROMPT);
  return summary.substring(0, 160);
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
