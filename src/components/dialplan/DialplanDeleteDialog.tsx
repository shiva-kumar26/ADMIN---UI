
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DialplanDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dialplanName?: string;
}

const DialplanDeleteDialog: React.FC<DialplanDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dialplanName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Dialplan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the dialplan "{dialplanName}"? 
            This action cannot be undone and will permanently remove the dialplan and all its associated details.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Dialplan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialplanDeleteDialog;