// knowledgebase.ts (updated)
import { kbApi } from '../config';

interface Document {
  id: string;
  name: string;
  upload_date: string;
  status: string;
  file_size: number;
  is_global: boolean;
}

interface DeleteResponse {
  message: string;
  document: string;
}

/**
 * Fetch all uploaded documents
 * (Flask endpoint: GET /chat-documents)
 */
export const fetchDocuments = async (): Promise<Document[]> => {
  const response = await kbApi.get("/chat-documents");
  // Backend returns { documents: [...], total: n }
  return response.data.documents || [];
};

/**
 * Upload one or more documents
 * (Flask endpoint: POST /process-files)
 */
export const uploadDocuments = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await kbApi.post("/process-files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data; // Returns { message, files: [...] }
};

/**
 * Delete a specific document by ID
 * (Flask endpoint: DELETE /documents/<document_id>)
 */
export const deleteDocument = async (
  documentId: string
): Promise<DeleteResponse> => {
  const response = await kbApi.delete(`/documents/${documentId}`);
  return response.data;
};

/**
 * Toggle a document's global status
 * (Flask endpoints: POST /documents/<id>/mark-global or /unmark-global)
 */
export const toggleDocumentGlobal = async (
  documentId: string,
  makeGlobal: boolean
): Promise<any> => {
  const action = makeGlobal ? 'mark-global' : 'unmark-global';
  const response = await kbApi.post(`/documents/${documentId}/${action}`);
  return response.data;
};