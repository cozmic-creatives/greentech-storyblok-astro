import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import ClientComponentRenderer from '~/components/ClientComponentRenderer';
import type { Component } from '~/components/ClientComponentRenderer';

// Helper function to normalize HTML entity encoding
const normalizeHtmlEntities = (html: string) => {
  // Convert HTML4 style quotes to HTML5 style
  return html.replace(/&quot;/g, '&#34;');
};

// Define types based on the Storyblok data structure
export interface TabItem {
  _uid: string;
  label: string;
  icon?: string;
  components: Component[];
  tabItemClasses?: string;
  editableAttributes?: Record<string, string>;
}

export interface UnprocessedTabItem {
  _uid: string;
  components: Component[];
  editableAttributes?: Record<string, string>;
}

export interface TabsWrapperProps {
  tabItems: TabItem[];
  label?: string;
  tabClasses?: string;
  tabContentMap?: Record<string, string>;
  unprocessedTabItems?: UnprocessedTabItem[];
  editableAttributes?: Record<string, string>;
}

/**
 * TabsWrapper component that handles both server-rendered and client-side components
 * - Server-rendered content is passed in via tabContentMap
 * - Client-side components are passed in via unprocessedTabItems
 */
export const TabsWrapper: React.FC<TabsWrapperProps> = ({
  tabItems = [],
  label = '',
  tabClasses = '',
  tabContentMap = {},
  unprocessedTabItems = [],
  editableAttributes = {},
}) => {
  // Set the first tab as default value or empty string if no tabs
  const defaultValue = tabItems?.length > 0 ? tabItems[0]._uid : '';

  // Create a lookup map for unprocessed components by tab UID
  const unprocessedComponentsMap = unprocessedTabItems.reduce<Record<string, Component[]>>(
    (acc, item) => {
      acc[item._uid] = item.components;
      return acc;
    },
    {}
  );

  return (
    <Tabs
      defaultValue={defaultValue}
      className={cn('w-full gap-6', tabClasses)}
      {...editableAttributes}
    >
      <TabsList className="w-full  h-11 shadow-inner border border-gray-200">
        {tabItems?.map(tab => (
          <TabsTrigger
            key={tab._uid}
            value={tab._uid}
            className="data-[state=active]:border-gray-200 data-[state=active]:border-1"
          >
            {tab.icon && <span className={`lucide-icon icon-${tab.icon} text-primary-dark`}></span>}
            {tab.label || label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabItems?.map(tab => (
        <TabsContent
          key={tab._uid}
          value={tab._uid}
          className={cn('tab-content', tab.tabItemClasses)}
          {...tab.editableAttributes}
        >
          {/* Render server-rendered HTML for processed components with normalized entities */}
          {tabContentMap[tab._uid] && (
            <div
              dangerouslySetInnerHTML={{ __html: normalizeHtmlEntities(tabContentMap[tab._uid]) }}
            />
          )}

          {/* Render client-side components for unprocessed items */}
          {unprocessedComponentsMap[tab._uid] &&
            unprocessedComponentsMap[tab._uid].map(component => (
              <ClientComponentRenderer key={component._uid} component={component} />
            ))}

          {/* Fallback if there's no content */}
          {!tabContentMap[tab._uid] && !unprocessedComponentsMap[tab._uid] && (
            <div>No content available for this tab</div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
