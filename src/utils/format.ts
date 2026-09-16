export function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDate(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function occupancyColor(pct: number): string {
  if (pct < 50) return 'text-teal-600';
  if (pct < 80) return 'text-gold-600';
  return 'text-rose-600';
}

export function occupancyBg(pct: number): string {
  if (pct < 50) return 'bg-teal-500';
  if (pct < 80) return 'bg-gold-500';
  return 'bg-rose-500';
}

export function occupancyLabel(pct: number): string {
  if (pct < 50) return 'Low';
  if (pct < 80) return 'Moderate';
  return 'High';
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function countdown(target: string, startTime: string, date: string): { text: string; expired: boolean; imminent: boolean } {
  const targetDate = new Date(`${date}T${startTime}:00`);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    // check the 1-hour expiry window
    const expiryMs = targetDate.getTime() + 60 * 60 * 1000 - now.getTime();
    if (expiryMs <= 0) return { text: 'Reservation expired — seat released', expired: true, imminent: false };
    const mins = Math.floor(expiryMs / 60000);
    const secs = Math.floor((expiryMs % 60000) / 1000);
    return { text: `Check-in required within: ${mins}m ${secs}s`, expired: false, imminent: true };
  }
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hrs > 0) return { text: `Starts in ${hrs}h ${mins}m`, expired: false, imminent: false };
  return { text: `Starts in ${mins}m`, expired: false, imminent: mins < 15 };
}
