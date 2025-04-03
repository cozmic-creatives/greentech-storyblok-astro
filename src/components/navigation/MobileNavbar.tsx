import { useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';
import type { NavItemStoryblok } from '~/types/component-types-sb';

interface MobileNavbarProps {
  businessLines: NavItemStoryblok;
  brands: NavItemStoryblok;
  markets: NavItemStoryblok;
  otherLinks: NavItemStoryblok[];
}

export function MobileNavbar({ businessLines, brands, markets, otherLinks }: MobileNavbarProps) {
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
              <img src="/greentech-logo.svg" alt="GreenTech Logo" className="h-7 w-auto" />
            </a>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="px-4 py-2">
            <MobileNavAccordion
              label={businessLines.label}
              items={businessLines.dropdown as NavItemStoryblok[]}
              setIsOpen={setIsOpen}
            />

            <MobileNavAccordion
              label={brands.label}
              items={brands.dropdown as NavItemStoryblok[]}
              setIsOpen={setIsOpen}
            />

            <MobileNavAccordion
              label={markets.label}
              items={markets.dropdown as NavItemStoryblok[]}
              setIsOpen={setIsOpen}
            />

            {otherLinks.map(navItem => (
              <a
                key={navItem.link}
                href={navItem.link}
                className="flex py-2 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {navItem.label}
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavAccordion({
  label,
  items,
  setIsOpen,
}: {
  label: string;
  items: NavItemStoryblok[];
  setIsOpen: (open: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-between py-2 text-lg font-medium"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {label}
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
                key={item.link}
                href={item.link}
                className="group"
                onClick={() => setIsOpen(false)}
              >
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
