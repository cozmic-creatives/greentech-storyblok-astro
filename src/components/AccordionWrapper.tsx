import {
  Accordion as BaseAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

interface AccordionItemType {
  title: string;
  text: string;
}

interface AccordionProps {
  title?: string;
  items: AccordionItemType[];
  accordionClasses?: string;
}

export function Accordion({ title, items, accordionClasses }: AccordionProps) {
  return (
    <div className={accordionClasses}>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}

      <BaseAccordion type="single" collapsible>
        {items.map((item, index) => {
          const boldRegex = /\*\*(.*?)\*\*/;
          const boldMatch = item.text.match(boldRegex);

          const title = boldMatch ? boldMatch[1] : item.title;
          const content = boldMatch ? item.text.replace(boldRegex, '') : item.text;

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
