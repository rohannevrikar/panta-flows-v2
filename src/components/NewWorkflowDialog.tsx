import React, { useState, useEffect } from "react";
import { Check, MessageSquare, Code, Image, FileText, Video, Music, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconOptions = [
  { name: "Chat", icon: MessageSquare },
  { name: "Code", icon: Code },
  { name: "Image", icon: Image },
  { name: "Document", icon: FileText },
  { name: "Video", icon: Video },
  { name: "Music", icon: Music },
  { name: "Bot", icon: Bot },
];

const colorOptions = [
  { name: "Blue", value: "text-blue-500" },
  { name: "Green", value: "text-green-500" },
  { name: "Red", value: "text-red-500" },
  { name: "Purple", value: "text-purple-500" },
  { name: "Yellow", value: "text-yellow-500" },
  { name: "Pink", value: "text-pink-500" },
  { name: "Gray", value: "text-gray-600" },
];

interface WorkflowFormData {
  title: string;
  description: string;
  systemPrompt: string;
  selectedIcon: string;
  iconColor: string;
  starters: { id: string; text: string }[];
}

interface NewWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateWorkflow: (workflow: WorkflowFormData) => void;
  workflow?: {
    id: string;
    title: string;
    description: string;
    icon: any;
    color?: string;
    systemPrompt: string;
    conversationStarters: { id: string; text: string }[];
    created_at?: string;
  };
}

const NewWorkflowDialog = ({
  open,
  onClose,
  onCreateWorkflow,
  workflow
}: NewWorkflowDialogProps) => {
  const [formData, setFormData] = useState<WorkflowFormData>({
    title: "",
    description: "",
    systemPrompt: "You are a helpful assistant.",
    selectedIcon: "Chat",
    iconColor: "text-gray-600",
    starters: [
      { id: "starter-1", text: "How can I help you today?" },
      { id: "starter-2", text: "What would you like to know?" }
    ],
  });
  const [currentStarter, setCurrentStarter] = useState("");

  useEffect(() => {
    if (workflow && workflow.id) {
      setFormData({
        title: workflow.title,
        description: workflow.description || "",
        systemPrompt: workflow.systemPrompt || "You are a helpful assistant.",
        selectedIcon: Object.keys(iconOptions).find(key => iconOptions[key].icon === workflow.icon) || "Chat",
        iconColor: workflow.color || "text-gray-600",
        starters: workflow.conversationStarters || [
          { id: "starter-1", text: "How can I help you today?" },
          { id: "starter-2", text: "What would you like to know?" }
        ],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        systemPrompt: "You are a helpful assistant.",
        selectedIcon: "Chat",
        iconColor: "text-gray-600",
        starters: [
          { id: "starter-1", text: "How can I help you today?" },
          { id: "starter-2", text: "What would you like to know?" }
        ],
      });
    }
  }, [workflow]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({ ...prev, selectedIcon: iconName }));
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, iconColor: color }));
  };

  const handleAddStarter = () => {
    if (currentStarter.trim()) {
      setFormData((prev) => ({
        ...prev,
        starters: [...prev.starters, { 
          id: `starter-${Date.now()}`, 
          text: currentStarter.trim() 
        }],
      }));
      setCurrentStarter("");
    }
  };

  const handleRemoveStarter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      starters: prev.starters.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateWorkflow(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{workflow ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
            <DialogDescription>
              {workflow ? 'Update your workflow configuration.' : 'Configure your new chat-based workflow.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Workflow Name</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., Customer Support Assistant"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what this workflow does"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleChange}
                placeholder="Instructions for the AI model"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-7 gap-2">
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.name}
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-16 w-16 flex-col gap-1 p-2",
                        formData.selectedIcon === option.name &&
                          "border-primary ring-2 ring-primary ring-opacity-20"
                      )}
                      onClick={() => handleIconSelect(option.name)}
                    >
                      <Icon className={cn("h-6 w-6", formData.iconColor)} />
                      <span className="text-xs">{option.name}</span>
                      {formData.selectedIcon === option.name && (
                        <Check className="absolute top-1 right-1 h-3 w-3" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Icon Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {colorOptions.map((option) => {
                  const Icon = 
                    iconOptions.find(i => i.name === formData.selectedIcon)?.icon || 
                    MessageSquare;
                  
                  return (
                    <Button
                      key={option.name}
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-14 w-14 p-2",
                        formData.iconColor === option.value &&
                          "border-primary ring-2 ring-primary ring-opacity-20"
                      )}
                      onClick={() => handleColorSelect(option.value)}
                    >
                      <Icon className={cn("h-8 w-8", option.value)} />
                      {formData.iconColor === option.value && (
                        <Check className="absolute top-1 right-1 h-3 w-3" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="starters">Conversation Starters</Label>
              <div className="flex gap-2">
                <Input
                  id="starter-input"
                  value={currentStarter}
                  onChange={(e) => setCurrentStarter(e.target.value)}
                  placeholder="Add a conversation starter"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddStarter}>
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {formData.starters.map((starter, index) => (
                  <div
                    key={starter.id}
                    className="flex items-center justify-between rounded-md border border-input bg-background p-2"
                  >
                    <span className="text-sm truncate flex-1">{starter.text}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStarter(index)}
                      className="h-8 w-8 p-0"
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {workflow ? 'Save Changes' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewWorkflowDialog;
