/**
 * Extracts bold text from a string that uses markdown-style ** for bold formatting
 * @param text The text to extract bold content from
 * @param removeBoldText Whether to remove the bold markers from the clean text (default: true)
 * @returns An object containing the array of bold text segments and a clean version of the text, or null if no text provided
 */
export function extractBoldText(
  text: string,
  removeBoldText: boolean = true
): { boldTexts: string[] | null; cleanText: string } | null {
  if (!text) return null;

  const boldRegex = /\*\*(.*?)\*\*/g;
  const matches = [...text.matchAll(boldRegex)];

  if (matches.length === 0) return null;

  // Extract the bold text segments
  const boldTexts = matches.map(match => match[1]);

  // Create a clean version of the text with bold markers removed if requested
  let cleanText = text;
  if (removeBoldText) {
    cleanText = text.replace(boldRegex, '');
  }

  return {
    boldTexts,
    cleanText,
  };
}

/**
 * Extracts heading text from a string that uses markdown-style # for heading formatting
 * @param text The text to extract heading content from
 * @param removeHeading Whether to return the clean text without the heading (default: true)
 * @returns Either the heading text (including hash symbols) or the text with heading removed based on removeHeading parameter, or null if no heading found
 */
export function extractHeadingText(
  text: string,
  removeHeading: boolean = true
): { headingText: string; cleanText: string } | null {
  if (!text) return null;

  // Match markdown headings (# Heading, ## Heading, etc.)
  const headingRegex = /^(#{1,6})\s+(.*)$/m;
  const match = text.match(headingRegex);

  if (!match) return null;

  const hashSymbols = match[1];
  const headingContent = match[2].trim();
  const headingText = `${hashSymbols} ${headingContent}`;
  const cleanText = text.replace(headingRegex, '').trim();

  return {
    headingText,
    cleanText,
  };
}
