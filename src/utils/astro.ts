/**
 * Storyblok Component Rendering Utilities
 *
 * This file contains utilities for processing and rendering Storyblok components
 * with a hybrid server/client approach. The system works as follows:
 *
 * 1. Component Processing
 *    - Components are categorized as either server-renderable or client-only
 *    - The processContentItems function separates these components
 *
 * 2. Server-Side Rendering
 *    - Server-renderable components are pre-rendered to HTML strings
 *    - This improves performance and SEO
 *
 * 3. Client-Side Hydration
 *    - Client-only components are sent to the browser for rendering
 *    - Examples include interactive components like galleries
 *
 * 4. Content Maps
 *    - Rendered HTML is stored in a map of component IDs to HTML strings
 *    - These maps are passed to wrapper components that handle both
 *      server-rendered and client-rendered content
 *
 * Usage:
 * 1. Process items with processContentItems()
 * 2. Create content map with createContentMap() or createItemContentMap()
 * 3. Pass to a wrapper component that can handle both rendered content and client components
 */

import { experimental_AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import reactRenderer from '@astrojs/react/server.js';
import { storyblokEditable } from '@storyblok/astro';

// Define Component interface for reuse
export interface Component {
  _uid: string;
  component: string;
  [key: string]: any;
}

/**
 * Renders an Astro component to a string using the Container API
 * @param Component The Astro component to render
 * @param props Props to pass to the component
 * @returns The rendered HTML as a string
 */
export async function renderComponentToString<Props extends Record<string, any>>(
  Component: AstroComponentFactory,
  props: Props
): Promise<string> {
  // Create a new container instance with React renderer
  const container = await experimental_AstroContainer.create();

  // Add React renderer
  container.addServerRenderer({
    renderer: reactRenderer,
    name: '@astrojs/react',
  });
  container.addClientRenderer({
    name: '@astrojs/react',
    entrypoint: '@astrojs/react/client.js',
  });

  // Render the component to string
  return await container.renderToString(Component, { props });
}

/**
 * Renders multiple instances of an Astro component using the same container
 * @param Component The Astro component to render
 * @param propsArray Array of props objects to render with
 * @returns Array of rendered HTML strings
 */
export async function renderComponentsToStrings<Props extends Record<string, any>>(
  Component: AstroComponentFactory,
  propsArray: Props[]
): Promise<string[]> {
  // Create a single container for all renderings with React renderer
  const container = await experimental_AstroContainer.create();

  // Add React renderer
  container.addServerRenderer({
    renderer: reactRenderer,
    name: '@astrojs/react',
  });
  container.addClientRenderer({
    name: '@astrojs/react',
    entrypoint: '@astrojs/react/client.js',
  });

  // Render each component instance
  return await Promise.all(propsArray.map(props => container.renderToString(Component, { props })));
}

/**
 * Categorize components into those that should be processed server-side
 * and those that should be handled client-side
 * @param component - The component to categorize
 * @returns Whether the component should be rendered on the server
 */
export function shouldProcessOnServer(component: Component): boolean {
  // Add more component types that should be client-rendered as needed
  const clientRenderedComponents = ['gallery'];
  return !clientRenderedComponents.includes(component.component);
}

/**
 * Process content items to separate server and client rendering
 * @param items Array of items to process (tabs, carousel slides, etc)
 * @returns Object with processed and unprocessed items
 */
export function processContentItems<T extends { _uid: string; components?: Component[] }>(
  items: T[]
): { processedItems: T[]; unprocessedItems: any[] } {
  const processedItems: T[] = [];
  const unprocessedItems: any[] = [];

  items.forEach(item => {
    if (item.components) {
      const processedComponents: Component[] = [];
      const unprocessedComponents: Component[] = [];

      // Categorize components
      item.components.forEach((component: Component) => {
        if (shouldProcessOnServer(component)) processedComponents.push(component);
        else unprocessedComponents.push(component);
      });

      // Add to processed items with filtered components
      processedItems.push({
        ...item,
        components: processedComponents,
        editableAttributes: storyblokEditable(item),
      } as T);

      // Add to unprocessed items with only the client components
      if (unprocessedComponents.length > 0) {
        unprocessedItems.push({
          _uid: item._uid,
          components: unprocessedComponents,
          editableAttributes: storyblokEditable(item),
        });
      }
    } else {
      processedItems.push({
        ...item,
        editableAttributes: storyblokEditable(item),
      } as T);
    }
  });

  return { processedItems, unprocessedItems };
}

/**
 * Create a map of item UIDs to their rendered content strings
 * @param StoryblokComponent The Storyblok component renderer
 * @param processedItems The processed items array
 * @returns Object mapping UIDs to rendered HTML content
 */
export async function createContentMap(
  StoryblokComponent: AstroComponentFactory,
  processedItems: any[]
): Promise<Record<string, string>> {
  // Render each item to a string
  const itemContents = await Promise.all(
    processedItems.map(async item => {
      // Handle different item structures:

      // 1. Item has components - render them with StoryblokComponent
      if (item.components && item.components.length > 0) {
        try {
          const componentsHtml = await renderComponentsToStrings(
            StoryblokComponent,
            item.components.map((component: Component) => ({ blok: component }))
          ).then(html => html.join(''));

          return componentsHtml;
        } catch (error) {
          console.error(`Failed to render components for item ${item._uid}:`, error);
          return '';
        }
      }

      // 2. Item has direct content - return it directly
      if (item.content) {
        return item.content;
      }

      // 3. Item itself might be a component - try rendering it directly
      try {
        const itemHtml = await renderComponentToString(StoryblokComponent, { blok: item });
        return itemHtml;
      } catch (error) {
        console.error(`Failed to directly render item ${item._uid}:`, error);
        return '';
      }
    })
  );

  // Create a map of item UIDs to their content
  return Object.fromEntries(processedItems.map((item, index) => [item._uid, itemContents[index]]));
}

/**
 * Creates a content map for items that need to be rendered with a specific Item component
 * @param ItemComponent The component to render each item with (TabItem, etc.)
 * @param processedItems Array of processed items
 * @returns Object mapping UIDs to rendered HTML content
 */
export async function createItemContentMap<T extends { _uid: string }>(
  ItemComponent: AstroComponentFactory,
  processedItems: T[]
): Promise<Record<string, string>> {
  // Create an array of props for each item
  const itemProps = processedItems.map(item => ({ blok: item }));

  // Pre-render all items in parallel
  const itemContents = await renderComponentsToStrings(ItemComponent, itemProps);

  // Create a map of item UIDs to their content
  return Object.fromEntries(processedItems.map((item, index) => [item._uid, itemContents[index]]));
}
