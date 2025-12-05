import { useState, useCallback } from 'react';
import { EmailTemplate, CreateEmailTemplateRequest, FileOrUrl } from '@/types/EmailTemplate';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://10.16.7.96/api/email_templates';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const prepareBodyWithFiles = async (content: string, images: FileOrUrl[], attachments: FileOrUrl[]): Promise<string> => {
    let bodyData: any = { message: content };

    // Add images to body
    if (images.length > 0) {
      const imagePromises = images.map(async (img) => {
        if (img.file) {
          return await convertFileToBase64(img.file);
        }
        return img.url;
      });
      const imageUrls = await Promise.all(imagePromises);
      if (imageUrls.length === 1) {
        bodyData.image = imageUrls[0];
      } else if (imageUrls.length > 1) {
        bodyData.images = imageUrls;
      }
    }

    // Add attachments to body
    if (attachments.length > 0) {
      const attachmentPromises = attachments.map(async (att, index) => {
        if (att.file) {
          return {
            id: `attachment-${Date.now()}-${index}`,
            name: att.name,
            url: await convertFileToBase64(att.file)
          };
        }
        return {
          id: `attachment-${Date.now()}-${index}`,
          name: att.name,
          url: att.url
        };
      });
      bodyData.attachments = await Promise.all(attachmentPromises);
    }

    return JSON.stringify(bodyData);
  };

  const extractFilesFromBody = (body: string) => {
    let content = body;
    let images: FileOrUrl[] = [];
    let attachments: FileOrUrl[] = [];

    try {
      const parsed = JSON.parse(body);
      content = parsed.message || body;

      if (parsed.image) {
        images.push({
          name: `image-${Date.now()}.png`,
          url: parsed.image
        });
      }

      if (parsed.images && Array.isArray(parsed.images)) {
        parsed.images.forEach((img: string, index: number) => {
          images.push({
            name: `image-${index + 1}.png`,
            url: img
          });
        });
      }

      if (parsed.attachments && Array.isArray(parsed.attachments)) {
        attachments = parsed.attachments.map((att: any) => ({
          name: att.name,
          url: att.url
        }));
      }
    } catch {
      // If not JSON, check for base64 patterns
      const base64Match = content.match(/"image"\s*:\s*"(data:image[^"]+)"/);
      if (base64Match) {
        images.push({
          name: `embedded-image-${Date.now()}.png`,
          url: base64Match[1]
        });
        content = content.replace(base64Match[0], '').trim();
      }
    }

    return { content, images, attachments };
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getTemplateById = async (id: number): Promise<EmailTemplate | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email template.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (data: { name: string; subject: string; content: string; images: FileOrUrl[]; attachments: FileOrUrl[] }) => {
    setLoading(true);
    try {
      const body = await prepareBodyWithFiles(data.content, data.images, data.attachments);
      const payload: CreateEmailTemplateRequest = {
        name: data.name,
        subject: data.subject,
        body
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create template');
      
      toast({
        title: "Success",
        description: "Email template created successfully."
      });
      
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create email template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: number, data: { name: string; subject: string; content: string; images: FileOrUrl[]; attachments: FileOrUrl[] }) => {
    setLoading(true);
    try {
      const body = await prepareBodyWithFiles(data.content, data.images, data.attachments);
      const payload: CreateEmailTemplateRequest = {
        name: data.name,
        subject: data.subject,
        body
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update template');
      
      toast({
        title: "Success",
        description: "Email template updated successfully."
      });
      
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update email template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete template');
      
      toast({
        title: "Success",
        description: "Email template deleted successfully."
      });
      
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete email template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    extractFilesFromBody
  };
};