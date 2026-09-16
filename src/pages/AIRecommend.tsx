import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookCover } from '../components/BookCover';
import { recommendBooks } from '../utils/ai';
import type { Book, Subject } from '../types';
import { INTEREST_OPTIONS } from '../data/mockData';
import {
  Sparkles,
  Search,
  Star,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Check,
} from 'lucide-react';

const PRESET_QUERIES = [
  'I want to learn Machine Learning from beginner level',
  'Help me learn Data Structures and Algorithms',
  'Recommend books for Web Development',
  'I want to study Physics for my semester exam',
  'Suggest resources for Cybersecurity beginners',
];

export function AIRecommend({ onOpenBook }: { onOpenBook: (id: string) => void }) {
  const { books, activeStudent, setActiveStudentFields } = useApp();
  const [query, setQuery] = useState('I want to learn Machine Learning from beginner level');
  const [submitted, setSubmitted] = useState(query);
  const [interests, setInterests] = useState<Subject[]>(activeStudent.interests);

  const recommendations = recommendBooks(submitted, books, interests);

  const toggleInterest = (s: Subject) => {
    setInterests((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
      setActiveStudentFields({ interests: next });
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Learning interests */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-gold-500" />
          <h3 className="font-display text-sm font-bold text-ink-900">Your Learning Interests</h3>
        </div>
        <p className="mt-1 text-xs text-ink-500">Select topics to personalize your recommendations.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((s) => {
            const active = interests.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleInterest(s)}
                className={`chip transition-all ${active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
              >
                {active && <Check className="h-3 w-3" />} {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Query input */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-teal-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-display text-sm font-bold text-ink-900">AI Book Recommendation</h3>
        </div>
        <div className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) setSubmitted(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you want to learn..."
                className="input pl-11"
              />
            </div>
            <button type="submit" className="btn-primary">
              <Sparkles className="h-4 w-4" /> Recommend
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); setSubmitted(q); }}
                className="chip bg-white border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                {q.length > 40 ? q.slice(0, 40) + '…' : q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-ink-900">Recommended Learning Path</h3>
          <span className="text-sm text-ink-500">{recommendations.length} books</span>
        </div>
        <p className="text-sm text-ink-500">For: "{submitted}"</p>

        {recommendations.length === 0 ? (
          <div className="card mt-4 p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 font-semibold text-ink-700">No matching books found</p>
            <p className="text-sm text-ink-500">Try a different topic or check your interests.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.book.id} rec={rec} index={i} onOpen={() => onOpenBook(rec.book.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  index,
  onOpen,
}: {
  rec: { book: Book; reason: string; order: number };
  index: number;
  onOpen: () => void;
}) {
  const { book, reason, order } = rec;
  return (
    <div
      className="card card-hover p-5 animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Order badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display text-sm font-bold text-white shadow-glow">
            {order}
          </div>
          <BookCover book={book} size="md" />
        </div>

        <div className="flex-1 min-w-0">
          <button onClick={onOpen} className="text-left">
            <h4 className="font-display text-base font-bold text-ink-900 hover:text-brand-700">{book.title}</h4>
          </button>
          <p className="text-sm text-ink-500">{book.author}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-50 text-brand-700">{book.subject}</span>
            <span className="chip bg-ink-100 text-ink-600">{book.difficulty}</span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-gold-600">
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {book.rating}
            </span>
            {book.availableCopies > 0 ? (
              <span className="chip bg-teal-100 text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Available ({book.availableCopies}/{book.totalCopies})
              </span>
            ) : (
              <span className="chip bg-rose-100 text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Issued
              </span>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50/60 p-3 border border-brand-100">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p className="text-xs leading-relaxed text-ink-600">{reason}</p>
          </div>

          <button onClick={onOpen} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View details <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
