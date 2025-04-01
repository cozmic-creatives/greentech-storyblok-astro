import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { NavItem } from '~/types/navigation';

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
                     hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
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
  items: NavItem[];
  currentImage: string | null;
  onImageChange: (url?: string) => void;
  title: string;
}

export function DropdownSection({
  items,
  currentImage,
  onImageChange,
  title,
}: DropdownSectionProps) {
  return (
    <div className="flex w-[900px] p-2">
      {/* Image container - left side */}
      <div className="relative w-1/4 mr-4 h-64 overflow-hidden rounded-md shadow-lg">
        <img
          src={currentImage || '/images/nav/fallback.jpg'}
          alt={`${title} preview`}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      </div>

      {/* Navigation links - right side */}
      <ul className="grid w-3/4 gap-3 md:grid-cols-2 p-4" aria-label={`${title} Navigation`}>
        {items.map(item => (
          <ListItem
            key={item.title}
            title={item.title}
            href={item.href}
            onMouseEnter={() => item.imageUrl && onImageChange(item.imageUrl)}
          >
            {item.description}
          </ListItem>
        ))}
      </ul>
    </div>
  );
}
