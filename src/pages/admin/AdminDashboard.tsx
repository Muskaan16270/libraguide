import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, LineChart, DonutChart, ProgressBar, RadialProgress } from '../../components/Charts';
import { analytics, memberGrowth, libraPointsDistribution, reservationStats, seatUtilizationData } from '../../data/mockData';
import {
  BookOpen,
  BookCheck,
  Users,
  TrendingUp,
  Bookmark,
  Library,
  Clock,
  AlertCircle,
  Crown,
  Armchair,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SUBJECT_COLORS: Record<string, string> = {
  Programming: '#1d72f5',
  'AI/ML': '#14a892',
  'Data Science': '#f99c07',
  Mathematics: '#bd1349',
  Physics: '#165ae1',
  Electronics: '#9d1342',
  'Web Development': '#0d8776',
  Cybersecurity: '#1f242e',
};

export function AdminDashboard() {
  const { books, students, rooms, seatReservations } = useApp();

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const availableBooks = books.filter((b) => b.availableCopies > 0).length;
    const issuedCount = books.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0);
    const totalSeats = rooms.reduce((s, r) => s + r.totalSeats, 0);
    const occupiedSeats = rooms.reduce((s, r) => s + r.occupiedSeats, 0);
    const activeRes = seatReservations.filter((r) => r.status === 'active' || r.status === 'checked-in').length;
    const memberCount = students.filter((s) => s.membership.status === 'active').length;
    const totalPrioritySeats = rooms.reduce((s, r) => s + r.seats.filter((seat) => seat.isMemberPriority).length, 0);
    return {
      totalBooks,
      availableBooks,
      issuedCount,
      students: students.length,
      occupancy: Math.round((occupiedSeats / totalSeats) * 100),
      activeRes,
      memberCount,
      totalPrioritySeats,
    };
  }, [books, students, rooms, seatReservations]);

  const statCards: { label: string; value: string | number; icon: LucideIcon; color: string; bg: string }[] = [
    { label: 'Total Books', value: stats.totalBooks, icon: Library, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Available', value: stats.availableBooks, icon: BookCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Issued Copies', value: stats.issuedCount, icon: BookOpen, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Students', value: stats.students, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Occupancy', value: `${stats.occupancy}%`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Active Reservations', value: stats.activeRes, icon: Bookmark, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Members', value: stats.memberCount, icon: Crown, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Priority Seats', value: stats.totalPrioritySeats, icon: Armchair, color: 'text-brand-600', bg: 'bg-brand-50' },
  ];

  const donutData = [
    { label: 'Available', count: stats.availableBooks, color: '#14a892' },
    { label: 'Issued', count: stats.issuedCount, color: '#f99c07' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card card-hover p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-4.5 w-4.5 ${s.color}`} />
              </div>
              <p className="mt-3 font-display text-xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-xs font-medium text-ink-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Visitors chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-ink-900">Library Visitors This Week</h3>
            <span className="chip bg-brand-50 text-brand-700">+12% vs last week</span>
          </div>
          <div className="mt-4">
            <BarChart data={analytics.visitorsThisWeek.map((d) => ({ label: d.day, count: d.count }))} color="#1d72f5" height={200} />
          </div>
        </div>

        {/* Book distribution */}
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">Book Distribution</h3>
          <div className="mt-4">
            <DonutChart data={donutData} size={160} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Most borrowed */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-bold text-ink-900">Most Borrowed Books</h3>
          <div className="mt-4">
            <BarChart data={analytics.mostBorrowed.map((d) => ({ label: d.title, count: d.count }))} color="#14a892" height={180} unit="" />
          </div>
        </div>

        {/* Occupancy now */}
        <div className="card p-5 flex flex-col items-center">
          <h3 className="self-start font-display text-sm font-bold text-ink-900">Current Occupancy</h3>
          <div className="mt-4">
            <RadialProgress value={stats.occupancy} size={130} color={stats.occupancy < 50 ? '#14a892' : '#f99c07'} label="occupied" />
          </div>
          <div className="mt-4 w-full space-y-2">
            {rooms.map((r) => {
              const pct = Math.round((r.occupiedSeats / r.totalSeats) * 100);
              const color = pct < 50 ? '#14a892' : pct < 80 ? '#f99c07' : '#f43f6e';
              return (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-600">{r.name}</span>
                    <span className="font-semibold text-ink-700">{pct}%</span>
                  </div>
                  <div className="mt-1"><ProgressBar value={pct} color={color} height={5} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Occupancy by hour */}
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">Occupancy Throughout the Day</h3>
          <div className="mt-4">
            <LineChart
              data={analytics.occupancyByHour.map((o) => ({ label: o.label, count: o.occupancy }))}
              color="#1d72f5"
              height={200}
              unit="%"
            />
          </div>
        </div>

        {/* Popular subjects */}
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">Popular Subjects</h3>
          <div className="mt-4">
            <DonutChart
              data={analytics.popularSubjects.slice(0, 6).map((s) => ({
                label: s.subject,
                count: s.count,
                color: SUBJECT_COLORS[s.subject] || '#65748b',
              }))}
              size={160}
            />
          </div>
        </div>
      </div>

      {/* Membership & LibraPoints Analytics */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-gold-500" />
            <h3 className="font-display text-sm font-bold text-ink-900">Member Growth</h3>
          </div>
          <div className="mt-4">
            <BarChart data={memberGrowth.map((d) => ({ label: d.month, count: d.count }))} color="#f99c07" height={180} />
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">LibraPoints Distribution</h3>
          <div className="mt-4">
            <DonutChart data={libraPointsDistribution} size={160} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">Seat Utilization This Week</h3>
          <div className="mt-4">
            <BarChart data={seatUtilizationData.map((d) => ({ label: d.label, count: d.count }))} color="#1d72f5" height={180} unit="%" />
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">Reservation Outcomes</h3>
          <div className="mt-4">
            <DonutChart data={reservationStats} size={160} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gold-500" />
          <h3 className="font-display text-sm font-bold text-ink-900">Needs Attention</h3>
        </div>
        <div className="mt-3 space-y-2">
          {analytics.frequentlyUnavailable.slice(0, 3).map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-gold-50 border border-gold-100 p-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gold-600" />
                <div>
                  <p className="text-sm font-semibold text-ink-800">{b.title}</p>
                  <p className="text-xs text-ink-500">{b.author} · {b.searches} searches, all copies issued</p>
                </div>
              </div>
              <span className="chip bg-gold-100 text-gold-700">Consider restocking</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
