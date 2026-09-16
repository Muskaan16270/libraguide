import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Student } from '../../types';
import { Search, BookOpen, Armchair, Users, Check, X } from 'lucide-react';

export function ManageStudents() {
  const { students, bookReservations, seatReservations } = useApp();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = useMemo(() => {
    let r = students;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.department.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') r = r.filter((s) => s.status === statusFilter);
    return r;
  }, [students, query, statusFilter]);

  const getStudentIssued = (id: string) => bookReservations.filter((r) => r.studentId === id && r.status === 'issued').length;
  const getStudentRes = (id: string) => seatReservations.filter((r) => r.studentId === id && (r.status === 'active' || r.status === 'checked-in')).length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID, or department..."
              className="input pl-11"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-ink-500">
        <span className="font-bold text-ink-900">{filtered.length}</span> student{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Books Issued</th>
                <th className="px-4 py-3">Reservations</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((s: Student) => (
                <tr key={s.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${s.avatarColors[0]}, ${s.avatarColors[1]})` }}
                      >
                        {s.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{s.name}</p>
                        <p className="text-xs text-ink-500">{s.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{s.department}</td>
                  <td className="px-4 py-3 text-ink-600">Year {s.year}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-ink-700">
                      <BookOpen className="h-3.5 w-3.5 text-brand-500" /> {getStudentIssued(s.id)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-ink-700">
                      <Armchair className="h-3.5 w-3.5 text-teal-500" /> {getStudentRes(s.id)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === 'active' ? (
                      <span className="chip bg-teal-100 text-teal-700"><Check className="h-3 w-3" /> Active</span>
                    ) : (
                      <span className="chip bg-ink-100 text-ink-500"><X className="h-3 w-3" /> Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">No students match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
