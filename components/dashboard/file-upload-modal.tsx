"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { UploadProgress } from "@/lib/types";

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileUploadModal({ open, onOpenChange }: FileUploadModalProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { currentFolder, addError } = useAppStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: "pending",
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      "text/markdown": [".md", ".markdown"],
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/zip": [".zip"],
    },
  });

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // 如果只有一个文件，使用单文件上传
      if (uploadFiles.length === 1) {
        await uploadSingleFile(uploadFiles[0], 0);
      } else {
        // 多文件上传
        await uploadMultipleFiles();
      }
    } catch (error) {
      addError("上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadSingleFile = async (uploadFile: UploadProgress, index: number) => {
    try {
      setUploadFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: "uploading" } : f
      ));

      const formData = new FormData();
      formData.append("file", uploadFile.file);
      if (currentFolder?.id) {
        formData.append("folder_id", currentFolder.id);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: "completed", progress: 100 } : f
        ));
      } else {
        const error = await response.json();
        setUploadFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: "error", error: error.error } : f
        ));
      }
    } catch (error) {
      setUploadFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: "error", error: "上传失败" } : f
      ));
    }
  };

  const uploadMultipleFiles = async () => {
    const formData = new FormData();
    uploadFiles.forEach(({ file }) => {
      formData.append("files", file);
    });
    
    if (currentFolder?.id) {
      formData.append("folder_id", currentFolder.id);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "PUT", // 批量上传使用 PUT
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadFiles(prev => prev.map(f => ({ 
          ...f, 
          status: "completed", 
          progress: 100 
        })));
        
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: string) => addError(error));
        }
      } else {
        setUploadFiles(prev => prev.map(f => ({ 
          ...f, 
          status: "error", 
          error: result.error 
        })));
      }
    } catch (error) {
      setUploadFiles(prev => prev.map(f => ({ 
        ...f, 
        status: "error", 
        error: "上传失败" 
      })));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: UploadProgress["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setUploadFiles([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传文件</DialogTitle>
          <DialogDescription>
            支持上传 Markdown、PDF、图片、Word 文档等格式，单个文件最大 50MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 拖拽上传区域 */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>拖拽文件到这里...</p>
            ) : (
              <div>
                <p className="mb-2">拖拽文件到这里，或点击选择文件</p>
                <p className="text-sm text-muted-foreground">
                  支持 .md .txt .pdf .png .jpg .jpeg .gif .webp .doc .docx .zip
                </p>
              </div>
            )}
          </div>

          {/* 文件列表 */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-auto">
              {uploadFiles.map((uploadFile, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-muted/30 rounded">
                  {getStatusIcon(uploadFile.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    
                    {uploadFile.status === "uploading" && (
                      <Progress value={uploadFile.progress} className="mt-1" />
                    )}
                    
                    {uploadFile.status === "error" && uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {isUploading ? "上传中..." : "取消"}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploadFiles.length === 0 || isUploading}
            >
              {isUploading ? "上传中..." : `上传 ${uploadFiles.length} 个文件`}
            </Button>
          </div>

          {/* 上传到的文件夹 */}
          {currentFolder && (
            <p className="text-xs text-muted-foreground text-center">
              文件将上传到：{currentFolder.name}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}