'use client';

import { useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

export default function ReceiptUpload({ onUpload, uploading = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        alert(
          `${file.name} is not a supported file type. Please upload images (JPEG, PNG, GIF) or PDF files.`
        );
        return false;
      }

      if (file.size > maxSize) {
        alert(
          `${file.name} is too large. Please upload files smaller than 10MB.`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileText className='h-5 w-5 text-terminal-red lucide' />;
    } else {
      return <Image className='h-5 w-5 text-terminal-blue lucide' />;
    }
  };

  return (
    <div className='space-y-4'>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-terminal-green bg-terminal-green/10'
            : 'border-terminal-border hover:border-terminal-green'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className='h-8 w-8 mx-auto mb-4 text-terminal-muted lucide' />
        <p className='text-terminal-text font-ocr mb-2'>
          Drag and drop receipt files here, or click to select
        </p>
        <p className='text-sm text-terminal-muted font-ocr mb-4'>
          Supports: JPG, PNG, GIF, PDF (max 10MB each)
        </p>
        <input
          type='file'
          multiple
          accept='image/*,.pdf'
          onChange={handleFileInput}
          className='hidden'
          id='receipt-upload'
          disabled={uploading}
        />
        <label
          htmlFor='receipt-upload'
          className='inline-flex items-center px-4 py-2 bg-terminal-green text-black rounded-md hover:bg-terminal-green/80 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 transition-colors font-ocr cursor-pointer'
        >
          Choose Files
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-terminal-text font-ocr'>
            Selected Files:
          </h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-terminal-light border border-terminal-border rounded-md'
            >
              <div className='flex items-center space-x-3'>
                {getFileIcon(file)}
                <div>
                  <p className='text-sm font-medium text-terminal-text font-ocr'>
                    {file.name}
                  </p>
                  <p className='text-xs text-terminal-muted font-ocr'>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className='text-terminal-red hover:text-terminal-red/80 transition-colors'
                disabled={uploading}
              >
                <X className='h-4 w-4 lucide' />
              </button>
            </div>
          ))}

          <div className='flex justify-end pt-2'>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className='flex items-center px-4 py-2 bg-terminal-blue text-white rounded-md hover:bg-terminal-blue/80 focus:outline-none focus:ring-2 focus:ring-terminal-blue focus:ring-offset-2 transition-colors font-ocr disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {uploading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='h-4 w-4 mr-2 lucide' />
                  Upload {selectedFiles.length} file
                  {selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
