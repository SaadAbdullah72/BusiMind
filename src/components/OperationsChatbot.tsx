import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const LOCAL_STORAGE_KEY = 'retailmind_chatbot_sessions';

export default function OperationsChatbot({ userEmail }: { userEmail: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    }
    
    // Default session if nothing is saved
    return [{
      id: 'default',
      title: 'New Analysis',
      messages: [
        {
          sender: 'ai',
          text: "Welcome to the RetailMind AI Store Assistant. I can analyze your POS logs, inventory records, and business policies to provide structured business insights.\n\nAsk me about stock status, product sales performance, layout optimization suggestions, or refund handling rules. All responses will be generated in professional English."
        }
      ],
      createdAt: Date.now()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActive = localStorage.getItem('retailmind_active_session_id');
    if (savedActive) {
      return savedActive;
    }
    return 'default';
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "Analyze Current Inventory", text: "Please analyze our current stock levels and highlight which categories have the highest value." },
    { label: "Check Return Policies", text: "What is our store policy on customer returns for opened items vs defective items?" },
    { label: "Bestselling Products", text: "Based on our POS transactions, what are the top three bestselling items and their total revenue?" },
    { label: "Check Near Expiry Stock", text: "List any items in the inventory that are near their expiry date and recommend markdown strategies." }
  ];

  // Sync active session ID to localStorage
  useEffect(() => {
    localStorage.setItem('retailmind_active_session_id', activeSessionId);
  }, [activeSessionId]);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Find the active session, fallback to the first session if not found
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'default',
    title: 'New Analysis',
    messages: []
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession.messages, loading]);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `New Session ${sessions.length + 1}`,
      messages: [
        {
          sender: 'ai',
          text: "Welcome to the RetailMind AI Store Assistant. I can analyze your POS logs, inventory records, and business policies to provide structured business insights.\n\nAsk me about stock status, product sales performance, layout optimization suggestions, or refund handling rules. All responses will be generated in professional English."
        }
      ],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedSessions = sessions.filter(s => s.id !== idToDelete);
    
    if (updatedSessions.length === 0) {
      const defaultSession: ChatSession = {
        id: 'default',
        title: 'New Analysis',
        messages: [
          {
            sender: 'ai',
            text: "Welcome to the RetailMind AI Store Assistant. I can analyze your POS logs, inventory records, and business policies to provide structured business insights.\n\nAsk me about stock status, product sales performance, layout optimization suggestions, or refund handling rules. All responses will be generated in professional English."
          }
        ],
        createdAt: Date.now()
      };
      setSessions([defaultSession]);
      setActiveSessionId('default');
    } else {
      setSessions(updatedSessions);
      if (activeSessionId === idToDelete) {
        setActiveSessionId(updatedSessions[0].id);
      }
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg = textToSend.trim();
    setInput('');
    setLoading(true);
    
    const currentActiveId = activeSession.id;
    const isFirstUserMessage = !activeSession.messages.some(m => m.sender === 'user');
    
    const userMessageObj: Message = { sender: 'user', text: userMsg };
    
    setSessions(prev => prev.map(s => {
      if (s.id === currentActiveId) {
        const updatedMessages = [...s.messages, userMessageObj];
        const title = isFirstUserMessage 
          ? (userMsg.length > 22 ? userMsg.substring(0, 22) + '...' : userMsg)
          : s.title;
        return { ...s, messages: updatedMessages, title };
      }
      return s;
    }));
    
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, query: userMsg })
      });
      const data = await res.json();
      
      const aiMessageText = res.ok 
        ? data.response 
        : `Sorry, there was an error: ${data.error || 'Server error'}`;
        
      const aiMessageObj: Message = { sender: 'ai', text: aiMessageText };
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentActiveId) {
          return { ...s, messages: [...s.messages, aiMessageObj] };
        }
        return s;
      }));
    } catch (err) {
      const aiMessageObj: Message = { sender: 'ai', text: "Network error. Server connection failed or timed out." };
      setSessions(prev => prev.map(s => {
        if (s.id === currentActiveId) {
          return { ...s, messages: [...s.messages, aiMessageObj] };
        }
        return s;
      }));
    } finally {
      setLoading(false);
    }
  };

  function formatMessageText(text: string) {
    const paragraphs = text.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      const isBulletList = paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ');
      const isNumberedList = /^\d+\.\s/.test(paragraph.trim());
      
      let content = paragraph;
      if (isBulletList) {
        content = paragraph.trim().replace(/^[-*]\s+/, '');
      } else if (isNumberedList) {
        content = paragraph.trim().replace(/^\d+\.\s+/, '');
      }
      
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const parsedElements = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIndex} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      if (isBulletList) {
        return (
          <ul key={index} className="list-disc pl-5 my-1 text-slate-300">
            <li>{parsedElements}</li>
          </ul>
        );
      }
      
      if (isNumberedList) {
        const match = paragraph.trim().match(/^(\d+)\.\s+/);
        const number = match ? match[1] : '1';
        return (
          <ol key={index} className="list-decimal pl-5 my-1 text-slate-300" start={parseInt(number)}>
            <li>{parsedElements}</li>
          </ol>
        );
      }
      
      return (
        <p key={index} className="mb-2 leading-relaxed last:mb-0">
          {parsedElements}
        </p>
      );
    });
  }

  return (
    <div className="flex h-[80vh] bg-[#0c0c0e]/40 border border-[#1c1c24] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Left Sidebar: Chat History */}
      <div className="w-[260px] bg-[#0c0c0e]/95 border-r border-[#1c1c24] flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-[#1c1c24]">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer border ${
                session.id === activeSession.id 
                  ? 'bg-[#161620]/60 border-[#2a2a35] text-slate-100' 
                  : 'border-transparent text-slate-400 hover:bg-[#121216]/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <svg className={`w-4 h-4 shrink-0 opacity-70 ${session.id === activeSession.id ? 'text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-semibold truncate">{session.title}</span>
              </div>
              
              <button 
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="opacity-40 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-all ml-1 cursor-pointer"
                title="Delete session"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat Workspace */}
      <div className="flex-1 bg-[#070709] flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#0c0c0e]/80 border-b border-[#1c1c24] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-xs text-slate-100">AI Store Assistant</h2>
              <p className="text-[10px] text-slate-500">Owner Copilot (POS + Stock + Policies RAG)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Active Session</span>
          </div>
        </div>

        {/* Chat Log & Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col justify-between">
          {activeSession.messages.length <= 1 ? (
            <div className="max-w-xl mx-auto my-auto flex flex-col justify-center h-full text-center space-y-8 py-10">
              <div>
                <h3 className="text-xl font-bold text-slate-200">How can I assist your business today?</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Ask professional queries about your inventory, customer transaction records, or shop policies.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.text)}
                    disabled={loading}
                    className="p-4 bg-[#0d0d11] hover:bg-[#121217]/80 border border-[#1c1c24] hover:border-indigo-500/30 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors mb-1">{qp.label}</h4>
                    <p className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-2 leading-relaxed">
                      "{qp.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto w-full">
              {activeSession.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                    }`}>
                      {msg.sender === 'user' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-xl text-xs leading-relaxed shadow-md border ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-slate-100 rounded-tr-none'
                        : 'bg-[#0d0d11] border-[#1c1c24] text-slate-300 rounded-tl-none'
                    }`}>
                      {formatMessageText(msg.text)}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-slate-800/50 border-slate-700/50 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-[#0d0d11] border-[#1c1c24] text-slate-300 p-4 rounded-xl rounded-tl-none border shadow-md flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-450 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-450 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-450 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-[#0a0a0c] border-t border-[#1c1c24] mt-auto">
          <div className="max-w-3xl mx-auto flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              placeholder="Ask anything about sales, low stock, or refund policies in professional English..."
              className="flex-1 bg-[#0d0d11] border border-[#1c1c24] rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              <span className="text-xs">Send</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
