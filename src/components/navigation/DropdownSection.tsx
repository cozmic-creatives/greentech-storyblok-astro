import { forwardRef, type ComponentPropsWithoutRef, useState } from 'react';
import type { NavItemStoryblok } from '~/types/component-types-sb';

interface ListItemProps extends ComponentPropsWithoutRef<'a'> {
  title: string;
  children: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ListItem = forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
    return (
      <li>
        <a
          ref={ref}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors 
                     hover:bg-gray-50 hover:text-primary-accessible focus:bg-gray-100 focus:text-primary-accessible ${className}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';

export interface DropdownSectionProps {
  items: NavItemStoryblok[];
}

export function DropdownSection({ items }: DropdownSectionProps) {
  // Managing image state internally
  const [currentImage, setCurrentImage] = useState<string | null>(
    items[0]?.image?.filename || null
  );

  // Function to update image on hover
  const handleItemHover = (item: NavItemStoryblok) => {
    if (item.image?.filename) setCurrentImage(item.image.filename);
  };

  return (
    <div className="flex w-[900px] min-h-[250px] p-3">
      {/* Image container - left side */}
      <div className="relative w-1/4 mr-4 overflow-hidden bg-gray-100 rounded-sm">
        <img
          src={currentImage || 'https://picsum.photos/200'}
          className="h-full object-cover transition-transform duration-500 ease-in-out"
          loading="lazy"
        />
      </div>

      {/* Navigation links - right side */}
      <ul className="grid w-3/4 gap-2 md:grid-cols-2 p-4">
        {items.map((item, index) => (
          <ListItem
            key={`${item._uid || index}`}
            title={item.label || ''}
            href={item.link || '#'}
            onMouseEnter={() => handleItemHover(item)}
          >
            {item.description || ''}
          </ListItem>
        ))}
      </ul>
    </div>
  );
}
