import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocuments, deleteDocument, toggleDocumentGlobal } from "@/services/knowledgebase";
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Globe, RefreshCw, AlertCircle, Lock } from 'lucide-react';
import { isAdmin, KBAuthSession } from '@/config';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Local interface with new fields
interface Document {
  id: string;
  name: string;
  upload_date: string;
  status: string;
  file_size: number;
  is_global: boolean;
  is_own_document: boolean;
  can_delete: boolean;
}

interface DeleteResponse {
  message: string;
  document: string;
}

interface DocumentListProps {
  searchTerm?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ searchTerm = '' }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tableRef = useRef<HTMLDivElement>(null);
  const newDocRef = useRef<HTMLTableRowElement>(null);
  const prevDocsRef = useRef<Document[]>([]);
  const isAdminUser = isAdmin();

  // Add state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string } | null>(null);

  // Add state for toggle dialog
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [documentToToggle, setDocumentToToggle] = useState<{ id: string; name: string; isGlobal: boolean } | null>(null);


  // Sync KB session on mount
  useEffect(() => {
    KBAuthSession.syncFromMainAuth();
  }, []);

  // Fixed useQuery with proper typing and fallback for new fields
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
    refetchInterval: 5000,
    select: (data): Document[] =>
      data.map((doc: any) => ({
        ...doc,
        is_own_document: doc.is_own_document ?? false,
        can_delete: doc.can_delete ?? false,
      } as Document)),
  });

  const deleteMutation = useMutation<DeleteResponse, any, string>({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: (data: DeleteResponse) => {
      toast({
        title: 'Success',
        description: `Document "${data.document}" deleted successfully`,
        variant: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete document';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      console.error("Delete error:", error);
    }
  });

  const toggleMutation = useMutation<any, any, { id: string; makeGlobal: boolean }>({
    mutationFn: ({ id, makeGlobal }) => toggleDocumentGlobal(id, makeGlobal),
    onSuccess: (data, variables) => {
      const { makeGlobal } = variables;
      const action = makeGlobal ? 'marked as global' : 'made private';
      toast({
        title: 'Success',
        description: `Document ${action}`,
        variant: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update document';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch documents. Retrying...',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Auto-scroll to newly added document
  useEffect(() => {
    if (documents.length > prevDocsRef.current.length) {
      const newDocs = documents.filter(
        doc => !prevDocsRef.current.some(prev => prev.id === doc.id)
      );
      if (newDocs.length > 0 && newDocRef.current) {
        newDocRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    prevDocsRef.current = documents;
  }, [documents]);

  const handleDelete = (documentId: string, documentName: string) => {
    setDocumentToDelete({ id: documentId, name: documentName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleToggleGlobal = (documentId: string, documentName: string, currentIsGlobal: boolean) => {
    setDocumentToToggle({ id: documentId, name: documentName, isGlobal: currentIsGlobal });
    setToggleDialogOpen(true);
  };

  const confirmToggle = () => {
    if (documentToToggle) {
      toggleMutation.mutate({ id: documentToToggle.id, makeGlobal: !documentToToggle.isGlobal });
      setToggleDialogOpen(false);
      setDocumentToToggle(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'uploaded':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const matchedDocIndex = -1; // Removed highlighting logic as we are filtering now

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Document Details</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Scope</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Visibility</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">File Size</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Uploaded</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => {
                const isNewDoc = !prevDocsRef.current.some(d => d.id === doc.id);

                return (
                  <tr
                    key={doc.id}
                    ref={isNewDoc ? newDocRef : null}
                    className={`
                      group transition-colors duration-200
                      ${doc.is_own_document ? 'bg-blue-50/10 hover:bg-blue-50/20' : 'hover:bg-gray-50'}
                      ${isNewDoc ? 'bg-blue-50' : ''}
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm text-gray-900 line-clamp-1 max-w-[240px]" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${doc.is_global
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                        {doc.is_global ? "Global" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {doc.is_own_document && isAdminUser ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleGlobal(doc.id, doc.name, doc.is_global)}
                                disabled={toggleMutation.isPending}
                                className={`h-8 px-3 rounded-lg text-xs font-medium border ml-0 transition-all ${doc.is_global
                                  ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                                  }`}
                              >
                                {doc.is_global ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                                    Make Private
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                                    Make Global
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{doc.is_global ? "Restrict access to only you" : "Share with everyone"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        {doc.can_delete && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(doc.id, doc.name)}
                                  disabled={!doc.can_delete || deleteMutation.isPending}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Document</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {!doc.is_own_document && !doc.can_delete && (
                          <span className="text-xs text-gray-400 italic px-2 cursor-default select-none">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-500 bg-gray-50/30">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-600">No documents found</p>
                    {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search terms</p>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
              <AlertDialogTitle className="text-xl text-gray-900">Delete Document</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-500 text-base leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{documentToDelete?.name}"</span>?
              <br />
              This action cannot be undone and will permanently remove the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)} className="h-10 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white h-10 px-6 shadow-md transition-all"
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${documentToToggle?.isGlobal ? 'bg-gray-100' : 'bg-purple-100'}`}>
                {documentToToggle?.isGlobal ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Globe className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <AlertDialogTitle className="text-xl text-gray-900">
                Make {documentToToggle?.isGlobal ? 'Private' : 'Global'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-500 leading-relaxed">
              Are you sure you want to change the scope for <span className="font-semibold text-gray-900">"{documentToToggle?.name}"</span> to <span className={`font-semibold ${documentToToggle?.isGlobal ? 'text-gray-700' : 'text-purple-600'}`}>{documentToToggle?.isGlobal ? 'Private' : 'Global'}</span>?

              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                {documentToToggle?.isGlobal ? (
                  <Lock className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                ) : (
                  <Globe className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                )}
                <div className="text-sm">
                  {documentToToggle?.isGlobal
                    ? <><span className="font-semibold text-gray-700">Private visibility:</span> Only you will be able to see and access this document.</>
                    : <><span className="font-semibold text-purple-700">Global visibility:</span> The document will be visible to ALL users in the Knowledge Base.</>
                  }
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel onClick={() => setDocumentToToggle(null)} className="h-10 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
              className={`h-10 px-6 shadow-md transition-all text-white ${documentToToggle?.isGlobal ? 'bg-gray-800 hover:bg-gray-900' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentList;