
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Eye } from 'lucide-react';
import { EmailTemplate, FileOrUrl } from '@/types/EmailTemplate';

interface TemplatesTableProps {
  templates: EmailTemplate[];
  onDeleteTemplate: (id: number) => Promise<boolean>;
  onViewTemplate: (template: EmailTemplate) => void;
  onEditTemplate: (template: EmailTemplate) => void;
  extractFilesFromBody: (body: string) => { content: string; images: FileOrUrl[]; attachments: FileOrUrl[] };
  loading: boolean;
}

export const TemplatesTable: React.FC<TemplatesTableProps> = ({
  templates,
  onDeleteTemplate,
  onViewTemplate,
  onEditTemplate,
  extractFilesFromBody,
  loading
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50 border-b border-gray-200">
          <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Name</TableHead>
          <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Subject</TableHead>
          <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Content Preview</TableHead>
          <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Files</TableHead>
          <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900">Created</TableHead>
          <TableHead className="px-4 py-3 text-center text-sm font-bold text-gray-900">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100">
        {templates.map((template) => {
          const { content } = extractFilesFromBody(template.body);
          const images = template.images && template.images.length > 0 ? template.images : extractFilesFromBody(template.body).images;
          const attachments = template.attachments && template.attachments.length > 0 ? template.attachments : extractFilesFromBody(template.body).attachments;

          return (
            <TableRow key={template.template_id} className="hover:bg-gray-50 transition-colors">
              <TableCell className="px-4 py-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{template.name}</span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm">{template.subject}</TableCell>
              <TableCell className="px-4 py-3 text-sm">
                <div className="max-w-xs truncate">{content}</div>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm">
                <div className="flex space-x-2">
                  {images.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {images.length} img
                    </span>
                  )}
                  {attachments.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {attachments.length} file
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-sm">
                {template.created_at ? new Date(template.created_at).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onViewTemplate(template)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => onEditTemplate(template)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteTemplate(template.template_id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};