
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EmailTemplate } from '@/types/EmailTemplate';

interface ViewTemplateDialogProps {
  template: EmailTemplate | null;
  onClose: () => void;
  extractFilesFromBody: (body: string) => { content: string; images: any[]; attachments: any[] };
}

export const ViewTemplateDialog: React.FC<ViewTemplateDialogProps> = ({ 
  template, 
  onClose, 
  extractFilesFromBody 
}) => {
  if (!template) return null;

  const { content, images, attachments } = extractFilesFromBody(template.body);

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>View Template: {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <p className="text-sm text-gray-700">{template.subject}</p>
          </div>
          <div>
            <Label>Content</Label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
          </div>
          {images.length > 0 && (
            <div>
              <Label>Images</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {images.map((img, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <span className="text-xs mt-1">{img.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {attachments.length > 0 && (
            <div>
              <Label>Attachments</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((att, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-2 rounded">
                    <span className="text-sm">{att.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
