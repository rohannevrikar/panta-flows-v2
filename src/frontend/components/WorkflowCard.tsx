
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/frontend/components/ui/card';
import { getIconByName } from '@/frontend/utils/iconMap';

interface WorkflowCardProps {
  title: string;
  description: string;
  icon: string;
  color?: string;
  onClick?: () => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  title,
  description,
  icon,
  color = '#1CB5E0',
  onClick,
}) => {
  // Get icon component from name
  const IconComponent = getIconByName(icon);
  
  // Generate a lighter version of the color for the background
  const getLighterColor = (hex: string): string => {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    
    // Return a translucent version for the background
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  };
  
  const iconBgColor = getLighterColor(color);
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md bg-white border border-gray-200",
        "p-6 flex flex-col h-full"
      )}
      onClick={onClick}
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: iconBgColor }}
      >
        {IconComponent && (
          <IconComponent size={24} style={{ color }} />
        )}
      </div>
      
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-500 text-sm flex-grow">{description}</p>
      
      <div className="mt-6 flex items-center justify-end">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <ChevronRight size={14} style={{ color }} />
        </div>
      </div>
    </Card>
  );
};

export default WorkflowCard;
