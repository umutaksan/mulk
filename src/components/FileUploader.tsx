import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onFileLoaded: (csvData: string, guestDetails?: any[]) => void;
  onConfirm: () => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded, onConfirm, isUploading }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [xlsxFileName, setXlsxFileName] = useState<string>('');
  const [hasFiles, setHasFiles] = useState<{ csv: boolean; xlsx: boolean }>({
    csv: false,
    xlsx: false
  });
  const [guestDetails, setGuestDetails] = useState<any[]>([]);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      if (csvData) {
        onFileLoaded(csvData, guestDetails);
        setHasFiles(prev => ({ ...prev, csv: true }));
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      console.error('Error reading CSV file');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleXlsxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setXlsxFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const details = XLSX.utils.sheet_to_json(firstSheet);
        
        setGuestDetails(details);
        setHasFiles(prev => ({ ...prev, xlsx: true }));
        
        // If CSV is already loaded, update with new guest details
        if (hasFiles.csv) {
          onFileLoaded(csvData, details);
        }
      } catch (error) {
        console.error('Error processing XLSX file:', error);
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      console.error('Error reading XLSX file');
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4">
      {/* CSV Upload */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="csv-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-500" />
            {csvFileName ? (
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">{csvFileName}</span>
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Upload Bookings CSV</span>
                </p>
                <p className="text-xs text-gray-500">CSV file with booking data</p>
              </>
            )}
          </div>
          <input
            id="csv-file"
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleCsvChange}
          />
        </label>
      </div>

      {/* XLSX Upload */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="xlsx-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-500" />
            {xlsxFileName ? (
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">{xlsxFileName}</span>
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Upload Guest Details XLSX</span>
                </p>
                <p className="text-xs text-gray-500">Excel file with additional guest information</p>
              </>
            )}
          </div>
          <input
            id="xlsx-file"
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleXlsxChange}
          />
        </label>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {(hasFiles.csv || hasFiles.xlsx) && (
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