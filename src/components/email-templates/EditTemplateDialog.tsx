
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image, Paperclip, X, Download } from 'lucide-react';
import { EmailTemplate, FileOrUrl } from '@/types/EmailTemplate';

interface EditTemplateDialogProps {
  templateId: number | null;
  template: EmailTemplate | null;
  onClose: () => void;
  onUpdateTemplate: (id: number, data: { name: string; subject: string; content: string; images: FileOrUrl[]; attachments: FileOrUrl[] }) => Promise<boolean>;
  extractFilesFromBody: (body: string, apiAttachments?: FileOrUrl[]) => { content: string; images: FileOrUrl[]; attachments: FileOrUrl[] };
  loading: boolean;
}

export const EditTemplateDialog: React.FC<EditTemplateDialogProps> = ({
  templateId,
  template,
  onClose,
  onUpdateTemplate,
  extractFilesFromBody,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    images: [] as FileOrUrl[],
    attachments: [] as FileOrUrl[]
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (template) {
      const { content, images, attachments } = extractFilesFromBody(template.body, template.attachments || []);

      console.log('Extracted data:', { content, images, attachments });
      setFormData({
        name: template.name,
        subject: template.subject,
        content,
        images,
        attachments
      });
    }
  }, [template, extractFilesFromBody]);

  const handleSave = async () => {
    if (templateId) {
      const success = await onUpdateTemplate(templateId, formData);
      if (success) {
        onClose();
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validImages = Array.from(files).filter(file => isImageFile(file.name));

      if (validImages.length < files.length) {
        // Optional: You could notify the user here that non-image files were skipped
        console.warn("Skipped non-image files");
      }

      const newImages = validImages.map(file => ({
        name: file.name,
        file
      }));
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages]
      });
    }
    event.target.value = '';
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        file
      }));
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...newAttachments]
      });
    }
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    });
  };

  const downloadAttachment = (attachment: FileOrUrl) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  if (!template || !templateId) return null;

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 py-3 border-b">
          <DialogTitle className="text-lg font-bold">Edit Email Template</DialogTitle>
          <DialogDescription>
            Make changes to your email template here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="templateName" className="text-xs font-semibold text-black tracking-wide">Template Name</Label>
            <Input
              id="templateName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs font-semibold text-black tracking-wide">Email Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-xs font-semibold text-black tracking-wide">Email Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your email template content here..."
              className="min-h-[150px] resize-none text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center space-x-1.5 h-8 text-xs"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => attachmentInputRef.current?.click()}
              className="flex items-center space-x-1.5 h-8 text-xs"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Add Attachment</span>
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              onChange={handleAttachmentUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.images.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-black tracking-wide">Images ({formData.images.length})</Label>
                <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-lg p-2 min-h-[80px]">
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square bg-white rounded border overflow-hidden">
                        {(img.url || img.file) ? (
                          <img
                            src={img.file ? URL.createObjectURL(img.file) : img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.attachments.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-black tracking-wide">Attachments ({formData.attachments.length})</Label>
                <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-lg p-2 min-h-[80px] max-h-[150px] overflow-y-auto space-y-1">
                  {formData.attachments.map((att, index) => {
                    const isImg = isImageFile(att.name || '');
                    return (
                      <div key={index} className="bg-white border rounded px-2 py-1.5 flex items-center justify-between group">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {isImg ? (
                            <div className="h-8 w-8 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                src={att.file ? URL.createObjectURL(att.file) : att.url}
                                alt={att.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <Paperclip className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-xs truncate" title={att.name}>
                            {att.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {att.url && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => downloadAttachment(att)}
                              className="h-5 w-5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeAttachment(index)}
                            className="h-5 w-5 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="p-3 border-t bg-gray-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
