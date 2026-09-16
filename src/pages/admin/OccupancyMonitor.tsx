import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressBar, LineChart, RadialProgress } from '../../components/Charts';
import { analytics } from '../../data/mockData';
import { Armchair, TrendingUp, Users, Activity, AlertCircle } from 'lucide-react';

export function OccupancyMonitor() {
  const { rooms } = useApp();
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const totalSeats = rooms.reduce((s, r) => s + r.totalSeats, 0);
  const occupied = rooms.reduce((s, r) => s + r.occupiedSeats, 0);
  const reserved = rooms.reduce((s, r) => s + r.reservedSeats, 0);
  const available = totalSeats - occupied - reserved;
  const pct = Math.round((occupied / totalSeats) * 100);

  const currentHour = new Date().getHours();
  const hourlyData = analytics.occupancyByHour.map((o) => ({ label: o.label, count: o.occupancy }));

  return (
    <div className="space-y-5">
      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total Seats" value={totalSeats} icon={Armchair} color="text-brand-600" bg="bg-brand-50" />
        <MetricCard label="Occupied" value={occupied} icon={Users} color="text-rose-600" bg="bg-rose-50" />
        <MetricCard label="Reserved" value={reserved} icon={TrendingUp} color="text-gold-600" bg="bg-gold-50" />
        <MetricCard label="Available" value={available} icon={Activity} color="text-teal-600" bg="bg-teal-50" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Overall occupancy */}
        <div className="card p-5 flex flex-col items-center">
          <h3 className="self-start font-display text-sm font-bold text-ink-900">Overall Occupancy</h3>
          <div className="mt-4">
            <RadialProgress value={pct} size={140} color={pct < 50 ? '#14a892' : pct < 80 ? '#f99c07' : '#f43f6e'} label="occupied" />
          </div>
          <p className="mt-3 text-center text-xs text-ink-500">
            {available} seats free across {rooms.length} reading rooms
          </p>
        </div>

        {/* Hourly trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-ink-900">Occupancy Throughout the Day</h3>
            <span className="chip bg-brand-50 text-brand-700">Live</span>
          </div>
          <div className="mt-4">
            <LineChart data={hourlyData} color="#1d72f5" height={220} unit="%" />
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Peak hour is 6 PM at 94% occupancy. Current time: {currentHour}:00.
          </p>
        </div>
      </div>

      {/* Per-room breakdown */}
      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-3.5">
          <h3 className="font-display text-sm font-bold text-ink-900">Room-by-Room Breakdown</h3>
        </div>
        <div className="divide-y divide-ink-50">
          {rooms.map((r) => {
            const rPct = Math.round((r.occupiedSeats / r.totalSeats) * 100);
            const rAvail = r.totalSeats - r.occupiedSeats - r.reservedSeats;
            const color = rPct < 50 ? '#14a892' : rPct < 80 ? '#f99c07' : '#f43f6e';
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50">
                  <Armchair className="h-5 w-5 text-ink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink-900">{r.name}</p>
                    <span className={`text-sm font-bold ${rPct < 50 ? 'text-teal-600' : rPct < 80 ? 'text-gold-600' : 'text-rose-600'}`}>{rPct}%</span>
                  </div>
                  <div className="mt-1.5"><ProgressBar value={rPct} color={color} height={6} /></div>
                  <p className="mt-1 text-xs text-ink-500">
                    {r.occupiedSeats} occupied · {r.reservedSeats} reserved · {rAvail} available of {r.totalSeats}
                  </p>
                </div>
                {rPct >= 90 && (
                  <span className="chip bg-rose-100 text-rose-700"><AlertCircle className="h-3 w-3" /> Nearly full</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: typeof Armchair; color: string; bg: string }) {
  return (
    <div className="card p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}
