import {
  Accordion as BaseAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { extractBoldText } from '~/utils/string';
import { cn } from '~/lib/utils';
import ClientComponentRenderer from '~/components/ClientComponentRenderer';
import type { Component } from '~/components/ClientComponentRenderer';

interface AccordionItemType {
  title: string;
  text: string;
}

interface AccordionProps {
  title?: string;
  items: AccordionItemType[];
  accordionClasses?: string;
}

// Extended interface to support the TabsWrapper-like functionality
export interface AccordionWrapperProps {
  tabItems?: any[];
  label?: string;
  accordionClasses?: string;
  tabContentMap?: Record<string, string>;
  unprocessedTabItems?: Array<{ _uid: string; components: Component[] }>;
}

// Original Accordion component
export function Accordion({ title, items, accordionClasses }: AccordionProps) {
  return (
    <div className={accordionClasses}>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}

      <BaseAccordion type="single" collapsible>
        {items.map((item, index) => {
          const boldMatch = extractBoldText(item.text);
          const title = boldMatch?.boldTexts?.[0] || item.title;
          const content = boldMatch?.cleanText || item.text;

          return (
            <AccordionItem
              key={`item-${index}`}
              value={`item-${index}`}
              className="border! rounded-md px-4 mb-2 last:mb-0 hover:border-primary cursor-pointer transition-border duration-300"
            >
              <AccordionTrigger className="text-base">{title}</AccordionTrigger>
              <AccordionContent>{content}</AccordionContent>
            </AccordionItem>
          );
        })}
      </BaseAccordion>
    </div>
  );
}

// New AccordionWrapper component that mirrors TabsWrapper functionality
export function AccordionWrapper({
  tabItems = [],
  label = '',
  accordionClasses = '',
  tabContentMap = {},
  unprocessedTabItems = [],
}: AccordionWrapperProps) {
  // Create a lookup map for unprocessed components by tab UID
  const unprocessedComponentsMap = unprocessedTabItems.reduce<Record<string, Component[]>>(
    (acc, item) => {
      acc[item._uid] = item.components;
      return acc;
    },
    {}
  );

  return (
    <div className={cn('w-full', accordionClasses)}>
      {label && <h3 className="text-lg font-semibold mb-2">{label}</h3>}

      <BaseAccordion type="single" collapsible>
        {tabItems?.map(tab => (
          <AccordionItem
            key={tab._uid}
            value={tab._uid}
            className="border! rounded-md px-4 mb-2 last:mb-0 hover:border-primary cursor-pointer transition-border duration-300"
          >
            <AccordionTrigger className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                {tab.icon && <span className={`lucide-icon icon-${tab.icon}`}></span>}
                <span className="underline">{tab.label || label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Render server-rendered HTML for processed components */}
              {tabContentMap[tab._uid] && (
                <div dangerouslySetInnerHTML={{ __html: tabContentMap[tab._uid] }} />
              )}

              {/* Render client-side components for unprocessed items */}
              {unprocessedComponentsMap[tab._uid] &&
                unprocessedComponentsMap[tab._uid].map(component => (
                  <ClientComponentRenderer key={component._uid} component={component} />
                ))}

              {/* Fallback if there's no content */}
              {!tabContentMap[tab._uid] && !unprocessedComponentsMap[tab._uid] && (
                <div>No content available for this item</div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </BaseAccordion>
    </div>
  );
}
