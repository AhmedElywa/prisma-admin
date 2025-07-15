'use client';

import { File, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  value?: string | string[];
  onChange?: (files: File[] | null) => void;
  required?: boolean;
}

export function FileUpload({
  name,
  label,
  accept,
  multiple = false,
  value,
  onChange,
  required = false,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      setSelectedFiles(files);
      onChange?.(files);

      // Generate previews for images
      const newPreviews: string[] = [];
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string);
            setPreviews([...newPreviews]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onChange?.(newFiles.length > 0 ? newFiles : null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return ImageIcon;
    }
    if (file.type.includes('pdf') || file.type.includes('document')) {
      return FileText;
    }
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <div
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          'hover:border-primary hover:bg-muted/50',
          selectedFiles.length > 0 && 'border-primary bg-muted/30'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          accept={accept}
          className="hidden"
          id={name}
          multiple={multiple}
          name={name}
          onChange={handleFileChange}
          ref={fileInputRef}
          required={required && selectedFiles.length === 0}
          type="file"
        />

        {selectedFiles.length === 0 ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground text-sm">
              Click to upload or drag and drop
            </p>
            {accept && (
              <p className="mt-1 text-muted-foreground text-xs">{accept}</p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              const preview = previews[index];

              return (
                <div
                  className="flex items-center gap-2 rounded-md bg-background p-2"
                  key={index}
                  onClick={(e) => e.stopPropagation()}
                >
                  {preview ? (
                    <img
                      alt={file.name}
                      className="h-10 w-10 rounded object-cover"
                      src={preview}
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="truncate font-medium text-sm">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    className="h-8 w-8 p-0"
                    onClick={() => removeFile(index)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {multiple && (
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Add more files
              </Button>
            )}
          </div>
        )}
      </div>

      {value && !selectedFiles.length && (
        <div className="text-muted-foreground text-sm">
          Current: {Array.isArray(value) ? value.join(', ') : value}
        </div>
      )}
    </div>
  );
}
