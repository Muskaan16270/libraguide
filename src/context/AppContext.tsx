import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  Book,
  ReadingRoom,
  Student,
  Notification,
  SeatReservation,
  BookReservation,
  Role,
  Seat,
  PointEntry,
} from '../types';
import {
  books as initialBooks,
  readingRooms as initialRooms,
  currentStudent,
  students as initialStudents,
  notifications as initialNotifications,
  initialBookReservations,
  initialSeatReservations,
} from '../data/mockData';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface WishlistItem {
  bookId: string;
  notifyOnAvailable: boolean;
}

interface AppContextValue {
  role: Role;
  setRole: (r: Role) => void;

  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  rooms: ReadingRoom[];
  setRooms: React.Dispatch<React.SetStateAction<ReadingRoom[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  activeStudent: Student;
  setActiveStudentFields: (fields: Partial<Student>) => void;

  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  bookReservations: BookReservation[];
  setBookReservations: React.Dispatch<React.SetStateAction<BookReservation[]>>;
  seatReservations: SeatReservation[];
  setSeatReservations: React.Dispatch<React.SetStateAction<SeatReservation[]>>;

  reserveSeat: (
    seat: Seat,
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
  ) => void;
  checkInSeat: (reservationId: string) => void;
  cancelSeatReservation: (reservationId: string) => void;
  checkOutSeat: (reservationId: string) => void;
  releaseSeatEarly: (reservationId: string) => void;
  expireReservation: (reservationId: string) => void;

  purchaseMembership: () => void;

  addLibraPoints: (amount: number, reason: string, category: PointEntry['category']) => void;

  issueBook: (bookId: string) => void;
  returnBook: (reservationId: string) => void;

  wishlist: WishlistItem[];
  toggleWishlist: (bookId: string) => void;
  notifyMe: (bookId: string) => void;

  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let toastId = 0;
let notifId = 100;
let resId = 100;

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('student');
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [rooms, setRooms] = useState<ReadingRoom[]>(initialRooms);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activeStudent, setActiveStudent] = useState<Student>(currentStudent);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [bookReservations, setBookReservations] = useState<BookReservation[]>(initialBookReservations);
  const [seatReservations, setSeatReservations] = useState<SeatReservation[]>(initialSeatReservations);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { bookId: 'b17', notifyOnAvailable: true },
  ]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `t${toastId++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = `n${notifId++}`;
    setNotifications((prev) => [
      { ...n, id, timestamp: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const setActiveStudentFields = useCallback((fields: Partial<Student>) => {
    setActiveStudent((prev) => ({ ...prev, ...fields }));
  }, []);

  const addLibraPoints = useCallback(
    (amount: number, reason: string, category: PointEntry['category']) => {
      const entry: PointEntry = {
        id: `ph${notifId++}`,
        amount,
        reason,
        category,
        timestamp: new Date().toISOString(),
      };
      setActiveStudent((prev) => ({
        ...prev,
        libraPoints: Math.max(0, prev.libraPoints + amount),
        pointHistory: [entry, ...prev.pointHistory],
      }));
      setStudents((prev) =>
        prev.map((s) =>
          s.id === activeStudent.id
            ? { ...s, libraPoints: Math.max(0, s.libraPoints + amount), pointHistory: [entry, ...s.pointHistory] }
            : s,
        ),
      );
    },
    [activeStudent.id],
  );

  const purchaseMembership = useCallback(() => {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + 30);
    setActiveStudent((prev) => ({
      ...prev,
      membership: {
        status: 'active',
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        monthlyFee: 100,
      },
    }));
    addToast('Welcome to LibraGuide Membership! Your member benefits are now active.', 'success');
    pushNotification({
      type: 'announcement',
      title: 'Membership Activated',
      message: 'Your LibraGuide Membership is now active. You can reserve Member Priority Seats and earn LibraPoints!',
      icon: 'sparkles',
    });
  }, [addToast, pushNotification]);

  const reserveSeat = useCallback(
    (seat: Seat, roomName: string, date: string, startTime: string, endTime: string) => {
      const id = `sr${resId++}`;
      const startHour = parseInt(startTime.split(':')[0]);
      const deadlineHour = startHour + 1;
      const checkInDeadline = `${String(deadlineHour).padStart(2, '0')}:00`;
      const reservation: SeatReservation = {
        id,
        seatId: seat.id,
        seatNumber: seat.number,
        roomId: seat.roomId,
        roomName,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        date,
        startTime,
        endTime,
        status: 'active',
        createdAt: new Date().toISOString(),
        isMemberPriority: seat.isMemberPriority,
        checkInDeadline,
      };
      setSeatReservations((prev) => [reservation, ...prev]);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === seat.roomId
            ? {
                ...r,
                reservedSeats: r.reservedSeats + 1,
                seats: r.seats.map((s) =>
                  s.id === seat.id ? { ...s, state: 'reserved' as const } : s,
                ),
              }
            : r,
        ),
      );
      setActiveStudent((prev) => ({
        ...prev,
        seatsReserved: prev.seatsReserved + 1,
        usageStats: { ...prev.usageStats, totalReservations: prev.usageStats.totalReservations + 1 },
      }));
      pushNotification({
        type: 'reservation',
        title: 'Seat reservation confirmed',
        message: `Seat ${seat.number} in ${roomName} reserved for ${date} ${startTime}–${endTime}. Check in by ${checkInDeadline}.`,
        icon: 'armchair',
      });
      addToast(`Seat ${seat.number} reserved in ${roomName}`, 'success');
    },
    [activeStudent, addToast, pushNotification],
  );

  const checkInSeat = useCallback(
    (reservationId: string) => {
      setSeatReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked-in' as const } : r)),
      );
      setRooms((prev) =>
        prev.map((r) => {
          const res = seatReservations.find((sr) => sr.id === reservationId);
          if (!res || r.id !== res.roomId) return r;
          return {
            ...r,
            seats: r.seats.map((s) =>
              s.id === res.seatId ? { ...s, state: 'checked-in' as const } : s,
            ),
          };
        }),
      );
      setActiveStudent((prev) => ({
        ...prev,
        usageStats: { ...prev.usageStats, successfulCheckIns: prev.usageStats.successfulCheckIns + 1 },
      }));
      addLibraPoints(10, 'Checked in on time', 'check-in');
      addToast('Checked in successfully! +10 LibraPoints', 'success');
    },
    [seatReservations, addLibraPoints, addToast],
  );

  const checkOutSeat = useCallback(
    (reservationId: string) => {
      const res = seatReservations.find((r) => r.id === reservationId);
      if (!res) return;
      setSeatReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'completed' as const } : r)),
      );
      setRooms((prev) =>
        prev.map((r) =>
          r.id === res.roomId
            ? {
                ...r,
                occupiedSeats: Math.max(0, r.occupiedSeats - 1),
                reservedSeats: Math.max(0, r.reservedSeats - 1),
                seats: r.seats.map((s) =>
                  s.id === res.seatId ? { ...s, state: 'available' as const } : s,
                ),
              }
            : r,
        ),
      );
      addLibraPoints(10, 'Completed reservation and checked out properly', 'checkout');
      addToast('Checked out. Thank you! +10 LibraPoints', 'success');
    },
    [seatReservations, addLibraPoints, addToast],
  );

  const releaseSeatEarly = useCallback(
    (reservationId: string) => {
      const res = seatReservations.find((r) => r.id === reservationId);
      if (!res) return;
      setSeatReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'released' as const, releasedReason: 'Student left early and released the seat' } : r)),
      );
      setRooms((prev) =>
        prev.map((r) =>
          r.id === res.roomId
            ? {
                ...r,
                reservedSeats: Math.max(0, r.reservedSeats - 1),
                seats: r.seats.map((s) =>
                  s.id === res.seatId ? { ...s, state: 'available' as const } : s,
                ),
              }
            : r,
        ),
      );
      setActiveStudent((prev) => ({
        ...prev,
        usageStats: { ...prev.usageStats, earlyReleases: prev.usageStats.earlyReleases + 1 },
      }));
      addLibraPoints(15, 'Released seat early for others to use', 'early-release');
      addToast('Thank you for releasing your seat! +15 LibraPoints', 'success');
    },
    [seatReservations, addLibraPoints, addToast],
  );

  const expireReservation = useCallback(
    (reservationId: string) => {
      const res = seatReservations.find((r) => r.id === reservationId);
      if (!res) return;
      setSeatReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'expired' as const, releasedReason: 'No-show — check-in deadline passed' } : r)),
      );
      setRooms((prev) =>
        prev.map((r) =>
          r.id === res.roomId
            ? {
                ...r,
                reservedSeats: Math.max(0, r.reservedSeats - 1),
                seats: r.seats.map((s) =>
                  s.id === res.seatId ? { ...s, state: 'available' as const } : s,
                ),
              }
            : r,
        ),
      );
      setActiveStudent((prev) => ({
        ...prev,
        usageStats: { ...prev.usageStats, noShows: prev.usageStats.noShows + 1 },
      }));
      addLibraPoints(-15, 'Reservation no-show — check-in deadline missed', 'no-show');
      addToast('Reservation expired — seat released. -15 LibraPoints', 'error');
    },
    [seatReservations, addLibraPoints, addToast],
  );

  const cancelSeatReservation = useCallback(
    (reservationId: string) => {
      const res = seatReservations.find((r) => r.id === reservationId);
      const wasActive = res?.status === 'active';
      setSeatReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' as const } : r)),
      );
      if (res) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === res.roomId
              ? {
                  ...r,
                  reservedSeats: Math.max(0, r.reservedSeats - 1),
                  seats: r.seats.map((s) =>
                    s.id === res.seatId ? { ...s, state: 'available' as const } : s,
                  ),
                }
              : r,
          ),
        );
      }
      if (wasActive) {
        addLibraPoints(-10, 'Reservation abandoned without checking in', 'misuse');
        addToast('Reservation cancelled. -10 LibraPoints for abandoning without check-in.', 'error');
      } else {
        addToast('Reservation cancelled', 'info');
      }
    },
    [seatReservations, addToast, addLibraPoints],
  );

  const issueBook = useCallback(
    (bookId: string) => {
      const book = books.find((b) => b.id === bookId);
      if (!book || book.availableCopies <= 0) {
        addToast('No copies available to issue', 'error');
        return;
      }
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1, borrowCount: b.borrowCount + 1 } : b,
        ),
      );
      const due = new Date();
      due.setDate(due.getDate() + 14);
      const newRes: BookReservation = {
        id: `br${resId++}`,
        bookId,
        bookTitle: book.title,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        issueDate: new Date().toISOString(),
        dueDate: due.toISOString(),
        status: 'issued',
      };
      setBookReservations((prev) => [newRes, ...prev]);
      setActiveStudent((prev) => ({ ...prev, booksIssued: prev.booksIssued + 1 }));
      addToast(`"${book.title}" issued. Due in 14 days.`, 'success');
    },
    [books, activeStudent, addToast],
  );

  const returnBook = useCallback(
    (reservationId: string) => {
      const res = bookReservations.find((r) => r.id === reservationId);
      if (!res) return;
      setBookReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'returned' as const } : r)),
      );
      setBooks((prev) =>
        prev.map((b) => (b.id === res.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b)),
      );
      setActiveStudent((prev) => ({
        ...prev,
        booksIssued: Math.max(0, prev.booksIssued - 1),
        booksReturned: prev.booksReturned + 1,
      }));
      addToast(`"${res.bookTitle}" returned. Thank you!`, 'success');
    },
    [bookReservations, addToast],
  );

  const toggleWishlist = useCallback(
    (bookId: string) => {
      setWishlist((prev) => {
        const exists = prev.find((w) => w.bookId === bookId);
        if (exists) {
          addToast('Removed from wishlist', 'info');
          return prev.filter((w) => w.bookId !== bookId);
        }
        addToast('Added to wishlist', 'success');
        return [...prev, { bookId, notifyOnAvailable: false }];
      });
    },
    [addToast],
  );

  const notifyMe = useCallback(
    (bookId: string) => {
      setWishlist((prev) => {
        const existing = prev.find((w) => w.bookId === bookId);
        if (existing) {
          return prev.map((w) => (w.bookId === bookId ? { ...w, notifyOnAvailable: true } : w));
        }
        return [...prev, { bookId, notifyOnAvailable: true }];
      });
      addToast('We will notify you when this book becomes available', 'success');
    },
    [addToast],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      setRole,
      books,
      setBooks,
      rooms,
      setRooms,
      students,
      setStudents,
      activeStudent,
      setActiveStudentFields,
      notifications,
      setNotifications,
      markNotificationRead,
      markAllRead,
      pushNotification,
      bookReservations,
      setBookReservations,
      seatReservations,
      setSeatReservations,
      reserveSeat,
      checkInSeat,
      cancelSeatReservation,
      checkOutSeat,
      releaseSeatEarly,
      expireReservation,
      purchaseMembership,
      addLibraPoints,
      issueBook,
      returnBook,
      wishlist,
      toggleWishlist,
      notifyMe,
      toasts,
      addToast,
      dismissToast,
    }),
    [
      role,
      books,
      rooms,
      students,
      activeStudent,
      notifications,
      bookReservations,
      seatReservations,
      wishlist,
      toasts,
      markNotificationRead,
      markAllRead,
      pushNotification,
      setActiveStudentFields,
      reserveSeat,
      checkInSeat,
      cancelSeatReservation,
      checkOutSeat,
      releaseSeatEarly,
      expireReservation,
      purchaseMembership,
      addLibraPoints,
      issueBook,
      returnBook,
      toggleWishlist,
      notifyMe,
      addToast,
      dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
