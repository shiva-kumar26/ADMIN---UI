// DocumentList.tsx - FINAL VERSION (No Errors, Fully Working)
import React, { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocuments, deleteDocument, toggleDocumentGlobal } from "@/services/knowledgebase";
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, FileText } from 'lucide-react';
import { isAdmin } from '@/config';
import { KBAuthSession } from '@/config';

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
    if (window.confirm(`Are you sure you want to delete "${documentName}"?`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const handleToggleGlobal = (documentId: string, currentIsGlobal: boolean) => {
    const makeGlobal = !currentIsGlobal;
    if (window.confirm(`Make this document ${makeGlobal ? 'global' : 'private'}?`)) {
      toggleMutation.mutate({ id: documentId, makeGlobal });
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
        return 'text-green-600';
      case 'processing':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const matchedDocIndex = documents.findIndex(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const matchedDocRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (matchedDocRef.current && searchTerm) {
      matchedDocRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [matchedDocIndex, searchTerm]);

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">Loading documents...</div>;
  }

  return (
    <div
      ref={tableRef}
      className="bg-white rounded-lg overflow-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 border border-gray-200"
    >
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 sticky top-0 bg-white z-10">
            <th className="p-4 text-gray-500 font-medium text-sm">Document Title</th>
            <th className="p-4 text-gray-500 font-medium text-sm">Status</th>
            <th className="p-4 text-gray-500 font-medium text-sm">Scope</th>
            <th className="p-4 text-gray-500 font-medium text-sm">Size</th>
            <th className="p-4 text-gray-500 font-medium text-sm">Uploaded</th>
            <th className="p-4 text-gray-500 font-medium text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.length > 0 ? (
            documents.map((doc, index) => {
              const isNewDoc = !prevDocsRef.current.some(d => d.id === doc.id);
              const isFirstMatch = index === matchedDocIndex && searchTerm;
              const isAnyMatch = searchTerm && doc.name.toLowerCase().includes(searchTerm.toLowerCase());

              // Highlight own documents
              const rowClass = doc.is_own_document
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'bg-white';

              return (
                <tr
                  key={doc.id}
                  ref={isFirstMatch ? matchedDocRef : isNewDoc ? newDocRef : null}
                  className={`border-b border-gray-200 transition-all ${rowClass} ${
                    isFirstMatch ? 'bg-yellow-100' :
                    isAnyMatch ? 'bg-yellow-50' :
                    isNewDoc ? 'bg-blue-100 animate-pulse' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {doc.is_global ? 'Global ' : ''}{doc.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {doc.is_global ? (
                      <span className="text-blue-600 font-medium">Global</span>
                    ) : (
                      <span className="text-gray-500">Personal</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{formatFileSize(doc.file_size)}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* Toggle Global/Private - only for own documents */}
                      {doc.is_own_document && isAdminUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleGlobal(doc.id, doc.is_global)}
                          disabled={toggleMutation.isPending}
                          className={
                            doc.is_global
                              ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                              : 'text-green-600 border-green-300 hover:bg-green-50'
                          }
                        >
                          {doc.is_global ? 'Make Private' : 'Make Global'}
                        </Button>
                      )}

                      {/* Delete Button - only if can_delete */}
                      {doc.can_delete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.name)}
                          disabled={!doc.can_delete || deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}

                      {/* No actions available */}
                      {!doc.is_own_document && !doc.can_delete && (
                        <span className="text-sm text-gray-400 italic">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="p-12 text-center text-gray-500">
                No documents found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;