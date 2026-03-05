import React, { useState, useEffect, useRef } from 'react';
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

  // Refs for drag and drop reordering
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // State for multi-selection in reorder mode
  const [selectedReorderPages, setSelectedReorderPages] = useState([]);

  useEffect(() => {
    let url = null;
    let isActive = true;

    if (file) {
      url = URL.createObjectURL(file);
      if (isActive) {
        setFileUrl(url);
      }
      setSelectedReorderPages([]); // Reset selection when file changes
    }

    return () => {
      isActive = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    if (mode === 'reorder') {
       onSelect(Array.from({length: numPages}, (_, i) => i + 1));
    }
  }

  const handleSelect = (pageNumber) => {
    if (mode === 'reorder') {
        let newReorderSelection;
        if (selectedReorderPages.includes(pageNumber)) {
            newReorderSelection = selectedReorderPages.filter(p => p !== pageNumber);
        } else {
            newReorderSelection = [...selectedReorderPages, pageNumber];
        }
        setSelectedReorderPages(newReorderSelection);
        return;
    }

    let newSelection;
    if (selectedPages.includes(pageNumber)) {
        newSelection = selectedPages.filter(p => p !== pageNumber);
    } else {
        newSelection = [...selectedPages, pageNumber];
    }
    onSelect(newSelection);
  };

  const handleDragStart = (e, index) => {
    if (mode !== 'reorder') return;

    // Determine which pages are being dragged
    const draggedPageNumber = selectedPages[index];
    let pagesToDrag = [];

    if (selectedReorderPages.includes(draggedPageNumber)) {
        // Dragging a selected item, so drag all selected items
        // Keep them in their current document order
        pagesToDrag = selectedPages.filter(p => selectedReorderPages.includes(p));
    } else {
        // Dragging an unselected item. Treat it as single drag and make it the only selected item
        pagesToDrag = [draggedPageNumber];
        setSelectedReorderPages([draggedPageNumber]);
    }

    // Store the dragged pages array as JSON string
    e.dataTransfer.setData('application/json', JSON.stringify(pagesToDrag));
    // Set drop effect to move
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (mode !== 'reorder') return;
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    if (mode !== 'reorder') return;
    e.preventDefault();

    try {
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const draggedPages = JSON.parse(data);
        if (!Array.isArray(draggedPages) || draggedPages.length === 0) return;

        // Count how many dragged items come BEFORE the targetIndex in the CURRENT selectedPages array
        // Because when we remove them, the targetIndex needs to shift left by that amount
        let shift = 0;
        for (let i = 0; i < targetIndex; i++) {
            if (draggedPages.includes(selectedPages[i])) {
                shift++;
            }
        }

        const newTargetIndex = targetIndex - shift;

        // Remove the dragged pages from the current order
        let newOrder = selectedPages.filter(p => !draggedPages.includes(p));

        // Insert the dragged pages at the adjusted target index
        newOrder.splice(newTargetIndex, 0, ...draggedPages);

        onSelect(newOrder);
    } catch (err) {
        console.error("Error parsing drag data", err);
    }
  };

  // Initialize selected pages for reorder if empty
  useEffect(() => {
    if (mode === 'reorder' && numPages && selectedPages.length === 0) {
      onSelect(Array.from({length: numPages}, (_, i) => i + 1));
    }
  }, [mode, numPages, selectedPages.length, onSelect]);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    let _selectedPages = [...selectedPages];
    if (_selectedPages.length === 0 && numPages) {
       _selectedPages = Array.from({length: numPages}, (_, i) => i + 1);
    }

    const draggedItemContent = _selectedPages.splice(dragItem.current, 1)[0];
    _selectedPages.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    onSelect(_selectedPages);
  };

  if (!fileUrl) return null;

  let renderPages = [];
  if (numPages) {
      if (mode === 'reorder') {
          renderPages = selectedPages.length === numPages ? selectedPages : Array.from({length: numPages}, (_, i) => i + 1);
      } else {
          renderPages = Array.from({length: numPages}, (_, i) => i + 1);
      }
  }

  return (
    <div className="mt-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview & Select Pages</h4>
        {numPages && mode !== 'reorder' && (
            <div className="space-x-2">
                <button
                  onClick={() => onSelect(Array.from({length: numPages}, (_, i) => i + 1))}
                  className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={() => onSelect([])}
                  className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Clear All
                </button>
            </div>
        )}
        {numPages && mode === 'reorder' && selectedReorderPages.length > 0 && (
            <div className="space-x-2">
                <button
                  onClick={() => setSelectedReorderPages([])}
                  className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
            </div>
        )}
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-wrap gap-4"
          loading={<div className="text-sm text-gray-500 dark:text-gray-400">Loading PDF preview...</div>}
        >
          {renderPages.map((pageNumber, index) => {
             const isSelected = mode === 'reorder' ? selectedReorderPages.includes(pageNumber) : selectedPages.includes(pageNumber);

             return (
                <div
                  key={`page_${pageNumber}_${index}`}
                  className={`relative transition-all rounded-lg overflow-hidden border-4 bg-white dark:bg-gray-700 shadow-sm flex flex-col ${
                    isSelected && mode !== 'reorder'
                      ? 'border-red-500 scale-105 shadow-md'
                      : isSelected && mode === 'reorder'
                      ? 'border-blue-500 scale-105 shadow-md'
                      : mode === 'reorder'
                      ? 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 scale-100 shadow-sm'
                      : 'border-transparent dark:border-gray-800 hover:scale-105'
                  } ${mode === 'reorder' ? 'cursor-pointer' : 'cursor-pointer'}`}
                  onClick={() => handleSelect(pageNumber)}
                  draggable={mode === 'reorder'}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={150}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="dark:invert dark:hue-rotate-180"
                  />
                  {mode === 'reorder' && (
                      <>
                          <div className={`absolute top-2 left-2 ${isSelected ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow`}>
                              {index + 1}
                          </div>
                          {isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                              </div>
                          )}
                      </>
                  )}
                  {mode !== 'reorder' && isSelected && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                      </div>
                  )}
                  <div className="bg-white dark:bg-gray-800 text-center text-xs py-1 font-medium text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 mt-auto w-full flex items-center justify-center gap-1">
                    {mode === 'reorder' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <circle cx="9" cy="12" r="1"></circle>
                           <circle cx="9" cy="5" r="1"></circle>
                           <circle cx="9" cy="19" r="1"></circle>
                           <circle cx="15" cy="12" r="1"></circle>
                           <circle cx="15" cy="5" r="1"></circle>
                           <circle cx="15" cy="19" r="1"></circle>
                        </svg>
                    )}
                    Page {pageNumber}
                  </div>
                </div>
              )
            })}
        </Document>
      </div>
      {mode === 'reorder' && selectedPages.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            New order: {selectedPages.join(', ')}
          </p>
      )}
    </div>
  );
}
