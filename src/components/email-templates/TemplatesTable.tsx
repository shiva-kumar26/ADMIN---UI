
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
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Content Preview</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => {
          const { content, images, attachments } = extractFilesFromBody(template.body);
          
          return (
            <TableRow key={template.template_id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>{template.name}</span>
                </div>
              </TableCell>
              <TableCell>{template.subject}</TableCell>
              <TableCell>
                <div className="max-w-xs truncate">{content}</div>
              </TableCell>
              <TableCell>
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
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onViewTemplate(template)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEditTemplate(template)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDeleteTemplate(template.template_id)}
                    className="text-red-600 hover:text-red-700"
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