
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const WorkflowCard = ({ 
  title, 
  description, 
  icon: Icon,
  color = "text-gray-600",  // Changed to a more minimalistic gray color
  className,
  onClick
}: WorkflowCardProps) => {
  return (
    <div 
      className={cn("workflow-card group", className)} 
      onClick={onClick}
    >
      <div className="workflow-icon bg-gray-50">  {/* Changed background to light gray */}
        <Icon className={cn("h-8 w-8", color)} />
      </div>
      <h3 className="font-medium text-sm text-center">{title}</h3>
      <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{description}</p>
    </div>
  );
};

export default WorkflowCard;
