'use client';

import { useState } from 'react';
import { X, Download, Trash2, Eye, FileText, Image } from 'lucide-react';

export default function ReceiptViewer({
  isOpen,
  onClose,
  receipts = [],
  transactionDescription = '',
  onDeleteReceipt,
}) {
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || receipts.length === 0) return null;

  const currentReceipt = receipts[selectedReceiptIndex];

  const handleDownload = async (receipt) => {
    try {
      const response = await fetch(receipt.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        receipt.name ||
        `receipt-${Date.now()}.${receipt.type?.split('/')[1] || 'file'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      // Fallback: open in new tab
      window.open(receipt.url, '_blank');
    }
  };

  const handleDelete = async (receipt, index) => {
    if (
      confirm(
        'Are you sure you want to delete this receipt? This action cannot be undone.'
      )
    ) {
      try {
        await onDeleteReceipt(receipt.id);

        // If we deleted the currently selected receipt and it's not the first one
        if (index === selectedReceiptIndex && index > 0) {
          setSelectedReceiptIndex(index - 1);
        } else if (receipts.length === 1) {
          // If this was the last receipt, close the viewer
          onClose();
        }
      } catch (error) {
        console.error('Error deleting receipt:', error);
        alert('Failed to delete receipt. Please try again.');
      }
    }
  };

  const isImage = (receipt) => {
    return receipt.type?.startsWith('image/') || false;
  };

  const isPDF = (receipt) => {
    return (
      receipt.type === 'application/pdf' ||
      receipt.name?.toLowerCase().endsWith('.pdf')
    );
  };

  const getFileIcon = (receipt) => {
    if (isPDF(receipt)) {
      return <FileText className='h-6 w-6 text-terminal-red lucide' />;
    } else {
      return <Image className='h-6 w-6 text-terminal-blue lucide' />;
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-terminal-light rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col border border-terminal-border'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-terminal-border'>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
              Receipt(s) for
            </h3>
            <p className='text-sm text-terminal-muted font-ocr-custom mt-1'>
              {transactionDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-terminal-muted hover:text-terminal-text transition-colors ml-4'
          >
            <X className='h-6 w-6 lucide' />
          </button>
        </div>

        {/* Receipt Navigation */}
        {receipts.length > 1 && (
          <div className='flex items-center justify-between p-4 bg-terminal-dark border-b border-terminal-border'>
            <button
              onClick={() =>
                setSelectedReceiptIndex(Math.max(0, selectedReceiptIndex - 1))
              }
              disabled={selectedReceiptIndex === 0}
              className='px-3 py-1 text-sm bg-terminal-green text-black rounded hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ocr-custom'
            >
              ← Previous
            </button>

            <span className='text-sm text-terminal-text font-ocr-custom'>
              {selectedReceiptIndex + 1} of {receipts.length}
            </span>

            <button
              onClick={() =>
                setSelectedReceiptIndex(
                  Math.min(receipts.length - 1, selectedReceiptIndex + 1)
                )
              }
              disabled={selectedReceiptIndex === receipts.length - 1}
              className='px-3 py-1 text-sm bg-terminal-green text-black rounded hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-ocr-custom'
            >
              Next →
            </button>
          </div>
        )}

        {/* Receipt Display */}
        <div className='flex-1 overflow-hidden flex'>
          {/* Main Receipt View */}
          <div className='flex-1 flex items-center justify-center p-4 bg-terminal-dark'>
            {currentReceipt && (
              <div className='max-w-full max-h-full flex items-center justify-center'>
                {isImage(currentReceipt) ? (
                  imageError ? (
                    <div className='text-center p-8'>
                      <FileText className='h-16 w-16 mx-auto mb-4 text-terminal-muted lucide' />
                      <p className='text-terminal-muted font-ocr-custom mb-2'>
                        Unable to display image
                      </p>
                      <button
                        onClick={() => handleDownload(currentReceipt)}
                        className='text-terminal-blue hover:text-terminal-blue/80 underline font-ocr-custom'
                      >
                        Download to view
                      </button>
                    </div>
                  ) : (
                    <img
                      src={currentReceipt.url}
                      alt={currentReceipt.name || 'Receipt'}
                      className='max-w-full max-h-full object-contain rounded border border-terminal-border'
                      onError={() => setImageError(true)}
                    />
                  )
                ) : isPDF(currentReceipt) ? (
                  <div className='text-center p-8'>
                    <FileText className='h-16 w-16 mx-auto mb-4 text-terminal-red lucide' />
                    <p className='text-terminal-text font-ocr-custom mb-2'>
                      PDF Document
                    </p>
                    <p className='text-sm text-terminal-muted font-ocr-custom mb-4'>
                      {currentReceipt.name}
                    </p>
                    <div className='space-y-2'>
                      <button
                        onClick={() =>
                          window.open(currentReceipt.url, '_blank')
                        }
                        className='block w-full px-4 py-2 bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr-custom'
                      >
                        <Eye className='h-4 w-4 inline mr-2 lucide' />
                        Open in New Tab
                      </button>
                      <button
                        onClick={() => handleDownload(currentReceipt)}
                        className='block w-full px-4 py-2 bg-terminal-green text-black rounded hover:bg-terminal-green/80 transition-colors font-ocr-custom'
                      >
                        <Download className='h-4 w-4 inline mr-2 lucide' />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='text-center p-8'>
                    <FileText className='h-16 w-16 mx-auto mb-4 text-terminal-muted lucide' />
                    <p className='text-terminal-muted font-ocr-custom mb-2'>
                      Unsupported file type
                    </p>
                    <button
                      onClick={() => handleDownload(currentReceipt)}
                      className='text-terminal-blue hover:text-terminal-blue/80 underline font-ocr-custom'
                    >
                      Download to view
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar with receipt list */}
          {receipts.length > 1 && (
            <div className='w-64 bg-terminal-light border-l border-terminal-border overflow-y-auto'>
              <div className='p-4 border-b border-terminal-border'>
                <h4 className='text-sm font-medium text-terminal-text font-ocr-custom'>
                  All Receipts ({receipts.length})
                </h4>
              </div>
              <div className='p-2 space-y-2'>
                {receipts.map((receipt, index) => (
                  <div
                    key={receipt.id || index}
                    className={`p-3 rounded cursor-pointer transition-colors border ${
                      index === selectedReceiptIndex
                        ? 'bg-terminal-green/20 border-terminal-green'
                        : 'bg-terminal-dark border-terminal-border hover:bg-terminal-dark/80'
                    }`}
                    onClick={() => setSelectedReceiptIndex(index)}
                  >
                    <div className='flex items-center space-x-2'>
                      {getFileIcon(receipt)}
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-terminal-text font-ocr-custom truncate'>
                          {receipt.name || `Receipt ${index + 1}`}
                        </p>
                        <p className='text-xs text-terminal-muted font-ocr-custom'>
                          {receipt.size
                            ? `${(receipt.size / 1024 / 1024).toFixed(2)} MB`
                            : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-terminal-border bg-terminal-dark gap-3'>
          <div className='flex items-center space-x-2 min-w-0 flex-1'>
            {getFileIcon(currentReceipt)}
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-terminal-text font-ocr-custom truncate'>
                {currentReceipt?.name || 'Unknown file'}
              </p>
              <p className='text-xs text-terminal-muted font-ocr-custom'>
                {currentReceipt?.size
                  ? `${(currentReceipt.size / 1024 / 1024).toFixed(2)} MB`
                  : 'Unknown size'}
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-2 flex-shrink-0'>
            <button
              onClick={() => handleDownload(currentReceipt)}
              className='flex items-center px-3 py-2 text-sm bg-terminal-blue text-white rounded hover:bg-terminal-blue/80 transition-colors font-ocr-custom'
            >
              <Download className='h-4 w-4 sm:mr-1 lucide' />
              <span className='hidden sm:inline'>Download</span>
            </button>

            <button
              onClick={() => handleDelete(currentReceipt, selectedReceiptIndex)}
              className='flex items-center px-3 py-2 text-sm bg-terminal-red text-white rounded hover:bg-terminal-red/80 transition-colors font-ocr-custom'
            >
              <Trash2 className='h-4 w-4 sm:mr-1 lucide' />
              <span className='hidden sm:inline'>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
