import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateAssistantResponse, SUGGESTED_PROMPTS } from '../utils/ai';
import { BookCover } from '../components/BookCover';
import type { ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Search,
  Armchair,
  BookOpen,
  Bot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const PROMPT_ICONS: Record<string, LucideIcon> = {
  search: Search,
  armchair: Armchair,
  sparkles: Sparkles,
  'book-open': BookOpen,
};

export function AIAssistant({ onOpenBook }: { onOpenBook: (id: string) => void }) {
  const { books, rooms, activeStudent } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm0',
      role: 'assistant',
      content: `Hi ${activeStudent.name.split(' ')[0]}! I'm your library study assistant. I can help you find books, locate them on the shelf, check seat availability, and recommend resources for your learning goals.\n\nWhat would you like to know?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const resp = generateAssistantResponse(text, books, rooms, activeStudent.interests);
      const assistantMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: 'assistant',
        content: resp.content,
        timestamp: new Date().toISOString(),
        recommendations: resp.recommendations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="card mb-4 flex items-center gap-3 p-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-500">
          <Bot className="h-5 w-5 text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-teal-400 ring-2 ring-white" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-ink-900">AI Study Assistant</h2>
          <p className="text-xs text-ink-500">Library-specific help · powered by your library data</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="card flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} onOpenBook={onOpenBook} />
          ))}
          {typing && (
            <div className="flex items-center gap-2.5">
              <AvatarIcon role="assistant" />
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-ink-100 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-ink-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((p) => {
          const Icon = PROMPT_ICONS[p.icon] || Search;
          return (
            <button
              key={p.label}
              onClick={() => send(p.text)}
              className="chip bg-white border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              <Icon className="h-3.5 w-3.5" /> {p.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2 rounded-2xl bg-white p-2 shadow-soft border border-ink-100"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Ask about books, seats, locations, or recommendations..."
          className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none max-h-32"
        />
        <button type="submit" disabled={!input.trim()} className="btn-primary !rounded-xl !p-2.5">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function AvatarIcon({ role }: { role: 'user' | 'assistant' }) {
  const { activeStudent } = useApp();
  if (role === 'user') {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${activeStudent.avatarColors[0]}, ${activeStudent.avatarColors[1]})` }}
      >
        {activeStudent.initials}
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500">
      <Bot className="h-4 w-4 text-white" />
    </div>
  );
}

function MessageBubble({ message, onOpenBook }: { message: ChatMessage; onOpenBook: (id: string) => void }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-fade-up`}>
      <AvatarIcon role={message.role} />
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'rounded-tr-sm bg-brand-600 text-white'
              : 'rounded-tl-sm bg-ink-100 text-ink-800'
          }`}
        >
          {formatContent(message.content)}
        </div>
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.recommendations.map((b) => (
              <button
                key={b.id}
                onClick={() => onOpenBook(b.id)}
                className="group flex w-full items-center gap-3 rounded-xl border border-ink-100 bg-white p-2.5 text-left transition-all hover:border-brand-200 hover:shadow-soft"
              >
                <BookCover book={b} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-sm font-bold text-ink-900 group-hover:text-brand-700">{b.title}</p>
                  <p className="text-xs text-ink-500">{b.author} · {b.subject}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="chip bg-ink-100 text-ink-600">{b.difficulty}</span>
                    {b.availableCopies > 0 ? (
                      <span className="chip bg-teal-100 text-teal-700">Available</span>
                    ) : (
                      <span className="chip bg-rose-100 text-rose-700">Issued</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatContent(text: string) {
  // Render **bold** segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
