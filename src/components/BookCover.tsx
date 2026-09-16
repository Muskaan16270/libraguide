import type { Book } from '../types';

export function BookCover({
  book,
  size = 'md',
  className = '',
}: {
  book: Book;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-[8px]',
    md: 'w-20 h-28 text-[10px]',
    lg: 'w-32 h-44 text-xs',
    xl: 'w-44 h-60 text-sm',
  };
  const [c1, c2] = book.coverColors;
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg shadow-md ${sizeClasses[size]} ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <div className="absolute left-0 top-0 h-full w-1.5 bg-black/15" />
      <div
        className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-30"
        style={{ background: book.coverAccent }}
      />
      <div className="flex h-full flex-col justify-between p-2.5">
        <div>
          <div className="mb-1 h-0.5 w-6 rounded-full" style={{ background: book.coverAccent }} />
          <p className="font-display font-bold leading-tight text-white drop-shadow-sm line-clamp-3">
            {book.title}
          </p>
        </div>
        <p className="text-white/70 leading-tight line-clamp-1">{book.author}</p>
      </div>
    </div>
  );
}
