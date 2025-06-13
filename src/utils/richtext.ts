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

export function convertToRichText(content: string): any {
  const lines = content.split('\n').filter(line => line.trim());
  const richTextContent: any[] = [];

  let i = 0;
  while (i < lines.length) {
    const trimmedLine = lines[i].trim();

    // Skip empty lines
    if (!trimmedLine) {
      i++;
      continue;
    }

    // Headings (## or # format)
    if (trimmedLine.startsWith('##')) {
      richTextContent.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineFormatting(trimmedLine.replace(/^##\s*/, '')),
      });
      i++;
    } else if (trimmedLine.startsWith('#')) {
      richTextContent.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineFormatting(trimmedLine.replace(/^#\s*/, '')),
      });
      i++;
    }
    // Numbered lists (1. 2. 3. format)
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const listItems: any[] = [];

      // Collect all consecutive numbered items
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push({
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: parseInlineFormatting(lines[i].trim().replace(/^\d+\.\s*/, '')),
            },
          ],
        });
        i++;
      }

      richTextContent.push({
        type: 'ordered_list',
        content: listItems,
      });
    }
    // Bullet lists (- or * format)
    else if (/^[-*]\s/.test(trimmedLine)) {
      const listItems: any[] = [];

      // Collect all consecutive bullet items
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        listItems.push({
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: parseInlineFormatting(lines[i].trim().replace(/^[-*]\s*/, '')),
            },
          ],
        });
        i++;
      }

      richTextContent.push({
        type: 'bullet_list',
        content: listItems,
      });
    }
    // Regular paragraphs
    else {
      richTextContent.push({
        type: 'paragraph',
        content: parseInlineFormatting(trimmedLine),
      });
      i++;
    }
  }

  // Fallback if no content was parsed
  if (richTextContent.length === 0) {
    richTextContent.push({
      type: 'paragraph',
      content: parseInlineFormatting(
        content
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      ),
    });
  }

  return {
    type: 'doc',
    content: richTextContent,
  };
}
