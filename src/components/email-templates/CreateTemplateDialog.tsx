
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Image, Paperclip, X } from 'lucide-react';
import { FileOrUrl } from '@/types/EmailTemplate';

interface CreateTemplateDialogProps {
  onCreateTemplate: (data: { name: string; subject: string; content: string; images: FileOrUrl[]; attachments: FileOrUrl[] }) => Promise<boolean>;
  loading: boolean;
}

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({ onCreateTemplate, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    images: [] as FileOrUrl[],
    attachments: [] as FileOrUrl[]
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        name: file.name,
        file
      }));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        file
      }));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    const success = await onCreateTemplate(formData);
    if (success) {
      setFormData({
        name: '',
        subject: '',
        content: '',
        images: [],
        attachments: []
      });
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Email Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
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
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="flex items-center bg-blue-100 px-3 py-1 rounded">
                    <span className="text-sm">{img.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeImage(index)}
                      className="ml-2 h-4 w-4 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formData.attachments.length > 0 && (
            <div>
              <Label>Attachments</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attachments.map((att, index) => (
                  <div key={index} className="flex items-center bg-green-100 px-3 py-1 rounded">
                    <span className="text-sm">{att.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                      className="ml-2 h-4 w-4 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
