'use client';
import React, { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function GrokClone() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'API error');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      console.error("Failed to fetch response:", error);
      setMessages([...newMessages, { role: 'assistant', content: `Oops! ${error.message || 'An error occurred while generating a response.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden font-sans">
      {/* Starry Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            radial-gradient(circle at 60% 50%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            radial-gradient(circle at 20% 70%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%'
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center space-x-3">
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
          <span className="text-[15px] font-semibold text-white">View in the Grok app</span>
        </div>
        <button className="flex items-center space-x-2 bg-[#1a1a1a] hover:bg-[#252525] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-gray-800">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            <path d="M2 12h20"></path>
          </svg>
          <span>Open Grok</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className={`flex-grow flex flex-col relative z-10 px-4 ${messages.length > 0 ? 'pb-32 pt-8 w-full max-w-4xl mx-auto overflow-y-auto items-stretch justify-start' : 'items-center justify-center pb-[15vh]'}`}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center">
            <svg className="w-[200px] h-auto" fill="none" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 10 C15 20, 10 40, 25 50 C40 60, 55 45, 55 30 C55 15, 45 5, 30 10 Z" stroke="white" strokeLinecap="round" strokeWidth="4"></path>
              <path d="M25 50 L15 58" stroke="white" strokeLinecap="round" strokeWidth="3"></path>
              <path d="M52 14 L60 8" stroke="white" strokeLinecap="round" strokeWidth="3"></path>
              <path d="M20 40 L45 15" stroke="white" strokeLinecap="round" strokeWidth="3"></path>
              <text fill="white" fontFamily="Inter, sans-serif" fontSize="38" fontWeight="600" letterSpacing="-1" x="70" y="42">Grok</text>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col space-y-6 w-full pb-8">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-3xl max-w-[85%] ${msg.role === 'user' ? 'bg-[#252525] text-white' : 'bg-transparent text-gray-200'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2 text-gray-400 font-semibold">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 10 C15 20, 10 40, 25 50 C40 60, 55 45, 55 30 C55 15, 45 5, 30 10 Z" stroke="currentColor" strokeLinecap="round" strokeWidth="6"></path>
                        <path d="M25 50 L15 58" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                        <path d="M52 14 L60 8" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                        <path d="M20 40 L45 15" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                      </svg>
                      <span>Grok</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="p-4 rounded-3xl text-gray-400 flex items-center space-x-2">
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Input Section */}
      <div className="absolute bottom-6 w-full max-w-3xl left-1/2 -translate-x-1/2 px-4 flex flex-col items-center space-y-4 z-20">
        {/* SuperGrok Banner */}
        {messages.length === 0 && (
          <div className="w-full sm:w-auto bg-[#141414]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a1a2e]/50 to-transparent"></div>
            <div className="relative z-10 flex flex-col pr-8 sm:pr-16">
              <span className="text-white text-lg font-bold tracking-tight">SuperGrok</span>
              <span className="text-gray-400 text-sm">Unlock extended capabilities</span>
            </div>
            <button className="relative z-10 bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
              Try Free
            </button>
          </div>
        )}

        {/* Search / Input Bar */}
        <form onSubmit={handleSubmit} className="w-full bg-[#1c1c1c] rounded-[28px] p-2 flex items-center shadow-lg border border-gray-800 focus-within:border-gray-500 transition-colors">
          <button type="button" className="p-3 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
          <input 
            className="flex-grow bg-transparent border-none text-white text-lg placeholder-gray-500 focus:ring-0 focus:outline-none px-2" 
            placeholder="Ask Grok" 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-center space-x-1 pr-1">
            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-white text-black p-2.5 rounded-full hover:bg-gray-200 transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                <rect fill="currentColor" height="4" rx="1" width="2" x="3" y="10"></rect>
                <rect fill="currentColor" height="12" rx="1" width="2" x="7" y="6"></rect>
                <rect fill="currentColor" height="18" rx="1" width="2" x="11" y="3"></rect>
                <rect fill="currentColor" height="12" rx="1" width="2" x="15" y="6"></rect>
                <rect fill="currentColor" height="4" rx="1" width="2" x="19" y="10"></rect>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
