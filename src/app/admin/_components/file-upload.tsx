'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, File, Image as ImageIcon, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  name: string
  label: string
  accept?: string
  multiple?: boolean
  value?: string | string[]
  onChange?: (files: File[] | null) => void
  required?: boolean
}

export function FileUpload({
  name,
  label,
  accept,
  multiple = false,
  value,
  onChange,
  required = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length > 0) {
      setSelectedFiles(files)
      onChange?.(files)

      // Generate previews for images
      const newPreviews: string[] = []
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            newPreviews.push(e.target?.result as string)
            setPreviews([...newPreviews])
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
    onChange?.(newFiles.length > 0 ? newFiles : null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-muted/50",
          selectedFiles.length > 0 && "border-primary bg-muted/30"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          required={required && selectedFiles.length === 0}
        />
        
        {selectedFiles.length === 0 ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            {accept && (
              <p className="text-xs text-muted-foreground mt-1">
                {accept}
              </p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const Icon = getFileIcon(file)
              const preview = previews[index]
              
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-2 p-2 bg-background rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  {preview ? (
                    <img 
                      src={preview} 
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
            
            {multiple && (
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Add more files
              </Button>
            )}
          </div>
        )}
      </div>
      
      {value && !selectedFiles.length && (
        <div className="text-sm text-muted-foreground">
          Current: {Array.isArray(value) ? value.join(', ') : value}
        </div>
      )}
    </div>
  )
}