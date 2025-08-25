import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../CSS/SummaryDisplay.css';

const SummaryDisplay = ({ summaries = [], isSignedIn = true }) => {
  const [copied, setCopied] = useState(false);
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);
  
  // Load saved summaries from localStorage on component mount
  const [localSummaries, setLocalSummaries] = useState([]);
  
  useEffect(() => {
    // Load saved summaries from localStorage
    const savedSummaries = localStorage.getItem('medbrief_summaries');
    if (savedSummaries) {
      try {
        const parsed = JSON.parse(savedSummaries);
        setLocalSummaries(parsed);
        // Set active index to the last summary if available
        if (parsed.length > 0) {
          setActiveSummaryIndex(parsed.length - 1);
        }
      } catch (error) {
        console.error('Error parsing saved summaries:', error);
      }
    }
  }, []);
  
  // When signed out, ensure no summaries are shown
  useEffect(() => {
    if (!isSignedIn) {
      setLocalSummaries([]);
    }
  }, [isSignedIn]);

  // Use local summaries if available, otherwise use props
  const displaySummaries = isSignedIn ? (localSummaries.length > 0 ? localSummaries : summaries) : [];

  // Build a safe base name for downloaded files derived from the uploaded file name
  const getDownloadBaseName = () => {
    const item = displaySummaries[activeSummaryIndex];
    const rawName = item?.fileName || `summary-${activeSummaryIndex + 1}`;
    const withoutExt = rawName.replace(/\.[^/.]+$/, '');
    const collapsedWhitespace = withoutExt.trim().replace(/\s+/g, '_');
    const safe = collapsedWhitespace.replace(/[^A-Za-z0-9_\-]+/g, '');
    return safe.length > 0 ? safe : `summary-${activeSummaryIndex + 1}`;
  };
  
  // Save summaries to localStorage whenever they change
  useEffect(() => {
    if (isSignedIn && summaries.length > 0) {
      localStorage.setItem('medbrief_summaries', JSON.stringify(summaries));
      setLocalSummaries(summaries);
      // Set active index to the latest summary
      setActiveSummaryIndex(summaries.length - 1);
    }
  }, [summaries]);

  const handleCopy = async () => {
    if (!displaySummaries[activeSummaryIndex]) return;
    
    try {
      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = displaySummaries[activeSummaryIndex].summary;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleDownloadJpg = async () => {
    if (!displaySummaries[activeSummaryIndex]) {
      console.error('No summary available for download');
      return;
    }
    
    console.log('=== STARTING JPG DOWNLOAD ===');
    console.log('Summary content length:', displaySummaries[activeSummaryIndex].summary?.length || 0);
    
    try {
      // Add protection class to prevent text shrinking
      const jpgButton = document.querySelector('.download-btn[onclick*="handleDownloadJpg"]');
      if (jpgButton) {
        jpgButton.classList.add('downloading');
        jpgButton.setAttribute('data-downloading', 'true');
      }
      
      // Create a new container for each download to avoid conflicts
      const tempContainer = createDownloadContent(displaySummaries[activeSummaryIndex].summary);
      
      // Add intelligent page breaks to prevent text cutting
      createIntelligentPageBreaks(tempContainer);
      
      // Ensure content fits within page boundaries
      ensureContentFit(tempContainer);
      
      // Mark elements that should not be cut off
      markNoCutElements(tempContainer);
      
      // Add to DOM temporarily
      document.body.appendChild(tempContainer);
      
      // Wait for content to render and images to load
      await waitForContentRender(tempContainer);
      
      // Additional wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Container dimensions:', tempContainer.offsetWidth, 'x', tempContainer.offsetHeight);
      console.log('Container scroll dimensions:', tempContainer.scrollWidth, 'x', tempContainer.scrollHeight);
      
      // Force a reflow to ensure content is properly rendered
      tempContainer.offsetHeight;
      
      const canvas = await html2canvas(tempContainer, { 
        scale: 2,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight,
        foreignObjectRendering: false,
        imageTimeout: 15000
      });
      
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions');
      }
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${getDownloadBaseName()}_summary.jpg`;
      link.click();
      
      console.log('JPG download completed successfully');
    } catch (error) {
      console.error('Error during JPG download:', error);
      alert('Failed to download JPG. Please try again.');
    } finally {
      // Remove protection class
      const jpgButton = document.querySelector('.download-btn[onclick*="handleDownloadJpg"]');
      if (jpgButton) {
        jpgButton.classList.remove('downloading');
        jpgButton.removeAttribute('data-downloading');
      }
      
      // Clean up
      const containers = document.querySelectorAll('[style*="left: -9999px"]');
      containers.forEach(container => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!displaySummaries[activeSummaryIndex]) {
      console.error('No summary available for download');
      return;
    }
    
    console.log('=== STARTING PDF DOWNLOAD ===');
    console.log('Summary content length:', displaySummaries[activeSummaryIndex].summary?.length || 0);
    
    try {
      // Add protection class to prevent text shrinking
      const pdfButton = document.querySelector('.download-btn[onclick*="handleDownloadPdf"]');
      if (pdfButton) {
        pdfButton.classList.add('downloading');
        pdfButton.setAttribute('data-downloading', 'true');
      }
      
      // Create a new container for each download to avoid conflicts
      const tempContainer = createDownloadContent(displaySummaries[activeSummaryIndex].summary);
      
      // Add intelligent page breaks to prevent text cutting
      createIntelligentPageBreaks(tempContainer);
      
      // Ensure content fits within page boundaries
      ensureContentFit(tempContainer);
      
      // Mark elements that should not be cut off
      markNoCutElements(tempContainer);
      
      // Add to DOM temporarily
      document.body.appendChild(tempContainer);
      
      // Wait for content to render and images to load
      await waitForContentRender(tempContainer);
      
      // Additional wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Container dimensions:', tempContainer.offsetWidth, 'x', tempContainer.offsetHeight);
      console.log('Container scroll dimensions:', tempContainer.scrollWidth, 'x', tempContainer.scrollHeight);
      
      // Force a reflow to ensure content is properly rendered
      tempContainer.offsetHeight;
      
      // Use html2canvas to capture the formatted content
      const canvas = await html2canvas(tempContainer, { 
        scale: 2,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight,
        foreignObjectRendering: false,
        imageTimeout: 15000
      });
      
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions');
      }
      
      // Convert to PDF using a simpler approach
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 80; // 40pt margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('PDF page dimensions:', pageWidth, 'x', pageHeight);
      console.log('Image dimensions:', imgWidth, 'x', imgHeight);

      if (imgHeight <= pageHeight - 80) {
        // Single page - fit entire image
        pdf.addImage(imgData, 'JPEG', 40, 40, imgWidth, imgHeight);
        console.log('Single page PDF created');
      } else {
        // Multi-page approach with element-aware page breaks to avoid cutting paragraphs
        const maxPageHeight = pageHeight - 120; // printable area per page (in PDF units)
        const domTotalHeight = tempContainer.scrollHeight; // DOM px height
        const imgPerDomUnit = imgHeight / domTotalHeight; // convert DOM px -> PDF image units

        // Candidate breakpoints:
        // - Bottoms of block elements (p, li, ul, ol) so they don't get cut
        // - TOPS of headings so each heading starts on a new page
        const blockElems = Array.from(tempContainer.querySelectorAll('p, li, ul, ol'));
        const headingElems = Array.from(tempContainer.querySelectorAll('h1, h2, h3, h4'));
        const candidates = [
          ...blockElems.map(el => (el.offsetTop + el.offsetHeight) * imgPerDomUnit),
          ...headingElems.map(el => el.offsetTop * imgPerDomUnit),
        ]
          .filter(y => y > 0 && y < imgHeight)
          .sort((a, b) => a - b);

        const safety = 8; // extra breathing room near edges
        const breaks = [];
        let target = maxPageHeight; // desired end of current page (PDF units)
        let i = 0;
        while (target < imgHeight && i < candidates.length) {
          let best = null;
          while (i < candidates.length && candidates[i] <= target - safety) {
            best = candidates[i];
            i++;
          }
          if (best === null) {
            // No safe breakpoint found in this window; fall back to target
            best = target;
          }
          breaks.push(best);
          target += maxPageHeight;
        }
        // Ensure last page captures any remainder
        if (breaks.length === 0 || breaks[breaks.length - 1] < imgHeight - 1) {
          breaks.push(imgHeight);
        }

        let startY = 0;
        for (let page = 0; page < breaks.length; page++) {
          const endY = Math.min(breaks[page], imgHeight);
          const pageImgHeight = endY - startY;
          if (page > 0) {
            pdf.addPage();
          }

          // Create a canvas for this page slice
          const pageCanvas = document.createElement('canvas');
          const pageContext = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;

          const sourceStartY = Math.floor((startY * canvas.height) / imgHeight);
          const sourceEndY = Math.ceil((endY * canvas.height) / imgHeight);
          const sourceHeight = Math.max(1, sourceEndY - sourceStartY);

          pageCanvas.height = sourceHeight;

          pageContext.drawImage(
            canvas,
            0, sourceStartY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );

          const pageData = pageCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageData, 'JPEG', 40, 40, imgWidth, pageImgHeight);

          startY = endY;
        }
      }
      
      pdf.save(`${getDownloadBaseName()}_summary.pdf`);
      console.log('PDF download completed successfully');
      
    } catch (error) {
      console.error('Error during PDF download:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      // Remove protection class
      const pdfButton = document.querySelector('.download-btn[onclick*="handleDownloadPdf"]');
      if (pdfButton) {
        pdfButton.classList.remove('downloading');
        pdfButton.removeAttribute('data-downloading');
      }
      
      // Clean up
      const containers = document.querySelectorAll('[style*="left: -9999px"]');
      containers.forEach(container => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!displaySummaries[activeSummaryIndex]?.whatsappLink) return;
    window.open(displaySummaries[activeSummaryIndex].whatsappLink, '_blank');
  };

  const handleShareEmail = () => {
    if (!displaySummaries[activeSummaryIndex]?.emailLink) return;
    window.open(displaySummaries[activeSummaryIndex].emailLink, '_blank');
  };

  const handleDownloadBackendPdf = () => {
    if (!displaySummaries[activeSummaryIndex]?.pdfLink) return;
    window.open(displaySummaries[activeSummaryIndex].pdfLink, '_blank');
  };

  const createDownloadContent = (summary) => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '2rem';
    tempContainer.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    tempContainer.style.fontSize = '16px';
    tempContainer.style.lineHeight = '1.8';
    tempContainer.style.color = '#000000';
    tempContainer.style.fontWeight = '400';
    tempContainer.style.letterSpacing = '0.1em';
    tempContainer.style.visibility = 'visible';
    tempContainer.style.zIndex = '-1000';
    
    tempContainer.innerHTML = summary;
    
    const style = document.createElement('style');
    style.textContent = `
      * { 
        letter-spacing: 0.1em !important; 
        box-sizing: border-box !important;
      }
      p { 
        margin: 0 0 1rem 0 !important; 
        line-height: 1.8 !important; 
        page-break-inside: avoid !important;
        orphans: 3 !important;
        widows: 3 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      ul, ol { 
        margin: 1rem 0 !important; 
        padding-left: 2rem !important; 
        page-break-inside: avoid !important;
        list-style-position: outside !important;
      }
      li { 
        margin-bottom: 0.75rem !important; 
        padding-left: 0.5rem !important; 
        page-break-inside: avoid !important;
        word-wrap: break-word !important;
      }
      h1, h2, h3, h4 { 
        margin: 1.5rem 0 1rem 0 !important; 
        line-height: 1.4 !important; 
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        word-wrap: break-word !important;
      }
      h1:first-child, h2:first-child, h3:first-child, h4:first-child { 
        margin-top: 0 !important; 
      }
      strong, b { 
        letter-spacing: 0.05em !important; 
      }
      /* Ensure text flows properly between pages */
      .page-break {
        page-break-before: always !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        clear: both !important;
        display: block !important;
      }
      .keep-together {
        page-break-inside: avoid !important;
      }
      .break-before {
        page-break-before: auto !important;
      }
      /* Special handling for large content */
      .large-content {
        page-break-inside: auto !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        hyphens: auto !important;
      }
      /* Ensure no text is cut off */
      .no-cut {
        page-break-inside: avoid !important;
        orphans: 2 !important;
        widows: 2 !important;
      }
      /* Force content to flow to next page if needed */
      .force-break {
        page-break-before: always !important;
        clear: both !important;
      }
    `;
    tempContainer.appendChild(style);
    
    return tempContainer;
  };

  const waitForContentRender = (container) => {
    return new Promise((resolve) => {
      const images = container.querySelectorAll('img');
      if (images.length === 0) {
        resolve();
        return;
      }
      
      let loadedImages = 0;
      const totalImages = images.length;
      
      const checkComplete = () => {
        loadedImages++;
        if (loadedImages >= totalImages) {
          resolve();
        }
      };
      
      images.forEach(img => {
        if (img.complete) {
          checkComplete();
        } else {
          img.onload = checkComplete;
          img.onerror = checkComplete;
        }
      });
    });
  };

  // Function to intelligently split content to prevent text cutting
  const createIntelligentPageBreaks = (container) => {
    const paragraphs = container.querySelectorAll('p, h1, h2, h3, h4, ul, ol');
    let currentHeight = 0;
    const maxPageHeight = 500; // Reduced to ensure no content is cut off
    
    // First pass: calculate total height and identify potential break points
    const breakPoints = [];
    let totalHeight = 0;
    
    paragraphs.forEach((element, index) => {
      const elementHeight = element.offsetHeight;
      totalHeight += elementHeight;
      
      // If this element would cause a page overflow, mark it as a break point
      if (currentHeight + elementHeight > maxPageHeight && currentHeight > 0) {
        breakPoints.push({
          element: element,
          height: currentHeight,
          index: index
        });
        currentHeight = elementHeight;
      } else {
        currentHeight += elementHeight;
      }
      
      // Add margin between elements
      currentHeight += 16;
    });
    
    console.log(`Content analysis: ${paragraphs.length} elements, total height: ${totalHeight}, break points: ${breakPoints.length}`);
    
    // Second pass: insert page breaks at optimal locations
    breakPoints.forEach((breakPoint, breakIndex) => {
      const pageBreak = document.createElement('div');
      pageBreak.className = 'page-break';
      pageBreak.style.cssText = `
        page-break-before: always !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        clear: both !important;
        display: block !important;
      `;
      
      // Insert page break before the element that would cause overflow
      breakPoint.element.parentNode.insertBefore(pageBreak, breakPoint.element);
      console.log(`Page break ${breakIndex + 1} inserted before element ${breakPoint.index}`);
    });
    
    return container;
  };

  // Function to ensure content fits within page boundaries
  const ensureContentFit = (container) => {
    const elements = container.querySelectorAll('*');
    let hasOverflow = false;
    
    elements.forEach(element => {
      if (element.offsetHeight > 0) {
        // Check if element would overflow a typical page
        if (element.offsetHeight > 600) {
          console.log(`Large element detected: ${element.tagName}, height: ${element.offsetHeight}`);
          hasOverflow = true;
          
          // Add a class to mark this element for special handling
          element.classList.add('large-content');
        }
      }
    });
    
    if (hasOverflow) {
      console.log('Content overflow detected, applying special handling');
    }
    
    return container;
  };

  // Function to mark elements that should not be cut off
  const markNoCutElements = (container) => {
    const paragraphs = container.querySelectorAll('p, h1, h2, h3, h4, ul, ol');
    
    paragraphs.forEach((element, index) => {
      // Check if this element is near the end of a potential page
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const pageHeight = 500; // Conservative page height
      
      // If element would be cut off, mark it to flow to next page
      if (elementTop + elementHeight > pageHeight && elementTop < pageHeight + 100) {
        element.classList.add('no-cut');
        console.log(`Element ${index} marked as no-cut to prevent text cutting`);
      }
      
      // Mark headings to stay with their content
      if (element.tagName.match(/^H[1-4]$/)) {
        element.classList.add('no-cut');
        
        // Also mark the next few elements to stay together
        let nextElement = element.nextElementSibling;
        let count = 0;
        while (nextElement && count < 3 && nextElement.tagName !== 'H1' && nextElement.tagName !== 'H2' && nextElement.tagName !== 'H3' && nextElement.tagName !== 'H4') {
          nextElement.classList.add('no-cut');
          count++;
          nextElement = nextElement.nextElementSibling;
        }
      }
    });
    
    return container;
  };

  if (displaySummaries.length === 0) {
    return (
      <section className="summary-section">
        <div className="summary-container">
          <div className="summary-header">
            <h2>Summary</h2>
          </div>
          <div className="summary-content">
            <p>No summary generated yet. Upload medical files to get started.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentSummary = displaySummaries[activeSummaryIndex];

  return (
    <section className="summary-section">
      <div className="summary-container">
        <div className="summary-header">
          <h2>AI-Generated Summary</h2>
          {displaySummaries.length > 1 && (
            <div className="summary-navigation">
              <button 
                className="nav-btn" 
                onClick={() => setActiveSummaryIndex(Math.max(0, activeSummaryIndex - 1))}
                disabled={activeSummaryIndex === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="summary-counter">
                {activeSummaryIndex + 1} of {displaySummaries.length}
              </span>
              <button 
                className="nav-btn" 
                onClick={() => setActiveSummaryIndex(Math.min(displaySummaries.length - 1, activeSummaryIndex + 1))}
                disabled={activeSummaryIndex === displaySummaries.length - 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          <div className="summary-actions">
            <button className={`download-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} title={copied ? 'Copied' : 'Copy'} aria-label={copied ? 'Copied' : 'Copy'}>
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <rect x="2" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {displaySummaries.length > 1 && (
          <div className="file-info">
            <h4>{currentSummary.fileName}</h4>
          </div>
        )}

        <div className="summary-content" dangerouslySetInnerHTML={{ __html: currentSummary.summary }} />

        <div className="summary-footer-actions">
          <button className="download-btn no-shrink" onClick={handleDownloadJpg} title="Download as JPG">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download as JPG
          </button>
          
          <button className="download-btn no-shrink" onClick={handleDownloadPdf} title="Download as PDF">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download as PDF
          </button>
        </div>
        
        <div className="summary-note">
          <p>Note: The summary will be cleared if you refresh the page twice. Please save or download it if you want to keep a copy.</p>
        </div>
      </div>
    </section>
  );
};

export default SummaryDisplay;


