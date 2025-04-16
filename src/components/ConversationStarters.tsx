import * as React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ConversationStartersProps {
  starters: string[];
  onStarterClick: (starter: string) => void;
  className?: string;
}

export const ConversationStarters: React.FC<ConversationStartersProps> = ({
  starters,
  onStarterClick,
  className
}) => {
  if (!starters || starters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 p-4", className)}>
      {starters.map((starter, index) => (
        <Button
          key={index}
          variant="outline"
          className="text-sm"
          onClick={() => onStarterClick(starter)}
        >
          {starter}
        </Button>
      ))}
    </div>
  );
}; 