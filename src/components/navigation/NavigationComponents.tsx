import { forwardRef } from 'react';
import { cn } from '~/lib/utils';
import {
  NavigationMenuContent as RadixNavigationMenuContent,
  NavigationMenuItem as RadixNavigationMenuItem,
} from '~/components/ui/navigation-menu';

/**
 * Custom Navigation MenuItem with relative positioning
 * This allows each menu item to be a positioning context for its dropdown
 */
export const NavigationMenuItem = forwardRef<
  React.ElementRef<typeof RadixNavigationMenuItem>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenuItem>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenuItem ref={ref} className={cn('relative', className)} {...props} />
));
NavigationMenuItem.displayName = 'NavigationMenuItem';

/**
 * Custom Navigation Menu Content with absolute positioning
 * This positions the dropdown content centered below its trigger
 */
export const NavigationMenuContent = forwardRef<
  React.ElementRef<typeof RadixNavigationMenuContent>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenuContent>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenuContent
    ref={ref}
    className={cn(
      'left-1/2 -translate-x-1/2 absolute',
      'absolute top-full bg-popover mt-[5px] rounded-md shadow-lg border border-border',
      'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = 'NavigationMenuContent';
