import { pdf, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';

/**
 * Generates a PDF from a @react-pdf document and triggers a browser download.
 * @param pdfElement The @react-pdf/renderer Document component instance
 * @param fileName The desired filename (e.g., 'document.pdf')
 */
export const downloadPDF = async (pdfElement: React.ReactElement<DocumentProps>, fileName: string) => {
  try {
    // Generate the PDF blob
    // Cast to any to bypass strict DocumentProps check as our components are wrappers
    const blob = await pdf(pdfElement as any).toBlob();
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    
    // Append to body, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
  }
};
