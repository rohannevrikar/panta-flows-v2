import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import WorkflowMenu from "./WorkflowMenu";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface WorkflowCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  className?: string;
  onClick?: () => void;
  translationKey?: string;
  onEdit?: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
}

const WorkflowCard = ({ 
  title, 
  description, 
  icon: Icon,
  color = "text-gray-600",  // Default color if none provided
  className,
  onClick,
  translationKey,
  onEdit,
  onSettings,
  onDelete
}: WorkflowCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const { translate } = useLanguage();
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };
  
  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  // Display translated title and description if translation keys are available
  const displayTitle = translationKey ? translate(`workflow.${translationKey}`) : title;
  const displayDescription = translationKey ? translate(`workflow.${translationKey}Desc`) : description;

  return (
    <div 
      className={cn(
        "workflow-card group transition-all duration-200 relative p-6 rounded-lg bg-white shadow-md border border-gray-100 hover:border-gray-300", 
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Menu in the top-right corner */}
      <div className={cn(
        "absolute top-2 right-2 transition-opacity", 
        isHovering ? "opacity-100" : "opacity-0"
      )}
        onClick={(e) => e.stopPropagation()}
      >
        <WorkflowMenu
          onEdit={handleEdit}
          onSettings={handleSettings}
          onDelete={handleDelete}
        />
      </div>
      
      <div className="workflow-icon bg-gray-50 p-5 rounded-full mb-4 group-hover:bg-black group-hover:text-white transition-colors duration-200">
        <Icon className={cn("h-8 w-8", color, "group-hover:text-white")} />
      </div>
      <h3 className="font-medium text-sm text-center group-hover:text-black mb-1">{displayTitle}</h3>
      <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2 group-hover:text-gray-700">{displayDescription}</p>
    </div>
  );
};

export default WorkflowCard;
