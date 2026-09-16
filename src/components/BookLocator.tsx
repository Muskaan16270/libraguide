import type { Book } from '../types';
import { Building2, DoorOpen, Layers, Bookmark, CheckCircle2, Lightbulb } from 'lucide-react';

export function BookLocator({ book, onClose }: { book: Book; onClose: () => void }) {
  const { block, room, shelf, row } = book.location;
  const steps = [
    { icon: Building2, label: block, sub: 'Enter the block', color: 'bg-brand-500' },
    { icon: DoorOpen, label: room, sub: 'Go to this room', color: 'bg-teal-500' },
    { icon: Layers, label: `Shelf ${shelf}`, sub: 'Find the shelf', color: 'bg-gold-500' },
    { icon: Bookmark, label: `Row ${row}`, sub: 'Your book is here', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Visual library map */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-gradient-to-br from-ink-50 to-brand-50/50 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Library Map · {block}</p>

        {/* Blocks row */}
        <div className="mt-4 flex gap-3">
          {['Block A', 'Block B', 'Block C'].map((b) => (
            <div
              key={b}
              className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${b === block ? 'border-brand-500 bg-brand-50 shadow-glow' : 'border-ink-200 bg-white/60'}`}
            >
              <Building2 className={`mx-auto h-5 w-5 ${b === block ? 'text-brand-600' : 'text-ink-300'}`} />
              <p className={`mt-1 text-xs font-bold ${b === block ? 'text-brand-700' : 'text-ink-400'}`}>{b}</p>
            </div>
          ))}
        </div>

        {/* Rooms grid inside block */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {['Room 101', 'Room 103', 'Room 204', 'Room 208', 'Room 210', 'Room 212', 'Room 302', 'Room 305'].map((r) => {
            const active = r === room;
            return (
              <div
                key={r}
                className={`rounded-lg border p-2 text-center transition-all ${active ? 'border-teal-500 bg-teal-50 scale-105' : 'border-ink-200 bg-white/40'}`}
              >
                <DoorOpen className={`mx-auto h-4 w-4 ${active ? 'text-teal-600' : 'text-ink-300'}`} />
                <p className={`mt-0.5 text-[10px] font-semibold ${active ? 'text-teal-700' : 'text-ink-400'}`}>{r}</p>
              </div>
            );
          })}
        </div>

        {/* Shelf + Row detail */}
        <div className="mt-4 rounded-xl bg-white p-4 border border-ink-100">
          <p className="text-xs font-semibold text-ink-500">Inside {room}</p>
          <div className="mt-3 flex items-end gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => {
              const active = s === shelf;
              return (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-md transition-all ${active ? 'h-16 bg-gold-500 shadow-md ring-2 ring-gold-300 ring-offset-1' : 'h-10 bg-ink-200'}`}
                  />
                  <span className={`mt-1 text-[9px] font-bold ${active ? 'text-gold-700' : 'text-ink-400'}`}>S{s}</span>
                </div>
              );
            })}
          </div>

          {shelf <= 10 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gold-50 p-2.5 border border-gold-100">
              <Layers className="h-4 w-4 text-gold-600" />
              <p className="text-xs text-ink-700">
                <span className="font-bold text-gold-700">Shelf {shelf}</span> — {book.subject} section
              </p>
            </div>
          )}

          {/* Row indicator */}
          <div className="mt-3 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((r) => {
              const active = r === row;
              return (
                <div
                  key={r}
                  className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-bold transition-all ${active ? 'bg-rose-500 text-white shadow-sm' : 'bg-ink-100 text-ink-400'}`}
                >
                  Row {r}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step-by-step */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Directions</p>
        <div className="mt-3 space-y-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.color} text-white`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink-900">{s.label}</p>
                  <p className="text-xs text-ink-500">{s.sub}</p>
                </div>
                {i < steps.length - 1 && <div className="text-ink-300">↓</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-teal-50 p-4 border border-teal-100">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <div>
          <p className="text-sm font-semibold text-teal-800">Almost there!</p>
          <p className="mt-0.5 text-xs text-ink-600">
            "{book.title}" is at <span className="font-bold">{block} → {room} → Shelf {shelf} → Row {row}</span>. Look for the {book.subject} label on the shelf.
          </p>
        </div>
      </div>

      <button onClick={onClose} className="btn-primary w-full">
        <CheckCircle2 className="h-4 w-4" /> Got it, take me there
      </button>
    </div>
  );
}
