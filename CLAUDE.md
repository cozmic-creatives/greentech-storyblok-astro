# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Storyblok-powered Astro project for a site called "GreenTech" focused on sustainable plastic solutions. The project uses Storyblok as a headless CMS to manage content and Astro as the frontend framework with React components.

## Environment Setup

The project needs a Storyblok token to function properly. It should be in the `.env` file:

```
STORYBLOK_PREVIEW_TOKEN=your_token_here
```

## Development Commands

- **Start development server**: `npm run dev`
  - This starts the dev server in preview mode with `PUBLIC_ENV=preview`

- **Build for production**: `npm run build:production`
  - Creates a static build with `PUBLIC_ENV=production`

- **Build for preview**: `npm run build:preview` 
  - Creates a server build with `PUBLIC_ENV=preview`

- **Preview build**: `npm run preview`
  - Previews the built site

- **Generate Storyblok Types**: `npm run storyblok:generate-types`
  - Pulls Storyblok components and generates TypeScript type definitions

## Project Architecture

### Key Concepts

1. **Storyblok Integration**:
   - The project uses `@storyblok/astro` to connect with the Storyblok CMS
   - Components are mapped in `astro.config.mjs` under the `components` section
   - The `src/lib/storyblok.ts` file provides utilities for fetching content

2. **Environment Handling**:
   - `PUBLIC_ENV` environment variable controls build mode (preview vs production)
   - In preview mode, the Storyblok visual editor bridge is enabled
   - Production uses static output, while preview uses server-side rendering

3. **Components Architecture**:
   - **Storyblok Components**: Located in `src/storyblok/` - these match the components configured in the Storyblok CMS
   - **UI Components**: Located in `src/components/ui/` - shadcn-style React components using Radix UI
   - **Layout Components**: Handle page structure with `BaseLayout.astro` as the main layout

4. **Page Routing**:
   - Static pages like `index.astro` and `company.astro`
   - Dynamic routes for brands, industries, and solutions with `[param].astro` files

5. **Styling**:
   - Uses Tailwind CSS for styling
   - Custom animations in `src/utils/animations.ts`
   - View transitions for page navigation

## Important Files

- `astro.config.mjs`: Main configuration file for Astro and Storyblok integration
- `src/lib/storyblok.ts`: Utility functions for fetching content from Storyblok
- `src/layouts/BaseLayout.astro`: Main layout component with navigation, footer, and transitions
- `src/components/navigation/Navbar.astro`: Main navigation component with mobile and desktop versions

## Development Workflow

1. Run `npm run dev` to start the development server
2. The site will be available at `https://localhost:4321` (note: uses HTTPS)
3. Changes to Storyblok content will be reflected in real-time in preview mode
4. When creating new Storyblok components:
   - Add them to `astro.config.mjs` in the components section
   - Create corresponding components in the `src/storyblok/` directory

## View Transitions and Third-Party Scripts

When using Astro's view transitions, be aware that:

1. **Scripts don't automatically re-execute on page navigation**:
   - Third-party scripts like analytics, chat widgets, etc. may need to be reinitialized after each transition
   - Use the `astro:page-load` event in viewTransitions.js to reinitialize scripts

2. **Per-page metadata**:
   - SEO metadata, titles, and other page-specific head elements should be defined in each page component
   - Don't rely on BaseLayout for page-specific meta tags when using view transitions

3. **External widgets and iframes**:
   - Chat widgets, comment systems, and other external embeds may need special handling
   - Follow the pattern used for Crisp chat in viewTransitions.js for other similar tools