import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function OperationsChatbot({ userEmail }: { userEmail: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Assalam-o-Alaikum! Main aapka RetailMind Operations Assistant hoon. Main aapke uploads kiye gaye POS log, stock files, aur Business Policies ko analyze kar sakta hoon.\n\nAap mujhse stock levels, customer refunds, supplier delivery minimums, ya product layout se mutaliq koi bhi sawal pooch sakte hain. Main Roman Urdu aur English dono samajh sakta hoon!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Dalda Cooking Oil ka stock kitna bacha hai?",
    "Opened items ka exchange return policy kia hai?",
    "Unilever supplier delivery rules batayein?",
    "POS analysis ke mutabiq best-selling product konsi hai?",
    "Dairy items ki shelf-life guidelines kia hain?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, query: userMsg })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, there was an error: ${data.error || 'Server error'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Network error. Server connection fails or timeout." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[80vh] gap-6 text-slate-200">
      {/* Chat Area */}
      <div className="flex-1 bg-[#0c0c0e]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-[#121216] border-b border-[#1e1e24] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-100">AI Store Assistant</h2>
              <p className="text-[10px] text-slate-400">Owner Copilot (POS + Stock + Policies RAG)</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0a0a0c]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-br-none border border-orange-500/20'
                    : 'bg-[#121216] text-slate-200 rounded-bl-none border border-[#1e1e24]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#121216] text-slate-200 p-4 rounded-2xl rounded-bl-none border border-[#1e1e24] shadow-lg flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-[#121216] border-t border-[#1e1e24]">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input);
              }}
              placeholder="Ask anything about sales, items near expiry, or refund policies..."
              className="flex-1 bg-[#0a0a0c] border border-[#1e1e24] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Quick Prompts & Store Scope */}
      <div className="w-80 bg-[#0c0c0e]/80 backdrop-blur-md border border-[#1e1e24] rounded-2xl p-5 flex flex-col shadow-2xl shrink-0">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Analysis Prompts</h3>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="w-full text-left p-3.5 bg-[#121216] hover:bg-[#1b1b22] border border-[#1e1e24] hover:border-orange-500/30 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all font-medium leading-relaxed block cursor-pointer"
            >
              "{p}"
            </button>
          ))}
        </div>
        <div className="border-t border-[#1e1e24] pt-4 mt-4 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-400 mb-1">💡 Tips:</p>
          <ul className="list-disc pl-3.5 space-y-1">
            <li>Ask for price comparisons between Metro, Imtiaz and your stock prices.</li>
            <li>Inquire about the maximum allowed discount on expiring yogurts.</li>
            <li>Ask which items to add to Unilever PO to avoid the 500 PKR shipping fee.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
