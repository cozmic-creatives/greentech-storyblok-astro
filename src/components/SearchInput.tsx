import { useState, useEffect } from 'react';
import { Input } from '~/components/ui/input';
import { updateQueryParam, getQueryParam } from '~/utils/queryParams';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({ 
  placeholder = 'Search articles...', 
  className = ''
}: SearchInputProps) {
  const [searchValue, setSearchValue] = useState('');

  // Initialize search value from URL on mount
  useEffect(() => {
    const searchParam = getQueryParam('search');
    if (searchParam) {
      setSearchValue(searchParam);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParam('search', searchValue.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateQueryParam('search', searchValue.trim());
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    updateQueryParam('search', '');
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-20"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}