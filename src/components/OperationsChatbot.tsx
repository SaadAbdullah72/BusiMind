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

/**
 * OperationsChatbot Component
 * 
 * A conversational interface powered by LangChain and Groq (LLaMA 3).
 * Allows users to ask questions regarding sales velocities, stock levels, or operational policies.
 * Manages chat session history in localStorage and communicates with the `/api/chatbot` endpoint.
 * 
 * @param userEmail - The currently authenticated user's email address used for session isolation.
 */
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
    { label: "Analyze Inventory", text: "Please analyze our current stock levels and highlight which categories have the highest value." },
    { label: "Return Policies", text: "What is our store policy on customer returns for opened items vs defective items?" },
    { label: "Bestselling Products", text: "Based on our POS transactions, what are the top three bestselling items and their total revenue?" },
    { label: "Near Expiry Stock", text: "List any items in the inventory that are near their expiry date and recommend markdown strategies." }
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
      title: `Session ${sessions.length + 1}`,
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
          <ul key={index} className="list-disc pl-5 my-1 text-slate-350">
            <li className="text-[11px] leading-relaxed">{parsedElements}</li>
          </ul>
        );
      }
      
      if (isNumberedList) {
        const match = paragraph.trim().match(/^(\d+)\.\s+/);
        const number = match ? match[1] : '1';
        return (
          <ol key={index} className="list-decimal pl-5 my-1 text-slate-350" start={parseInt(number)}>
            <li className="text-[11px] leading-relaxed">{parsedElements}</li>
          </ol>
        );
      }
      
      return (
        <p key={index} className="mb-2 leading-relaxed text-[11.5px] text-slate-300 last:mb-0">
          {parsedElements}
        </p>
      );
    });
  }

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[76vh] bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Left Sidebar: Chat History */}
      <div className="w-full md:w-[230px] bg-[#08080a]/90 border-r border-[#1a1a24]/80 flex flex-col h-48 md:h-full shrink-0">
        <div className="p-3.5 border-b border-[#1a1a24]/80">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-200 text-[11px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                session.id === activeSession.id 
                  ? 'bg-slate-800/20 border-slate-700/20 text-slate-105 font-medium' 
                  : 'border-transparent text-slate-400 hover:bg-[#121216]/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <span className={`text-[11px] truncate uppercase font-bold tracking-wider ${session.id === activeSession.id ? 'text-white' : 'text-slate-400'}`}>{session.title}</span>
              </div>
              
              <button 
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-60 p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-all ml-1 cursor-pointer"
                title="Delete session"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat Workspace */}
      <div className="flex-1 bg-[#060608]/90 flex flex-col h-[60vh] md:h-full overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#0c0c0e]/80 border-b border-[#1a1a24]/80 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div>
              <h2 className="font-bold text-[12px] text-slate-200 uppercase tracking-widest">AI Store Assistant</h2>
              <p className="text-[9.5px] text-slate-500 uppercase tracking-widest font-semibold">POS + Stock + Policies RAG Copilot</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
            <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Active Session</span>
          </div>
        </div>

        {/* Chat Log & Grid */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin flex flex-col">
          {activeSession.messages.length <= 1 ? (
            <div className="max-w-xl mx-auto my-auto flex flex-col justify-center h-full text-center space-y-6 py-6">
              <div>
                <h3 className="text-[15px] font-bold text-slate-200">How can I assist your business today?</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ask professional queries about your inventory, customer transaction records, or shop policies.
                </p>
              </div>
              
              {/* Flexbox auto-adjusting tags instead of rigid grids */}
              <div className="flex flex-wrap gap-2.5 justify-center">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.text)}
                    disabled={loading}
                    className="p-3 bg-[#0c0c0e]/80 hover:bg-slate-800 border border-[#1a1a24]/80 hover:border-slate-600 rounded-xl text-left transition-all group cursor-pointer max-w-[260px] flex-grow flex flex-col justify-between"
                  >
                    <h4 className="text-[10.5px] font-bold text-slate-350 group-hover:text-white transition-colors mb-1 uppercase tracking-widest">{qp.label}</h4>
                    <p className="text-[9.5px] text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">
                      "{qp.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto w-full flex-1">
              {activeSession.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-[9px] font-bold uppercase ${
                      msg.sender === 'user' 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      {msg.sender === 'user' ? 'USR' : 'AI'}
                    </div>
                    
                    <div className={`p-3.5 rounded-xl border leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 border-slate-700 text-slate-200 rounded-tr-none'
                        : 'bg-[#0c0c0e]/80 border-slate-800 text-slate-300 rounded-tl-none'
                    }`}>
                      {formatMessageText(msg.text)}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border bg-slate-900 border-slate-800 text-[9px] font-bold text-slate-400 uppercase">
                      AI
                    </div>
                    <div className="bg-[#0c0c0e]/80 border-slate-800 text-slate-350 p-3 rounded-xl rounded-tl-none border shadow-md flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3.5 bg-[#08080a]/90 border-t border-[#1a1a24]/80 mt-auto">
          <div className="max-w-2xl mx-auto flex space-x-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              placeholder="Ask anything about sales, stock status, or business policies in professional English..."
              className="flex-1 bg-[#0c0c0e]/80 border border-[#1a1a24]/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500/50 transition-colors"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer shrink-0 uppercase tracking-wider"
            >
              <span className="text-[11px]">Send</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
