import { useState, useEffect, useRef } from 'react';

export default function SupportEngine({ userEmail }: { userEmail: string }) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState(0);
  const [sendingTest, setSendingTest] = useState(false);
  const stopRequestedRef = useRef(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('support_engine_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.emails && parsed.emails.length > 0) {
          setEmails(parsed.emails);
          setResults(parsed.results || {});
          if (parsed.selectedEmail) setSelectedEmail(parsed.selectedEmail);
          if (parsed.progress !== undefined) setProgress(parsed.progress);
        }
      } catch (e) {}
    }
  }, []);

  // Sync state to localStorage whenever emails, results, selectedEmail, or progress changes
  useEffect(() => {
    if (emails.length > 0) {
      localStorage.setItem('support_engine_state', JSON.stringify({
        emails,
        results,
        selectedEmail,
        progress
      }));
    }
  }, [emails, results, selectedEmail, progress]);

  const sendTestEmails = async () => {
    setSendingTest(true);
    try {
      const res = await fetch('/api/support/send-mock-emails', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchInbox();
      } else {
        alert(data.message || 'Error sending test emails');
      }
    } catch (err) {
      alert('Network error while sending test emails.');
    } finally {
      setSendingTest(false);
    }
  };

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/live-inbox?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only auto-fetch on mount if no cached emails exist in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('support_engine_state');
    let hasCachedEmails = false;
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.emails && parsed.emails.length > 0) {
          hasCachedEmails = true;
        }
      } catch (e) {}
    }
    if (userEmail && !hasCachedEmails) {
      fetchInbox();
    }
  }, [userEmail]);

  const processAll = async () => {
    if (processing) {
      // Toggle stop
      stopRequestedRef.current = true;
      setProcessing(false);
      return;
    }
    
    stopRequestedRef.current = false;
    setProcessing(true);
    
    let currentResults = { ...results };
    let currentEmails = [ ...emails ];
    const totalEmails = currentEmails.length;
    
    // Calculate initial processed count to support resume progress correctly
    const processedCount = currentEmails.filter(e => e.status !== 'unread').length;
    let count = processedCount;

    for (const email of currentEmails) {
      if (stopRequestedRef.current) break;
      
      if (email.status !== 'unread') {
        continue;
      }
      
      setSelectedEmail(email); // Show currently processing
      try {
        const res = await fetch(`/api/support/resolve-live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message_id: email.message_id, 
            message: email.body, 
            sender: email.sender,
            subject: email.subject,
            email: userEmail
          })
        });
        
        if (!res.ok) {
          throw new Error("Resolution request failed");
        }
        
        const data = await res.json();
        
        currentResults = { ...currentResults, [email.message_id]: data };
        setResults(currentResults);
        
        currentEmails = currentEmails.map(e => 
          e.message_id === email.message_id 
            ? { ...e, status: data.intent === 'COMPLAINT' ? 'escalated' : 'replied' } 
            : e
        );
        setEmails(currentEmails);
      } catch (err) {
        console.error(err);
      }
      
      count++;
      setProgress(Math.round((count / totalEmails) * 100));
      
      if (stopRequestedRef.current) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setProcessing(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[83vh] gap-6 text-slate-200">
      
      {/* Left Pane: Inbox */}
      <div className="w-full md:w-1/2 min-h-[50vh] bg-gradient-to-b from-[#0e0e12]/90 to-[#060609]/95 border border-[#1c1c24]/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-[#0e0e12]/85 border-b border-[#1a1a24]/85 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="font-extrabold text-xs text-slate-100 uppercase tracking-widest">Live Gmail Inbox ({emails.length})</h2>
          </div>
          <div className="flex space-x-2">
            <button onClick={sendTestEmails} disabled={loading || processing || sendingTest} className="px-3 py-1.5 bg-[#121216]/80 hover:bg-slate-800 text-slate-350 text-[10px] rounded-lg font-bold transition-all border border-slate-700/60 cursor-pointer disabled:opacity-50 uppercase tracking-wider">
              {sendingTest ? 'Sending...' : 'Send Test'}
            </button>
            <button onClick={fetchInbox} disabled={loading || processing || sendingTest} className="px-3 py-1.5 bg-[#121216]/80 hover:bg-slate-800 text-slate-350 text-[10px] rounded-lg font-bold transition-all border border-slate-700/60 cursor-pointer disabled:opacity-50 uppercase tracking-wider">
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
            <button 
              onClick={processAll} 
              disabled={loading || sendingTest || emails.length === 0} 
              className={`px-3 py-1.5 text-white text-[10px] rounded-lg font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50 uppercase tracking-wider ${processing ? 'bg-rose-600 hover:bg-rose-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              {processing ? `Stop Automation (${progress}%)` : progress > 0 && progress < 100 ? 'Resume Automation' : 'Run Automation'}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-[#050508]/40 divide-y divide-[#1a1a24]/40 scrollbar-thin">
          {emails.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
              <p className="font-semibold uppercase tracking-wider">Inbox is empty. Click "Fetch Live" to pull from Gmail.</p>
            </div>
          )}
          {emails.map((email) => (
            <div 
              key={email.message_id} 
              onClick={() => {
                setSelectedEmail(email);
              }}
              className={`p-4 cursor-pointer hover:bg-[#121216]/30 transition-all ${selectedEmail?.message_id === email.message_id ? 'bg-indigo-950/20 border-l-2 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-200 text-xs truncate max-w-[70%]">{email.subject}</span>
                {email.status === 'unread' && <span className="px-2 py-0.5 rounded-full bg-slate-800/30 text-slate-400 text-[8.5px] font-bold border border-slate-700/25 uppercase tracking-wider">Unread</span>}
                {email.status === 'replied' && <span className="px-2 py-0.5 rounded-full bg-emerald-950/30 text-emerald-400 text-[8.5px] font-bold border border-emerald-600/20 uppercase tracking-wider">Auto-Replied</span>}
                {email.status === 'escalated' && <span className="px-2 py-0.5 rounded-full bg-rose-950/30 text-rose-450 text-[8.5px] font-bold border border-rose-600/20 uppercase tracking-wider">Escalated</span>}
              </div>
              <p className="text-[10.5px] text-slate-500 truncate font-medium">{email.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Pipeline Visualization */}
      <div className="w-full md:w-1/2 min-h-[50vh] bg-gradient-to-b from-[#0e0e12]/90 to-[#060609]/95 border border-[#1c1c24]/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-[#0e0e12]/85 border-b border-[#1a1a24]/85 p-4 flex items-center space-x-3">
          <h2 className="font-extrabold text-xs text-slate-100 uppercase tracking-widest">Live Automation Output</h2>
        </div>

        <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
          {!selectedEmail && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
              <svg className="w-12 h-12 mb-3 opacity-20 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path></svg>
              <p className="font-semibold uppercase tracking-wider">Select an email to view AI processing details...</p>
            </div>
          )}

          {selectedEmail && processing && !results[selectedEmail.message_id] && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
              <div className="flex items-center space-x-3 text-slate-400 text-xs uppercase font-extrabold tracking-widest">
                <span>Classifying Intent for {selectedEmail.subject}...</span>
              </div>
            </div>
          )}

          {selectedEmail && results[selectedEmail.message_id] && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Original Message */}
              <div className="bg-gradient-to-b from-[#0a0a0f]/90 to-[#0c0c12]/95 border border-[#1c1c26] rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Incoming Live Email</span>
                   <span className="text-[9px] text-slate-500 font-mono">{selectedEmail.sender}</span>
                </div>
                <p className="text-[11px] text-slate-200">"{selectedEmail.body}"</p>
              </div>

              {/* Step 1: Classification */}
              <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#121217]/50 border border-slate-800/50 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-slate-350 uppercase tracking-wider">Step 1: AI Classification</span>
                  {results[selectedEmail.message_id].intent === 'COMPLAINT' ? (
                     <span className="px-2.5 py-0.5 bg-rose-950/60 border border-rose-800/40 text-rose-400 text-[8.5px] font-extrabold rounded uppercase tracking-wider">Escalated</span>
                  ) : (
                     <span className="px-2.5 py-0.5 bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 text-[8.5px] font-extrabold rounded uppercase tracking-wider">Auto-Replied</span>
                  )}
                </div>
                <div className="flex space-x-6">
                  <div>
                    <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Detected Intent</p>
                    <p className="font-extrabold text-slate-200 text-xs mt-0.5">{results[selectedEmail.message_id].intent}</p>
                  </div>
                  <div>
                    <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Extracted Order ID</p>
                    <p className="font-extrabold text-slate-200 text-xs mt-0.5">{results[selectedEmail.message_id].extracted_id}</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Database Lookup */}
              {results[selectedEmail.message_id].database_context !== "No specific database context needed." && (
                <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#121714]/50 border border-slate-800/50 rounded-xl p-4 shadow-md">
                  <span className="text-[9px] font-bold text-slate-350 uppercase tracking-wider mb-2 block">Step 2: Database Lookup</span>
                  <p className="text-[10px] text-slate-450 font-mono bg-[#050508]/80 p-2.5 rounded border border-[#1a1a24]/85 break-words leading-relaxed">
                    {results[selectedEmail.message_id].database_context}
                  </p>
                </div>
              )}

              {/* Step 3: Reply Generation */}
              <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#121217]/50 border border-slate-800/50 rounded-xl p-4 shadow-md">
                <span className="text-[9px] font-bold text-slate-350 uppercase tracking-wider mb-2 block">Step 3: Auto-Reply Draft</span>
                <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {results[selectedEmail.message_id].auto_reply}
                </p>
              </div>

              {/* Step 4: Final Action */}
              <div className="bg-gradient-to-b from-[#0c0c0e]/80 to-[#0f0f14]/80 border border-[#1a1a24] rounded-xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Final Automation Action</p>
                  <p className="font-extrabold text-slate-200 text-xs mt-0.5">{results[selectedEmail.message_id].action_taken}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border bg-slate-800/60 border-slate-700 text-slate-300 uppercase tracking-wider`}>
                  {results[selectedEmail.message_id].intent === 'COMPLAINT' ? 'Forwarded' : 'Replied'}
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
