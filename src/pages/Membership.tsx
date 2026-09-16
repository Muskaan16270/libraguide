import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';
import { getPriorityLevel } from '../types';
import {
  Crown,
  Check,
  Star,
  Zap,
  Bell,
  Award,
  Shield,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowRight,
  Armchair,
  LogIn,
  LogOut,
  Timer,
  XCircle,
  Plus,
  Minus,
} from 'lucide-react';

const BENEFITS = [
  { icon: Armchair, title: 'Member-Priority Seat Reservations', desc: 'Reserve from the 10% member-priority seats across all reading rooms.' },
  { icon: Sparkles, title: 'Smart Seat Prediction', desc: 'AI-powered predictions for the best time to visit based on occupancy patterns.' },
  { icon: Bell, title: 'Reservation Reminders', desc: 'Get notified before your check-in deadline so you never miss a reservation.' },
  { icon: Star, title: 'LibraPoints Reward System', desc: 'Earn points for responsible behavior and climb the priority ladder.' },
  { icon: TrendingUp, title: 'Points-Based Priority', desc: 'Higher LibraPoints give you better priority for limited member seats.' },
  { icon: Bell, title: 'Book Availability Notifications', desc: 'Get instant alerts when your wishlist books become available.' },
];

export function Membership({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { activeStudent, purchaseMembership } = useApp();
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);

  const membership = activeStudent.membership;
  const isActive = membership.status === 'active';
  const priorityLevel = getPriorityLevel(activeStudent.libraPoints);

  const handleSubscribe = () => {
    setProcessing(true);
    setTimeout(() => {
      purchaseMembership();
      setProcessing(false);
      setShowPayment(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Membership status card */}
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-teal-700 p-6 text-white">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-teal-400/20" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold-300" />
                <p className="text-xs font-bold uppercase tracking-wider text-brand-100">LibraGuide Membership</p>
              </div>
              <p className="mt-2 font-display text-4xl font-extrabold">
                ₹100<span className="text-lg font-medium text-brand-200">/month</span>
              </p>
              <div className="mt-3 flex items-center gap-3">
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-3 py-1 text-xs font-bold text-teal-100 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300 animate-pulse" /> Active Member
                  </span>
                ) : membership.status === 'inactive' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/20 px-3 py-1 text-xs font-bold text-rose-100 backdrop-blur">
                    <Clock className="h-3 w-3" /> Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    Not a Member
                  </span>
                )}
                {isActive && membership.expiryDate && (
                  <span className="text-xs text-brand-200">Expires {formatDate(membership.expiryDate)}</span>
                )}
              </div>
            </div>
            {isActive && (
              <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                <p className="text-xs font-medium text-brand-100">LibraPoints</p>
                <p className="font-display text-3xl font-extrabold">{activeStudent.libraPoints}</p>
                <p className="text-xs text-brand-200">{priorityLevel} Priority</p>
              </div>
            )}
          </div>
        </div>

        {!isActive && (
          <div className="p-5">
            <button
              onClick={() => setShowPayment(true)}
              className="btn-primary w-full"
            >
              <Crown className="h-4 w-4" /> Become a Member — ₹100/month
            </button>
            <p className="mt-2 text-center text-xs text-ink-500">
              Membership gives you access to priority seat reservations and rewards. Cancel anytime.
            </p>
          </div>
        )}

        {isActive && (
          <div className="border-t border-ink-100 p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatusItem label="Status" value="Active" color="text-teal-600" />
              <StatusItem label="LibraPoints" value={String(activeStudent.libraPoints)} color="text-gold-600" />
              <StatusItem label="Priority" value={priorityLevel} color="text-brand-600" />
              <StatusItem label="Expires" value={membership.expiryDate ? formatDate(membership.expiryDate) : '—'} color="text-ink-700" />
            </div>
            <button
              onClick={() => onNavigate('seats')}
              className="btn-secondary mt-4 w-full"
            >
              <Armchair className="h-4 w-4" /> Reserve a Member Priority Seat
            </button>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="card p-5">
        <h3 className="font-display text-sm font-bold text-ink-900">Membership Benefits</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="rounded-xl border border-ink-100 p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <Icon className="h-4.5 w-4.5 text-brand-600" />
                </div>
                <p className="mt-3 text-sm font-bold text-ink-900">{b.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority levels */}
      <div className="card p-5">
        <h3 className="font-display text-sm font-bold text-ink-900">Priority Levels</h3>
        <p className="mt-1 text-xs text-ink-500">
          Membership gives you eligibility to reserve Member Priority Seats. Your LibraPoints determine your priority when seats are limited.
        </p>
        <div className="mt-4 space-y-3">
          <PriorityRow
            level="Standard"
            range="0–99 points"
            color="bg-ink-100 text-ink-700"
            active={priorityLevel === 'Standard'}
          />
          <PriorityRow
            level="High"
            range="100–249 points"
            color="bg-brand-100 text-brand-700"
            active={priorityLevel === 'High'}
          />
          <PriorityRow
            level="Very High"
            range="250+ points"
            color="bg-teal-100 text-teal-700"
            active={priorityLevel === 'Very High'}
          />
        </div>
        <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 p-4 border border-brand-100">
          <p className="text-xs leading-relaxed text-ink-600">
            <Shield className="inline h-3.5 w-3.5 text-brand-600 mr-1" />
            Membership gives you access to the priority reservation system, but <span className="font-bold">responsible behaviour determines your priority.</span> Only 10% of seats are member-priority seats — the rest remain available to all students.
          </p>
        </div>
      </div>

      {/* LibraPoints Rules */}
      <div className="card p-5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-gold-500" />
          <h3 className="font-display text-sm font-bold text-ink-900">How LibraPoints Work</h3>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          Earn points for responsible library behaviour. Lose points when you abandon reservations or miss check-in deadlines. Points determine your priority for the limited Member Priority Seats.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Earning */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-teal-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Earning Points</p>
            </div>
            <div className="mt-3 space-y-2.5">
              <PointRule icon={LogIn} color="text-teal-600" amount="+10" label="Check in on time" desc="Within the 1-hour check-in window" />
              <PointRule icon={LogOut} color="text-teal-600" amount="+10" label="Check out properly" desc="Complete your session and check out" />
              <PointRule icon={Timer} color="text-teal-600" amount="+15" label="Release seat early" desc="Free the seat for others when leaving ahead of schedule" />
            </div>
          </div>

          {/* Losing */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-rose-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Losing Points</p>
            </div>
            <div className="mt-3 space-y-2.5">
              <PointRule icon={XCircle} color="text-rose-600" amount="-15" label="No-show" desc="Miss the 1-hour check-in deadline — seat auto-released" />
              <PointRule icon={XCircle} color="text-rose-600" amount="-10" label="Abandon reservation" desc="Cancel an active reservation without checking in" />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-ink-50 p-4">
          <p className="text-xs font-semibold text-ink-600">Priority Seat Allocation</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            When multiple members want the same Member Priority Seat, students with higher LibraPoints get priority. Very High priority members are served first, followed by High, then Standard. Points never go below zero.
          </p>
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 animate-fade-in" onClick={() => !processing && setShowPayment(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-t-2xl bg-gradient-to-br from-brand-600 to-teal-700 p-5 text-white">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold-300" />
                <h3 className="font-display text-lg font-bold">LibraGuide Membership</h3>
              </div>
              <p className="mt-1 text-sm text-brand-100">₹100/month · Cancel anytime</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-ink-50 p-4">
                <p className="text-xs font-semibold text-ink-500">Payment Method</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-white border border-ink-200">
                    <span className="text-xs font-bold text-ink-700">UPI</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Simulated Payment</p>
                    <p className="text-xs text-ink-500">No real charge — demo only</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-ink-100 p-3">
                <span className="text-sm text-ink-600">Monthly subscription</span>
                <span className="font-display text-lg font-bold text-ink-900">₹100</span>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={processing}
                className="btn-primary w-full"
              >
                {processing ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Processing...</>
                ) : (
                  <><Zap className="h-4 w-4" /> Pay ₹100 & Activate</>
                )}
              </button>
              <button onClick={() => setShowPayment(false)} disabled={processing} className="w-full text-center text-xs font-semibold text-ink-500 hover:text-ink-700">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-ink-100 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function PriorityRow({ level, range, color, active }: { level: string; range: string; color: string; active: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl p-3.5 transition-all ${active ? 'bg-brand-50 border-2 border-brand-200' : 'border border-ink-100'}`}>
      <div className="flex items-center gap-3">
        <span className={`chip ${color}`}>{level}</span>
        <span className="text-sm text-ink-600">{range}</span>
      </div>
      {active && (
        <span className="flex items-center gap-1 text-xs font-bold text-brand-600">
          <Check className="h-3.5 w-3.5" /> Your level
        </span>
      )}
    </div>
  );
}

function PointRule({ icon: Icon, color, amount, label, desc }: { icon: typeof LogIn; color: string; amount: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-800">{label}</p>
          <span className={`chip text-[10px] font-bold ${amount.startsWith('+') ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>{amount} pts</span>
        </div>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}
