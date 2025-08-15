/**
 * Convert content to Storyblok rich text format
 * Supports headings, lists, paragraphs, and inline formatting (bold, italic, code) in TipTap editor format
 */

/**
 * Parse inline markdown formatting (bold, italic, code) within text
 */
function parseInlineFormatting(text: string): any[] {
  const content: any[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Find the next formatting marker
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const italicMatch = remaining.match(/\*(.*?)\*/);
    const codeMatch = remaining.match(/`(.*?)`/);

    // Find which comes first
    const matches = [
      { match: boldMatch, type: 'bold', marker: '**' },
      { match: italicMatch, type: 'italic', marker: '*' },
      { match: codeMatch, type: 'code', marker: '`' },
    ]
      .filter(m => m.match)
      .sort((a, b) => a.match!.index! - b.match!.index!);

    if (matches.length === 0) {
      // No more formatting, add remaining text
      if (remaining.trim()) {
        content.push({ type: 'text', text: remaining });
      }
      break;
    }

    const firstMatch = matches[0];
    const match = firstMatch.match!;

    // Add text before the match
    if (match.index! > 0) {
      const beforeText = remaining.substring(0, match.index);
      if (beforeText.trim()) {
        content.push({ type: 'text', text: beforeText });
      }
    }

    // Add the formatted text
    const formattedText = match[1];
    if (formattedText.trim()) {
      if (firstMatch.type === 'bold') {
        content.push({ type: 'text', text: formattedText, marks: [{ type: 'bold' }] });
      } else if (firstMatch.type === 'italic') {
        content.push({ type: 'text', text: formattedText, marks: [{ type: 'italic' }] });
      } else if (firstMatch.type === 'code') {
        content.push({ type: 'text', text: formattedText, marks: [{ type: 'code' }] });
      }
    }

    // Continue with the rest of the text
    remaining = remaining.substring(match.index! + match[0].length);
  }

  return content.length > 0 ? content : [{ type: 'text', text: text }];
}

/**
 * Decode HTML entities to their proper characters
 */
function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&#8211;': '-', // en dash
    '&#8212;': '-', // em dash  
    '&#8216;': "'", // left single quotation mark
    '&#8217;': "'", // right single quotation mark
    '&#8218;': "'", // single low-9 quotation mark
    '&#8220;': '"', // left double quotation mark
    '&#8221;': '"', // right double quotation mark
    '&#8222;': '"', // double low-9 quotation mark
    '&#8230;': '...', // horizontal ellipsis
    '&#8242;': "'", // prime
    '&#8243;': '"', // double prime
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  let decoded = text;
  for (const [entity, character] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), character);
  }
  
  // Handle any remaining numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });
  
  return decoded;
}

/**
 * Convert HTML content to Storyblok rich text format
 */
export function convertToRichText(content: string): any {
  // First decode HTML entities
  let cleanContent = decodeHtmlEntities(content);
  
  // Handle specific HTML elements and convert to rich text
  const richTextContent: any[] = [];
  
  // Split by paragraphs and process each
  const sections = cleanContent.split(/(?=<p[^>]*>)|(?=<h[1-6][^>]*>)|(?=<iframe)|(?=<ul>)|(?=<ol>)/i).filter(section => section.trim());
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    if (!trimmedSection) continue;
    
    // Handle iframes (YouTube, etc.)
    if (trimmedSection.match(/<iframe[^>]*>/i)) {
      const srcMatch = trimmedSection.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        richTextContent.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `[Embedded Content: ${srcMatch[1]}]`,
              marks: [{ type: 'italic' }]
            }
          ],
        });
      }
      continue;
    }
    
    // Handle headings
    const headingMatch = trimmedSection.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i);
    if (headingMatch) {
      const level = parseInt(headingMatch[1]);
      const headingText = headingMatch[2].replace(/<[^>]*>/g, '').trim();
      if (headingText) {
        richTextContent.push({
          type: 'heading',
          attrs: { level: Math.min(level, 3) }, // Limit to h1-h3
          content: [{ type: 'text', text: headingText }],
        });
      }
      continue;
    }
    
    // Handle links within paragraphs
    if (trimmedSection.includes('<a ')) {
      const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
      let processedText = trimmedSection;
      const links: Array<{ url: string; text: string; match: string }> = [];
      
      let linkMatch;
      while ((linkMatch = linkRegex.exec(trimmedSection)) !== null) {
        links.push({
          url: linkMatch[1],
          text: linkMatch[2].replace(/<[^>]*>/g, '').trim(),
          match: linkMatch[0]
        });
      }
      
      // For now, convert links to simple text with URL
      for (const link of links) {
        processedText = processedText.replace(link.match, `${link.text} (${link.url})`);
      }
      
      // Clean remaining HTML tags
      processedText = processedText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      if (processedText) {
        richTextContent.push({
          type: 'paragraph',
          content: parseInlineFormatting(processedText),
        });
      }
      continue;
    }
    
    // Handle regular paragraphs
    const paragraphText = trimmedSection.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (paragraphText && paragraphText !== '&nbsp;') {
      richTextContent.push({
        type: 'paragraph',
        content: parseInlineFormatting(paragraphText),
      });
    }
  }

  // Fallback if no content was parsed
  if (richTextContent.length === 0) {
    const fallbackText = cleanContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (fallbackText) {
      richTextContent.push({
        type: 'paragraph',
        content: parseInlineFormatting(fallbackText),
      });
    }
  }

  return {
    type: 'doc',
    content: richTextContent,
  };
}
