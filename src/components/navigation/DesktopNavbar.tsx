import { cn } from '~/lib/utils';
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '~/components/ui/navigation-menu';
import { Search } from './Search';

import { cva } from 'class-variance-authority';
import {
  NavigationMenuItem,
  NavigationMenuContent,
} from '~/components/navigation/NavigationComponents';
import { DropdownSection } from '~/components/navigation/DropdownSection';
import type { NavItemStoryblok } from '~/types/component-types-sb';
import { Button } from '~/components/ui/button';
import { isSafeCrispCommand, sanitizeCrispCommand } from '~/utils/crisp';

interface DesktopNavbarProps {
  businessLines: NavItemStoryblok;
  brands: NavItemStoryblok;
  markets: NavItemStoryblok;
  otherLinks: NavItemStoryblok[];
  className?: string;
  activeItem?: string;
  ctaButton: NavItemStoryblok;
}

export function DesktopNavbar({
  businessLines,
  brands,
  markets,
  otherLinks,
  className,
  activeItem,
  ctaButton,
}: DesktopNavbarProps) {
  // Style for navigation triggers
  const navTriggerStyle = cva('cursor-pointer focus:bg-transparent bg-transparent');

  return (
    <div className="relative flex items-center w-full">
      <NavigationMenu className={className} viewport={false}>
        <NavigationMenuList className="gap-2">
          {/* Business Lines Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navTriggerStyle()} aria-label="Business Lines">
              {businessLines.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <DropdownSection items={businessLines.dropdown as NavItemStoryblok[]} />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Brands Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navTriggerStyle()} aria-label="Brands">
              {brands.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <DropdownSection items={brands.dropdown as NavItemStoryblok[]} />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Markets Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navTriggerStyle()} aria-label="Markets">
              {markets.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <DropdownSection items={markets.dropdown as NavItemStoryblok[]} />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Main Navigation Links */}
          {otherLinks.map(navItem => (
            <NavigationMenuItem key={navItem.link}>
              <NavigationMenuLink
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  activeItem === navItem.link && 'text-primary font-semibold'
                )}
                href={navItem.link ?? '/'}
                active={activeItem === navItem.link}
              >
                {navItem.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>

        {/* CTA Button */}

        <Button
          variant={ctaButton.variant}
          className={cn('lg:ml-4')}
          onClick={() => {
            if (window.$crisp) {
              $crisp.push(['set', 'message:text', ["Hi! I'd like to get help."]]);
              $crisp.push(['do', 'chat:open']);
            }
          }}
        >
          {ctaButton.text}
          <span className={`lucide-icon icon-${ctaButton.icon}`}></span>
        </Button>
      </NavigationMenu>
    </div>
  );
}
