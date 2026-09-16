import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { countdown, formatDate } from '../utils/format';
import type { SeatReservation } from '../types';
import {
  Armchair,
  BookOpen,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Timer,
  BookMarked,
  Crown,
} from 'lucide-react';

export function Reservations() {
  const { seatReservations, bookReservations, activeStudent, checkInSeat, cancelSeatReservation, checkOutSeat, releaseSeatEarly, returnBook } = useApp();

  const activeSeat = seatReservations.filter(
    (r) => r.studentId === activeStudent.id && (r.status === 'active' || r.status === 'checked-in'),
  );
  const pastSeat = seatReservations.filter(
    (r) => r.studentId === activeStudent.id && (r.status === 'completed' || r.status === 'expired' || r.status === 'cancelled' || r.status === 'released'),
  );
  const myBooks = bookReservations.filter((r) => r.studentId === activeStudent.id);
  const issued = myBooks.filter((r) => r.status === 'issued');
  const returned = myBooks.filter((r) => r.status !== 'issued');

  return (
    <div className="space-y-6">
      {/* Active seat reservations */}
      <section>
        <h2 className="font-display text-lg font-bold text-ink-900">Active Reservations</h2>
        {activeSeat.length === 0 ? (
          <div className="card mt-3 flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100">
              <Armchair className="h-6 w-6 text-ink-400" />
            </div>
            <p className="mt-3 font-semibold text-ink-700">No active seat reservations</p>
            <p className="text-sm text-ink-500">Reserve a seat from the Study Seats page.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {activeSeat.map((r) => (
              <ActiveSeatCard
                key={r.id}
                res={r}
                onCheckIn={() => checkInSeat(r.id)}
                onCancel={() => cancelSeatReservation(r.id)}
                onCheckOut={() => checkOutSeat(r.id)}
                onRelease={() => releaseSeatEarly(r.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Book reservations */}
      <section>
        <h2 className="font-display text-lg font-bold text-ink-900">Issued Books</h2>
        {issued.length === 0 ? (
          <div className="card mt-3 flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100">
              <BookOpen className="h-6 w-6 text-ink-400" />
            </div>
            <p className="mt-3 font-semibold text-ink-700">No books currently issued</p>
            <p className="text-sm text-ink-500">Find and reserve books from the Books page.</p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {issued.map((r) => {
              const due = new Date(r.dueDate);
              const daysLeft = Math.ceil((due.getTime() - Date.now()) / 86400000);
              const overdue = daysLeft < 0;
              return (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <BookMarked className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 truncate">{r.bookTitle}</p>
                      <p className="text-xs text-ink-500">Issued {formatDate(r.issueDate)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-ink-500">Due {formatDate(r.dueDate)}</span>
                    <span className={`chip ${overdue ? 'bg-rose-100 text-rose-700' : daysLeft <= 2 ? 'bg-gold-100 text-gold-700' : 'bg-teal-100 text-teal-700'}`}>
                      {overdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  </div>
                  <button onClick={() => returnBook(r.id)} className="btn-secondary mt-3 w-full !py-2">
                    Return book
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past seat reservations */}
      {pastSeat.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">Previous Reservations</h2>
          <div className="card mt-3 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Seat</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {pastSeat.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 text-ink-700">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-ink-700">{r.roomName}</td>
                    <td className="px-4 py-3 text-ink-700">#{r.seatNumber}</td>
                    <td className="px-4 py-3 text-ink-500">{r.startTime}–{r.endTime}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Returned books */}
      {returned.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900">Returned Books</h2>
          <div className="card mt-3 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {returned.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-800">{r.bookTitle}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(r.issueDate)}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(r.dueDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function ActiveSeatCard({ res, onCheckIn, onCancel, onCheckOut, onRelease }: { res: SeatReservation; onCheckIn: () => void; onCancel: () => void; onCheckOut: () => void; onRelease: () => void }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const cd = countdown(res.date, res.startTime, res.date);
  const checkedIn = res.status === 'checked-in';

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500">
          <Armchair className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-ink-900">Seat {res.seatNumber}</h3>
            <span className="text-sm text-ink-500">· {res.roomName}</span>
            {res.isMemberPriority && (
              <span className="chip bg-brand-100 text-brand-700"><Crown className="h-3 w-3" /> Priority</span>
            )}
            <StatusBadge status={res.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(res.date)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {res.startTime}–{res.endTime}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Floor {res.roomName.includes('1') ? 1 : res.roomName.includes('2') ? 2 : 3}</span>
            {res.checkInDeadline && !checkedIn && (
              <span className="flex items-center gap-1 font-semibold text-gold-600"><Timer className="h-3.5 w-3.5" /> Deadline: {res.checkInDeadline}</span>
            )}
          </div>
        </div>

        {/* Countdown / actions */}
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {!checkedIn && (
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${cd.imminent ? 'bg-gold-50 text-gold-700' : cd.expired ? 'bg-rose-50 text-rose-700' : 'bg-brand-50 text-brand-700'}`}>
              <Timer className="h-4 w-4" />
              {cd.text}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {!checkedIn && !cd.expired && (
              <button onClick={onCheckIn} className="btn-teal !py-2 !px-3 text-xs">
                <LogIn className="h-3.5 w-3.5" /> Check in
              </button>
            )}
            {checkedIn && (
              <button onClick={onCheckOut} className="btn-teal !py-2 !px-3 text-xs">
                <LogOut className="h-3.5 w-3.5" /> Check out
              </button>
            )}
            <button onClick={onRelease} className="btn-secondary !py-2 !px-3 text-xs">
              <Timer className="h-3.5 w-3.5" /> Release seat
            </button>
            <button onClick={onCancel} className="btn-secondary !py-2 !px-3 text-xs">
              <XCircle className="h-3.5 w-3.5" /> Cancel (-10 pts)
            </button>
          </div>
        </div>
      </div>
      {checkedIn && (
        <div className="border-t border-ink-100 bg-teal-50 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-teal-700">
          <CheckCircle2 className="h-4 w-4" /> Checked in — enjoy your study session!
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-gold-100 text-gold-700',
    'checked-in': 'bg-brand-100 text-brand-700',
    completed: 'bg-teal-100 text-teal-700',
    expired: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-ink-100 text-ink-600',
    released: 'bg-brand-100 text-brand-700',
    issued: 'bg-brand-100 text-brand-700',
    returned: 'bg-teal-100 text-teal-700',
    overdue: 'bg-rose-100 text-rose-700',
    reserved: 'bg-gold-100 text-gold-700',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`chip ${map[status] || 'bg-ink-100 text-ink-600'}`}>{label}</span>;
}
