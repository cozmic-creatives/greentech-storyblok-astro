/**
 * View Transitions Event Handlers
 * Manages loading indicator, scroll behavior, and other transitions
 */

// Fix URL generation to remove port 8080 from client-side navigation
function fixNavigationURLs() {
  // Override URL construction for client-side navigation
  if (window.location.port === '8080' && window.location.hostname === 'greentechmachinery.co.za') {
    // Replace any URLs that include port 8080 with clean URLs
    const links = document.querySelectorAll('a[href*=":8080"]');
    links.forEach(link => {
      const cleanUrl = link.href.replace(':8080', '');
      link.href = cleanUrl;
    });
    
    // Fix form actions that might include the port
    const forms = document.querySelectorAll('form[action*=":8080"]');
    forms.forEach(form => {
      const cleanAction = form.action.replace(':8080', '');
      form.action = cleanAction;
    });
  }
}

// This runs on initial page load and after each page transition
document.addEventListener('astro:page-load', () => {
  console.log('Page transition complete!');
  
  // Fix URLs that might have port 8080
  fixNavigationURLs();
  
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
  
  // Fix any new URLs that were just loaded
  setTimeout(fixNavigationURLs, 100);
});

// Run immediately when script loads
document.addEventListener('DOMContentLoaded', fixNavigationURLs);

// Also run immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixNavigationURLs);
} else {
  fixNavigationURLs();
}
