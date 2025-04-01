
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import WorkflowMenu from "./WorkflowMenu";
import { useState } from "react";
import { toast } from "sonner";

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
  const [isHovering, setIsHovering] = useState(false);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Editing workflow: ${title}`);
  };
  
  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Opening settings for: ${title}`);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.error(`Delete workflow: ${title}`, {
      description: "This action can't be undone.",
      action: {
        label: "Undo",
        onClick: () => toast.success("Deletion cancelled")
      }
    });
  };

  return (
    <div 
      className={cn(
        "workflow-card group transition-all duration-200 relative p-6 border rounded-lg bg-white shadow-sm hover:shadow-md flex flex-col items-center", 
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
      <h3 className="font-medium text-sm text-center group-hover:text-black mb-1">{title}</h3>
      <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2 group-hover:text-gray-700">{description}</p>
    </div>
  );
};

export default WorkflowCard;
