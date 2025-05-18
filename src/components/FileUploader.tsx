import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';

interface FileUploaderProps {
  onFileLoaded: (data: string) => void;
  onConfirm: () => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded, onConfirm, isUploading }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [hasFile, setHasFile] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      if (csvData) {
        onFileLoaded(csvData);
        setHasFile(true);
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      console.error('Error reading file');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-500" />
            {fileName ? (
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">{fileName}</span>
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file with booking data</p>
              </>
            )}
            {isLoading && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {hasFile && (
        <button
          onClick={onConfirm}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading to Database...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              Confirm and Save to Database
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FileUploader;