import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Ensure worker is configured as in PdfPreviewWrapper
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function FileThumbnail({ file }) {
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    let url = null;
    let isActive = true;

    if (file) {
      url = URL.createObjectURL(file);
      if (isActive) {
        setFileUrl(url);
      }
    }

    return () => {
      isActive = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  if (!fileUrl) return null;

  return (
    <div className="w-12 h-16 overflow-hidden rounded shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
      <Document
        file={fileUrl}
        loading={<span className="text-[8px] text-gray-400 dark:text-gray-500">...</span>}
        error={<span className="text-[8px] text-red-400 dark:text-red-500">Err</span>}
      >
        <Page
          pageNumber={1}
          width={48} // matches w-12 roughly
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="dark:invert dark:hue-rotate-180"
        />
      </Document>
    </div>
  );
}
