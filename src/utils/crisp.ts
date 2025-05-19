/**
 * Utility functions for Crisp chat integration
 */

/**
 * Validates if a string is a safe Crisp chat command
 * @param link - The string to validate
 * @returns Whether the string is a safe Crisp chat command
 */
export function isSafeCrispCommand(link: unknown): boolean {
  const isCrispScript = typeof link === 'string' && link.startsWith('$crisp.push');

  return (
    isCrispScript &&
    // Only allow specific safe Crisp commands
    (link.includes('"set", "message:text"') ||
      link.includes('"do", "chat:open"') ||
      link.includes('"do", "chat:show"') ||
      link.includes('"do", "chat:hide"'))
  );
}

/**
 * Sanitizes a Crisp command by removing potentially harmful characters
 * @param command - The Crisp command to sanitize
 * @returns Sanitized Crisp command
 */
export function sanitizeCrispCommand(command: string): string {
  return command.replace(/[<>]/g, '');
}
