// Shared image optimization utilities for Storyblok images

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'auto';
  width?: number;
  height?: number;
}

export interface ResponsiveBackgroundOptions extends ImageOptimizationOptions {
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
}

export interface ResponsiveBackgroundResult {
  className: string;
  css: string;
  fallbackUrl: string;
}

// Constants - Single source of truth for responsive image configuration
export const DEFAULT_QUALITY = 80;
export const DEFAULT_FORMAT = 'webp';

// Responsive breakpoints (screen widths)
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
  large: 1920,
} as const;

// Default widths for responsive images (image widths)
export const DEFAULT_RESPONSIVE_WIDTHS = [320, 640, 768, 1024] as const;

// Default breakpoints for background images
export const DEFAULT_BACKGROUND_BREAKPOINTS = {
  mobile: RESPONSIVE_BREAKPOINTS.mobile,
  tablet: RESPONSIVE_BREAKPOINTS.tablet,
  desktop: RESPONSIVE_BREAKPOINTS.desktop,
  large: RESPONSIVE_BREAKPOINTS.large,
};

// Generate default sizes attribute from breakpoints
export const DEFAULT_SIZES = [
  `(max-width: ${RESPONSIVE_BREAKPOINTS.mobile}px) 100vw`,
  `(max-width: ${RESPONSIVE_BREAKPOINTS.tablet}px) 75vw`,
  `(max-width: ${RESPONSIVE_BREAKPOINTS.desktop}px) 50vw`,
  '33vw',
].join(', ');

/**
 * Check if URL is a Storyblok image that can be optimized
 */
export function isStoryblokUrl(url: string): boolean {
  return !!(url && url.includes('storyblok') && !url.endsWith('.svg') && !url.startsWith('/'));
}

/**
 * Normalize S3 URLs to standard Storyblok format
 */
export function normalizeStoryblokUrl(url: string): string {
  if (url.includes('s3.amazonaws.com/a.storyblok.com/')) {
    return url.replace('https://s3.amazonaws.com/a.storyblok.com/', 'https://a.storyblok.com/');
  }
  return url;
}

/**
 * Build dimension path for Storyblok image service
 */
export function buildDimensionPath(targetWidth?: number, targetHeight?: number): string {
  if (!targetWidth && !targetHeight) return '/m';

  const w = targetWidth || 0;
  const h = targetHeight || 0;

  // Maintain aspect ratio when only one dimension is specified
  if (targetWidth && !targetHeight) return `/m/${w}x0`;
  if (!targetWidth && targetHeight) return `/m/0x${h}`;
  return `/m/${w}x${h}`;
}

/**
 * Build filter parameters for Storyblok image service
 */
export function buildFilterParams(
  quality: number = DEFAULT_QUALITY,
  format: string = DEFAULT_FORMAT
): string {
  const params: string[] = [];

  if (quality !== 80) params.push(`quality(${quality})`);
  if (format === 'webp') params.push('format(webp)');
  // Don't add format filter for 'auto' - let Storyblok decide

  return params.length > 0 ? `/filters:${params.join(':')}` : '';
}

/**
 * Build optimized Storyblok image URL
 */
export function buildOptimizedUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!isStoryblokUrl(originalUrl)) return originalUrl;

  const { quality = DEFAULT_QUALITY, format = DEFAULT_FORMAT, width, height } = options;

  const normalizedUrl = normalizeStoryblokUrl(originalUrl);
  const dimensionPath = buildDimensionPath(width, height);
  const filterParams = buildFilterParams(quality, format);

  return `${normalizedUrl}${dimensionPath}${filterParams}`;
}

/**
 * Generate optimized URLs for all breakpoints
 */
function generateBreakpointUrls(
  imageUrl: string,
  breakpoints: typeof DEFAULT_BACKGROUND_BREAKPOINTS,
  quality: number,
  format: string
) {
  const urls = {
    mobile: buildOptimizedUrl(imageUrl, { quality, format: 'auto', width: breakpoints.mobile }),
    tablet: buildOptimizedUrl(imageUrl, { quality, format: 'auto', width: breakpoints.tablet }),
    desktop: buildOptimizedUrl(imageUrl, { quality, format: 'auto', width: breakpoints.desktop }),
    large: buildOptimizedUrl(imageUrl, { quality, format: 'auto', width: breakpoints.large }),
    original: buildOptimizedUrl(imageUrl, { quality, format: 'auto' }),
  };

  return urls;
}

/**
 * Generate CSS media query rules for responsive background images
 */
function generateResponsiveCSS(
  className: string,
  urls: ReturnType<typeof generateBreakpointUrls>,
  breakpoints: typeof DEFAULT_BACKGROUND_BREAKPOINTS,
  originalImageUrl: string
): string {
  return `
    .${className} {
      background-image: url(${urls.original}), url(${originalImageUrl});
      background-image: url(${urls.mobile});
    }
    
    @media (min-width: ${breakpoints.mobile + 1}px) {
      .${className} {
        background-image: url(${urls.tablet});
      }
    }
    
    @media (min-width: ${breakpoints.tablet + 1}px) {
      .${className} {
        background-image: url(${urls.desktop});
      }
    }
    
    @media (min-width: ${breakpoints.desktop + 1}px) {
      .${className} {
        background-image: url(${urls.large});
      }
    }
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Generate unique CSS class name from image URL
 */
function generateClassName(imageUrl: string): string {
  const urlHash = imageUrl.split('/').pop()?.split('?')[0] || 'bg';
  return `responsive-bg-${urlHash.replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Generate responsive background CSS data for different screen sizes
 */
export function getResponsiveBackgroundData(
  imageUrl: string | undefined,
  options: ResponsiveBackgroundOptions = {}
): ResponsiveBackgroundResult | null {
  if (!imageUrl || !isStoryblokUrl(imageUrl)) {
    return imageUrl ? { className: '', css: '', fallbackUrl: imageUrl } : null;
  }

  const {
    quality = DEFAULT_QUALITY,
    format = DEFAULT_FORMAT,
    breakpoints = DEFAULT_BACKGROUND_BREAKPOINTS,
  } = options;

  const className = generateClassName(imageUrl);
  const urls = generateBreakpointUrls(imageUrl, breakpoints, quality, format);
  const css = generateResponsiveCSS(className, urls, breakpoints, imageUrl);

  return {
    className,
    css,
    fallbackUrl: urls.mobile,
  };
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcset(
  originalUrl: string,
  widths: number[],
  options: ImageOptimizationOptions = {}
): string {
  const { quality = DEFAULT_QUALITY, format = DEFAULT_FORMAT, height } = options;

  return widths
    .map(w => `${buildOptimizedUrl(originalUrl, { quality, format, width: w, height })} ${w}w`)
    .join(', ');
}