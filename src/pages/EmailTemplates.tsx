import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { useEmailTemplates } from '@/hooks/useEmailTemplate'; // Removed
import { CreateTemplateDialog } from '@/components/email-templates/CreateTemplateDialog';
import { EditTemplateDialog } from '@/components/email-templates/EditTemplateDialog';
import { ViewTemplateDialog } from '@/components/email-templates/ViewTemplateDialog';
import { TemplatesTable } from '@/components/email-templates/TemplatesTable';
import { EmailTemplate, CreateEmailTemplateRequest, FileOrUrl } from '@/types/EmailTemplate';
import CustomPagination from './CustomPagination';
import { useSidebar } from '@/components/SidebarContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://10.16.7.96/api/email_templates';

const EmailTemplates = () => {
  // State moved from useEmailTemplate
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { isSidebarOpen } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // --- Helper Functions (From Hook) ---

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const preparePayload = async (content: string, images: FileOrUrl[], attachments: FileOrUrl[]) => {
    // 1. Convert all images to base64 objects
    const processedImages = await Promise.all(images.map(async (img) => ({
      name: img.name,
      url: img.file ? await convertFileToBase64(img.file) : img.url
    })));

    // 2. Convert all attachments to base64 objects
    const processedAttachments = await Promise.all(attachments.map(async (att) => ({
      name: att.name,
      url: att.file ? await convertFileToBase64(att.file) : att.url
    })));

    // 3. Merge them (backend only has one 'attachments' list)
    const allFiles = [...processedImages, ...processedAttachments];

    // 4. Construct JSON body per backend expectation
    const bodyData = {
      message: content,
      attachments: allFiles
    };

    console.log('Final Payload Body:', bodyData);
    return { body: JSON.stringify(bodyData) };
  };

  const extractFilesFromBody = (body: string, apiAttachments: FileOrUrl[] = []) => {
    let content = body;
    let allFiles: FileOrUrl[] = [...apiAttachments];

    try {
      const parsed = JSON.parse(body);
      content = parsed.message || body;

      // If no API attachments provided, check body for legacy/optimistic attachments
      if (allFiles.length === 0 && parsed.attachments && Array.isArray(parsed.attachments)) {
        allFiles = parsed.attachments.map((att: any) => ({
          name: att.name,
          url: att.url || att.data // Handle variations
        }));
      }
    } catch (e) {
      // Plain text body
    }

    // Split into images and attachments based on extension
    const images: FileOrUrl[] = [];
    const attachments: FileOrUrl[] = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

    allFiles.forEach(file => {
      const isImg = imageExtensions.some(ext => (file.name || '').toLowerCase().endsWith(ext));
      if (isImg) {
        images.push(file);
      } else {
        attachments.push(file);
      }
    });

    return { content, images, attachments };
  };

  // --- API Functions (From Hook) ---

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
      const { body } = await preparePayload(data.content, data.images, data.attachments);
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
      const { body } = await preparePayload(data.content, data.images, data.attachments);
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

  // --- End Helper Functions ---

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleEditTemplate = async (template: EmailTemplate) => {
    const fullTemplate = await getTemplateById(template.template_id);
    if (fullTemplate) {
      setEditingTemplate(fullTemplate);
      setEditingTemplateId(template.template_id);
    }
  };

  const handleCloseEditDialog = () => {
    setEditingTemplate(null);
    setEditingTemplateId(null);
  };

  const handleDeleteClick = async (id: number) => {
    setDeleteTemplateId(id);
    return false;
  };

  const confirmDelete = async () => {
    if (deleteTemplateId !== null) {
      await deleteTemplate(deleteTemplateId);
      setDeleteTemplateId(null);
    }
  };

  const filteredTemplates = templates.filter(template =>
    (template.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.subject ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  if (loading && templates.length === 0) { // Only show full loader if no data yet or initial load
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading templates...</div>
      </div>
    );
  }

  // Debug: Log file counts when viewing template
  const viewingFiles = viewingTemplate ? extractFilesFromBody(viewingTemplate.body) : { images: [], attachments: [] };

  // Force update viewing template images/attachments from extraction if missing
  // This ensures the Dialog gets the data even if the object property is empty
  const enrichedViewingTemplate = viewingTemplate ? {
    ...viewingTemplate,
    images: viewingFiles.images,
    attachments: viewingFiles.attachments
  } : null;

  return (
    <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Templates</h1>
        </div>
        <CreateTemplateDialog
          onCreateTemplate={createTemplate}
          loading={loading}
        />
      </div>

      <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
        <CardContent className="p-0">

          {/* Search Section */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md w-full">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl bg-white w-full"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <TemplatesTable
              templates={paginatedTemplates}
              onDeleteTemplate={handleDeleteClick}
              onViewTemplate={(template) => {
                setViewingTemplate(template);
                // We can debug log here too, logic is same
              }}
              onEditTemplate={handleEditTemplate}
              extractFilesFromBody={extractFilesFromBody}
              loading={loading}
            />
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {filteredTemplates.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} entries
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-md px-2 py-1 text-sm bg-white"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ViewTemplateDialog
        template={enrichedViewingTemplate}
        onClose={() => setViewingTemplate(null)}
        extractFilesFromBody={extractFilesFromBody}
        initialImages={viewingFiles.images}
        initialAttachments={viewingFiles.attachments}
      />

      <EditTemplateDialog
        templateId={editingTemplateId}
        template={editingTemplate}
        onClose={handleCloseEditDialog}
        onUpdateTemplate={updateTemplate}
        extractFilesFromBody={extractFilesFromBody}
        loading={loading}
      />

      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the email template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmailTemplates;
