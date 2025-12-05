import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch } from 'lucide-react';

interface FlowCreationDialogProps {
  isOpen: boolean;
  onFlowCreate: (flowName: string) => void;
  onCancel: () => void;
}

const FlowCreationDialog: React.FC<FlowCreationDialogProps> = ({
  isOpen,
  onFlowCreate,
  onCancel,
}) => {
  const [flowName, setFlowName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!flowName.trim()) {
      setError('Please enter a flow name');
      return;
    }
    
    if (flowName.trim().length < 3) {
      setError('Flow name must be at least 3 characters long');
      return;
    }

    onFlowCreate(flowName.trim());
    setFlowName('');
    setError('');
  };

  const handleCancel = () => {
    setFlowName('');
    setError('');
    onCancel();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowName(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Create New IVR Flow
          </DialogTitle>
          <DialogDescription>
            Enter a name for your new IVR flow to get started with the flow builder.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="flowName">Flow Name</Label>
            <Input
              id="flowName"
              placeholder="e.g., Customer Support Flow"
              value={flowName}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Getting Started</h4>
            <p className="text-xs text-blue-700">
              Once created, you can drag elements from the sidebar to build your IVR flow and configure each node's properties.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
          >
            Create Flow & Start Building
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlowCreationDialog;