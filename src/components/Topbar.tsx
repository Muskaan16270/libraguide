import { useApp } from '../context/AppContext';
import { relativeTime } from '../utils/format';
import { Bell, CheckCheck, Armchair, Clock, BellRing, Sparkles, Megaphone, Menu, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const ICON_MAP: Record<string, typeof Bell> = {
  armchair: Armchair,
  'book-clock': Clock,
  'bell-ring': BellRing,
  sparkles: Sparkles,
  megaphone: Megaphone,
};

export function Topbar({
  title,
  onMenuClick,
  onNavigate,
}: {
  title: string;
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
}) {
  const { notifications, markAllRead, markNotificationRead, role, setRole, activeStudent } = useApp();
  const [bellOpen, setBellOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <h1 className="font-display text-lg font-bold text-ink-900 md:text-xl">{title}</h1>
      </div>

      {/* Role switcher */}
      <div className="relative">
        <button
          onClick={() => setRoleOpen((o) => !o)}
          className="btn-secondary !py-1.5 !px-3 text-xs"
        >
          <GraduationCap className="h-4 w-4 text-brand-600" />
          <span className="capitalize">{role}</span>
        </button>
        {roleOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setRoleOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 w-40 card p-1.5 animate-scale-in">
              <button
                onClick={() => {
                  setRole('student');
                  onNavigate('dashboard');
                  setRoleOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${role === 'student' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'}`}
              >
                Student view
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  onNavigate('admin-dashboard');
                  setRoleOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${role === 'admin' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'}`}
              >
                Admin view
              </button>
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setBellOpen((o) => !o)}
          className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
        {bellOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 w-[360px] max-w-[calc(100vw-2rem)] card animate-scale-in max-h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <h4 className="font-display text-sm font-bold text-ink-900">Notifications</h4>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-ink-400">No notifications yet</p>
                ) : (
                  notifications.slice(0, 8).map((n) => {
                    const Icon = ICON_MAP[n.icon] || Bell;
                    return (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`flex w-full gap-3 border-b border-ink-50 px-4 py-3 text-left transition-colors hover:bg-ink-50 ${!n.read ? 'bg-brand-50/40' : ''}`}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${!n.read ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-400'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink-800 truncate">{n.title}</p>
                          <p className="text-xs text-ink-500 line-clamp-2 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-ink-400 mt-1">{relativeTime(n.timestamp)}</p>
                        </div>
                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                      </button>
                    );
                  })
                )}
              </div>
              <button
                onClick={() => {
                  onNavigate('notifications');
                  setBellOpen(false);
                }}
                className="border-t border-ink-100 px-4 py-2.5 text-center text-xs font-semibold text-brand-600 hover:bg-ink-50"
              >
                View all notifications
              </button>
            </div>
          </>
        )}
      </div>

      {/* Avatar */}
      <button
        onClick={() => onNavigate('profile')}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-ink-100 transition-colors"
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${activeStudent.avatarColors[0]}, ${activeStudent.avatarColors[1]})` }}
        >
          {activeStudent.initials}
        </div>
        <span className="hidden text-sm font-semibold text-ink-700 sm:inline">{activeStudent.name.split(' ')[0]}</span>
      </button>
    </header>
  );
}
