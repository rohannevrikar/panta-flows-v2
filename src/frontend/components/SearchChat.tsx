
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/frontend/components/ui/dialog';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/frontend/components/ui/command';
import { useLanguage } from '@/frontend/contexts/LanguageContext';

// Mock history data for search results
const searchData = [
  { id: '1', title: 'Logo Design For Tech Startup', type: 'Chat History', date: '2 days ago' },
  { id: '2', title: 'Product Packaging Design', type: 'Chat History', date: '1 week ago' },
  { id: '3', title: 'Website Wireframe', type: 'Chat History', date: '3 weeks ago' },
  { id: '4', title: 'Social Media Campaign', type: 'Workflow', date: '' },
  { id: '5', title: 'Brand Identity', type: 'Workflow', date: '' },
];

const SearchChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { translate } = useLanguage();
  
  // Filter results based on search query
  const filteredResults = searchData.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase())
  );
  
  const handleSelect = (id: string) => {
    // Here you would implement navigation to the selected item
    console.log(`Selected item with id: ${id}`);
    setOpen(false);
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">{translate('common.search')}</span>
        <span className="sr-only">Search chats and workflows</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-0">
          <Command className="rounded-lg border shadow-md">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle>{translate('search.dialogTitle')}</DialogTitle>
            </DialogHeader>
            <CommandInput
              placeholder={translate('search.placeholder')}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>{translate('search.noResults')}</CommandEmpty>
              <CommandGroup heading={translate('search.results')}>
                {filteredResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.type}</span>
                    </div>
                    {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchChat;
