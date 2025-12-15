
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useEmailTemplates } from '@/hooks/useEmailTemplate';
import { CreateTemplateDialog } from '@/components/email-templates/CreateTemplateDialog';
import { EditTemplateDialog } from '@/components/email-templates/EditTemplateDialog';
import { ViewTemplateDialog } from '@/components/email-templates/ViewTemplateDialog';
import { TemplatesTable } from '@/components/email-templates/TemplatesTable';
import { EmailTemplate } from '@/types/EmailTemplate';
import CustomPagination from './CustomPagination';
import { useSidebar } from '@/components/SidebarContext';
const EmailTemplates = () => {
  const {
    templates,
    loading,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    extractFilesFromBody
  } = useEmailTemplates();
  const { isSidebarOpen } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  const filteredTemplates = templates.filter(template =>
    (template.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.subject ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading templates...</div>
      </div>
    );
  }

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
              onDeleteTemplate={deleteTemplate}
              onViewTemplate={setViewingTemplate}
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
                <Button // Update imports if Button not imported, but it is not imported in EmailTemplates.tsx currently? 
                  // Wait, Button IS NOT imported in EmailTemplates.tsx (Step 207). It uses CustomPagination and CreateTemplateDialog.
                  // I need to check imports.
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
        template={viewingTemplate}
        onClose={() => setViewingTemplate(null)}
        extractFilesFromBody={extractFilesFromBody}
      />

      <EditTemplateDialog
        templateId={editingTemplateId}
        template={editingTemplate}
        onClose={handleCloseEditDialog}
        onUpdateTemplate={updateTemplate}
        extractFilesFromBody={extractFilesFromBody}
        loading={loading}
      />
    </div>
  );
};

export default EmailTemplates;
