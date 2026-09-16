import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookCover } from '../components/BookCover';
import { SUBJECTS } from '../data/mockData';
import type { Book } from '../types';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  X,
  Frown,
  Heart,
} from 'lucide-react';

type StatusFilter = 'all' | 'available' | 'issued';

export function Books({
  onOpenBook,
  initialQuery = '',
}: {
  onOpenBook: (id: string) => void;
  initialQuery?: string;
}) {
  const { books, wishlist, toggleWishlist } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [subject, setSubject] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<'rating' | 'title' | 'popular'>('rating');

  const filtered = useMemo(() => {
    let result = books;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q) ||
          b.isbn.includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (status === 'available') result = result.filter((b) => b.availableCopies > 0);
    if (status === 'issued') result = result.filter((b) => b.availableCopies === 0);
    if (subject !== 'all') result = result.filter((b) => b.subject === subject);
    if (difficulty !== 'all') result = result.filter((b) => b.difficulty === difficulty);
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === 'title') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'popular') result = [...result].sort((a, b) => b.searchCount - a.searchCount);
    return result;
  }, [books, query, status, subject, difficulty, sort]);

  const activeFilters = (status !== 'all' ? 1 : 0) + (subject !== 'all' ? 1 : 0) + (difficulty !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setStatus('all');
    setSubject('all');
    setDifficulty('all');
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, subject, ISBN, or keyword..."
              className="input pl-11"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input !w-auto !py-2.5">
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
              <option value="title">A–Z</option>
            </select>
            <button
              onClick={() => setShowFilters((o) => !o)}
              className={`btn-secondary relative ${showFilters || activeFilters > 0 ? '!border-brand-300 !text-brand-700' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-3 animate-fade-in">
            <div>
              <label className="label">Availability</label>
              <div className="flex gap-1.5">
                {(['all', 'available', 'issued'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 rounded-lg px-2.5 py-2 text-xs font-semibold capitalize transition-colors ${status === s ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input">
                <option value="all">All subjects</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input">
                <option value="all">All levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs font-semibold text-brand-600 hover:text-brand-700 sm:col-span-3 sm:justify-self-end">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-ink-500">
        Showing <span className="font-bold text-ink-900">{filtered.length}</span> book{filtered.length !== 1 ? 's' : ''}
        {query && <> for "<span className="font-semibold text-ink-700">{query}</span>"</>}
      </p>

      {/* Book grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100">
            <Frown className="h-7 w-7 text-ink-400" />
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">No books found</h3>
          <p className="mt-1 text-sm text-ink-500">Try adjusting your search or filters.</p>
          <button onClick={() => { setQuery(''); clearFilters(); }} className="mt-4 btn-secondary">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              index={i}
              onClick={() => onOpenBook(book.id)}
              inWishlist={!!wishlist.find((w) => w.bookId === book.id)}
              onWishlist={() => toggleWishlist(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({
  book,
  index,
  onClick,
  inWishlist,
  onWishlist,
}: {
  book: Book;
  index: number;
  onClick: () => void;
  inWishlist: boolean;
  onWishlist: () => void;
}) {
  return (
    <div
      className="card card-hover group flex flex-col overflow-hidden animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="relative flex gap-3 p-4">
        <button onClick={onClick} className="shrink-0">
          <BookCover book={book} size="md" className="transition-transform group-hover:scale-105" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <button onClick={onClick} className="text-left">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-brand-700">
                {book.title}
              </h3>
            </button>
            <button
              onClick={onWishlist}
              className={`shrink-0 rounded-lg p-1 transition-colors ${inWishlist ? 'text-rose-500' : 'text-ink-300 hover:text-rose-400'}`}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-500">{book.author}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="chip bg-brand-50 text-brand-700">{book.subject}</span>
            <span className="chip bg-ink-100 text-ink-600">{book.difficulty}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-0.5 font-semibold text-gold-600">
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {book.rating}
            </span>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500">({book.ratingsCount})</span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-ink-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {book.availableCopies > 0 ? (
            <span className="chip bg-teal-100 text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {book.availableCopies}/{book.totalCopies} available
            </span>
          ) : (
            <span className="chip bg-rose-100 text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              All issued
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-medium text-ink-500">
            <MapPin className="h-3 w-3" /> {book.location.room}
          </span>
        </div>
      </div>
    </div>
  );
}
