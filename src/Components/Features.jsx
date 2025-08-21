import React from 'react';
import { FiFileText, FiCamera, FiBookOpen, FiShield, FiUploadCloud, FiDownloadCloud } from 'react-icons/fi';
import '../CSS/Features.css';

const Features = () => {
  const featureItems = [
    {
      icon: <FiFileText />,
      text: 'Supports PDF, JPG, PNG files',
    },
    {
      icon: <FiCamera />,
      text: 'Extracts scanned image text using OCR',
    },
    {
      icon: <FiBookOpen />,
      text: 'Summarizes lengthy medical reports instantly',
    },
    {
      icon: <FiShield />,
      text: 'Free to use with private & secure processing',
    },
    {
      icon: <FiUploadCloud />,
      text: 'User-friendly interface for quick uploads',
    },
    {
      icon: <FiDownloadCloud />,
      text: 'Download or share summaries in one click',
    },
  ];

  return (
    <section className="features" aria-labelledby="features-heading">
      <div className="features-container">
        <h2 id="features-heading" className="features-title">What MedBrief AI Offers</h2>

        <div className="features-grid">
          {featureItems.map((item, index) => (
            <div key={index} className="feature-card" tabIndex={0}>
              <div className="feature-icon">{item.icon}</div>
              <h3 className="feature-text">{item.text}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


