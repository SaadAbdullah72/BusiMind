import { useState, useEffect } from 'react';



export default function SupportEngine() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState(0);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/support/live-inbox`);
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);


  const processAll = async () => {
    setProcessing(true);
    let count = 0;
    
    // We will process them sequentially to avoid rate limits, or in small batches.
    // Since there are 100, we'll do them sequentially for visual effect.
    for (const email of emails) {
      if (email.status !== 'unread') {
        count++;
        continue;
      }
      setSelectedEmail(email); // Show currently processing
      try {
        const res = await fetch('/api/support/resolve-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message_id: email.message_id, 
            message: email.body, 
            sender: email.sender,
            subject: email.subject
          })
        });
        const data = await res.json();
        
        // Update local results
        setResults(prev => ({...prev, [email.message_id]: data}));
        
        // Mark as read locally
        setEmails(prev => prev.map(e => e.message_id === email.message_id ? {...e, status: data.intent === 'COMPLAINT' ? 'escalated' : 'replied'} : e));
      } catch (err) {
        console.error(err);
      }
      count++;
      setProgress(Math.round((count / emails.length) * 100));
      // Add a 3 second delay to avoid hitting LLM rate limits (Groq allows ~30 RPM)
      await new Promise(r => setTimeout(r, 3000));
    }
    setProcessing(false);
  };

  return (
    <div className="flex h-[80vh] gap-6 text-slate-200">
      
      {/* Left Pane: Inbox */}
      <div className="w-1/2 bg-[#0c0c0e]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-[#121216] border-b border-[#1e1e24] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="font-bold text-slate-100">Live Gmail Inbox ({emails.length})</h2>
          </div>
          <div className="flex space-x-2">
            <button onClick={fetchInbox} disabled={loading || processing} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg font-medium transition-colors border border-slate-700 disabled:opacity-50">
              {loading ? 'Fetching...' : 'Fetch Live Emails'}
            </button>
            <button onClick={processAll} disabled={loading || processing || emails.length === 0} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {processing ? `Processing ${progress}%` : 'Run AI Automation'}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-[#0a0a0c]">
          {emails.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <p>Inbox is empty. Click "Fetch Live Emails" to pull from Gmail via IMAP.</p>
            </div>
          )}
          {emails.map((email) => (
            <div 
              key={email.message_id} 
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b border-[#1e1e24] cursor-pointer hover:bg-[#121216] transition-colors ${selectedEmail?.message_id === email.message_id ? 'bg-[#121216] border-l-2 border-l-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200 text-sm">{email.subject}</span>
                {email.status === 'unread' && <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">Unread</span>}
                {email.status === 'replied' && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Auto-Replied</span>}
                {email.status === 'escalated' && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">Escalated</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{email.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Pipeline Visualization */}
      <div className="w-1/2 bg-[#0c0c0e]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-[#121216] border-b border-[#1e1e24] p-4 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <h2 className="font-bold text-slate-100">Live Automation Output</h2>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!selectedEmail && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <p>Select an email to view AI processing details...</p>
            </div>
          )}

          {selectedEmail && processing && !results[selectedEmail.message_id] && (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center space-x-3 text-blue-400 animate-pulse">
                <span>Classifying Intent for {selectedEmail.subject}...</span>
              </div>
            </div>
          )}

          {selectedEmail && results[selectedEmail.message_id] && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Original Message */}
              <div className="bg-[#121216] border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Incoming Live Email</span>
                   <span className="text-[10px] text-slate-500 font-mono">{selectedEmail.sender}</span>
                </div>
                <p className="text-sm text-slate-200">"{selectedEmail.body}"</p>
              </div>

              {/* Step 1: Classification */}
              <div className="bg-[#121216] border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 1: AI Classification</span>
                  {results[selectedEmail.message_id].intent === 'COMPLAINT' ? (
                     <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">High Priority</span>
                  ) : (
                     <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded">Standard</span>
                  )}
                </div>
                <div className="flex space-x-4">
                  <div>
                    <p className="text-[10px] text-slate-500">Detected Intent</p>
                    <p className="font-semibold text-slate-200">{results[selectedEmail.message_id].intent}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Extracted Order ID</p>
                    <p className="font-semibold text-slate-200">{results[selectedEmail.message_id].extracted_id}</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Database Lookup */}
              {results[selectedEmail.message_id].database_context !== "No specific database context needed." && (
                <div className="bg-[#121216] border border-amber-500/30 rounded-xl p-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 block">Step 2: MongoDB POS Lookup</span>
                  <p className="text-sm text-slate-300 font-mono bg-black/50 p-2 rounded border border-slate-800 break-words">
                    {results[selectedEmail.message_id].database_context}
                  </p>
                </div>
              )}

              {/* Step 3: Reply Generation */}
              <div className="bg-[#121216] border border-emerald-500/30 rounded-xl p-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Step 3: Auto-Reply Draft (Roman Urdu)</span>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {results[selectedEmail.message_id].auto_reply}
                </p>
              </div>

              {/* Step 4: Final Action */}
              <div className="bg-[#121216] border border-[#1e1e24] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500">Final Automation Action</p>
                  <p className="font-bold text-slate-200">{results[selectedEmail.message_id].action_taken}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${results[selectedEmail.message_id].intent === 'COMPLAINT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {results[selectedEmail.message_id].intent === 'COMPLAINT' ? 'Sent to Admin' : 'Email Sent to Customer'}
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
