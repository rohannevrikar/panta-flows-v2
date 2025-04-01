
import { useState } from 'react';
import { Button } from '@/frontend/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/frontend/components/ui/dialog';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import { getIconByName } from '@/frontend/utils/iconMap';
import { workflowService } from '@/frontend/services/workflowService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/components/ui/select';
import { Switch } from '@/frontend/components/ui/switch';
import { TextArea } from '@/frontend/components/ui/textarea';
import { IconName } from '@/frontend/utils/iconMap';

export interface Workflow {
  id?: string;
  title: string;
  description: string;
  iconName: string;
  clientId: string;
  isPublic: boolean;
  isFavorite?: boolean;
  type?: string;
}

interface NewWorkflowDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const iconOptions: IconName[] = [
  'MessageSquare',
  'FileText',
  'Brain',
  'Bot',
  'Database',
  'Code',
  'FileQuestion',
  'FileImage',
];

const NewWorkflowDialog = ({ open, onOpenChange }: NewWorkflowDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState<IconName>('MessageSquare');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your workflow');
      return;
    }

    if (!user?.clientId) {
      toast.error('You need to be part of a client to create a workflow');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const workflow: Workflow = {
        title,
        description: description || `${title} workflow`,
        iconName,
        clientId: user.clientId,
        isPublic,
        isFavorite: false,
      };
      
      const result = await workflowService.createWorkflow(workflow);
      
      toast.success('Workflow created successfully!');
      onOpenChange(false);
      
      // Clear form state
      setTitle('');
      setDescription('');
      setIconName('MessageSquare');
      setIsPublic(true);
      
      // Navigate to the new workflow if created successfully
      if (result?.id) {
        navigate(`/workflow/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Create a custom workflow for your AI interactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Custom Workflow"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this workflow do? (Optional)"
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={iconName} onValueChange={(value) => setIconName(value as IconName)}>
                <SelectTrigger id="icon" className="w-full">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => {
                    const IconComponent = getIconByName(icon);
                    return (
                      <SelectItem key={icon} value={icon} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">Make workflow visible to all team members</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewWorkflowDialog;
