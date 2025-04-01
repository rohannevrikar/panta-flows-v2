
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
  color = "text-gray-600",  // Default color if none provided
  className,
  onClick
}: WorkflowCardProps) => {
  return (
    <div 
      className={cn("workflow-card group transition-all duration-200", className)} 
      onClick={onClick}
    >
      <div className="workflow-icon bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-200">
        <Icon className={cn("h-8 w-8", color, "group-hover:text-white")} />
      </div>
      <h3 className="font-medium text-sm text-center group-hover:text-black">{title}</h3>
      <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2 group-hover:text-gray-700">{description}</p>
    </div>
  );
};

export default WorkflowCard;
