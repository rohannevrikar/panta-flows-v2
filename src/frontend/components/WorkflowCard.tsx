
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { getIconByName } from '@/frontend/utils/iconMap';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/frontend/components/ui/dropdown-menu';

export interface WorkflowProps {
  id: string;
  title: string;
  description?: string;
  iconName?: string;
  isFavorite?: boolean;
  isPublic?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

const WorkflowCard: React.FC<WorkflowProps> = ({
  title,
  description,
  iconName = 'MessageSquare',
  isFavorite = false,
  isPublic = true,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const Icon = getIconByName(iconName);

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      <div className="relative">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${isFavorite ? 'bg-amber-100' : 'bg-slate-100'}`}>
                <Icon className={`h-5 w-5 ${isFavorite ? 'text-amber-600' : ''}`} />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            
            {/* Dropdown menu for workflow actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) onToggleFavorite();
                  }}
                >
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit();
                  }}
                >
                  Edit
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete();
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Visibility badge */}
          {!isPublic && (
            <div className="absolute top-2 right-12">
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                Private
              </span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          {description && (
            <CardDescription className="mt-1 text-sm text-gray-500 line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default WorkflowCard;
