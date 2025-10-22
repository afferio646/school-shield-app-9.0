import React, { useState } from 'react';
import './LeaveAndAccommodationCard.css';

// This is our hard-coded example response.
const exampleResponse = "To be eligible for FMLA leave, an employee must have worked for the company for at least 12 months and completed at least 1,250 hours of service in the preceding 12-month period.";

function LeaveAndAccommodationCard() {
  // State to manage the name of the "uploaded" file
  const [uploadedFile, setUploadedFile] = useState(null);
  // State to hold the final response to display
  const [response, setResponse] = useState("");

  // A mock function to simulate a file upload
  const handleFileUpload = () => {
    setUploadedFile("FMLA_Policy.pdf");
    // Clear previous response when a new file is uploaded
    setResponse("");
  };

  // A function to handle the query and show the hard-coded response
  const handleAskQuestion = () => {
    if (uploadedFile) {
      setResponse(exampleResponse);
    } else {
      alert("Please upload a document first.");
    }
  };

  return (
    <div className="compliance-card">
      <h3>Leave & Accommodation</h3>

      {/* --- Overview & Instructions Section --- */}
      <div className="card-instructions">
        <p><strong>Overview:</strong> This card helps you manage and analyze employee leave and accommodation requests to ensure compliance with legal standards and internal policies.</p>
        <ol>
          <li>Click "Upload Document" to add a policy or request file.</li>
          <li>Ask a specific question about the uploaded document.</li>
        </ol>
      </div>

      {/* --- Document Upload Section --- */}
      <div className="card-section">
        <button onClick={handleFileUpload}>Upload Document</button>
        {uploadedFile && (
          <div className="file-display">
            <p>Uploaded: <strong>{uploadedFile}</strong></p>
          </div>
        )}
      </div>

      {/* --- Query Input Section --- */}
      <div className="card-section">
        <textarea
          className="query-input"
          placeholder="Ask a question about the uploaded document..."
          rows="3"
        ></textarea>
        <button onClick={handleAskQuestion}>Ask Question</button>
      </div>

      {/* --- Response Display Section --- */}
      {response && (
        <div className="card-section response-area">
          <h4>Response:</h4>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default LeaveAndAccommodationCard;
