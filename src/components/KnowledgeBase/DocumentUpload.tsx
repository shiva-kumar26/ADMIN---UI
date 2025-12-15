import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast"; // Correct hook import
import { useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

import { uploadDocuments } from "@/services/knowledgebase";
import { KBAuthSession } from '@/config';

const DocumentUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    KBAuthSession.syncFromMainAuth();
  }, []);

  const handleFileSelect = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10 MB limit`,
          variant: "destructive",
        });
        return false;
      }
      // Check for duplicates
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        toast({
          title: "Duplicate file",
          description: `${file.name} is already selected`,
          variant: "default", // or warning if available
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(Array.from(e.target.files));
      // Reset input so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const loadingToast = toast({
      title: "Uploading...",
      description: `Uploading ${selectedFiles.length} file(s)...`,
    });

    try {
      const response = await uploadDocuments(selectedFiles);

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${response.files?.length ?? selectedFiles.length} document(s).`,
        variant: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSelectedFiles([]);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errMsg = error.response?.data?.error || error.message || "Failed to upload files";
      toast({
        title: "Upload Failed",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Toast dismissal is handled by newer toasts or timeout
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-blue-500/25">
          <Upload className="w-5 h-5 mr-2" />
          Add Document
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl bg-white p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">Upload Documents</DialogTitle>
          <DialogDescription className="text-gray-500 mt-1">
            Drag and drop files here or click to browse. Supported formats: PDF, DOCX, PNG, JPG (Max 10MB).
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2">
          {/* Drag & Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative group cursor-pointer
              border-2 border-dashed rounded-xl p-10
              flex flex-col items-center justify-center text-center
              transition-all duration-200 ease-in-out
              ${isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
              }
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleInputChange}
            />

            <div className={`
              p-4 rounded-full mb-4 transition-colors
              ${isDragging ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500"}
            `}>
              <Upload className="w-8 h-8" />
            </div>

            <p className="text-sm font-medium text-gray-900">
              <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                <span>Selected Files ({selectedFiles.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-red-500 hover:text-red-600 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFiles([]);
                  }}
                >
                  Clear all
                </Button>
              </h4>
              <div className="space-y-2">
                {selectedFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-md border border-gray-100 shadow-sm text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-700 truncate block max-w-[200px] sm:max-w-[280px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 bg-gray-50/50 border-t border-gray-100">
          <div className="flex w-full items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
              className="px-5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className={`
                px-6 min-w-[100px]
                ${uploading
                  ? "bg-blue-400"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                } text-white shadow-md
              `}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpload;