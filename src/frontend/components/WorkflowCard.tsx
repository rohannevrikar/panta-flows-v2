
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Star, StarOff } from 'lucide-react';
import { iconMap } from '@/frontend/utils/iconMap';

export interface WorkflowProps {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isFavorite: boolean;
  onClick: () => void;
  onFavoriteToggle?: () => Promise<void>;
}

const WorkflowCard: React.FC<WorkflowProps> = ({
  id,
  title,
  description,
  iconName,
  isFavorite,
  onClick,
  onFavoriteToggle
}) => {
  const Icon = iconMap[iconName] || iconMap.FileQuestion;
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      await onFavoriteToggle();
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-300"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {onFavoriteToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleFavoriteClick}
            >
              {isFavorite ? (
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default WorkflowCard;
