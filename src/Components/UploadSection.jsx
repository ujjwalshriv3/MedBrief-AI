import React, { useState, useRef } from 'react';
import '../CSS/UploadSection.css';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { uploadFiles } from '../services/api';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const UploadSection = ({ onSummaryGenerated, onRequireAuth }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (onRequireAuth && !onRequireAuth()) {
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (onRequireAuth && !onRequireAuth()) {
      if (e && e.target) {
        e.target.value = '';
      }
      return;
    }
    if (e.target.files && e.target.files.length) {
      handleFiles(e.target.files);
    }
  };

  const handleOpenFilePicker = (e) => {
    if (e) e.stopPropagation();
    if (onRequireAuth && !onRequireAuth()) {
      return;
    }
    fileInputRef.current?.click();
  };

  const renderPdfFirstPageThumbnail = (file, id) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const uint8 = new Uint8Array(ev.target.result);
        const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
        const page = await pdf.getPage(1);

        // Render at higher pixel density for sharper downscaled thumbnail
        const cssWidth = 80; // displayed width in CSS
        const devicePixelRatio = window.devicePixelRatio || 1;
        const desiredWidth = cssWidth * Math.max(2, devicePixelRatio); // at least 2x
        const initialViewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / initialViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');

        setUploadedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, preview: dataUrl } : f)));

        try { await pdf.cleanup(); } catch (e) { /* noop */ }
      } catch (error) {
        console.error('Failed to render PDF preview:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFiles = (files) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const incomingFiles = Array.from(files);

    const validItems = incomingFiles.reduce((acc, file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Unsupported file type: ${file.name}`);
        return acc;
      }
      if (file.size > maxSize) {
        alert(`File too large (max 10MB): ${file.name}`);
        return acc;
      }
      const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}` , file, preview: null };
      acc.push(item);
      return acc;
    }, []);

    if (validItems.length === 0) return;

    setUploadedFiles((prev) => [...prev, ...validItems]);
    setError(''); // Clear any previous errors

    // Generate previews for images and PDFs
    validItems.forEach((item) => {
      const type = item.file.type;
      if (type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const previewDataUrl = ev.target.result;
          setUploadedFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, preview: previewDataUrl } : f)));
        };
        reader.readAsDataURL(item.file);
      } else if (type === 'application/pdf') {
        renderPdfFirstPageThumbnail(item.file, item.id);
      }
    });
  };

  const handleGenerateSummary = async () => {
    // Auth gate: if not authenticated, trigger parent modal and stop
    if (onRequireAuth && !onRequireAuth()) {
      return;
    }
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    setError('');

    try {
      const files = uploadedFiles.map(item => item.file);
      const result = await uploadFiles(files);
      
      if (result.summaries && result.summaries.length > 0) {
        // Pass the summaries to the parent component
        onSummaryGenerated(result.summaries);
        
        // Clear uploaded files after successful processing
        setUploadedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('No summaries were generated. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate summary. Please try again.');
      console.error('Summary generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return next;
    });
    setError(''); // Clear error when files change
  };

  return (
    <section id="upload-section" className="upload-section">
      <div className="upload-container">
        <div className="upload-header">
          <h2>Upload Medical Files</h2>
          <p>Upload your medical reports to get AI-powered summaries</p>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {error}
          </div>
        )}

        <div className="upload-area">
          {uploadedFiles.length === 0 ? (
            <div
              className={`drag-drop-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleOpenFilePicker}
            >
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,14 12,9 17,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="21" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Drop your files here or click to browse</h3>
              <p>Supports PDF, JPG, PNG files up to 10MB</p>
              <button className="browse-btn" onClick={handleOpenFilePicker}>
                Choose Files
              </button>
            </div>
          ) : (
            <div>
              <div className="selected-count">
                <span>{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected</span>
                <button className="clear-all-btn" onClick={() => { setUploadedFiles([]); if (fileInputRef.current) fileInputRef.current.value = ''; setError(''); }}>
                  Clear all
                </button>
              </div>
              {uploadedFiles.map((item) => (
                <div className="file-preview" key={item.id} style={{ marginBottom: '1rem' }}>
                  <div className="preview-content">
                    {item.preview ? (
                      <img src={item.preview} alt={item.file.type === 'application/pdf' ? 'PDF first page preview' : 'Image preview'} className="image-preview" />
                    ) : (
                      <div className="pdf-preview" />
                    )}
                    <div className="file-info">
                      <h4>{item.file.name}</h4>
                      <p>{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button className="remove-btn" onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="generate-section">
            <button 
              className={`generate-btn ${isProcessing ? 'processing' : ''}`} 
              onClick={handleGenerateSummary}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Generate Summary
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadSection;
