# 🚀 GreenTech SEO Implementation Guide

## Overview

This guide covers the comprehensive SEO implementation for the GreenTech Astro + Storyblok website. The new SEO system follows all modern best practices and is designed to help your website rank at the top of search results.

## 🎯 SEO Features Implemented

### ✅ Core SEO Elements

- **Dynamic Page Titles** - Unique, descriptive titles for each page
- **Meta Descriptions** - Compelling descriptions that improve click-through rates
- **Canonical URLs** - Prevents duplicate content issues
- **Keywords Meta Tags** - Targeted keywords for each page
- **Robots Meta Tags** - Controls search engine crawling and indexing

### ✅ Social Media Optimization

- **Open Graph Tags** - Optimized sharing on Facebook, LinkedIn, etc.
- **Twitter Cards** - Enhanced Twitter sharing with images and descriptions
- **Social Media Images** - Automatic image optimization for sharing

### ✅ Structured Data (JSON-LD)

- **Organization Schema** - Company information for search engines
- **Article Schema** - For blog posts and articles
- **Product Schema** - For product/brand pages
- **Service Schema** - For solution and industry pages
- **Breadcrumb Schema** - Navigation structure for search engines

### ✅ Technical SEO

- **Sitemap Generation** - Automatic XML sitemap creation
- **Robots.txt** - Search engine crawling directives
- **Performance Optimization** - DNS prefetch, preconnect for faster loading
- **Mobile-First Design** - Responsive and mobile-optimized

## 📁 File Structure

```
src/
├── components/
│   └── SEO.astro              # Main SEO component
├── utils/
│   └── seo.ts                 # SEO utility functions
├── layouts/
│   └── BaseLayout.astro       # Updated with SEO integration
└── pages/
    ├── index.astro            # Homepage with SEO
    ├── company.astro          # Company page with SEO
    ├── contact.astro          # Contact page with SEO
    ├── privacy-policy.astro   # Privacy page with SEO
    ├── solutions/
    │   └── [solution].astro   # Dynamic solution pages
    ├── industries/
    │   └── [industry].astro   # Dynamic industry pages
    └── brands/
        └── [brand].astro      # Dynamic brand pages

public/
├── robots.txt                 # Search engine directives
├── favicon.svg               # Site favicon
└── greentech-logo.svg        # Company logo for social sharing
```

## 🛠 How to Use

### 1. Basic Usage

Every page now automatically includes SEO optimization. The system extracts data from Storyblok and applies intelligent fallbacks:

```astro
---
import { extractSEOFromStory } from '~/utils/seo';
import { getStoryblokStory } from '~/lib/storyblok';

const story = await getStoryblokStory('your-page-slug');
const seo = extractSEOFromStory(story, {
  title: 'Your Custom Title',
  description: 'Your custom description',
  keywords: 'your, keywords, here',
});
---

<BaseLayout seo={seo}>
  <!-- Your content -->
</BaseLayout>
```

### 2. Storyblok SEO Fields

To maximize SEO effectiveness, add these fields to your Storyblok content types:

#### Recommended Storyblok Fields:

- `seo_title` (Text) - Custom page title
- `seo_description` (Textarea) - Meta description
- `seo_keywords` (Text) - Target keywords
- `seo_image` (Asset) - Social sharing image
- `featured_image` (Asset) - Fallback for social sharing

### 3. Advanced SEO Features

#### Custom Structured Data

```astro
const customStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Your Product Name',
  description: 'Product description',
  // ... more schema properties
};

const seo = extractSEOFromStory(story, {
  structuredData: customStructuredData,
});
```

#### Article Meta (for blog posts)

```astro
const seo = extractSEOFromStory(story, {
  articleMeta: {
    publishedTime: '2024-01-01T00:00:00Z',
    modifiedTime: '2024-01-02T00:00:00Z',
    section: 'Technology',
    tags: ['sustainability', 'plastic', 'recycling'],
  },
});
```

## 🎯 SEO Best Practices

### 1. Title Optimization

- **Length**: 50-60 characters
- **Format**: `Primary Keyword - Secondary Keyword | Brand`
- **Unique**: Every page should have a unique title
- **Descriptive**: Clearly describe the page content

### 2. Meta Description

- **Length**: 150-160 characters
- **Compelling**: Write to encourage clicks
- **Include Keywords**: But avoid keyword stuffing
- **Call-to-Action**: Include action words when appropriate

### 3. Keywords Strategy

- **Primary Keyword**: 1 main keyword per page
- **Secondary Keywords**: 2-3 related keywords
- **Long-tail Keywords**: Include specific phrases
- **Natural Integration**: Keywords should flow naturally

### 4. Image Optimization

- **Alt Text**: Descriptive alt text for all images
- **File Names**: Use descriptive file names
- **Size**: Optimize file sizes for fast loading
- **Format**: Use modern formats (WebP, AVIF when possible)

## 🔧 Configuration

### 1. Update Site URL

Update the site URL in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://your-actual-domain.com',
  // ...
});
```

### 2. Update Base URL

Update the base URL in `src/utils/seo.ts`:

```typescript
function getBaseUrl(): string {
  return process.env.SITE_URL || 'https://your-actual-domain.com';
}
```

### 3. Update Social Media Handles

Update Twitter handles in `src/components/SEO.astro`:

```typescript
const tw = {
  site: '@your_twitter_handle',
  creator: '@your_twitter_handle',
  // ...
};
```

### 4. Update Robots.txt

Update the sitemap URL in `public/robots.txt`:

```
Sitemap: https://your-actual-domain.com/sitemap.xml
```

## 📊 SEO Monitoring

### Tools to Monitor SEO Performance:

1. **Google Search Console** - Track search performance
2. **Google Analytics** - Monitor traffic and user behavior
3. **Google PageSpeed Insights** - Check page loading speed
4. **Lighthouse** - Comprehensive performance audit
5. **Screaming Frog** - Technical SEO audit

### Key Metrics to Track:

- **Organic Traffic** - Visitors from search engines
- **Keyword Rankings** - Position for target keywords
- **Click-Through Rate (CTR)** - Percentage of users who click your results
- **Core Web Vitals** - Page loading performance metrics
- **Crawl Errors** - Issues preventing search engine access

## 🚀 Next Steps

### 1. Content Optimization

- Create high-quality, original content
- Target specific keywords for each page
- Update content regularly
- Add internal linking between related pages

### 2. Technical Improvements

- Implement schema markup for specific content types
- Add breadcrumb navigation
- Optimize images with next-gen formats
- Implement lazy loading for images

### 3. Link Building

- Create valuable content that others want to link to
- Reach out to industry publications
- Guest posting on relevant websites
- Build relationships with industry influencers

### 4. Local SEO (if applicable)

- Add Google My Business listing
- Include local keywords
- Get reviews from customers
- Add location-specific content

## 🔍 Troubleshooting

### Common Issues:

1. **Missing Meta Descriptions**

   - Ensure `seo_description` field is filled in Storyblok
   - Check fallback descriptions in page components

2. **Duplicate Titles**

   - Make sure each page has a unique title
   - Use dynamic titles based on content

3. **Images Not Showing in Social Shares**

   - Verify image URLs are absolute
   - Check image dimensions (recommended: 1200x630px)
   - Test with Facebook Sharing Debugger

4. **Sitemap Not Generating**
   - Ensure `@astrojs/sitemap` is installed
   - Check that `site` is configured in `astro.config.mjs`
   - Verify build process completes successfully

## 📞 Support

For questions about this SEO implementation:

1. Check this guide first
2. Review the code comments in the SEO components
3. Test changes in a development environment
4. Monitor SEO tools for any issues

Remember: SEO is a long-term strategy. Results typically take 3-6 months to show significant improvement. Focus on creating valuable content and following best practices consistently.
