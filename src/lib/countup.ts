/**
 * Count-up animation utility
 */

/**
 * Quartic ease-out function for very pronounced deceleration
 */
const easeOutQuart = (t: number): number => {
  return 1 - (1 - t) * (1 - t) * (1 - t) * (1 - t);
};

/**
 * Extracts first number from a string
 */
function extractNumber(text: string): number {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Animates a number from 0 to target value with easing
 */
function animateCount(targetValue: number, element: HTMLElement, duration: number = 3000): void {
  let startTime: number;

  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const currentValue = Math.round(easedProgress * targetValue);

    element.textContent = currentValue.toString();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = targetValue.toString();
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Checks if element is in top 2/3rds of viewport
 */
function isInTopTwoThirds(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const viewportTwoThirds = (window.innerHeight * 2) / 3;
  return rect.top < viewportTwoThirds && rect.bottom > 0;
}

/**
 * Generic scroll-based trigger for elements
 */
export function onScrollTrigger(
  selector: string,
  callback: (element: Element) => void,
  checkFn: (element: Element) => boolean = isInTopTwoThirds
): () => void {
  const elements = Array.from(document.querySelectorAll(selector));
  const triggered = new Set<Element>();

  const checkElements = () => {
    elements.forEach(element => {
      if (!triggered.has(element) && checkFn(element)) {
        triggered.add(element);
        callback(element);
      }
    });
  };

  // Initial check
  checkElements();

  // Check on scroll
  window.addEventListener('scroll', checkElements, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', checkElements);
  };
}

/**
 * Initialize count-up animations for elements with data-countup attribute
 */
export function initCountUp(): void {
  // First pass: set all countup elements to '0' initially
  document.querySelectorAll('[data-countup]').forEach(element => {
    const htmlElement = element as HTMLElement;
    const targetText = htmlElement.getAttribute('data-countup') || '0';
    const targetNumber = extractNumber(targetText);

    if (targetNumber > 0) {
      htmlElement.textContent = '0';
    }
  });

  // Second pass: set up scroll trigger for animations
  onScrollTrigger('[data-countup]', element => {
    const htmlElement = element as HTMLElement;
    const targetText = htmlElement.getAttribute('data-countup') || '0';
    const targetNumber = extractNumber(targetText);

    if (targetNumber === 0) {
      htmlElement.textContent = targetText;
      return;
    }

    // Start animation
    setTimeout(() => {
      animateCount(targetNumber, htmlElement);
    }, 200);
  });
}
