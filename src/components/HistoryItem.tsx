import { LucideIcon, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/lib/api-service";

interface HistoryItemProps {
  session: ChatSession;
  onSelect: (session: ChatSession) => void;
  onDelete: (sessionId: string) => void;
  workflowIcon: LucideIcon;
}

export default function HistoryItem({ session, onSelect, onDelete, workflowIcon: Icon }: HistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date | string | undefined) => {
    try {
      if (!date) return 'Just now';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Just now';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Just now';
    }
  };

  return (
    <div 
      className={`relative rounded-lg border transition-all duration-200 ${
        isHovered ? 'border-gray-300 shadow-md' : 'border-gray-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onSelect(session)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-panta-blue flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{session.title || 'Untitled Workflow'}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(session.created_at)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
