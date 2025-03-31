
import { LucideIcon, MoreHorizontal, Star, StarOff, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HistoryItemProps {
  title: string;
  workflowType: string;
  timestamp: Date;
  icon: LucideIcon;
  status?: "completed" | "processing" | "failed";
  isFavorite?: boolean;
  className?: string;
  onClick?: () => void;
  onFavoriteToggle?: () => void;
  onRename?: (newName: string) => void;
}

const HistoryItem = ({ 
  title, 
  workflowType,
  timestamp, 
  icon: Icon,
  status = "completed",
  isFavorite = false,
  className,
  onClick,
  onFavoriteToggle = () => {},
  onRename = () => {}
}: HistoryItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  
  const statusColors = {
    completed: "text-green-500",
    processing: "text-amber-500",
    failed: "text-red-500"
  };

  const handleRename = () => {
    onRename(newTitle);
    setIsEditing(false);
  };

  return (
    <div 
      className={cn("history-item", className)}
    >
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-full bg-panta-blue-100 mr-3")}>
        <Icon className="h-4 w-4 text-panta-blue" />
      </div>
      
      <div className="flex-1" onClick={onClick}>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-7 py-1 text-sm"
              autoFocus
            />
            <Button size="sm" className="h-7 px-2 py-1" onClick={handleRename}>Save</Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 px-2 py-1"
              onClick={() => {
                setNewTitle(title);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <h4 className="text-sm font-medium">{title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-panta-blue font-medium">{workflowType}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </span>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center">
        <div className={cn("text-xs font-medium mr-2", statusColors[status])}>
          {status === "completed" && "Completed"}
          {status === "processing" && "Processing"}
          {status === "failed" && "Failed"}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFavoriteToggle}>
              {isFavorite ? (
                <>
                  <StarOff className="mr-2 h-4 w-4" />
                  Remove from favorites
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Add to favorites
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default HistoryItem;
