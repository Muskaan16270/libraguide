import { useMemo } from 'react';
import { BarChart, LineChart, DonutChart, ProgressBar } from '../../components/Charts';
import { analytics } from '../../data/mockData';
import { TrendingUp, BarChart3, Clock, AlertTriangle, BookOpen, Search } from 'lucide-react';

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

export function AdminAnalytics() {
  const monthlyData = useMemo(
    () => analytics.monthlyUsage.map((m) => ({ label: m.month, count: m.visits })),
    [],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Most borrowed */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-sm font-bold text-ink-900">Most Borrowed Books</h3>
          </div>
          <div className="mt-4">
            <BarChart data={analytics.mostBorrowed.map((d) => ({ label: d.title, count: d.count }))} color="#14a892" height={200} />
          </div>
        </div>

        {/* Most searched */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-sm font-bold text-ink-900">Most Searched Books</h3>
          </div>
          <div className="mt-4">
            <BarChart data={analytics.mostSearched.map((d) => ({ label: d.title, count: d.count }))} color="#1d72f5" height={200} />
          </div>
        </div>
      </div>

      {/* Occupancy by hour */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-600" />
          <h3 className="font-display text-sm font-bold text-ink-900">Library Occupancy Throughout the Day</h3>
        </div>
        <div className="mt-4">
          <LineChart
            data={analytics.occupancyByHour.map((o) => ({ label: o.label, count: o.occupancy }))}
            color="#1d72f5"
            height={240}
            unit="%"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Popular subjects */}
        <div className="card p-5">
          <h3 className="font-display text-sm font-bold text-ink-900">Popular Subjects</h3>
          <div className="mt-4">
            <DonutChart
              data={analytics.popularSubjects.map((s) => ({
                label: s.subject,
                count: s.count,
                color: SUBJECT_COLORS[s.subject] || '#65748b',
              }))}
              size={170}
            />
          </div>
        </div>

        {/* Peak hours */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            <h3 className="font-display text-sm font-bold text-ink-900">Peak Library Hours</h3>
          </div>
          <div className="mt-4">
            <BarChart data={analytics.peakHours} color="#f99c07" height={180} />
          </div>
        </div>

        {/* Frequently unavailable */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h3 className="font-display text-sm font-bold text-ink-900">Frequently Unavailable</h3>
          </div>
          <p className="mt-1 text-xs text-ink-500">Searched often but all copies issued</p>
          <div className="mt-4 space-y-3">
            {analytics.frequentlyUnavailable.map((b, i) => (
              <div key={i} className="rounded-xl border border-ink-100 p-3">
                <p className="text-sm font-semibold text-ink-800 line-clamp-1">{b.title}</p>
                <p className="text-xs text-ink-500">{b.author}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-ink-500">{b.searches} searches</span>
                  <span className="chip bg-rose-100 text-rose-700">0 available</span>
                </div>
                <div className="mt-2"><ProgressBar value={b.searches} max={800} color="#f43f6e" height={5} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly usage trend */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-600" />
          <h3 className="font-display text-sm font-bold text-ink-900">Monthly Library Usage</h3>
        </div>
        <p className="mt-1 text-xs text-ink-500">Visits per month over the past year</p>
        <div className="mt-4">
          <LineChart data={monthlyData} color="#14a892" height={240} />
        </div>
      </div>
    </div>
  );
}
