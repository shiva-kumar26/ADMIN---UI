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
      console.log('Processing images for payload:', images);
      const imagePromises = images.map(async (img) => {
        if (img.file) {
          try {
            const base64 = await convertFileToBase64(img.file);
            console.log('Converted image to base64 length:', base64.length);
            return base64;
          } catch (err) {
            console.error('Failed to convert image:', err);
            return null;
          }
        }
        return img.url;
      });
      const imageUrls = (await Promise.all(imagePromises)).filter(Boolean); // Filter out failed conversions

      console.log('Final image URLs for payload:', imageUrls.length);

      if (imageUrls.length === 1) {
        bodyData.image = imageUrls[0];
      } else if (imageUrls.length > 1) {
        bodyData.images = imageUrls;
      }
    }

    // Add attachments to body
    if (attachments.length > 0) {
      console.log('Processing attachments for payload:', attachments);
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

    const jsonBody = JSON.stringify(bodyData);
    console.log('Final Body Payload (truncated):', jsonBody.substring(0, 500) + '...');
    return jsonBody;
  };

  const extractFilesFromBody = (body: string) => {
    let content = body;
    let images: FileOrUrl[] = [];
    let attachments: FileOrUrl[] = [];

    try {
      // console.log('Extracting files from body:', body); // Debug log (can be removed later)
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
    } catch (e) {
      console.warn('Failed to parse template body JSON:', e);
      // If not JSON, check for base64 patterns using a more robust regex
      // Matches "image":"data:image..." or "image": "data:image..."
      const base64Match = content.match(/"image"\s*:\s*"(data:image\/[^;]+;base64,[^"]+)"/);
      if (base64Match) {
        images.push({
          name: `embedded-image-${Date.now()}.png`,
          url: base64Match[1]
        });
        // Try to clean up the JSON-like part from content if possible, or just leave it
        // content = content.replace(base64Match[0], '').trim(); 
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
        description: "Email template created successfully.",
        variant: "success"
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
        description: "Email template updated successfully.",
        variant: "success"
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
        description: "Email template deleted successfully.",
        variant: "success"
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