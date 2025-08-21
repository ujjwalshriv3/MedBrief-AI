import React from 'react';
import '../CSS/Hero.css';
import logo from '../assets/logo.jpg';

const Hero = () => {
  const scrollToUpload = () => {
    // Scroll to upload section (you can add an id to your upload section)
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">
              MedBrief AI – Patient Report Summarizer
            </h1>
            <p className="hero-subheadline">
              Upload medical files (PDFs, images) and get simplified summaries instantly.
            </p>
            <div className="hero-actions">
              <button className="hero-upload-btn" onClick={scrollToUpload}>
                Start Summarising Report
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-illustration">
              <img className="hero-photo" src={logo} alt="Doctor profile" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 