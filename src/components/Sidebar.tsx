import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Armchair,
  Sparkles,
  Bookmark,
  Bell,
  User,
  BarChart3,
  Library,
  Users,
  TrendingUp,
  GraduationCap,
  X,
  BookMarked,
  Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const studentNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'seats', label: 'Study Seats', icon: Armchair },
  { id: 'ai-assistant', label: 'AI Study Assistant', icon: Sparkles },
  { id: 'ai-recommend', label: 'AI Recommendations', icon: BookMarked },
  { id: 'reservations', label: 'My Reservations', icon: Bookmark },
  { id: 'membership', label: 'Membership', icon: Crown },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
];

const adminNav: NavItem[] = [
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { id: 'admin-books', label: 'Manage Books', icon: Library },
  { id: 'admin-seats', label: 'Manage Seats', icon: Armchair },
  { id: 'admin-students', label: 'Students', icon: Users },
  { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'admin-occupancy', label: 'Occupancy Monitor', icon: TrendingUp },
];

export function Sidebar({
  page,
  onNavigate,
  open,
  onClose,
}: {
  page: string;
  onNavigate: (page: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const { role, activeStudent, notifications } = useApp();
  const nav = role === 'admin' ? adminNav : studentNav;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-100 bg-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between gap-2.5 border-b border-ink-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow">
              <GraduationCap className="h-5 w-5 text-white" />
              <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-teal-400 ring-2 ring-white" />
            </div>
            <div>
              <p className="font-display text-base font-extrabold leading-none text-ink-900">LibraGuide</p>
              <p className="mt-0.5 text-[10px] font-medium text-ink-400">Smart College Library</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">
            {role === 'admin' ? 'Administration' : 'Student'}
          </p>
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              const showBadge = item.id === 'notifications' && unread > 0;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`sidebar-link w-full ${active ? 'sidebar-link-active' : ''}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-brand-600' : ''}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {showBadge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {role === 'student' && (
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 p-4 border border-brand-100">
              <p className="text-xs font-bold text-brand-700">Smart Insight</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                Reading Room 2 is only 37% occupied right now. A great time to study!
              </p>
              <button
                onClick={() => onNavigate('seats')}
                className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View seats →
              </button>
            </div>
          )}
        </nav>

        {/* User card */}
        <div className="border-t border-ink-100 p-3">
          <button
            onClick={() => onNavigate('profile')}
            className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-ink-100 transition-colors"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${activeStudent.avatarColors[0]}, ${activeStudent.avatarColors[1]})` }}
            >
              {activeStudent.initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-sm font-semibold text-ink-800">{activeStudent.name}</p>
              <p className="truncate text-[10px] text-ink-400">{activeStudent.studentId}</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
