import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookCover } from '../components/BookCover';
import { Modal } from '../components/Modal';
import { BookLocator } from '../components/BookLocator';
import {
  Star,
  MapPin,
  BookOpen,
  Heart,
  BellRing,
  ArrowLeft,
  Navigation,
  Bookmark,
  Calendar,
  Hash,
  Layers,
  Building2,
} from 'lucide-react';

export function BookDetails({
  bookId,
  onBack,
}: {
  bookId: string;
  onBack: () => void;
}) {
  const { books, wishlist, toggleWishlist, notifyMe, issueBook, bookReservations, activeStudent } = useApp();
  const book = books.find((b) => b.id === bookId);
  const [locatorOpen, setLocatorOpen] = useState(false);

  if (!book) {
    return (
      <div className="card p-12 text-center">
        <p className="text-ink-500">Book not found.</p>
        <button onClick={onBack} className="mt-4 btn-secondary">Back to books</button>
      </div>
    );
  }

  const inWishlist = !!wishlist.find((w) => w.bookId === book.id);
  const isAvailable = book.availableCopies > 0;
  const myIssue = bookReservations.find(
    (r) => r.bookId === book.id && r.studentId === activeStudent.id && r.status === 'issued',
  );

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to books
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cover + actions */}
        <div className="lg:col-span-1">
          <div className="card p-6 flex flex-col items-center">
            <BookCover book={book} size="xl" className="shadow-card" />
            <div className="mt-5 w-full space-y-2.5">
              <button
                onClick={() => setLocatorOpen(true)}
                className="btn-primary w-full"
              >
                <Navigation className="h-4 w-4" /> Find This Book
              </button>
              {isAvailable ? (
                <button
                  onClick={() => issueBook(book.id)}
                  disabled={!!myIssue}
                  className="btn-teal w-full"
                >
                  <BookOpen className="h-4 w-4" /> {myIssue ? 'Already Issued' : 'Reserve Book'}
                </button>
              ) : (
                <button onClick={() => notifyMe(book.id)} className="btn-secondary w-full">
                  <BellRing className="h-4 w-4" /> Notify Me When Available
                </button>
              )}
              <button
                onClick={() => toggleWishlist(book.id)}
                className={`btn-secondary w-full ${inWishlist ? '!text-rose-600 !border-rose-200' : ''}`}
              >
                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-brand-50 text-brand-700">{book.subject}</span>
                  <span className="chip bg-ink-100 text-ink-600">{book.difficulty}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900">{book.title}</h2>
                <p className="mt-1 text-sm text-ink-500">by {book.author}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-gold-50 px-3 py-2">
                <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                <span className="font-display text-lg font-bold text-gold-700">{book.rating}</span>
                <span className="text-xs text-ink-500">({book.ratingsCount})</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-600">{book.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={BookOpen} label="Available" value={`${book.availableCopies}/${book.totalCopies}`} color={isAvailable ? 'text-teal-600' : 'text-rose-600'} />
              <Stat icon={Hash} label="ISBN" value={book.isbn} />
              <Stat icon={Calendar} label="Published" value={String(book.publishedYear)} />
              <Stat icon={Layers} label="Pages" value={String(book.pages)} />
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-ink-900">Location in Library</h3>
              <button onClick={() => setLocatorOpen(true)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Open map →
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <LocChip icon={Building2} label={book.location.block} />
              <span className="text-ink-300">→</span>
              <LocChip icon={MapPin} label={book.location.room} />
              <span className="text-ink-300">→</span>
              <LocChip icon={Layers} label={`Shelf ${book.location.shelf}`} />
              <span className="text-ink-300">→</span>
              <LocChip icon={Bookmark} label={`Row ${book.location.row}`} highlight />
            </div>
            <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 p-4 border border-brand-100">
              <p className="text-sm text-ink-700">
                <span className="font-bold text-brand-700">Navigation:</span> Enter through{' '}
                <span className="font-semibold">{book.location.block}</span>, head to{' '}
                <span className="font-semibold">{book.location.room}</span>. The book is on{' '}
                <span className="font-semibold">Shelf {book.location.shelf}, Row {book.location.row}</span>.
              </p>
            </div>
          </div>

          {/* Status + popularity */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-display text-sm font-bold text-ink-900">Availability Status</h3>
              <div className="mt-3 space-y-2.5">
                <Row label="Total copies" value={`${book.totalCopies}`} />
                <Row label="Available now" value={`${book.availableCopies}`} valueClass={isAvailable ? 'text-teal-600 font-bold' : 'text-rose-600 font-bold'} />
                <Row label="Currently issued" value={`${book.totalCopies - book.availableCopies}`} />
                <div className="flex items-center justify-between border-t border-ink-100 pt-2.5">
                  <span className="text-xs font-medium text-ink-500">Status</span>
                  {isAvailable ? (
                    <span className="chip bg-teal-100 text-teal-700">Available</span>
                  ) : (
                    <span className="chip bg-rose-100 text-rose-700">All copies issued</span>
                  )}
                </div>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-display text-sm font-bold text-ink-900">Popularity</h3>
              <div className="mt-3 space-y-2.5">
                <Row label="Times borrowed" value={`${book.borrowCount}`} />
                <Row label="Searches this month" value={`${book.searchCount}`} />
                <Row label="Rating" value={`${book.rating} / 5`} />
                <div className="flex flex-wrap gap-1.5 border-t border-ink-100 pt-2.5">
                  {book.tags.map((t) => (
                    <span key={t} className="chip bg-ink-100 text-ink-600">#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={locatorOpen} onClose={() => setLocatorOpen(false)} title="Smart Book Locator" size="lg">
        <BookLocator book={book} onClose={() => setLocatorOpen(false)} />
      </Modal>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color = 'text-ink-900' }: { icon: typeof Star; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function LocChip({ icon: Icon, label, highlight }: { icon: typeof MapPin; label: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${highlight ? 'bg-brand-600 text-white shadow-glow' : 'bg-ink-100 text-ink-700'}`}>
      <Icon className="h-4 w-4" /> {label}
    </span>
  );
}

function Row({ label, value, valueClass = 'text-ink-800 font-semibold' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}
