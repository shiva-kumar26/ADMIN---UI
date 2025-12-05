
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
 const {isSidebarOpen} = useSidebar()
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
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="space-y-6 mt-8">
       <Card
                className={` h-[88vh] flex flex-col mx-1 mb-2 ${
                  !isSidebarOpen ? 'w-full ml-10' : 'max-w-[1230px]'
                }`}
              >
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Email Templates</CardTitle>
            <div className="flex gap-4">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <CreateTemplateDialog 
                onCreateTemplate={createTemplate}
                loading={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TemplatesTable
            templates={paginatedTemplates}
            onDeleteTemplate={deleteTemplate}
            onViewTemplate={setViewingTemplate}
            onEditTemplate={handleEditTemplate}
            extractFilesFromBody={extractFilesFromBody}
            loading={loading}
          />

    
        </CardContent>
      </Card>
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        filteredUsers={filteredTemplates}
        startIndex={startIndex}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
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
