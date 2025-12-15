import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EmailTemplate } from '@/types/EmailTemplate';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Mail, Paperclip, Image as ImageIcon, Calendar, Clock } from 'lucide-react';

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
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-white rounded-xl shadow-2xl border-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">{template.name}</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-0.5">
                Email Template Preview
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Metadata Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 min-w-[80px]">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Subject:</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 border-l border-gray-200 pl-3">{template.subject}</span>
            </div>
          </div>

          {/* Body Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Message Content</Label>

            </div>
            <ScrollArea className="h-[300px] w-full rounded-xl border border-gray-200 bg-gray-50/30 p-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-full">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 font-sans">{content}</p>

                {/* Images in Body */}
                {images.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3 block">Embedded Images</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="group relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {img.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div className="pt-2">
              <Label className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5" />
                Attachments ({attachments.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1.5 h-auto text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                    {att.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
