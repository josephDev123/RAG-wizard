import React, { useRef } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Document {
  id: string;
  name: string;
  content: File;
  chunks: number;
  docLength: number;
}

interface DocumentUploadProps {
  onUpload: (files: FileList) => void;
  isProcessing: boolean;
  documents: Document;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  isProcessing,
  documents,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
        <h3 className="text-white font-semibold mb-2">Upload Documents</h3>
        <p className="text-white/70 text-sm mb-4">
          Drag and drop files here, or click to select
        </p>
        <p className="text-white/50 text-xs mb-4">
          Supports: .txt, .md, .pdf files
        </p>

        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="bg-white/20 hover:bg-white/30 border-white/30"
          variant="outline"
        >
          {isProcessing ? "Processing..." : "Select Files"}
        </Button>
      </div>

      {/* Document List */}
      {documents?.docLength > 0 && (
        <div className="space-y-2">
          <h4 className="text-white font-medium">Uploaded Documents</h4>
          {/* {documents.map((doc) => ( */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-white text-sm font-medium">
                    {documents.name ?? ""}
                  </div>
                  <div className="text-white/60 text-xs">
                    {documents.chunks ?? 0} chunks processed
                  </div>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </CardContent>
          </Card>
          {/* ))} */}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
