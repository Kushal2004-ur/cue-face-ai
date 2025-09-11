import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaUploadProps {
  caseId: string;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

const MediaUpload = ({ caseId, onUploadComplete }: MediaUploadProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}`,
      progress: 0,
      status: 'pending',
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFilesToStorage = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const uploadFile of uploadFiles) {
        if (uploadFile.status !== 'pending') continue;

        // Update status to uploading
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'uploading' as const }
              : f
          )
        );

        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${caseId}/${fileName}`;

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('case-evidence')
          .upload(filePath, uploadFile.file);

        if (storageError) throw storageError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('case-evidence')
          .getPublicUrl(filePath);

        // Save media record to database
        const { error: dbError } = await supabase
          .from('media')
          .insert({
            case_id: caseId,
            url: publicUrl,
            type: uploadFile.file.type,
            meta: {
              filename: uploadFile.file.name,
              size: uploadFile.file.size,
              storage_path: filePath,
            },
          });

        if (dbError) throw dbError;

        // Update status to complete
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'complete' as const, progress: 100 }
              : f
          )
        );
      }

      toast.success('Files uploaded successfully');
      onUploadComplete();
      
      // Clear completed files after a delay
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.status !== 'complete'));
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
      
      // Mark failed uploads
      setUploadFiles(prev => 
        prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, status: 'error' as const }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage;
    return Paperclip;
  };

  const hasFilesToUpload = uploadFiles.some(f => f.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Evidence</CardTitle>
        <CardDescription>
          Add images, documents, and other evidence files to this case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports images, PDFs, and documents (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Files to upload:</h4>
            {uploadFiles.map((uploadFile) => {
              const Icon = getFileIcon(uploadFile.file);
              return (
                <div key={uploadFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="mt-2" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === 'complete' && (
                      <span className="text-xs text-green-600">✓ Complete</span>
                    )}
                    {uploadFile.status === 'error' && (
                      <span className="text-xs text-red-600">✗ Error</span>
                    )}
                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Button */}
        {hasFilesToUpload && (
          <Button 
            onClick={uploadFilesToStorage} 
            disabled={isUploading} 
            className="w-full"
          >
            {isUploading ? 'Uploading...' : `Upload ${uploadFiles.filter(f => f.status === 'pending').length} files`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaUpload;