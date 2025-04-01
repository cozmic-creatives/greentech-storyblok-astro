import { useState } from 'react';
import { cn } from '~/lib/utils';
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '~/components/ui/navigation-menu';
import { Search } from './Search';

// Import shared data types and custom components
import type { NavItem } from '~/types/navigation';
import { cva } from 'class-variance-authority';
import {
  NavigationMenuItem,
  NavigationMenuContent,
} from '~/components/navigation/NavigationComponents';
import { DropdownSection } from '~/components/navigation/DropdownSection';

/**
 * Interface for desktop navigation bar props
 */
interface DesktopNavbarProps {
  /** Business Lines navigation items */
  businessLines: NavItem[];
  /** Brand navigation items */
  brands: NavItem[];
  /** Market navigation items */
  markets: NavItem[];
  /** Main navigation links */
  mainLinks: NavItem[];
  /** Optional class name for the navigation menu */
  className?: string;
  /** Currently active navigation item path */
  activeItem?: string;
}

/**
 * Desktop navigation bar component with dropdown menus
 *
 * Displays main navigation links and three dropdown sections:
 * - Business Lines
 * - Brands
 * - Markets
 *
 * Each dropdown features a hover-responsive image and navigation links.
 */
export function DesktopNavbar({
  businessLines,
  brands,
  markets,
  mainLinks,
  className,
  activeItem,
}: DesktopNavbarProps) {
  // Style for navigation triggers
  const navTriggerStyle = cva(
    'bg-transparent hover:bg-transparent! focus:bg-transparent! focus:outline-none text-sm font-medium transition-colors'
  );

  // State for each dropdown section's current image
  const [businessLineImage, setBusinessLineImage] = useState<string | null>(
    businessLines[0]?.imageUrl || null
  );
  const [brandImage, setBrandImage] = useState<string | null>(brands[0]?.imageUrl || null);
  const [marketImage, setMarketImage] = useState<string | null>(markets[0]?.imageUrl || null);

  return (
    <div className="relative flex items-center justify-center w-full">
      <NavigationMenu className={className} viewport={false}>
        <NavigationMenuList className="gap-2">
          {/* Business Lines Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navTriggerStyle()} aria-label="Business Lines">
              Business Lines
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <DropdownSection
                items={businessLines}
                currentImage={businessLineImage}
                onImageChange={setBusinessLineImage}
                title="Business Lines"
              />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Brands Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navTriggerStyle()} aria-label="Brands">
              Brands
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <DropdownSection
                items={brands}
                currentImage={brandImage}
                onImageChange={setBrandImage}
                title="Brands"
              />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Markets Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navTriggerStyle()} aria-label="Markets">
              Markets
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <DropdownSection
                items={markets}
                currentImage={marketImage}
                onImageChange={setMarketImage}
                title="Markets"
              />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Main Navigation Links */}
          {mainLinks
            .filter(link => link.title !== 'Home')
            .map(link => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors',
                    activeItem === link.href && 'text-primary font-semibold'
                  )}
                  href={link.href}
                  active={activeItem === link.href}
                >
                  {link.title}
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
