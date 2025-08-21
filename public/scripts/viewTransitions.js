/**
 * View Transitions Event Handlers
 * Manages loading indicator, scroll behavior, and other transitions
 */

// Intercept Astro's client-side navigation to prevent port 8080 in URLs
function interceptAstroNavigation() {
  // Always intercept on greentechmachinery.co.za or localhost with port 8080
  const shouldIntercept = (
    window.location.hostname === 'greentechmachinery.co.za' || 
    window.location.port === '8080'
  );
  
  if (shouldIntercept) {
    console.log('🔧 Intercepting Astro navigation for URL cleanup on:', window.location.hostname + ':' + (window.location.port || 'default'));
    
    // Override history.pushState to clean URLs during client-side navigation
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      if (typeof url === 'string') {
        const originalUrl = url;
        // Remove any port 8080 references
        url = url.replace(/greentechmachinery\.co\.za:8080/g, 'greentechmachinery.co.za');
        url = url.replace(/localhost:8080/g, 'localhost');
        
        if (originalUrl !== url) {
          console.log('🧹 Cleaned navigation URL:', originalUrl, '→', url);
        }
      }
      return originalPushState.call(this, state, title, url);
    };
    
    // Override history.replaceState to clean URLs
    const originalReplaceState = history.replaceState;
    history.replaceState = function(state, title, url) {
      if (typeof url === 'string') {
        const originalUrl = url;
        url = url.replace(/greentechmachinery\.co\.za:8080/g, 'greentechmachinery.co.za');
        url = url.replace(/localhost:8080/g, 'localhost');
        
        if (originalUrl !== url) {
          console.log('🧹 Cleaned replaceState URL:', originalUrl, '→', url);
        }
      }
      return originalReplaceState.call(this, state, title, url);
    };
  }
}

// This runs on initial page load and after each page transition
document.addEventListener('astro:page-load', () => {
  console.log('Page transition complete!');
  
  // Handle Crisp chat after page transition
  if (window.CRISP_WEBSITE_ID && window.$crisp && window.$crisp.push) {
    // If Crisp exists but needs to be refreshed after navigation
    console.log('Refreshing Crisp chat after navigation');
    
    // Reset session to ensure widget is properly displayed after navigation
    window.$crisp.push(['do', 'session:reset']);
  }
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

// Initialize URL interception immediately when script loads
interceptAstroNavigation();
