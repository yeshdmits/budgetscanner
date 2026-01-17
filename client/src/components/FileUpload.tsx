import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { uploadCSV } from '../api/transactions';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setResult(null);
    setProgress({ current: 0, total: acceptedFiles.length });

    let totalImported = 0;
    let totalSkipped = 0;
    let errors: string[] = [];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      setProgress({ current: i + 1, total: acceptedFiles.length });

      try {
        const response = await uploadCSV(file);
        totalImported += response.data.imported;
        totalSkipped += response.data.skipped;
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }

    if (errors.length === 0) {
      setResult({
        success: true,
        message: `Imported ${totalImported} transactions from ${acceptedFiles.length} file(s)${totalSkipped > 0 ? `, skipped ${totalSkipped} duplicates` : ''}`
      });
    } else if (errors.length < acceptedFiles.length) {
      setResult({
        success: true,
        message: `Partially completed: imported ${totalImported} transactions. Errors: ${errors.join('; ')}`
      });
    } else {
      setResult({
        success: false,
        message: errors.join('; ')
      });
    }

    setProgress(null);
    setUploading(false);
    onUploadSuccess();
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: true,
    disabled: uploading
  });

  return (
    <div className="mb-6">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the CSV file(s) here'
              : uploading && progress
              ? `Uploading file ${progress.current} of ${progress.total}...`
              : 'Drag & drop CSV file(s) here, or click to select'}
          </p>
          <p className="text-sm text-gray-400">Supports multiple ZKB bank statement CSV files</p>
        </div>
      </div>

      {result && (
        <div
          className={cn(
            'mt-4 p-4 rounded-lg flex items-center gap-2',
            result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}
        >
          {result.success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          {result.message}
        </div>
      )}
    </div>
  );
}
