import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ProgressBar, LineChart } from '../components/Charts';
import { seatPrediction } from '../data/mockData';
import { occupancyLabel } from '../utils/format';
import type { ReadingRoom, Seat } from '../types';
import {
  Armchair,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Clock,
  Plug,
  Sun,
  CheckCircle2,
  Calendar,
  X,
  Volume2,
  Navigation,
  Crown,
  Lock,
} from 'lucide-react';

export function StudySeats({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { rooms } = useApp();
  const [selectedRoom, setSelectedRoom] = useState<ReadingRoom | null>(null);

  if (selectedRoom) {
    return <RoomLayout room={selectedRoom} onBack={() => setSelectedRoom(null)} onNavigate={onNavigate} />;
  }

  return (
    <div className="space-y-5">
      {/* AI Seat Prediction */}
      <AIPredictionCard />

      {/* Rooms */}
      <div>
        <h2 className="font-display text-lg font-bold text-ink-900">Reading Rooms</h2>
        <p className="text-sm text-ink-500">Tap a room to view the seat layout and reserve a seat.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {rooms.map((room, i) => (
          <RoomCard key={room.id} room={room} index={i} onOpen={() => setSelectedRoom(room)} />
        ))}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Seat Legend</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <LegendItem color="bg-teal-500" label="Available" />
          <LegendItem color="bg-rose-400" label="Occupied" />
          <LegendItem color="bg-gold-400" label="Reserved" />
          <LegendItem color="bg-ink-200" label="Unavailable" />
          <LegendItem color="bg-brand-500" label="Member Priority" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded ${color}`} />
      <span className="font-medium text-ink-600">{label}</span>
    </div>
  );
}

function RoomCard({ room, index, onOpen }: { room: ReadingRoom; index: number; onOpen: () => void }) {
  const pct = Math.round((room.occupiedSeats / room.totalSeats) * 100);
  const avail = room.totalSeats - room.occupiedSeats - room.reservedSeats;
  const color = pct < 50 ? '#14a892' : pct < 80 ? '#f99c07' : '#f43f6e';
  return (
    <div
      className="card card-hover overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">{room.name}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
              <span>Floor {room.floor}</span>
              <span className="text-ink-300">·</span>
              <Volume2 className="h-3 w-3" /> {room.silenceLevel}
            </p>
          </div>
          <span className={`chip ${pct < 50 ? 'bg-teal-100 text-teal-700' : pct < 80 ? 'bg-gold-100 text-gold-700' : 'bg-rose-100 text-rose-700'}`}>
            {occupancyLabel(pct)}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-display text-3xl font-extrabold text-ink-900">{pct}<span className="text-lg">%</span></p>
            <p className="text-xs text-ink-500">occupancy</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold text-ink-700">{avail} <span className="text-ink-400">free</span></p>
            <p className="text-ink-400">{room.occupiedSeats} occupied · {room.reservedSeats} reserved</p>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={pct} color={color} height={8} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-ink-50 py-2">
            <p className="font-bold text-ink-900">{room.totalSeats}</p>
            <p className="text-[10px] text-ink-500">Total</p>
          </div>
          <div className="rounded-lg bg-rose-50 py-2">
            <p className="font-bold text-rose-600">{room.occupiedSeats}</p>
            <p className="text-[10px] text-ink-500">Occupied</p>
          </div>
          <div className="rounded-lg bg-teal-50 py-2">
            <p className="font-bold text-teal-600">{avail}</p>
            <p className="text-[10px] text-ink-500">Available</p>
          </div>
        </div>
      </div>
      <button onClick={onOpen} className="w-full border-t border-ink-100 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
        View seat layout →
      </button>
    </div>
  );
}

function RoomLayout({ room, onBack, onNavigate }: { room: ReadingRoom; onBack: () => void; onNavigate?: (page: string) => void }) {
  const { rooms, reserveSeat, activeStudent, seatReservations } = useApp();
  const isMember = activeStudent.membership.status === 'active';
  const liveRoom = rooms.find((r) => r.id === room.id) || room;
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('19:00');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reservedSeatNum, setReservedSeatNum] = useState<number | null>(null);

  const hasActiveRes = seatReservations.find(
    (r) => r.studentId === activeStudent.id && r.roomId === room.id && (r.status === 'active' || r.status === 'checked-in'),
  );

  const avail = liveRoom.totalSeats - liveRoom.occupiedSeats - liveRoom.reservedSeats;

  const handleReserve = () => {
    if (!selectedSeat) return;
    setReservedSeatNum(selectedSeat.number);
    reserveSeat(selectedSeat, liveRoom.name, date, startTime, endTime);
    setConfirmOpen(true);
    setSelectedSeat(null);
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to rooms
      </button>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">{liveRoom.name}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-500">
              <span>Floor {liveRoom.floor}</span> · <Volume2 className="h-3 w-3" /> {liveRoom.silenceLevel}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="chip bg-teal-100 text-teal-700">{avail} available</span>
            <span className="chip bg-rose-100 text-rose-700">{liveRoom.occupiedSeats} occupied</span>
            <span className="chip bg-gold-100 text-gold-700">{liveRoom.reservedSeats} reserved</span>
          </div>
        </div>
      </div>

      {hasActiveRes && (
        <div className="rounded-xl bg-gold-50 border border-gold-100 p-4 flex items-center gap-3">
          <Armchair className="h-5 w-5 text-gold-600" />
          <p className="text-sm text-ink-700">
            You already have an active reservation in this room (Seat {hasActiveRes.seatNumber}, {hasActiveRes.startTime}–{hasActiveRes.endTime}).
          </p>
        </div>
      )}

      {/* Seat grid */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-ink-900">Seat Layout</h3>
          <p className="text-xs text-ink-500">{liveRoom.totalSeats} seats · click to select</p>
        </div>

        {/* Front door indicator */}
        <div className="mt-5 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-ink-100 px-4 py-1.5 text-xs font-semibold text-ink-500">
            <Navigation className="h-3 w-3" /> Entrance
          </div>
        </div>

        <div className="mt-4 grid grid-cols-10 gap-1.5 sm:gap-2">
          {liveRoom.seats.map((seat) => (
            <SeatButton
              key={seat.id}
              seat={seat}
              selected={selectedSeat?.id === seat.id}
              onClick={() => setSelectedSeat(seat)}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs">
          <LegendItem color="bg-teal-500" label="Available" />
          <LegendItem color="bg-rose-400" label="Occupied" />
          <LegendItem color="bg-gold-400" label="Reserved" />
          <LegendItem color="bg-ink-200" label="Unavailable" />
          <LegendItem color="bg-brand-600" label="Selected" />
          <LegendItem color="bg-brand-500" label="Member Priority" />
        </div>
      </div>

      {/* Reservation panel */}
      {selectedSeat && (
        <div className="card p-5 animate-scale-in border-brand-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-ink-900">Reserve Seat {selectedSeat.number}</h3>
            <button onClick={() => setSelectedSeat(null)} className="text-ink-400 hover:text-ink-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {selectedSeat.isMemberPriority && <span className="chip bg-brand-100 text-brand-700"><Crown className="h-3 w-3" /> Member Priority Seat</span>}
            {selectedSeat.hasPower && <span className="chip bg-brand-50 text-brand-700"><Plug className="h-3 w-3" /> Power outlet</span>}
            {selectedSeat.nearWindow && <span className="chip bg-gold-50 text-gold-700"><Sun className="h-3 w-3" /> Near window</span>}
          </div>
          {selectedSeat.isMemberPriority && !isMember && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gold-50 p-3 text-xs text-gold-700 border border-gold-100">
              <Lock className="h-4 w-4 shrink-0" />
              This is a Member Priority Seat. Become a LibraGuide Member to reserve it.
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Start time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">End time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input" />
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-gold-50 p-3 text-xs text-ink-600 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold-600" />
            Please check in within <span className="font-bold">1 hour</span> of your start time, or the seat will be released.
          </div>
          <button onClick={handleReserve} disabled={selectedSeat.isMemberPriority && !isMember} className="btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed">
            <CheckCircle2 className="h-4 w-4" /> {selectedSeat.isMemberPriority && !isMember ? 'Membership Required' : 'Confirm Reservation'}
          </button>
        </div>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reservation Confirmed" size="sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <CheckCircle2 className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-ink-900">Seat reserved!</h3>
          <p className="mt-1 text-sm text-ink-500">
            Seat {reservedSeatNum} in {liveRoom.name}
          </p>
          <div className="mt-4 w-full space-y-2 rounded-xl bg-ink-50 p-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Date</span>
              <span className="font-semibold">{date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Time</span>
              <span className="font-semibold">{startTime} – {endTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500 flex items-center gap-1.5"><Armchair className="h-4 w-4" /> Seat</span>
              <span className="font-semibold">#{reservedSeatNum}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary flex-1">Done</button>
            <button onClick={() => { setConfirmOpen(false); onNavigate?.('reservations'); }} className="btn-primary flex-1">View My Reservations</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SeatButton({ seat, selected, onClick }: { seat: Seat; selected: boolean; onClick: () => void }) {
  const disabled = seat.state === 'occupied' || seat.state === 'reserved' || seat.state === 'unavailable';
  const bg = selected
    ? 'bg-brand-600 text-white ring-2 ring-brand-300 ring-offset-1 scale-110'
    : seat.state === 'available'
      ? seat.isMemberPriority
        ? 'bg-brand-500 hover:bg-brand-600 text-white'
        : 'bg-teal-500 hover:bg-teal-600 text-white'
      : seat.state === 'occupied'
        ? 'bg-rose-400 text-white'
        : seat.state === 'reserved'
          ? 'bg-gold-400 text-white'
          : 'bg-ink-200 text-ink-400';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative aspect-square rounded-lg text-[9px] font-bold transition-all ${bg} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
      title={`Seat ${seat.number} · ${seat.state}${seat.isMemberPriority ? ' · Member Priority' : ''}`}
    >
      {seat.number}
      {seat.isMemberPriority && seat.state === 'available' && !selected && (
        <Crown className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 text-gold-600 bg-white rounded-full p-0.5" />
      )}
      {seat.hasPower && seat.state === 'available' && !seat.isMemberPriority && (
        <Plug className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 text-brand-700 bg-white rounded-full p-0.5" />
      )}
    </button>
  );
}

function AIPredictionCard() {
  const data = useMemo(
    () => seatPrediction.map((p) => ({ label: p.label, count: p.occupancy })),
    [],
  );
  const bestSlot = seatPrediction.reduce((min, p) => (p.occupancy < min.occupancy ? p : min));
  const worstSlot = seatPrediction.reduce((max, p) => (p.occupancy > max.occupancy ? p : max));
  const chance = bestSlot.occupancy < 50 ? 'High' : bestSlot.occupancy < 75 ? 'Medium' : 'Low';

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-teal-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-display text-sm font-bold text-ink-900">Smart Seat Prediction</h3>
        </div>
        <span className="chip bg-brand-50 text-brand-700">AI-powered</span>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-xs font-medium text-ink-500">Predicted occupancy for the next few hours</p>
          <div className="mt-3">
            <LineChart data={data} color="#1d72f5" height={200} predictedFromIndex={1} />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-brand-50 p-4 border border-teal-100 flex flex-col">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">AI Recommendation</p>
          </div>
          <p className="mt-3 font-display text-2xl font-extrabold text-ink-900">{bestSlot.label}</p>
          <p className="text-xs text-ink-500">Recommended visit time</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Expected occupancy</span>
              <span className="font-bold text-ink-900">{bestSlot.occupancy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Seat chance</span>
              <span className={`font-bold ${chance === 'High' ? 'text-teal-600' : chance === 'Medium' ? 'text-gold-600' : 'text-rose-600'}`}>{chance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Avoid</span>
              <span className="font-bold text-rose-600">{worstSlot.label} ({worstSlot.occupancy}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
