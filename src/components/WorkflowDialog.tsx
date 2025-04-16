import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from './ui/color-picker';
import { Workflow } from '@/lib/types';

interface WorkflowFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  conversationStarters: string[];
}

interface WorkflowDialogProps {
  workflow?: Workflow;
  onClose: () => void;
  onSave: (data: WorkflowFormData) => void;
}

export const WorkflowDialog: React.FC<WorkflowDialogProps> = ({ workflow, onClose, onSave }) => {
  const [formData, setFormData] = useState<WorkflowFormData>({
    title: '',
    description: '',
    icon: 'message-square',
    color: '#000000',
    systemPrompt: '',
    conversationStarters: [],
  });

  useEffect(() => {
    if (workflow) {
      setFormData({
        title: workflow.title,
        description: workflow.description || '',
        icon: workflow.icon || 'message-square',
        color: workflow.color || '#000000',
        systemPrompt: workflow.systemPrompt || '',
        conversationStarters: workflow.conversationStarters || [],
      });
    }
  }, [workflow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{workflow ? 'Edit Workflow' : 'New Workflow'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="message-square">Message</SelectItem>
                <SelectItem value="bot">Bot</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="file-text">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <ColorPicker
              value={formData.color}
              onChange={(value) => setFormData({ ...formData, color: value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversationStarters">Conversation Starters</Label>
            <Textarea
              id="conversationStarters"
              value={formData.conversationStarters.join('\n')}
              onChange={(e) => setFormData({ ...formData, conversationStarters: e.target.value.split('\n') })}
              placeholder="Enter each starter on a new line"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {workflow ? 'Save Changes' : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 