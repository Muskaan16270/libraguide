import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RadialProgress } from '../components/Charts';
import { formatDate, relativeTime } from '../utils/format';
import { INTEREST_OPTIONS } from '../data/mockData';
import { getPriorityLevel } from '../types';
import type { Subject } from '../types';
import {
  BookOpen,
  BookCheck,
  Armchair,
  Clock,
  Check,
  Pencil,
  Mail,
  IdCard,
  Building,
  GraduationCap,
  Award,
  Crown,
  Star,
  TrendingUp,
  LogIn,
  LogOut,
  Timer,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

export function Profile() {
  const { activeStudent, setActiveStudentFields, addToast, bookReservations } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(activeStudent.name);
  const [department, setDepartment] = useState(activeStudent.department);
  const [year, setYear] = useState(activeStudent.year);
  const [interests, setInterests] = useState<Subject[]>(activeStudent.interests);

  const issued = bookReservations.filter((r) => r.studentId === activeStudent.id && r.status === 'issued');
  const priorityLevel = getPriorityLevel(activeStudent.libraPoints);
  const isMember = activeStudent.membership.status === 'active';

  const usage = activeStudent.usageStats;
  const checkInRate = usage.totalReservations > 0 ? Math.round((usage.successfulCheckIns / usage.totalReservations) * 100) : 0;

  const usageStats = [
    { label: 'Total Reservations', value: usage.totalReservations, icon: Armchair, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Successful Check-ins', value: usage.successfulCheckIns, icon: LogIn, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Early Releases', value: usage.earlyReleases, icon: Timer, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'No-shows', value: usage.noShows, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const pointCategoryIcons: Record<string, typeof LogIn> = {
    'check-in': LogIn,
    checkout: LogOut,
    'early-release': Timer,
    'no-show': XCircle,
    misuse: ShieldCheck,
    completion: Check,
  };

  const stats = [
    { label: 'Books Issued', value: activeStudent.booksIssued, icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Books Returned', value: activeStudent.booksReturned, icon: BookCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Seats Reserved', value: activeStudent.seatsReserved, icon: Armchair, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Study Hours', value: activeStudent.studyHours, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const save = () => {
    setActiveStudentFields({ name, department, year, interests });
    setEditing(false);
    addToast('Profile updated successfully', 'success');
  };

  const toggleInterest = (s: Subject) => {
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-brand-600 via-brand-700 to-teal-600 relative">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute right-24 -bottom-8 h-24 w-24 rounded-full bg-teal-400/20" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div
              className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold text-white shadow-card ring-4 ring-white"
              style={{ background: `linear-gradient(135deg, ${activeStudent.avatarColors[0]}, ${activeStudent.avatarColors[1]})` }}
            >
              {activeStudent.initials}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-extrabold text-ink-900">{activeStudent.name}</h2>
              <p className="text-sm text-ink-500">{activeStudent.studentId} · {activeStudent.department}</p>
            </div>
            <button onClick={() => setEditing((e) => !e)} className="btn-secondary">
              <Pencil className="h-4 w-4" /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoItem icon={IdCard} label="Student ID" value={activeStudent.studentId} />
            <InfoItem icon={Mail} label="Email" value={activeStudent.email} />
            <InfoItem icon={Building} label="Department" value={activeStudent.department} />
            <InfoItem icon={GraduationCap} label="Year" value={`Year ${activeStudent.year}`} />
          </div>
        </div>
      </div>

      {editing && (
        <div className="card p-5 animate-scale-in space-y-4">
          <h3 className="font-display text-sm font-bold text-ink-900">Edit Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Learning Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((s) => {
                const active = interests.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleInterest(s)}
                    className={`chip transition-all ${active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
                  >
                    {active && <Check className="h-3 w-3" />} {s}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={save} className="btn-primary">Save changes</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-xs font-medium text-ink-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Responsible Library Usage */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <h3 className="font-display text-sm font-bold text-ink-900">Responsible Library Usage</h3>
          {isMember && (
            <span className="ml-auto chip bg-teal-100 text-teal-700">
              <Crown className="h-3 w-3" /> Active Member
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {usageStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-xl border border-ink-100 p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className="mt-2 font-display text-xl font-extrabold text-ink-900">{s.value}</p>
                <p className="text-[10px] font-medium text-ink-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 p-4 border border-brand-100">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600">
            <div className="text-center">
              <p className="font-display text-lg font-extrabold leading-none text-white">{activeStudent.libraPoints}</p>
              <p className="text-[8px] font-medium uppercase text-gold-100">pts</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-ink-500">LibraPoints Balance</p>
            <p className={`font-display text-base font-extrabold ${priorityLevel === 'Very High' ? 'text-teal-600' : priorityLevel === 'High' ? 'text-brand-600' : 'text-ink-600'}`}>{priorityLevel} Priority</p>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/60">
              <div
                className={`h-full rounded-full transition-all ${priorityLevel === 'Very High' ? 'bg-teal-500' : priorityLevel === 'High' ? 'bg-brand-500' : 'bg-ink-400'}`}
                style={{ width: `${Math.min(100, (activeStudent.libraPoints / 250) * 100)}%` }}
              />
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-ink-500">Check-in Rate</p>
            <p className="font-display text-2xl font-extrabold text-teal-600">{checkInRate}%</p>
          </div>
        </div>
      </div>

      {/* LibraPoints History */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-600" />
          <h3 className="font-display text-sm font-bold text-ink-900">LibraPoints History</h3>
        </div>
        {activeStudent.pointHistory.length > 0 ? (
          <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
            {activeStudent.pointHistory.map((entry) => {
              const Icon = pointCategoryIcons[entry.category] || Star;
              const positive = entry.amount > 0;
              return (
                <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${positive ? 'bg-teal-50' : 'bg-rose-50'}`}>
                    <Icon className={`h-4 w-4 ${positive ? 'text-teal-600' : 'text-rose-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">{entry.reason}</p>
                    <p className="text-[10px] text-ink-400">{relativeTime(entry.timestamp)}</p>
                  </div>
                  <span className={`font-display text-sm font-extrabold ${positive ? 'text-teal-600' : 'text-rose-600'}`}>
                    {positive ? '+' : ''}{entry.amount}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-400">No LibraPoints activity yet. Check in to a seat reservation to start earning points!</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Study progress */}
        <div className="card p-5 flex flex-col items-center">
          <h3 className="self-start font-display text-sm font-bold text-ink-900">Semester Progress</h3>
          <div className="mt-4">
            <RadialProgress value={activeStudent.studyHours} max={200} size={140} color="#14a892" label="of 200h goal" />
          </div>
          <p className="mt-3 text-center text-xs text-ink-500">
            You've studied <span className="font-bold text-teal-600">{activeStudent.studyHours} hours</span> this semester. Keep it up!
          </p>
        </div>

        {/* Interests */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-bold text-ink-900">Learning Interests</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeStudent.interests.length > 0 ? (
              activeStudent.interests.map((s) => (
                <span key={s} className="chip bg-brand-50 text-brand-700">
                  <Award className="h-3 w-3" /> {s}
                </span>
              ))
            ) : (
              <p className="text-sm text-ink-400">No interests selected yet.</p>
            )}
          </div>

          <h3 className="mt-5 font-display text-sm font-bold text-ink-900">Currently Issued Books</h3>
          <div className="mt-3 space-y-2">
            {issued.length > 0 ? (
              issued.map((r) => {
                const daysLeft = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                        <BookOpen className="h-4 w-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-800">{r.bookTitle}</p>
                        <p className="text-xs text-ink-500">Due {formatDate(r.dueDate)}</p>
                      </div>
                    </div>
                    <span className={`chip ${daysLeft < 0 ? 'bg-rose-100 text-rose-700' : daysLeft <= 2 ? 'bg-gold-100 text-gold-700' : 'bg-teal-100 text-teal-700'}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-ink-400">No books currently issued.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-ink-800 truncate">{value}</p>
    </div>
  );
}
