import React from 'react';
import '../CSS/HowToUse.css';

const HowToUse = () => {
  return (
    <section className="how-to-use">
      <div className="container">
        <h2 className="how-to-use-heading">
          How to use MedBrief AI - Patient Report Summarizer
        </h2>
        
        <div className="steps">
          <div className="step-row">
            <div className="step-number">1</div>
            <div className="step">
              <div className="step-content">
                <h3 className="step-title">Upload Medical Report</h3>
                <p className="step-text">
                  Select and upload a medical report that needs to be summarized by AI.
                </p>
              </div>
            </div>
          </div>
          
          <div className="step-row">
            <div className="step-number">2</div>
            <div className="step">
              <div className="step-content">
                <h3 className="step-title">AI Processing</h3>
                <p className="step-text">
                  AI will summarize your medical report into concise and structured summary, helping you read and learn faster.
                </p>
              </div>
            </div>
          </div>
          
          <div className="step-row">
            <div className="step-number">3</div>
            <div className="step">
              <div className="step-content">
                <h3 className="step-title">Download & Share</h3>
                <p className="step-text">
                  You can copy or download the summarized report as PDF or JPG for easy access and sharing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
