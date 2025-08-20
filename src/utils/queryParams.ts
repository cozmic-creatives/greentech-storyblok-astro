/**
 * Query parameter utilities for client-side navigation
 */

/**
 * Update a single query parameter in the current URL
 * @param key - Parameter key to update
 * @param value - Parameter value (empty string removes the parameter)
 * @param navigate - Whether to navigate to the new URL (default: true)
 */
export function updateQueryParam(key: string, value: string, navigate: boolean = true): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  if (value && value.trim()) {
    params.set(key, value.trim());
  } else {
    params.delete(key);
  }

  const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  
  if (navigate) {
    window.location.href = newUrl;
  }
  
  return newUrl;
}

/**
 * Update multiple query parameters at once
 * @param updates - Object with key-value pairs to update
 * @param navigate - Whether to navigate to the new URL (default: true)
 */
export function updateQueryParams(updates: Record<string, string>, navigate: boolean = true): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  Object.entries(updates).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
  });

  const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  
  if (navigate) {
    window.location.href = newUrl;
  }
  
  return newUrl;
}

/**
 * Get a query parameter value from current URL
 * @param key - Parameter key to retrieve
 */
export function getQueryParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/**
 * Get all query parameters as an object
 */
export function getAllQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}