import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/Modal';
import { ProgressBar } from '../../components/Charts';
import type { ReadingRoom, SeatState } from '../../types';
import {
  Plus,
  Pencil,
  Volume2,
  Calendar,
} from 'lucide-react';

export function ManageSeats() {
  const { rooms, setRooms, seatReservations, addToast } = useApp();
  const [editing, setEditing] = useState<ReadingRoom | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const activeReservations = seatReservations.filter((r) => r.status === 'active' || r.status === 'checked-in');

  const toggleSeatState = (roomId: string, seatId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              seats: r.seats.map((s) => {
                if (s.id !== seatId) return s;
                const next: SeatState = s.state === 'unavailable' ? 'available' : 'unavailable';
                return { ...s, state: next };
              }),
            }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Manage reading rooms and seat availability.</p>
        <button
          onClick={() => { setCreating(true); setEditing({ id: `room${Date.now()}`, name: '', totalSeats: 50, occupiedSeats: 0, reservedSeats: 0, floor: 1, silenceLevel: 'Quiet', seats: [] }); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {/* Rooms */}
      <div className="grid gap-5 lg:grid-cols-3">
        {rooms.map((room, i) => {
          const pct = Math.round((room.occupiedSeats / room.totalSeats) * 100);
          const color = pct < 50 ? '#14a892' : pct < 80 ? '#f99c07' : '#f43f6e';
          const avail = room.totalSeats - room.occupiedSeats - room.reservedSeats;
          return (
            <div key={room.id} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">{room.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                    Floor {room.floor} · <Volume2 className="h-3 w-3" /> {room.silenceLevel}
                  </p>
                </div>
                <button onClick={() => { setEditing(room); setCreating(false); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-2xl font-extrabold text-ink-900">{pct}%</p>
                <p className="text-xs text-ink-500">{avail} free · {room.occupiedSeats} occupied</p>
              </div>
              <div className="mt-2"><ProgressBar value={pct} color={color} height={7} /></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-ink-50 py-2"><p className="font-bold text-ink-900">{room.totalSeats}</p><p className="text-ink-500">Total</p></div>
                <div className="rounded-lg bg-rose-50 py-2"><p className="font-bold text-rose-600">{room.occupiedSeats}</p><p className="text-ink-500">Occupied</p></div>
                <div className="rounded-lg bg-teal-50 py-2"><p className="font-bold text-teal-600">{avail}</p><p className="text-ink-500">Free</p></div>
              </div>
              <button
                onClick={() => setActiveRoom(activeRoom === room.id ? null : room.id)}
                className="mt-4 w-full rounded-lg border border-ink-200 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50"
              >
                {activeRoom === room.id ? 'Hide seats' : 'Manage seat states'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Seat state management */}
      {activeRoom && (
        <div className="card p-5 animate-scale-in">
          {(() => {
            const room = rooms.find((r) => r.id === activeRoom);
            if (!room) return null;
            return (
              <>
                <h3 className="font-display text-sm font-bold text-ink-900">{room.name} — Seat States</h3>
                <p className="mt-1 text-xs text-ink-500">Click a seat to toggle it between available and unavailable (maintenance).</p>
                <div className="mt-4 grid grid-cols-10 gap-1.5 sm:gap-2">
                  {room.seats.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSeatState(room.id, s.id)}
                      className={`aspect-square rounded-lg text-[9px] font-bold transition-all ${
                        s.state === 'unavailable'
                          ? 'bg-ink-300 text-ink-500 line-through'
                          : s.state === 'available'
                            ? 'bg-teal-500 text-white hover:bg-teal-600'
                            : s.state === 'occupied'
                              ? 'bg-rose-400 text-white'
                              : 'bg-gold-400 text-white'
                      }`}
                      title={`Seat ${s.number} — ${s.state}`}
                    >
                      {s.number}
                    </button>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Active reservations */}
      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-3.5 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-600" />
          <h3 className="font-display text-sm font-bold text-ink-900">Active Reservations</h3>
          <span className="chip bg-brand-50 text-brand-700 ml-auto">{activeReservations.length} active</span>
        </div>
        {activeReservations.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-400">No active reservations right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Seat</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {activeReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-800">{r.studentName}</td>
                    <td className="px-4 py-3 text-ink-600">{r.roomName}</td>
                    <td className="px-4 py-3 text-ink-600">#{r.seatNumber}</td>
                    <td className="px-4 py-3 text-ink-500">{r.date}</td>
                    <td className="px-4 py-3 text-ink-500">{r.startTime}–{r.endTime}</td>
                    <td className="px-4 py-3">
                      <span className={`chip ${r.status === 'checked-in' ? 'bg-teal-100 text-teal-700' : 'bg-gold-100 text-gold-700'}`}>
                        {r.status === 'checked-in' ? 'Checked in' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Room editor */}
      {editing && (
        <RoomFormModal
          room={editing}
          creating={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(updated) => {
            if (creating) {
              const seats = Array.from({ length: updated.totalSeats }, (_, i) => ({
                id: `${updated.id}-s${i + 1}`,
                roomId: updated.id,
                number: i + 1,
                state: 'available' as SeatState,
                hasPower: (i + 1) % 3 === 0,
                nearWindow: (i + 1) % 10 === 1 || (i + 1) % 10 === 0,
              }));
              setRooms((prev) => [...prev, { ...updated, seats }]);
              addToast(`${updated.name} created`, 'success');
            } else {
              setRooms((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
              addToast(`${updated.name} updated`, 'success');
            }
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function RoomFormModal({
  room,
  creating,
  onClose,
  onSave,
}: {
  room: ReadingRoom;
  creating: boolean;
  onClose: () => void;
  onSave: (r: ReadingRoom) => void;
}) {
  const [form, setForm] = useState({
    name: room.name,
    totalSeats: room.totalSeats,
    floor: room.floor,
    silenceLevel: room.silenceLevel,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...room,
      name: form.name,
      totalSeats: form.totalSeats,
      floor: form.floor,
      silenceLevel: form.silenceLevel as ReadingRoom['silenceLevel'],
      occupiedSeats: creating ? 0 : room.occupiedSeats,
    });
  };

  return (
    <Modal open onClose={onClose} title={creating ? 'Add Reading Room' : 'Edit Room'} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Room Name</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" placeholder="e.g. Reading Room 4" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Total Seats</label>
            <input type="number" min="1" value={form.totalSeats} onChange={(e) => setForm((p) => ({ ...p, totalSeats: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">Floor</label>
            <input type="number" min="1" value={form.floor} onChange={(e) => setForm((p) => ({ ...p, floor: Number(e.target.value) }))} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Silence Level</label>
          <select value={form.silenceLevel} onChange={(e) => setForm((p) => ({ ...p, silenceLevel: e.target.value as ReadingRoom['silenceLevel'] }))} className="input">
            <option>Silent</option><option>Quiet</option><option>Discussion</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">{creating ? 'Create' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
