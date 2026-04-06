import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // ========================================================
  // THE REACT STATE (The memory of our component)
  // ========================================================
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  
  // NEW: A counter to track how many times we've asked the server
  const [pollCount, setPollCount] = useState(0); 

  // ========================================================
  // TASK 2: THE FETCH LOGIC (GET REQUEST)
  // ========================================================
  const fetchMeetings = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/meetings');
      if (response.ok) {
        let data = await response.json();
        // Sort data so the newest meetings always show up at the top!
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMeetings(data);
      }
    } catch (error) {
      console.error("Failed to fetch meetings. Is backend on?", error);
    }
  };

  // ========================================================
  // TASK 3: THE SMART POLLING ENGINE (The 10-Poll Kill Switch)
  // ========================================================
  
  // 1. Initial Load: Fetch meetings ONCE when the dashboard opens
  useEffect(() => {
    fetchMeetings();
  }, []);

  // 2. The Smart Engine Loop
  useEffect(() => {
    // Check if there are ANY meetings that are still PENDING
    const hasPendingMeetings = meetings.some(m => m.status === 'PENDING');

    // RULE 1: Stop polling entirely if all uploaded meetings are completed!
    if (!hasPendingMeetings) {
       return; 
    }

    // RULE 2: The Kill Switch. If we've polled 10 times, assume the backend AI crashed.
    if (pollCount >= 10) {
       // Mark all currently 'PENDING' items as 'CRASHED' purely on the frontend UI
       setMeetings(prevMeetings => prevMeetings.map(m => 
          m.status === 'PENDING' ? { ...m, status: 'CRASHED: Please re-upload' } : m
       ));
       return; // Stop the engine so we don't ping the server anymore
    }

    // If we passed the rules above, start the 3-second timer.
    const intervalId = setInterval(() => {
       fetchMeetings();
       setPollCount(prevCount => prevCount + 1); // Increase our attempts tracker
    }, 3000);

    // Cleanup: destroy the timer if the component redraws
    return () => clearInterval(intervalId);
    
  }, [meetings, pollCount]); // The engine watches these two variables to know when to stop

  // ========================================================
  // TASK 1: THE SAVE LOGIC (POST REQUEST)
  // ========================================================
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (!title || !transcript) {
      alert("Please enter both a title and transcript.");
      return;
    }

    try {
      await fetch('http://localhost:8081/api/meetings/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, transcript })
      });

      // Clear the text boxes on success
      setTitle('');
      setTranscript('');
      
      // NEW: Wake up the Smart Polling Engine!
      setPollCount(0); // Reset our attempts back to 0
      fetchMeetings(); // Manually fetch once instantly to show the new pending card
      
    } catch (error) {
      console.error("Error uploading meeting:", error);
      alert("Failed to connect to backend server!");
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* THE BRANDING HEADER */}
      <header className="header">
        <h1>Analyze Meetings With AI</h1>
        <p>Enterprise-grade meeting transcription, summary, and action items.</p>
      </header>
      
      <section className="glass-card">
        <h2>1. Upload a New Meeting Transcript</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meeting Title</label>
            <input 
              className="form-control" 
              type="text" 
              placeholder="e.g. Q3 Roadmap Review" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Raw Transcript</label>
            <textarea 
              className="form-control" 
              rows="5" 
              placeholder="Paste the raw meeting transcript here..." 
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
          
          <button className="submit-btn" type="submit">Analyze with AI</button>
        </form>
      </section>

      <section className="glass-card" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        <h2 style={{ paddingLeft: '10px' }}>2. Meeting History Dashboard</h2>
        
        <div className="meetings-grid">
          
          {meetings.length === 0 && (
             <div style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '20px' }}>
               No meetings processed yet. Upload your first transcript above! 🚀
             </div>
          )}

          {meetings.map((meeting) => (
            
            <div key={meeting.id} className="glass-card meeting-item" style={{ marginBottom: 0 }}>
              
              <div className="meeting-header">
                <h3 className="meeting-title">{meeting.title}</h3>
                
                {/* Dynamically applying the correct colored badge based on status! */}
                <span className={
                  meeting.status === 'PENDING' ? 'status-badge status-pending' : 
                  meeting.status.includes('CRASHED') ? 'status-badge status-crashed' : 
                  'status-badge status-completed'
                }>
                  {meeting.status}
                </span>
              </div>
              
              {/* Conditional Rendering: Show summary if COMPLETED, else pending/crashed messages */}
              {meeting.status === 'COMPLETED' ? (
                <div className="summary-box">
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '10px' }}>🤖 AI Summary Result:</strong>
                  <pre>{meeting.summaryJson}</pre>
                </div>
              ) : meeting.status.includes('CRASHED') ? (
                <p style={{ color: '#ef4444', fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>
                  🚨 {meeting.status}
                </p>
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
