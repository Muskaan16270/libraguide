import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/Modal';
import { BookCover } from '../../components/BookCover';
import { SUBJECTS } from '../../data/mockData';
import type { Book, Difficulty, Subject } from '../../types';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  MapPin,
} from 'lucide-react';

const EMPTY_BOOK: Omit<Book, 'id'> = {
  title: '',
  author: '',
  subject: 'Programming',
  isbn: '',
  description: '',
  difficulty: 'Beginner',
  rating: 4.0,
  ratingsCount: 0,
  totalCopies: 1,
  availableCopies: 1,
  location: { block: 'Block A', room: 'Room 103', shelf: 1, row: 1 },
  coverColors: ['#1d72f5', '#152957'],
  coverAccent: '#8ecdff',
  tags: [],
  borrowCount: 0,
  searchCount: 0,
  publishedYear: new Date().getFullYear(),
  pages: 200,
};

export function ManageBooks() {
  const { books, setBooks, addToast } = useApp();
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [editing, setEditing] = useState<Book | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);

  const filtered = useMemo(() => {
    let r = books;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q));
    }
    if (subjectFilter !== 'all') r = r.filter((b) => b.subject === subjectFilter);
    return r;
  }, [books, query, subjectFilter]);

  const handleSave = (book: Book) => {
    if (creating) {
      setBooks((prev) => [book, ...prev]);
      addToast(`"${book.title}" added to library`, 'success');
    } else {
      setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
      addToast(`"${book.title}" updated`, 'success');
    }
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setBooks((prev) => prev.filter((b) => b.id !== confirmDelete.id));
    addToast(`"${confirmDelete.title}" removed`, 'info');
    setConfirmDelete(null);
  };

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
              placeholder="Search by title, author, or ISBN..."
              className="input pl-11"
            />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input !w-auto">
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => { setCreating(true); setEditing({ ...EMPTY_BOOK, id: `b${Date.now()}` }); }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Add Book
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Copies</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-ink-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BookCover book={b} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900 line-clamp-1">{b.title}</p>
                        <p className="text-xs text-ink-500">{b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="chip bg-brand-50 text-brand-700">{b.subject}</span></td>
                  <td className="px-4 py-3 text-ink-700">
                    <span className={b.availableCopies > 0 ? 'text-teal-600 font-semibold' : 'text-rose-600 font-semibold'}>
                      {b.availableCopies}/{b.totalCopies}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.location.room}, S{b.location.shelf}</span>
                  </td>
                  <td className="px-4 py-3">
                    {b.availableCopies > 0 ? (
                      <span className="chip bg-teal-100 text-teal-700">Available</span>
                    ) : (
                      <span className="chip bg-rose-100 text-rose-700">All issued</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(b); setCreating(false); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-600" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(b)} className="rounded-lg p-1.5 text-ink-500 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">No books match your search.</p>
          </div>
        )}
      </div>

      {/* Edit/Add modal */}
      {editing && (
        <BookFormModal
          book={editing}
          creating={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Book" size="sm">
        <p className="text-sm text-ink-600">
          Are you sure you want to remove <span className="font-bold text-ink-900">"{confirmDelete?.title}"</span> from the library? This cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn flex-1 bg-rose-600 text-white hover:bg-rose-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function BookFormModal({
  book,
  creating,
  onClose,
  onSave,
}: {
  book: Book;
  creating: boolean;
  onClose: () => void;
  onSave: (b: Book) => void;
}) {
  const [form, setForm] = useState<Book>(book);

  const update = (field: keyof Book, value: unknown) => setForm((p) => ({ ...p, [field]: value }));
  const updateLoc = (field: keyof Book['location'], value: unknown) =>
    setForm((p) => ({ ...p, location: { ...p.location, [field]: value } }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={creating ? 'Add New Book' : 'Edit Book'} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Author</label>
            <input value={form.author} onChange={(e) => update('author', e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Subject</label>
            <select value={form.subject} onChange={(e) => update('subject', e.target.value as Subject)} className="input">
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">ISBN</label>
            <input value={form.isbn} onChange={(e) => update('isbn', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value as Difficulty)} className="input">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Rating</label>
            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => update('rating', Number(e.target.value))} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="input resize-none" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Total Copies</label>
            <input type="number" min="1" value={form.totalCopies} onChange={(e) => {
              const total = Number(e.target.value);
              update('totalCopies', total);
              if (form.availableCopies > total) update('availableCopies', total);
            }} className="input" />
          </div>
          <div>
            <label className="label">Available Copies</label>
            <input type="number" min="0" max={form.totalCopies} value={form.availableCopies} onChange={(e) => update('availableCopies', Number(e.target.value))} className="input" />
          </div>
        </div>

        <div className="rounded-xl border border-ink-100 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400 mb-3">Location</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="label">Block</label>
              <select value={form.location.block} onChange={(e) => updateLoc('block', e.target.value)} className="input">
                <option>Block A</option><option>Block B</option><option>Block C</option>
              </select>
            </div>
            <div>
              <label className="label">Room</label>
              <input value={form.location.room} onChange={(e) => updateLoc('room', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Shelf</label>
              <input type="number" min="1" value={form.location.shelf} onChange={(e) => updateLoc('shelf', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Row</label>
              <input type="number" min="1" value={form.location.row} onChange={(e) => updateLoc('row', Number(e.target.value))} className="input" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">{creating ? 'Add Book' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
}
