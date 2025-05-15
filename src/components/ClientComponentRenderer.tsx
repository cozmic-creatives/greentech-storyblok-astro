import React, { lazy, Suspense, useMemo } from 'react';
import { LoaderCircle } from 'lucide-react';

// Define the Component interface
export interface Component {
  _uid: string;
  component: string;
  [key: string]: any;
}

interface ClientComponentRendererProps {
  component: Component;
}

// Create a cache for loaded components to prevent reloading
const componentCache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();

/**
 * ClientComponentRenderer dynamically loads and renders client-side components
 * based on the component type provided in the props
 */
const ClientComponentRenderer: React.FC<ClientComponentRendererProps> = ({ component }) => {
  const componentType = component.component;

  // Use memoization to maintain component instance
  const DynamicComponent = useMemo(() => {
    // Check cache first
    if (!componentCache.has(componentType)) {
      // If not in cache, create the lazy component
      switch (componentType) {
        case 'gallery':
          componentCache.set(
            componentType,
            lazy(() => import('~/components/Gallery'))
          );
          break;
        // Add more component mappings as needed
      }
    }

    // Return from cache
    return componentCache.get(componentType);
  }, [componentType]);

  if (!DynamicComponent) {
    console.warn(`No client component implementation found for: ${componentType}`);
    return <div>Component not implemented: {componentType}</div>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center p-4">
          <LoaderCircle className="animate-spin text-primary" size={24} />
        </div>
      }
    >
      <DynamicComponent blok={component} />
    </Suspense>
  );
};

export default React.memo(ClientComponentRenderer);
