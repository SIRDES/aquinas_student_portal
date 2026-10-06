// components/PDFViewer.tsx
'use client';
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import "react-pdf/dist/Page/TextLayer.css";

interface PDFViewerProps {
    file: string | Blob | null;
}

export default function PDFFileViewer({ file }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        console.log('Number of pages: ', numPages);
        setNumPages(numPages);
    }

    return (
        <div style={{
            border: '1px solid #ccc', padding: '5', width: 'fit-content'
        }}>
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess} >
                {/* <Page key={`page_${1}`} pageNumber={1} renderTextLayer={false} width={600} /> */}
                {Array.from({ length: numPages || 0 }, (_, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
            </Document>
        </div>
    );
}
