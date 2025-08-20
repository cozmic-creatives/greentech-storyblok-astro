'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

export interface ComboboxOption {
  value: string;
  label: string;
  count?: number;
  metadata?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  onSelect?: (option: ComboboxOption) => void;
  showCounts?: boolean;
}

export function Combobox({
  options,
  placeholder = 'Search options...',
  emptyMessage = 'No options found.',
  className,
  onSelect,
  showCounts = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSelect = (currentValue: string) => {
    if (currentValue === value) {
      setValue('');
    } else {
      const selectedOption = options.find(option => option.value.toLowerCase() === currentValue);
      if (selectedOption) {
        setValue(currentValue);
        onSelect?.(selectedOption);
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="rounded-full">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {value
            ? options.find(option => option.value.toLowerCase() === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value.toLowerCase()}
                  onSelect={handleSelect}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  <div className="flex items-center gap-2">
                    {showCounts && option.count && (
                      <span className="text-xs text-muted-foreground">
                        {option.count} {option.metadata || 'item'}
                        {option.count !== 1 ? 's' : ''}
                      </span>
                    )}
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === option.value.toLowerCase() ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Legacy component for backward compatibility
export interface TagComboboxProps {
  tags: Array<{ name: string; count: number; percentage: number }>;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function TagCombobox(props: TagComboboxProps) {
  const options: ComboboxOption[] = props.tags.map(tag => ({
    value: tag.name,
    label: tag.name,
    count: tag.count,
    metadata: 'article',
  }));

  const handleSelect = (option: ComboboxOption) => {
    const { updateQueryParam } = require('~/utils/queryParams');
    updateQueryParam('tag', option.value);
  };

  return (
    <Combobox
      options={options}
      placeholder={props.placeholder}
      emptyMessage={props.emptyMessage}
      className={props.className}
      onSelect={handleSelect}
      showCounts={true}
    />
  );
}
