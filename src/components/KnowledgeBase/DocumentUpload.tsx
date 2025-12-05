import React, { useState, useEffect } from "react";  // <-- Added useEffect
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { uploadDocuments } from "@/services/knowledgebase"; // your service file
import { KBAuthSession } from '@/config';  // <-- NEW IMPORT: For KB auth sync

const DocumentUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ==================== SYNC KB SESSION ON MOUNT ====================
  useEffect(() => {
    KBAuthSession.syncFromMainAuth();
  }, []);
  // =================================================================

  /* ------------------------------------------------------------------ */
  /*  File selection + 10 MB validation                                 */
  /* ------------------------------------------------------------------ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10 MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(files);
  };

  /* ------------------------------------------------------------------ */
  /*  Upload handler – uses your uploadDocuments() + kbApi.post          */
  /* ------------------------------------------------------------------ */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    // ---- Show loading toast -------------------------------------------------
    const loadingToast = toast({
      title: "Uploading...",
      description: `Uploading ${selectedFiles.length} file(s)...`,
    });

    try {
      const response = await uploadDocuments(selectedFiles); // uses kbApi + FormData

      // ---- Success ---------------------------------------------------------
      toast({
        title: "Upload Successful",
        description: `Uploaded ${
          response.files?.length ?? selectedFiles.length
        } document(s). They are being processed.`,
      });

      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSelectedFiles([]);
      setIsOpen(false);
    } catch (error: any) {
      // ---- Detailed error logging -----------------------------------------
      console.error("Upload error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      const errMsg =
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        "Failed to upload files";

      toast({
        title: "Upload Failed",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      // Dismiss the loading toast (if it still exists)
      loadingToast?.dismiss?.();
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Add Document
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Upload documents (PDF, DOCX, PNG, JPG, JPEG – max 10 MB each).
        </DialogDescription>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4 p-2 border border-gray-300 rounded w-full"
          accept=".pdf,.docx,.png,.jpg,.jpeg"
        />

        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Selected Files:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {selectedFiles.map((file, i) => (
                <li key={i} className="text-sm">
                  {file.name} (
                  {(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Upload Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpload;