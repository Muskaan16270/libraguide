import { useApp } from '../context/AppContext';
import { relativeTime } from '../utils/format';
import { Bell, CheckCheck, Armchair, Clock, BellRing, Sparkles, Megaphone, BellOff } from 'lucide-react';

const ICON_MAP: Record<string, typeof Bell> = {
  armchair: Armchair,
  'book-clock': Clock,
  'bell-ring': BellRing,
  sparkles: Sparkles,
  megaphone: Megaphone,
};

const TYPE_COLOR: Record<string, string> = {
  reservation: 'bg-brand-100 text-brand-700',
  expiry: 'bg-gold-100 text-gold-700',
  return: 'bg-gold-100 text-gold-700',
  available: 'bg-teal-100 text-teal-700',
  recommendation: 'bg-brand-100 text-brand-700',
  announcement: 'bg-ink-100 text-ink-700',
};

export function Notifications() {
  const { notifications, markNotificationRead, markAllRead } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">Notifications</h2>
          <p className="text-sm text-ink-500">{unread} unread of {notifications.length} total</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary !py-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100">
            <BellOff className="h-7 w-7 text-ink-400" />
          </div>
          <p className="mt-3 font-semibold text-ink-700">You're all caught up!</p>
          <p className="text-sm text-ink-500">No notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n, i) => {
            const Icon = ICON_MAP[n.icon] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`card w-full flex items-start gap-4 p-4 text-left transition-all animate-fade-up hover:shadow-card ${!n.read ? 'border-brand-200 bg-brand-50/30' : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TYPE_COLOR[n.type] || 'bg-ink-100 text-ink-600'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">{n.message}</p>
                  <p className="mt-1.5 text-xs text-ink-400">{relativeTime(n.timestamp)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
