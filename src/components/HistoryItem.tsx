
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface HistoryItemProps {
  title: string;
  timestamp: Date;
  icon: LucideIcon;
  status?: "completed" | "processing" | "failed";
  className?: string;
  onClick?: () => void;
}

const HistoryItem = ({ 
  title, 
  timestamp, 
  icon: Icon,
  status = "completed",
  className,
  onClick
}: HistoryItemProps) => {
  const statusColors = {
    completed: "text-green-500",
    processing: "text-amber-500",
    failed: "text-red-500"
  };

  return (
    <div 
      className={cn("history-item", className)}
      onClick={onClick}
    >
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-full bg-ai-purple-100 mr-3")}>
        <Icon className="h-4 w-4 text-ai-purple-600" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-ai-neutral-500">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
      <div className={cn("text-xs font-medium", statusColors[status])}>
        {status === "completed" && "Completed"}
        {status === "processing" && "Processing"}
        {status === "failed" && "Failed"}
      </div>
    </div>
  );
};

export default HistoryItem;
