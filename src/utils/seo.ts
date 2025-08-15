import type { ISbStoryData } from '@storyblok/astro';
import type { SEOProps } from '../components/SEO.astro';

/**
 * Extract SEO metadata from a Storyblok story
 * @param story The Storyblok story object
 * @param fallbacks Optional fallback values
 * @returns SEO props object
 */
export function extractSEOFromStory(
  story: ISbStoryData<any>,
  fallbacks: Partial<SEOProps> = {}
): SEOProps {
  const content = story.content || {};

  // Extract basic SEO fields from story
  const title = content.seo_title || content.title || story.name || fallbacks.title;
  const description =
    content.seo_description || content.description || content.intro || fallbacks.description;
  const keywords = content.seo_keywords || content.keywords || fallbacks.keywords;

  // Extract image for Open Graph
  const ogImage =
    content.seo_image?.filename ||
    content.featured_image?.filename ||
    content.image?.filename ||
    content.images?.[0]?.filename ||
    fallbacks.openGraph?.image;

  // Generate canonical URL
  const canonical = `${getBaseUrl()}/${story.full_slug}`;

  // Generate structured data based on content type
  const structuredData = generateStructuredData(story, {
    title,
    description,
    image: ogImage,
    url: canonical,
  });

  return {
    title,
    description,
    keywords,
    canonical,
    openGraph: {
      title,
      description,
      image: ogImage,
      url: canonical,
      type: getOpenGraphType(story),
      ...fallbacks.openGraph,
    },
    twitter: {
      title,
      description,
      image: ogImage,
      ...fallbacks.twitter,
    },
    structuredData,
    articleMeta: extractArticleMeta(story),
    ...fallbacks,
  };
}

/**
 * Generate structured data based on story content
 */
function generateStructuredData(story: ISbStoryData<any>, meta: any) {
  const baseUrl = getBaseUrl();
  const content = story.content || {};

  // Default to Organization schema
  let structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GreenTech',
    description:
      'Leading provider of sustainable plastic solutions and innovative recycling technologies.',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/greentech-logo.svg`,
    },
  };

  // Customize based on component type or story structure
  if (
    content.component === 'article' ||
    story.full_slug.includes('blog/') ||
    story.full_slug.includes('news/')
  ) {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.title,
      description: meta.description,
      image: meta.image ? `${baseUrl}${meta.image}` : undefined,
      url: meta.url,
      datePublished: story.created_at,
      dateModified: story.published_at || story.created_at,
      author: {
        '@type': 'Organization',
        name: 'GreenTech',
      },
      publisher: {
        '@type': 'Organization',
        name: 'GreenTech',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/greentech-logo.svg`,
        },
      },
    };
  } else if (content.component === 'product' || story.full_slug.includes('brands/')) {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: meta.title,
      description: meta.description,
      image: meta.image ? `${baseUrl}${meta.image}` : undefined,
      url: meta.url,
      brand: {
        '@type': 'Brand',
        name: 'GreenTech',
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'GreenTech',
      },
    };
  } else if (story.full_slug.includes('solutions/') || story.full_slug.includes('industries/')) {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: meta.title,
      description: meta.description,
      image: meta.image ? `${baseUrl}${meta.image}` : undefined,
      url: meta.url,
      provider: {
        '@type': 'Organization',
        name: 'GreenTech',
      },
      serviceType: 'Sustainable Plastic Solutions',
    };
  }

  return structuredData;
}

/**
 * Determine Open Graph type based on story
 */
function getOpenGraphType(story: ISbStoryData<any>): 'website' | 'article' | 'product' {
  const content = story.content || {};

  if (
    content.component === 'article' ||
    story.full_slug.includes('blog/') ||
    story.full_slug.includes('news/')
  ) {
    return 'article';
  }
  if (content.component === 'product' || story.full_slug.includes('brands/')) {
    return 'product';
  }
  return 'website';
}

/**
 * Extract article metadata if applicable
 */
function extractArticleMeta(story: ISbStoryData<any>) {
  const content = story.content || {};

  if (
    content.component === 'article' ||
    story.full_slug.includes('blog/') ||
    story.full_slug.includes('news/')
  ) {
    // Handle tags that might be a string (comma-separated) or array
    let tags: string[] = [];
    if (content.tags) {
      if (typeof content.tags === 'string') {
        // Split comma-separated string and clean up whitespace
        tags = content.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(content.tags)) {
        tags = content.tags;
      }
    }

    return {
      publishedTime: story.created_at,
      modifiedTime: story.published_at || story.created_at,
      section: content.category || content.section,
      tags,
    };
  }

  return undefined;
}

/**
 * Get base URL for the site
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.SITE_URL || 'https://greentech.matthewbracke.com'; // Updated with actual domain
}

/**
 * Generate page-specific breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  story: ISbStoryData<any>,
  baseUrl: string = getBaseUrl()
) {
  const pathSegments = story.full_slug.split('/').filter(Boolean);

  if (pathSegments.length <= 1) {
    return null; // No breadcrumbs for home page
  }

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: index + 2,
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      item: `${baseUrl}${currentPath}`,
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };
}

/**
 * Generate FAQ structured data from content blocks
 */
export function generateFAQStructuredData(faqBlocks: any[]) {
  if (!faqBlocks || faqBlocks.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqBlocks.map(faq => ({
      '@type': 'Question',
      name: faq.question || faq.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer || faq.content || faq.text,
      },
    })),
  };
}
