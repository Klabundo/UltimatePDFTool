import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfPreview({ file, selectedPages, onSelect, mode }) {
  const [numPages, setNumPages] = useState(null);

  // Use a local URL for previewing the File object
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleSelect = (pageNumber) => {
    let newSelection;
    if (selectedPages.includes(pageNumber)) {
        newSelection = selectedPages.filter(p => p !== pageNumber);
    } else {
        newSelection = [...selectedPages, pageNumber];
    }
    onSelect(newSelection);
  };

  if (!fileUrl) return null;

  return (
    <div className="mt-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700">Preview & Select Pages</h4>
        {numPages && (
            <div className="space-x-2">
                <button
                  onClick={() => onSelect(Array.from({length: numPages}, (_, i) => i + 1))}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={() => onSelect([])}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Clear All
                </button>
            </div>
        )}
      </div>
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-wrap gap-4"
          loading={<div className="text-sm text-gray-500">Loading PDF preview...</div>}
        >
          {Array.from(new Array(numPages), (el, index) => {
             const pageNumber = index + 1;
             const isSelected = selectedPages.includes(pageNumber);
             const selectionIndex = selectedPages.indexOf(pageNumber);

             return (
                <div
                  key={`page_${pageNumber}`}
                  className={`relative cursor-pointer transition-all rounded-lg overflow-hidden border-4 bg-white shadow-sm flex flex-col ${
                    isSelected
                      ? 'border-red-500 scale-105 shadow-md'
                      : 'border-transparent hover:scale-105'
                  }`}
                  onClick={() => handleSelect(pageNumber)}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={150}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                  {mode === 'reorder' && isSelected && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                          {selectionIndex + 1}
                      </div>
                  )}
                  {mode !== 'reorder' && isSelected && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                      </div>
                  )}
                  <div className="bg-white text-center text-xs py-1 font-medium text-gray-600 border-t mt-auto w-full">
                    Page {pageNumber}
                  </div>
                </div>
             )
          })}
        </Document>
      </div>
      {mode === 'reorder' && selectedPages.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            New order: {selectedPages.join(', ')}
          </p>
      )}
    </div>
  );
}
