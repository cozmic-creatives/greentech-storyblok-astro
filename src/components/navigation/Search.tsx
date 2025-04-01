import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { cn } from '~/lib/utils';

interface SearchProps {
  className?: string;
}

export function Search({ className }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    // You could redirect to search results page or filter content
    // window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    setIsOpen(false);
  };

  return (
    <div className={cn('flex items-center', className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Search">
            <SearchIcon className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Search GreenTech</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="flex gap-2 mt-4">
            <Input
              type="search"
              placeholder="Search for products, brands, or services..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit">Search</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
