/**
 * View Transitions Event Handlers
 * Manages loading indicator and scroll behavior during page transitions
 */

// This runs when the page transition has completed (DOM is updated and animation is finished)
document.addEventListener('astro:page-load', () => {
  console.log('Page transition complete!');
});

// Show loading indicator when navigation starts
document.addEventListener('astro:before-preparation', () => {
  console.log('Navigation started - showing loading indicator');
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) loadingIndicator.classList.add('show');
});

// Hide loading indicator when navigation completes
document.addEventListener('astro:after-preparation', () => {
  console.log('Navigation preparation complete - hiding loading indicator');
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) loadingIndicator.classList.remove('show');
});

// This runs right before the new page is swapped in
document.addEventListener('astro:before-swap', event => {
  console.log('About to swap pages');
});

// Reset scroll position after page transitions
document.addEventListener('astro:after-swap', () => {
  console.log('Page swap complete - scrolling to top');
  window.scrollTo({ top: 0, behavior: 'instant' });
});
