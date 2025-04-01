import { useState } from 'react';
import { ChevronDown, Leaf, Menu, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';

// Import shared data types
import type { NavItem } from '~/types/navigation';

interface MobileNavbarProps {
  businessLines: NavItem[];
  brands: NavItem[];
  markets: NavItem[];
  mainLinks: NavItem[];
}

export function MobileNavbar({ businessLines, brands, markets, mainLinks }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between px-4">
            <a href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">GreenTech</span>
            </a>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="px-4 py-2">
            <MobileNavAccordion
              title="Business Lines"
              items={businessLines}
              setIsOpen={setIsOpen}
            />

            <MobileNavAccordion title="Brands" items={brands} setIsOpen={setIsOpen} />

            <MobileNavAccordion title="Markets" items={markets} setIsOpen={setIsOpen} />

            {mainLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="flex py-2 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavAccordion({
  title,
  items,
  setIsOpen,
}: {
  title: string;
  items: NavItem[];
  setIsOpen: (open: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-between py-2 text-lg font-medium"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-300', isExpanded && 'rotate-180')}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-4 mt-2 flex flex-col space-y-3 pb-4">
            {items.map(item => (
              <a
                key={item.title}
                href={item.href}
                className="group"
                onClick={() => setIsOpen(false)}
              >
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
