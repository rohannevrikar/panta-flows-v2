
import React, { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/frontend/components/ui/radio-group";
import { getIconByName } from "@/frontend/utils/iconMap";
import { workflowService, WorkflowCreateParams } from "@/frontend/services/workflowService";
import { toast } from "sonner";
import { useAuth } from "@/frontend/contexts/AuthContext";

export interface NewWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WorkflowCreateParams) => Promise<void>;
}

const workflowTypes = [
  {
    id: "chat",
    name: "Chat",
    description: "General purpose AI assistant",
    icon: "MessageSquare",
  },
  {
    id: "document",
    name: "Document",
    description: "Upload and analyze documents",
    icon: "FileText",
  },
  {
    id: "image",
    name: "Image",
    description: "Generate and edit images",
    icon: "FileImage",
  },
];

const NewWorkflowDialog: React.FC<NewWorkflowDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("chat");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a workflow title");
      return;
    }
    
    // Find the selected workflow type
    const selectedType = workflowTypes.find((t) => t.id === type);
    
    if (!selectedType) {
      toast.error("Please select a workflow type");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the workflow
      await onSubmit({
        title: title,
        description: selectedType.description,
        iconName: selectedType.icon,
        clientId: user?.clientId || "",
        isPublic: true,
        isFavorite: false
      });
      
      setTitle("");
      setType("chat");
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow");
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = (name: string) => {
    const Icon = getIconByName(name);
    return <Icon className="h-5 w-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Workflow Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a name for your workflow"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Workflow Type</Label>
            <RadioGroup
              value={type}
              onValueChange={setType}
              className="grid grid-cols-1 gap-2"
            >
              {workflowTypes.map((workflowType) => (
                <div
                  key={workflowType.id}
                  className={`flex items-center space-x-2 rounded-lg border p-3 cursor-pointer ${
                    type === workflowType.id ? "border-primary" : "border-border"
                  }`}
                >
                  <RadioGroupItem
                    value={workflowType.id}
                    id={workflowType.id}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-md bg-primary/10 p-2 text-primary">
                        {IconComponent(workflowType.icon)}
                      </div>
                      <div>
                        <Label
                          htmlFor={workflowType.id}
                          className="text-base font-medium"
                        >
                          {workflowType.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {workflowType.description}
                        </p>
                      </div>
                    </div>
                    {type === workflowType.id && (
                      <div className="text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewWorkflowDialog;
