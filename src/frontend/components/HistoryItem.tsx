
import React from 'react';
import { Star, MoreVertical, Pencil, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/frontend/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/frontend/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getIconByName } from '@/frontend/utils/iconMap';

export type HistoryItemStatus = 'completed' | 'processing' | 'failed';

interface HistoryItemProps {
  title: string;
  workflowType: string;
  timestamp: string;
  icon: string; // Icon name from Lucide
  status: HistoryItemStatus;
  isFavorite: boolean;
  onClick: () => void;
  onFavoriteToggle: () => void;
  onRename?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  title,
  workflowType,
  timestamp,
  icon,
  status,
  isFavorite,
  onClick,
  onFavoriteToggle,
  onRename,
}) => {
  const IconComponent = getIconByName(icon);
  
  const statusStyles = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    completed: "Abgeschlossen",
    processing: "In Bearbeitung",
    failed: "Fehler",
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer",
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            {IconComponent && <IconComponent size={20} />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
          <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
            <span>{workflowType}</span>
            <span className="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {timestamp}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={cn(
          "text-xs px-2 py-1 rounded-full", 
          statusStyles[status]
        )}>
          {statusLabels[status]}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-transparent"
              >
                <Star 
                  size={18} 
                  className={cn(
                    isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                  )} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFavorite ? "Von Favoriten entfernen" : "Als Favorit markieren"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="hover:bg-transparent">
              <MoreVertical size={18} className="text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {onRename && (
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename?.(); }}>
                  <Pencil size={14} className="mr-2" />
                  Umbenennen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}>
              <Star size={14} className="mr-2" />
              {isFavorite ? "Von Favoriten entfernen" : "Als Favorit markieren"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:bg-transparent"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default HistoryItem;
