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

interface DesktopNavbarProps {
  businessLines: NavItemStoryblok;
  brands: NavItemStoryblok;
  markets: NavItemStoryblok;
  otherLinks: NavItemStoryblok[];
  className?: string;
  activeItem?: string;
}

export function DesktopNavbar({
  businessLines,
  brands,
  markets,
  otherLinks,
  className,
  activeItem,
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

        {/* Search Component */}
        <Search />
      </NavigationMenu>
    </div>
  );
}
