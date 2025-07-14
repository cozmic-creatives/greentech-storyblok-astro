# Components Documentation

## Combobox

A generic React component that provides a searchable dropdown interface, built using shadcn/ui components.

### Usage

```tsx
import { Combobox, ComboboxOption } from '~/components/TagCombobox';

const options: ComboboxOption[] = [
  { value: 'sustainability', label: 'Sustainability', count: 5, metadata: 'article' },
  { value: 'processing', label: 'Material Processing', count: 3, metadata: 'article' },
];

<Combobox
  options={options}
  placeholder="Search options..."
  emptyMessage="No options found."
  className="w-full"
  onSelect={option => console.log(option)}
  showCounts={true}
  client:load
/>;
```

### Props

| Prop           | Type                               | Default               | Description                                    |
| -------------- | ---------------------------------- | --------------------- | ---------------------------------------------- |
| `options`      | `ComboboxOption[]`                 | Required              | Array of selectable options                    |
| `placeholder`  | `string`                           | `"Search options..."` | Placeholder text for the search input          |
| `emptyMessage` | `string`                           | `"No options found."` | Message shown when no options match the search |
| `className`    | `string`                           | `undefined`           | Additional CSS classes for styling             |
| `onSelect`     | `(option: ComboboxOption) => void` | `undefined`           | Callback when an option is selected            |
| `showCounts`   | `boolean`                          | `false`               | Whether to display counts for each option      |

### ComboboxOption Interface

```typescript
interface ComboboxOption {
  value: string; // Unique identifier
  label: string; // Display text
  count?: number; // Optional count for display
  metadata?: string; // Optional metadata (e.g., "article", "post")
}
```

## TagCombobox (Legacy)

A specialized version of Combobox for tag selection with automatic navigation to articles.

### Usage

```tsx
import { TagCombobox } from '~/components/TagCombobox';

const tags = [
  { name: 'Sustainability', count: 5, percentage: 20.83 },
  { name: 'MaterialProcessing', count: 3, percentage: 12.5 },
];

<TagCombobox
  tags={tags}
  placeholder="Search topics..."
  emptyMessage="No topics found."
  className="w-full"
  client:load
/>;
```

### Features

- **Search functionality**: Real-time filtering of tags as you type
- **Article counts**: Shows how many articles use each tag
- **Navigation**: Automatically navigates to `/articles?tag=${tagName}` on selection
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Adapts to container width
- **Visual feedback**: Check icons and hover states

### Integration with Astro

This component is designed to work with Astro's React integration:

1. **Client-side rendering**: Use `client:load` directive for interactivity
2. **Data passing**: Pass tag data from Astro component as props
3. **Navigation**: Uses `window.location.href` for page navigation

### Dependencies

Built on top of shadcn/ui components:

- `Button` - Trigger button
- `Popover` - Dropdown container
- `Command` - Search and selection functionality
- `Check` and `ChevronsUpDown` icons from Lucide React

### Used in

- `src/storyblok/Menu/Articles.astro` - For tag-based article navigation
