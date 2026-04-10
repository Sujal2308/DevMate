import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure worker for react-pdf
// Fallback to min.js instead of min.mjs if bundler complains
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfCarousel = ({ url, file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="pdf-carousel-container relative flex flex-col items-center border border-x-border/30 rounded-xl overflow-hidden select-none">
      
      <div className="w-full overflow-hidden flex justify-center bg-x-black/40">
        <Document
          file={file || url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-12 h-64 text-x-gray">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-x-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Document...
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center p-8 text-x-gray">
               <span className="text-3xl mb-2">📄</span>
               <p>Failed to render PDF preview.</p>
               {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-x-blue hover:underline">
                  View PDF Directly
                </a>
               )}
            </div>
          }
        >
          {!loading && (
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page-shadow rounded max-w-full overflow-hidden"
              width={window.innerWidth < 640 ? window.innerWidth - 64 : undefined}
            />
          )}
        </Document>
      </div>

      {/* Navigation Overlays */}
      {!loading && numPages > 1 && (
        <>
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={(e) => { e.preventDefault(); previousPage(); }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-x-dark/80 text-white shadow-lg backdrop-blur-sm ${pageNumber <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-x-blue hover:scale-110 cursor-pointer'}`}
            aria-label="Previous page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={(e) => { e.preventDefault(); nextPage(); }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-x-dark/80 text-white shadow-lg backdrop-blur-sm ${pageNumber >= numPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-x-blue hover:scale-110 cursor-pointer'}`}
            aria-label="Next page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Page Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-x-dark/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md">
            {pageNumber} / {numPages}
          </div>
        </>
      )}

      {/* Fallback View Document Ribbon for native downloads */}
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full text-center py-2 text-xs font-semibold text-x-gray bg-black/40 hover:text-white hover:bg-black/80 transition-colors"
        >
          Open Document in New Tab
        </a>
      )}

      <style>{`
        .pdf-page-shadow canvas {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 4px;
          max-height: 550px !important;
          width: auto !important;
          height: auto !important;
          max-width: 100% !important;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};

export default PdfCarousel;
