import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Edit, Trash2, Image, Paperclip, Eye, Save, X, ArrowUpDown, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import CustomPagination from './CustomPagination';
import { useSidebar } from '@/components/SidebarContext';
interface FileOrUrl {
  name: string;
  url?: string;
  file?: File;
}

interface ChatTemplate {
  id: string;
  name: string;
  content: string;
  attachments: FileOrUrl[];
  images: FileOrUrl[];
  createdAt: string;
}

const ChatTemplates = () => {
  const { toast } = useToast();
  const { isSidebarOpen } = useSidebar()
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<ChatTemplate | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const editAttachmentInputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);

  useEffect(() => {
    getTemplateDetails();
  }, []);

  const getTemplateDetails = () => {
    axios
      .get("https://10.16.7.96/api/chat_templates/")
      .then((response) => {
        const mappedTemplates = response.data.map((item: any) => ({
          id: String(item.chat_template_id),
          name: item.chat_template_name,
          content: item.chat_template_body,
          attachments: (item.chat_attachments || []).map((att: any) => ({
            name: att.name,
            url: att.url,
          })),
          images: (item.chat_images || []).map((img: any) => ({
            name: img.name,
            url: img.url,
          })),
          createdAt: item.created_at || new Date().toISOString(),
        }));
        setTemplates(mappedTemplates);
        console.log("Fetched template details:", mappedTemplates);
      })
      .catch((error) => {
        console.error("Error fetching templates:", error);
      });
  };

  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    content: string;
    attachments: ({ name: string; url: string } | { name: string; file: File })[];
    images: ({ name: string; url: string } | { name: string; file: File })[];
  }>({
    name: '',
    content: '',
    attachments: [],
    images: []
  });

  const [editingData, setEditingData] = useState<ChatTemplate | null>(null);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleCreateTemplate = async () => {
    const attachmentsBase64 = await Promise.all(
      newTemplate.attachments.map(async (att: any) => {
        if (att.file) {
          return {
            id: uuid(),
            name: att.name,
            url: await fileToBase64(att.file),
          };
        }
        return {
          id: att.id || uuid(),
          name: att.name,
          url: att.url,
        };
      })
    );

    const imagesBase64 = await Promise.all(
      newTemplate.images.map(async (img: any) => {
        if (img.file) {
          return {
            id: uuid(),
            name: img.name,
            url: await fileToBase64(img.file),
          };
        }
        return {
          id: img.id || uuid(),
          name: img.name,
          url: img.url,
        };
      })
    );

    const chatTemplateBody = JSON.stringify({
      message: newTemplate.content,
      chat_attachments: attachmentsBase64,
      chat_images: imagesBase64,
    });

    const templateToSave = {
      chat_template_name: newTemplate.name,
      chat_template_body: chatTemplateBody,
    };

    axios.post("https://10.16.7.96/api/chat_templates/", templateToSave, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => {
        console.log("Posting response in templates api:", response);
        getTemplateDetails();
        setNewTemplate({ name: '', content: '', attachments: [], images: [] });
        setIsCreateDialogOpen(false);
        toast({
          title: "Template Created",
          description: "New chat template has been successfully created.",
          variant: "success",
        });
      })
      .catch((error) => {
        console.error("Error posting template:", error);
        toast({
          title: "Error",
          description: "Please enter the required fields",
        });
      });
  };

  const base64ToFile = (base64: string, filename: string, mimeType = "image/png") => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleEditTemplate = async (template: ChatTemplate) => {
    try {
      const response = await axios.get(`https://10.16.7.96/api/chat_templates/${template.id}`);
      const item = response.data;

      let content = item.chat_template_body;
      let attachments: FileOrUrl[] = [];
      let images: FileOrUrl[] = [];

      try {
        const parsed = JSON.parse(item.chat_template_body);
        content = parsed.message || item.chat_template_body;

        // Extract embedded base64 image from parsed content
        if (parsed.image && parsed.image.startsWith('data:image')) {
          const imageName = `embedded-image-${Date.now()}.png`;
          images.push({
            name: imageName,
            url: parsed.image
          });
        }

        // Convert attachments base64 to file objects or keep as url
        attachments = (parsed.chat_attachments || []).map((att: any) => {
          if (att.url?.startsWith("data:")) {
            return {
              name: att.name,
              file: base64ToFile(att.url, att.name)
            };
          }
          return {
            name: att.name,
            url: att.url
          };
        });
      } catch {
        // Check for base64 image in string format
        const base64Match = content.match(/"image"\s*:\s*"(data:image[^"]+)"/);
        if (base64Match) {
          const imageName = `embedded-image-${Date.now()}.png`;
          images.push({
            name: imageName,
            url: base64Match[1]
          });
          // Remove the base64 image from content
          content = removeBase64ImageFromContent(content);
        }

        attachments = (item.chat_attachments || []).map((att: any) => ({
          name: att.name,
          url: att.url,
        }));
      }

      // Add existing images from API response
      const existingImages = (item.chat_images || []).map((img: any) => {
        if (img.url?.startsWith("data:")) {
          return {
            name: img.name,
            file: base64ToFile(img.url, img.name)
          };
        }
        return {
          name: img.name,
          url: img.url
        };
      });

      images = [...images, ...existingImages];

      setEditingData({
        id: String(item.chat_template_id),
        name: item.chat_template_name,
        content,
        attachments,
        images,
        createdAt: item.created_at || new Date().toISOString(),
      });
      setEditingTemplate(template.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch template details.",
      });
      console.error("Error fetching template details:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingData) return;

    try {
      // Process images - convert to base64 or keep url
      const processedImages = await Promise.all(
        editingData.images.map(async (img) => {
          if (img.file) {
            return await fileToBase64(img.file);
          }
          return img.url || '';
        })
      );

      // Get the first image as base64/url string for embedding
      const embeddedImage = processedImages.length > 0 ? processedImages[0] : null;

      // Convert attachments to base64
      const attachmentsBase64 = await Promise.all(
        editingData.attachments.map(async (att: any) => {
          if (att.file) {
            return {
              id: uuid(),
              name: att.name,
              url: await fileToBase64(att.file),
            };
          }
          return {
            id: att.id || uuid(),
            name: att.name,
            url: att.url,
          };
        })
      );

      // Construct content object
      const contentObject: any = {
        message: editingData.content,
      };

      if (embeddedImage) {
        contentObject.image = embeddedImage;
      }

      if (attachmentsBase64.length > 0) {
        contentObject.chat_attachments = attachmentsBase64;
      }

      const updatedContent = JSON.stringify(contentObject);

      // Prepare the update payload
      const updatePayload = {
        chat_template_name: editingData.name,
        chat_template_body: updatedContent
      };

      // Make PUT API call
      const response = await axios.put(
        `https://10.16.7.96/api/chat_templates/${editingData.id}`,
        updatePayload,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log("Update response:", response);

      // Refresh the templates list
      getTemplateDetails();

      // Close dialog and reset state
      setEditingTemplate(null);
      setEditingData(null);

      // Show success toast
      toast({
        title: "Template Updated",
        description: "Chat template has been successfully updated.",
        variant: "success",
      });

    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update chat template.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditingData(null);
  };

  const handleDeleteClick = (templateId: string) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDeleteTemplate = () => {
    if (!deleteTemplateId) return;

    axios
      .delete(`https://10.16.7.96/api/chat_templates/${deleteTemplateId}`)
      .then(() => {
        setTemplates(templates.filter(template => template.id !== deleteTemplateId));
        setDeleteTemplateId(null);
        toast({
          title: "Template Deleted",
          description: "Chat template has been successfully deleted.",
          variant: "success",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to delete chat template.",
        });
        console.error("Error deleting template:", error);
      });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const files = event.target.files;
    if (files) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
      const validFiles = Array.from(files).filter(file =>
        imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      );

      if (validFiles.length < files.length) {
        toast({
          title: "Invalid File Type",
          description: "Some files were skipped because they are not images.",
          variant: "destructive",
        });
      }

      const fileObjs = validFiles.map(file => ({ name: file.name, file }));
      if (isEditing && editingData) {
        setEditingData({
          ...editingData,
          images: [...editingData.images, ...fileObjs]
        });
      } else {
        setNewTemplate({
          ...newTemplate,
          images: [...newTemplate.images, ...fileObjs]
        });
      }
    }
    event.target.value = '';
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const files = event.target.files;
    if (files) {
      const fileObjs = Array.from(files).map(file => ({ name: file.name, file }));
      if (isEditing && editingData) {
        setEditingData({
          ...editingData,
          attachments: [...editingData.attachments, ...fileObjs]
        });
      } else {
        setNewTemplate({
          ...newTemplate,
          attachments: [...newTemplate.attachments, ...fileObjs]
        });
      }
    }
    event.target.value = '';
  };

  const removeImage = (index: number, isEditing = false) => {
    if (isEditing && editingData) {
      setEditingData({
        ...editingData,
        images: editingData.images.filter((_, i) => i !== index)
      });
    }
  };

  const removeAttachment = (index: number, isEditing = false) => {
    if (isEditing && editingData) {
      setEditingData({
        ...editingData,
        attachments: editingData.attachments.filter((_, i) => i !== index)
      });
    } else {
      setNewTemplate({
        ...newTemplate,
        attachments: newTemplate.attachments.filter((_, i) => i !== index)
      });
    }
  };

  const extractBase64Image = (content: string) => {
    try {
      const match = content.match(/"image"\s*:\s*"([^"]+)"/);
      if (match && match[1].startsWith('data:image')) {
        return match[1];
      }
    } catch { }
    return null;
  };

  const removeBase64ImageFromContent = (content: string) => {
    let cleaned = content
      .replace(/"image"\s*:\s*"data:image[^"]*"/g, "")
      .replace(/"image"\s*:\s*\[image\]/g, "")
      .replace(/(\{\s*\})/g, "")
      .replace(/,\s*}/g, "}")
      .replace(/{\s*,/g, "{")
      .replace(/\n{2,}/g, "\n")
      .trim();
    return cleaned;
  };

  const handleViewTemplate = (template: ChatTemplate) => {
    setViewingTemplate(template);
  };

  const getFileCountDisplay = (files: FileOrUrl[], type: 'image' | 'file') => {
    if (files.length === 0) return null;

    const bgColor = type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    const icon = type === 'image' ? '🖼️' : '📎';

    if (files.length === 1) {
      return (
        <span className={`text-xs px-2 py-1 rounded ${bgColor}`}>
          {icon} 1 {type}
        </span>
      );
    }

    return (
      <span className={`text-xs px-2 py-1 rounded ${bgColor}`}>
        {icon} {files.length} {type}s
      </span>
    );
  };

  const getContentPreview = (content: string) => {
    const cleanContent = removeBase64ImageFromContent(content);
    return cleanContent.length > 100 ? cleanContent.substring(0, 100) + '...' : cleanContent;
  };
  const handleSort = (field: string) => {

  };
  return (
    <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat Templates</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Chat Template</DialogTitle>
              <DialogDescription>
                Create a new chat template to use in your conversations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Enter your chat template content here..."
                />
              </div>
              <div className="flex space-x-4">
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
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleAttachmentUpload(e)}
                  className="hidden"
                />
              </div>
              {newTemplate.attachments.length > 0 && (
                <div>
                  <Label>Attachments:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center bg-green-100 px-3 py-1 rounded">
                        <span className="text-sm">{attachment.name}</span>
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
              <Button onClick={handleCreateTemplate} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
              {/* Re-add search icon if needed, but Input has padding. Let's add the icon manually like other pages */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {/* Reuse existing search icon style if you want, or just generic Search lucide */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead onClick={() => handleSort('firstname')} className="px-4 py-3 text-left text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      Template Name <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900 min-w-[120px]">Content Preview</TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900 min-w-[120px]">Files</TableHead>
                  <TableHead className="px-4 py-3 text-left text-sm font-bold text-gray-900 min-w-[120px]">Created</TableHead>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold text-gray-900 min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100">
                {paginatedTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTemplates.map((template) => (
                    <TableRow
                      key={template.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <TableCell className="px-4 py-3 font-medium text-sm">{template.name}</TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {getContentPreview(template.content)}
                          </div>
                          {extractBase64Image(template.content) && (
                            <div className="mt-1">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                📷 Embedded Image
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {getFileCountDisplay(template.images, 'image')}
                          {getFileCountDisplay(template.attachments, 'file')}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-sm">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleViewTemplate(template)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEditTemplate(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
        </CardContent >
      </Card >

      {editingTemplate && editingData && (
        <Dialog open={!!editingTemplate} onOpenChange={() => { setEditingTemplate(null); setEditingData(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
            <DialogHeader className="p-4 py-3 border-b">
              <DialogTitle className="text-lg font-bold">Edit Chat Template</DialogTitle>
              <DialogDescription>
                Update your chat template content and attachments.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="editTemplateName" className="text-xs font-semibold text-gray-600 tracking-wide">Template Name</Label>
                <Input
                  id="editTemplateName"
                  value={editingData.name}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  placeholder="e.g., Welcome Message"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editContent" className="text-xs font-semibold text-gray-600 tracking-wide">Message Content</Label>
                <div className="relative">
                  <Textarea
                    id="editContent"
                    rows={6}
                    value={editingData.content}
                    onChange={(e) => setEditingData({ ...editingData, content: e.target.value })}
                    placeholder="Type your message here..."
                    className="min-h-[100px] resize-none pr-12 text-sm"
                  />
                  <div className="absolute right-2 bottom-2 text-[10px] text-muted-foreground bg-white/80 px-1.5 py-0.5 rounded border shadow-sm">
                    {editingData.content.length}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editImageInputRef.current?.click()}
                  className="flex items-center space-x-1.5 h-8 text-xs"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editAttachmentInputRef.current?.click()}
                  className="flex items-center space-x-1.5 h-8 text-xs"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Add Attachment</span>
                </Button>
                <input
                  ref={editImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                <input
                  ref={editAttachmentInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleAttachmentUpload(e, true)}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Images Section */}
                {editingData.images.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 tracking-wide">Images ({editingData.images.length})</Label>
                    <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-lg p-2 min-h-[80px]">
                      <div className="grid grid-cols-4 gap-2">
                        {editingData.images.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square bg-white rounded border overflow-hidden">
                            {img.file ? (
                              <img
                                src={URL.createObjectURL(img.file)}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-6 w-6 rounded-full"
                                onClick={() => removeImage(idx, true)}
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

                {/* Attachments Section */}
                {editingData.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 tracking-wide">Attachments ({editingData.attachments.length})</Label>
                    <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-lg p-2 min-h-[80px] flex flex-col gap-1.5">
                      <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                        {editingData.attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded border text-xs group">
                            <span className="truncate flex-1 mr-2" title={att.name}>{att.name}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeAttachment(idx, true)}
                              className="h-5 w-5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-3 border-t bg-gray-50/50">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Template Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={(open) => !open && setViewingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 py-3 border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">{viewingTemplate?.name}</DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Chat Template Preview
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Content Section */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Message Content</Label>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 min-h-[100px]">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 font-sans">
                  {viewingTemplate ? removeBase64ImageFromContent(viewingTemplate.content) : ''}
                </p>

                {/* Images */}
                {viewingTemplate && viewingTemplate.images && viewingTemplate.images.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 block">Images</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {viewingTemplate.images.map((img, index) => (
                        <div key={index} className="group relative rounded border border-gray-200 bg-white aspect-square overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            {viewingTemplate && viewingTemplate.attachments && viewingTemplate.attachments.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  Attachments ({viewingTemplate.attachments.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {viewingTemplate.attachments.map((att, index) => (
                    <div key={index} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      <Paperclip className="w-3 h-3 text-gray-500" />
                      {att.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-3 border-t bg-gray-50/50">
            <Button variant="outline" size="sm" onClick={() => setViewingTemplate(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ChatTemplates;
