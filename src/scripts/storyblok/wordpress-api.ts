import { config } from 'dotenv';
import https from 'https';
import { URL } from 'url';

// Load environment variables
config();

// WordPress API configuration
export const WP_API_BASE = 'https://156.38.250.198/wp-json/wp/v2';

// Enhanced logging utilities
export function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function logInfo(message: string): void {
  console.log(`[${formatTimestamp()}] ℹ️  ${message}`);
}

export function logSuccess(message: string): void {
  console.log(`[${formatTimestamp()}] ✅ ${message}`);
}

export function logError(message: string, error?: any): void {
  const errorDetails = error ? ` - ${error.message || error}` : '';
  console.error(`[${formatTimestamp()}] ❌ ${message}${errorDetails}`);
}

export function logWarning(message: string): void {
  console.log(`[${formatTimestamp()}] ⚠️  ${message}`);
}

export function logProgress(current: number, total: number, message: string): void {
  const percentage = Math.round((current / total) * 100);
  console.log(`[${formatTimestamp()}] 🔄 [${percentage}%] ${message} (${current}/${total})`);
}

// WordPress Post interface
export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  date_modified?: string;
  modified?: string;
  date?: string;
  slug: string;
}

/**
 * Shared HTTPS request function for old WordPress server access
 * Handles Host header override that Node.js fetch() cannot do properly
 */
export async function makeWordPressRequest(url: string, returnBinary = false): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const options = {
      hostname: '156.38.250.198', // Direct IP
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        Host: 'greentechmachinery.co.za', // Virtual host header
        'User-Agent': 'WordPress-API-Client/1.0',
      },
      rejectUnauthorized: false, // Ignore SSL certificate issues
    };

    const req = https.request(options, res => {
      if (returnBinary) {
        // For images - return ArrayBuffer
        const chunks: Buffer[] = [];

        res.on('data', chunk => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const buffer = Buffer.concat(chunks);
            resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
          } else {
            logError(`Request failed: ${res.statusCode} ${res.statusMessage}`);
            resolve(null);
          }
        });
      } else {
        // For JSON/text data
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage || '',
              json: () => Promise.resolve(jsonData),
              text: () => Promise.resolve(data),
              headers: res.headers,
            });
          } catch (error) {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage || '',
              json: () => Promise.reject(new Error('Invalid JSON')),
              text: () => Promise.resolve(data),
              headers: res.headers,
            });
          }
        });
      }
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Custom fetch function for WordPress API calls
 */
export async function customFetch(url: string): Promise<any> {
  return makeWordPressRequest(url, false);
}

/**
 * Get total count of WordPress articles from API headers
 */
export async function getWordPressArticleCount(): Promise<number> {
  try {
    logInfo('Getting total WordPress article count...');

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(`${WP_API_BASE}/posts?per_page=1`);

      const options = {
        hostname: '156.38.250.198', // Direct IP
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          Host: 'greentechmachinery.co.za', // Virtual host header
          'User-Agent': 'WordPress-API-Client/1.0',
        },
        rejectUnauthorized: false,
      };

      const req = https.request(options, res => {
        // WordPress API sends total count in X-WP-Total header
        const totalCount = res.headers['x-wp-total'];

        if (totalCount) {
          const count = parseInt(totalCount as string, 10);
          logSuccess(`Found ${count} total WordPress articles`);
          resolve(count);
        } else {
          logWarning('X-WP-Total header not found, counting manually...');
          // Fallback: consume response and count pages
          let data = '';
          res.on('data', chunk => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const posts = JSON.parse(data);
              resolve(posts.length > 0 ? posts.length : 0);
            } catch (error) {
              resolve(0);
            }
          });
        }
      });

      req.on('error', error => {
        logError('Error getting article count', error);
        resolve(0);
      });

      req.end();
    });
  } catch (error) {
    logError('Error getting WordPress article count', error);
    return 0;
  }
}

/**
 * Test connection to WordPress API
 */
export async function testWordPressConnection(): Promise<boolean> {
  try {
    logInfo('Testing connection to WordPress API...');
    logInfo(`Using custom fetch with IP and Host header`);

    const response = await customFetch(`${WP_API_BASE}/posts?per_page=1`);

    logInfo(`Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const posts = await response.json();
      logSuccess(`Connection successful! Found ${posts.length} posts available`);
      return true;
    } else {
      const errorText = await response.text();
      logError(`Connection failed: ${response.status} ${response.statusText}`);
      logError(`Response body: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    logError('Connection test failed', error);
    return false;
  }
}

/**
 * Fetch WordPress posts
 */
export async function fetchWordPressPosts(
  perPage: number = 100,
  offset: number = 0
): Promise<WordPressPost[]> {
  try {
    const response = await customFetch(`${WP_API_BASE}/posts?per_page=${perPage}&offset=${offset}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError('Error fetching WordPress posts', error);
    return [];
  }
}

/**
 * Retry utility function
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        logError(`Operation failed after ${maxRetries} attempts`, error);
        throw error;
      }

      logWarning(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw lastError;
}