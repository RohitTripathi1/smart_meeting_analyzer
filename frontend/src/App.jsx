import { useState } from 'react'
import './App.css'

function App() {
  
  // -------------------------------------------------------------
  // DUMMY DATA: This represents exactly what our Spring Boot API 
  // will eventually return. We use this to build the UI safely!
  // -------------------------------------------------------------
  const dummyMeetings = [
    {
      id: "meeting-1",
      title: "Sprint Planning",
      transcript: "We need to finish the React dashboard today.",
      status: "PENDING",
      summaryJson: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "meeting-2",
      title: "Marketing Sync",
      transcript: "Let's increase our ad spend on LinkedIn.",
      status: "COMPLETED",
      summaryJson: '{\n  "summary": "Team agreed to increase LinkedIn budget.",\n  "action_items": [\n    "Update budget sheet",\n    "Track metrics"\n  ]\n}',
      createdAt: new Date(Date.now() - 50000).toISOString()
    }
  ];

  return (
    <div className="dashboard-container">
      
      {/* THE BRANDING HEADER */}
      <header className="header">
        <h1>Analyze Meetings With AI</h1>
        <p>Enterprise-grade meeting transcription, summary, and action items.</p>
      </header>
      
      {/* ======================================================== */}
      {/* SECTION 1: THE UPLOAD FORM                               */}
      {/* ======================================================== */}
      <section className="glass-card">
        <h2>1. Upload a New Meeting Transcript</h2>
        <form>
          <div className="form-group">
            <label>Meeting Title</label>
            <input className="form-control" type="text" placeholder="e.g. Q3 Roadmap Review" />
          </div>
          
          <div className="form-group">
            <label>Raw Transcript</label>
            <textarea className="form-control" rows="5" placeholder="Paste the raw meeting transcript here..." />
          </div>
          
          <button className="submit-btn" type="submit">Analyze with AI</button>
        </form>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: THE DASHBOARD (LIST OF MEETINGS)              */}
      {/* ======================================================== */}
      <section className="glass-card" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        <h2 style={{ paddingLeft: '10px' }}>2. Meeting History Dashboard</h2>
        
        {/* The Grid layout automatically figures out how many cards fit side-by-side */}
        <div className="meetings-grid">
          {dummyMeetings.map((meeting) => (
            
            <div key={meeting.id} className="glass-card meeting-item" style={{ marginBottom: 0 }}>
              
              <div className="meeting-header">
                <h3 className="meeting-title">{meeting.title}</h3>
                
                {/* Dynamically applying the correct colored badge based on status! */}
                <span className={meeting.status === 'PENDING' ? 'status-badge status-pending' : 'status-badge status-completed'}>
                  {meeting.status}
                </span>
              </div>
              
              {/* Conditional Rendering: Only show summary if it is COMPLETED */}
              {meeting.status === 'COMPLETED' ? (
                <div className="summary-box">
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '10px' }}>🤖 AI Summary Result:</strong>
                  <pre>{meeting.summaryJson}</pre>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, fontStyle: 'italic' }}>
                  The AI is currently processing this transcript. Please wait for the worker...
                </p>
              )}
              
            </div>
            
          ))}
        </div>
      </section>

    </div>
  )
}

export default App
