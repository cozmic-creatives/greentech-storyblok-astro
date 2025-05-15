import { experimental_AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import reactRenderer from '@astrojs/react/server.js';

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
