
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  extractFilesFromBody: (body: string) => { content: string; images: FileOrUrl[]; attachments: FileOrUrl[] };
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
      const { content, images, attachments } = extractFilesFromBody(template.body);
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
      const newImages = Array.from(files).map(file => ({
        name: file.name,
        file
      }));
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages]
      });
    }
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template: {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter your email template content here..."
            />
          </div>
          
          <div className="flex space-x-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Image className="w-4 h-4" />
              <span>Add Image</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => attachmentInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Paperclip className="w-4 h-4" />
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

          {formData.images.length > 0 && (
            <div>
              <Label>Images ({formData.images.length})</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative flex flex-col items-center border rounded p-2">
                    {img.url && (
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          console.error('Image failed to load:', img.url);
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    )}
                    <div className="flex items-center justify-between w-full mt-2">
                      <span className="text-xs truncate max-w-24" title={img.name}>
                        {img.name}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeImage(index)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.attachments.length > 0 && (
            <div>
              <Label>Attachments ({formData.attachments.length})</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {formData.attachments.map((att, index) => (
                  <div key={index} className="bg-gray-50 border rounded px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm truncate" title={att.name}>
                        {att.name}
                      </span>
                      {att.url && att.url.startsWith('data:') && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0">
                          Base64
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {att.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAttachment(att)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
