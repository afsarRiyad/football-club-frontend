"use client";

import React, { useState, useRef } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  accept = "image/*",
  multiple = false,
  maxFiles = 10,
  onFilesSelected,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, multiple ? maxFiles : 1);
    setSelectedFiles((prev) => {
      const combined = multiple ? [...prev, ...newFiles] : newFiles;
      const result = combined.slice(0, maxFiles);
      onFilesSelected(result);
      return result;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-150 cursor-pointer",
          isDragging
            ? "border-pitch-accent bg-pitch-accent/5"
            : "border-line hover:border-mist",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Upload className="h-8 w-8 text-mist mx-auto mb-3" />
        <p className="text-sm text-mist">
          Drag and drop files here, or{" "}
          <span className="text-pitch-accent font-medium">browse</span>
        </p>
        <p className="text-xs text-mist/70 mt-1">
          {multiple ? `Up to ${maxFiles} files` : "Single file"} &bull;{" "}
          {accept}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-2 bg-surface rounded-lg border border-line"
            >
              <FileIcon className="h-4 w-4 text-mist" />
              <span className="text-sm text-floodlight flex-1 truncate">
                {file.name}
              </span>
              <span className="text-xs text-mist">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-mist hover:text-alert-red transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
