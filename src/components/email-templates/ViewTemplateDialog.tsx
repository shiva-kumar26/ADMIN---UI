import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EmailTemplate } from '@/types/EmailTemplate';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Mail, Paperclip, Image as ImageIcon, Calendar, Clock } from 'lucide-react';

interface ViewTemplateDialogProps {
  template: EmailTemplate | null;
  onClose: () => void;
  extractFilesFromBody: (body: string, apiAttachments?: any[]) => { content: string; images: any[]; attachments: any[] };
  initialImages?: any[];
  initialAttachments?: any[];
}

export const ViewTemplateDialog: React.FC<ViewTemplateDialogProps> = ({
  template,
  onClose,
  extractFilesFromBody,
  initialImages,
  initialAttachments
}) => {
  if (!template) return null;

  // Extract once
  const extracted = extractFilesFromBody(template.body || '{}', template.attachments || []);
  const content = extracted.content;

  // Priority: 1. Passed props (from parent debug/logic), 2. Extracted
  const finalImages = initialImages && initialImages.length > 0 ? initialImages : extracted.images;
  const finalAttachments = initialAttachments && initialAttachments.length > 0 ? initialAttachments : extracted.attachments;

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 py-3 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">{template.name}</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Email Template Preview
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metadata Section */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded border border-gray-100">
            <Mail className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-500">Subject:</span>
            <span className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">{template.subject}</span>
          </div>

          {/* Body Section */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Message Content</Label>
            <div className="bg-white rounded-lg border border-gray-200 p-3 min-h-[100px]">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 font-sans">{content}</p>

              {/* Images in Body */}
              {finalImages.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                    Embedded Images ({finalImages.length})
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {finalImages.map((img, index) => (
                      <div key={index} className="group relative rounded border border-gray-200 bg-gray-50 aspect-square overflow-hidden">
                        <img
                          src={img.url || (img.file ? URL.createObjectURL(img.file) : '')}
                          alt={img.name || 'Image'}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=Error';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          {finalAttachments.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Attachments ({finalAttachments.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {finalAttachments.map((att, index) => {
                  const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => (att.name || '').toLowerCase().endsWith(ext));
                  if (isImage) {
                    return (
                      <div key={index} className="group relative rounded border border-gray-200 bg-gray-50 h-16 w-16 overflow-hidden" title={att.name}>
                        <img
                          src={att.url || (att.file ? URL.createObjectURL(att.file) : '')}
                          alt={att.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=Error';
                          }}
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      <Paperclip className="w-3 h-3 text-gray-500" />
                      {att.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t bg-gray-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
