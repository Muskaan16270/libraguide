import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BookCover } from '../components/BookCover';
import { RadialProgress, ProgressBar } from '../components/Charts';
import { greeting, countdown } from '../utils/format';
import { recommendBooks } from '../utils/ai';
import { getPriorityLevel } from '../types';
import {
  Search,
  BookOpen,
  Armchair,
  Sparkles,
  Bookmark,
  TrendingUp,
  Clock,
  ArrowRight,
  Library,
  Users,
  Lightbulb,
  Star,
  Crown,
  LogIn,
  Timer,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Book } from '../types';

export function Dashboard({ onNavigate, onSearch }: { onNavigate: (p: string) => void; onSearch: (q: string) => void }) {
  const { books, rooms, activeStudent, seatReservations, bookReservations, checkInSeat, releaseSeatEarly } = useApp();
  const [query, setQuery] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const priorityLevel = getPriorityLevel(activeStudent.libraPoints);
  const isMember = activeStudent.membership.status === 'active';

  const stats = useMemo(() => {
    const totalSeats = rooms.reduce((s, r) => s + r.totalSeats, 0);
    const occupied = rooms.reduce((s, r) => s + r.occupiedSeats, 0);
    const availSeats = totalSeats - occupied - rooms.reduce((s, r) => s + r.reservedSeats, 0);
    const availableBooks = books.filter((b) => b.availableCopies > 0).length;
    const occupancyPct = Math.round((occupied / totalSeats) * 100);
    return {
      issued: bookReservations.filter((r) => r.status === 'issued' && r.studentId === activeStudent.id).length,
      availSeats,
      availableBooks,
      occupancyPct,
    };
  }, [rooms, books, bookReservations, activeStudent.id]);

  const recommendations = useMemo(
    () => recommendBooks('learn machine learning', books, activeStudent.interests).slice(0, 4),
    [books, activeStudent.interests],
  );

  const activeSeat = seatReservations.find(
    (r) => r.studentId === activeStudent.id && (r.status === 'active' || r.status === 'checked-in'),
  );

  const myIssued = bookReservations.filter((r) => r.studentId === activeStudent.id && r.status === 'issued');
  const nextReturn = myIssued
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const smartInsight = useMemo(() => {
    const bestRoom = [...rooms].sort((a, b) => a.occupiedSeats / a.totalSeats - b.occupiedSeats / b.totalSeats)[0];
    const pct = Math.round((bestRoom.occupiedSeats / bestRoom.totalSeats) * 100);
    return {
      room: bestRoom.name,
      pct,
      avail: bestRoom.totalSeats - bestRoom.occupiedSeats - bestRoom.reservedSeats,
    };
  }, [rooms]);

  const quickActions = [
    { label: 'Find a Book', icon: BookOpen, page: 'books', color: 'from-brand-500 to-brand-700' },
    { label: 'Find a Seat', icon: Armchair, page: 'seats', color: 'from-teal-500 to-teal-700' },
    { label: 'Reserve a Seat', icon: Bookmark, page: 'seats', color: 'from-gold-400 to-gold-600' },
    { label: 'Ask AI', icon: Sparkles, page: 'ai-assistant', color: 'from-brand-600 to-teal-600' },
  ];

  const statCards = [
    { label: 'Books Issued', value: stats.issued, icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Seats Available (Entire Library)', value: stats.availSeats, icon: Armchair, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Books Available', value: stats.availableBooks, icon: Library, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Library Occupancy', value: `${stats.occupancyPct}%`, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting + Search */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 md:p-8 text-white shadow-glow">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-teal-400/20" />
        <div className="relative">
          <p className="text-sm font-medium text-brand-100">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">
            {greeting()}, {activeStudent.name.split(' ')[0]} 👋
          </h2>
          <p className="mt-1 text-brand-100">Ready to make your study session productive?</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(query);
            }}
            className="mt-5 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lg"
          >
            <Search className="ml-2.5 h-5 w-5 shrink-0 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, authors, subjects..."
              className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none py-2"
            />
            <button type="submit" className="btn-primary !py-2">
              Search
            </button>
          </form>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.page)}
                  className="group flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-left backdrop-blur transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-100"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${a.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold leading-tight">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card card-hover p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-xs font-medium text-ink-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Smart Insight + Recommendations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Smart Insight */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-3.5">
              <Lightbulb className="h-4 w-4 text-gold-500" />
              <h3 className="font-display text-sm font-bold text-ink-900">Smart Library Insight</h3>
              <span className="ml-auto chip bg-teal-100 text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" /> Live
              </span>
            </div>
            <div className="flex items-center gap-5 p-5">
              <RadialProgress value={smartInsight.pct} size={110} color={smartInsight.pct < 50 ? '#14a892' : '#f99c07'} label="occupied" />
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-ink-700">
                  <span className="font-bold text-ink-900">{smartInsight.room}</span> currently has{' '}
                  <span className="font-bold text-teal-600">{smartInsight.pct}% occupancy</span> with{' '}
                  <span className="font-bold">{smartInsight.avail} seats available</span>. This is a good time to study.
                </p>
                <button
                  onClick={() => onNavigate('seats')}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Reserve a seat now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <h3 className="font-display text-sm font-bold text-ink-900">Recommended For You</h3>
              </div>
              <button
                onClick={() => onNavigate('ai-recommend')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                See more →
              </button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {recommendations.map((rec) => (
                <RecBookCard key={rec.book.id} book={rec.book} reason={rec.reason} onClick={() => onNavigate('books')} />
              ))}
            </div>
          </div>
        </div>

        {/* Current Activity */}
        <div className="space-y-6">
          {/* LibraPoints & Priority */}
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-gold-500" />
              <h3 className="font-display text-sm font-bold text-ink-900">LibraPoints & Priority</h3>
              <span className={`ml-auto chip ${isMember ? 'bg-teal-100 text-teal-700' : 'bg-ink-100 text-ink-600'}`}>
                {isMember ? 'Member' : 'Non-Member'}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600">
                <div className="text-center">
                  <p className="font-display text-xl font-extrabold leading-none text-white">{activeStudent.libraPoints}</p>
                  <p className="text-[9px] font-medium uppercase text-gold-100">pts</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-ink-500">Priority Level</p>
                <p className={`font-display text-lg font-extrabold ${priorityLevel === 'Very High' ? 'text-teal-600' : priorityLevel === 'High' ? 'text-brand-600' : 'text-ink-600'}`}>
                  {priorityLevel}
                </p>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full transition-all ${priorityLevel === 'Very High' ? 'bg-teal-500' : priorityLevel === 'High' ? 'bg-brand-500' : 'bg-ink-400'}`}
                    style={{ width: `${Math.min(100, (activeStudent.libraPoints / 250) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-ink-400">
                  {priorityLevel === 'Very High' ? 'Maximum priority reached' : `${250 - activeStudent.libraPoints > 0 ? 250 - activeStudent.libraPoints : 100 - activeStudent.libraPoints} pts to next level`}
                </p>
              </div>
            </div>
            {!isMember && (
              <button onClick={() => onNavigate('membership')} className="btn-secondary mt-4 w-full !py-2 text-xs">
                <Crown className="h-3.5 w-3.5" /> Become a Member to unlock priority seats
              </button>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-display text-sm font-bold text-ink-900">Your Current Activity</h3>

            {/* Active seat */}
            <div className="mt-4 rounded-xl border border-ink-100 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Armchair className="h-4 w-4 text-teal-600" /> Active Seat
              </div>
              {activeSeat ? (
                <div className="mt-2">
                  <p className="font-semibold text-ink-900">
                    Seat {activeSeat.seatNumber} · {activeSeat.roomName}
                  </p>
                  <p className="text-xs text-ink-500">
                    {activeSeat.date} · {activeSeat.startTime}–{activeSeat.endTime}
                  </p>
                  {activeSeat.status === 'checked-in' ? (
                    <div className="mt-2">
                      <span className="chip bg-teal-100 text-teal-700">
                        <CheckCircle2 className="h-3 w-3" /> Checked in
                      </span>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => releaseSeatEarly(activeSeat.id)} className="btn-secondary !py-1.5 !px-2.5 text-xs flex-1">
                          <XCircle className="h-3.5 w-3.5" /> Release Seat
                        </button>
                        <button onClick={() => onNavigate('reservations')} className="btn-secondary !py-1.5 !px-2.5 text-xs">
                          View →
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    const cd = countdown(activeSeat.date, activeSeat.startTime, activeSeat.date);
                    return (
                      <div className="mt-2">
                        <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${cd.imminent ? 'bg-gold-50 text-gold-700' : cd.expired ? 'bg-rose-50 text-rose-700' : 'bg-brand-50 text-brand-700'}`}>
                          <Timer className="h-3.5 w-3.5" /> {cd.text}
                        </div>
                        {activeSeat.checkInDeadline && (
                          <p className="mt-1 text-[10px] text-ink-400">Check-in deadline: {activeSeat.checkInDeadline} (1-hour window)</p>
                        )}
                        <div className="mt-2 flex gap-2">
                          {!cd.expired && (
                            <button onClick={() => checkInSeat(activeSeat.id)} className="btn-teal !py-1.5 !px-2.5 text-xs flex-1">
                              <LogIn className="h-3.5 w-3.5" /> Check In
                            </button>
                          )}
                          <button onClick={() => releaseSeatEarly(activeSeat.id)} className="btn-secondary !py-1.5 !px-2.5 text-xs flex-1">
                            <XCircle className="h-3.5 w-3.5" /> Release Seat
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-ink-400">No active seat reservation.</p>
                  <button onClick={() => onNavigate('seats')} className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Reserve a seat →
                  </button>
                </div>
              )}
            </div>

            {/* Issued books */}
            <div className="mt-3 rounded-xl border border-ink-100 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <BookOpen className="h-4 w-4 text-brand-600" /> Issued Books
              </div>
              {myIssued.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {myIssued.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink-800">{r.bookTitle}</p>
                      <span className="shrink-0 text-[10px] font-medium text-ink-500">
                        Due {new Date(r.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-ink-400">No books currently issued.</p>
              )}
            </div>

            {/* Next return */}
            {nextReturn && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-gold-50 p-3.5 border border-gold-100">
                <Clock className="h-5 w-5 shrink-0 text-gold-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gold-700">Return reminder</p>
                  <p className="truncate text-sm text-ink-700">
                    "{nextReturn.bookTitle}" due{' '}
                    {new Date(nextReturn.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Occupancy snapshot */}
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              <h3 className="font-display text-sm font-bold text-ink-900">Reading Room Occupancy</h3>
            </div>
            <div className="mt-4 space-y-3.5">
              {rooms.map((r) => {
                const pct = Math.round((r.occupiedSeats / r.totalSeats) * 100);
                const color = pct < 50 ? '#14a892' : pct < 80 ? '#f99c07' : '#f43f6e';
                return (
                  <div key={r.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-700">{r.name}</span>
                      <span className="font-medium text-ink-500">
                        {r.totalSeats - r.occupiedSeats - r.reservedSeats} free
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={pct} color={color} height={6} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecBookCard({ book, reason, onClick }: { book: Book; reason: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex gap-3 rounded-xl border border-ink-100 p-3 text-left transition-all hover:border-brand-200 hover:shadow-soft"
    >
      <BookCover book={book} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="line-clamp-2 text-sm font-bold text-ink-900 group-hover:text-brand-700">{book.title}</p>
        <p className="mt-0.5 text-xs text-ink-500">{book.author}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="chip bg-ink-100 text-ink-600">{book.difficulty}</span>
          <span className="flex items-center gap-0.5 text-xs font-medium text-gold-600">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" /> {book.rating}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-ink-500">{reason}</p>
        <div className="mt-1.5 flex items-center gap-1">
          {book.availableCopies > 0 ? (
            <span className="chip bg-teal-100 text-teal-700">Available</span>
          ) : (
            <span className="chip bg-rose-100 text-rose-700">Issued</span>
          )}
        </div>
      </div>
    </button>
  );
}
