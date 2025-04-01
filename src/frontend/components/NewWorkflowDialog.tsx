
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/frontend/components/ui/dialog';
import { Button } from '@/frontend/components/ui/button';
import { ScrollArea } from '@/frontend/components/ui/scroll-area';
import { getIconByName } from '@/frontend/utils/iconMap';
import { ClientWorkflow } from '@/frontend/lib/client-themes';
import { useLanguage } from '@/frontend/contexts/LanguageContext';

interface NewWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkflow: (workflowType: string) => void;
  workflows: ClientWorkflow[];
}

const NewWorkflowDialog: React.FC<NewWorkflowDialogProps> = ({
  open,
  onOpenChange,
  onCreateWorkflow,
  workflows,
}) => {
  const { translate } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{translate('workflows.createNewTitle')}</DialogTitle>
          <DialogDescription>
            {translate('workflows.createNewDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {workflows.map((workflow) => {
              const IconComponent = getIconByName(workflow.iconName);
              const color = workflow.color || '#1CB5E0';
              const bgColor = `${color}20`; // 20% opacity version of the color
              
              return (
                <Button
                  key={workflow.id}
                  variant="outline"
                  className="h-auto p-4 justify-start flex-col items-start gap-3 hover:bg-gray-50 transition-colors"
                  onClick={() => onCreateWorkflow(workflow.title)}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: bgColor }}
                  >
                    {IconComponent && <IconComponent size={20} style={{ color }} />}
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium mb-1">{workflow.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewWorkflowDialog;
