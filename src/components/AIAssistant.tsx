import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Station } from '../types';
import { api } from '../lib/api';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  MapPin, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';

interface AIAssistantProps {
  stations: Station[];
  activeStationId?: string;
}

export default function AIAssistant({ stations, activeStationId }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Welcome to the Siemens Mobility Engineering Assistant. Ask about stations, RFIs, NCRs, Punch Items, project progress, or request a site inspection report.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick prompt templates
  
const QUICK_PROMPTS = [
  { text: 'Show open issues for the current station', label: 'Station Issues' },
  { text: 'Show all open NCRs', label: 'Open NCRs' },
  { text: 'Create a site inspection report', label: 'Draft Report' },
  { text: 'Show delayed activities', label: 'Delayed Tasks' }
];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await api.askAssistant([...messages, userMsg], activeStationId);
      
      const assistantMsg: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        role: 'model',
        content: responseText,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'model',
        content: 'Unable to connect to the AI service. Please try again later.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai_assistant_panel" className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col h-[650px] shadow-sm font-sans animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-slate-150 pb-3 mb-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
              <span>Siemens Engineering AI</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Engineering Project Assistant</p>
          </div>
        </div>

        {activeStationId && (
          <div className="text-[10px] bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 font-bold">
            Context: {stations.find(s => s.id === activeStationId)?.nameEn}
          </div>
        )}
      </div>

      {/* Message Timeline */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-teal-500 text-slate-950 font-bold rounded-tr-none' 
                : 'bg-slate-50 border border-slate-150 text-slate-900 rounded-tl-none font-medium'
            }`}>
              {/* Markdown simulation / clean breaks */}
              <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {m.content}
              </p>
              <span className={`text-[9px] font-mono block mt-2 text-right ${
                m.role === 'user' ? 'text-slate-800/80' : 'text-slate-500'
              }`}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-2.5 shadow-sm">
              <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
              <span className="text-xs text-slate-500 font-medium">Gemini AI is analyzing project metrics...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Container */}
      <div className="mb-3 shrink-0 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.text)}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-[10px] sm:text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-sm"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="shrink-0 flex gap-2 pt-2 border-t border-slate-150">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          placeholder="Ask a question or describe an issue..."
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all font-medium"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
          className="px-4 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
