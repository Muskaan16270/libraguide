// Domain types for LibraGuide

export type Role = 'student' | 'admin';

export type BookStatus = 'available' | 'issued' | 'reserved';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Book {
  id: string;
  title: string;
  author: string;
  subject: Subject;
  isbn: string;
  description: string;
  difficulty: Difficulty;
  rating: number;
  ratingsCount: number;
  totalCopies: number;
  availableCopies: number;
  location: BookLocation;
  coverColors: [string, string];
  coverAccent: string;
  tags: string[];
  borrowCount: number;
  searchCount: number;
  publishedYear: number;
  pages: number;
}

export interface BookLocation {
  block: string;
  room: string;
  shelf: number;
  row: number;
}

export type Subject =
  | 'Programming'
  | 'AI/ML'
  | 'Data Science'
  | 'Mathematics'
  | 'Physics'
  | 'Electronics'
  | 'Web Development'
  | 'Cybersecurity';

export interface ReadingRoom {
  id: string;
  name: string;
  totalSeats: number;
  occupiedSeats: number;
  reservedSeats: number;
  floor: number;
  silenceLevel: 'Silent' | 'Quiet' | 'Discussion';
  seats: Seat[];
}

export type SeatState = 'available' | 'occupied' | 'reserved' | 'selected' | 'unavailable' | 'awaiting-checkin' | 'checked-in' | 'released' | 'expired';

export interface Seat {
  id: string;
  roomId: string;
  number: number;
  state: SeatState;
  hasPower: boolean;
  nearWindow: boolean;
  isMemberPriority?: boolean;
}

export interface SeatReservation {
  id: string;
  seatId: string;
  seatNumber: number;
  roomId: string;
  roomName: string;
  studentId: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'checked-in' | 'completed' | 'expired' | 'cancelled' | 'released';
  createdAt: string;
  isMemberPriority?: boolean;
  checkInDeadline?: string;
  releasedReason?: string;
}

export interface BookReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  dueDate: string;
  status: 'issued' | 'returned' | 'reserved' | 'overdue';
}

export interface Notification {
  id: string;
  type: 'reservation' | 'expiry' | 'return' | 'available' | 'recommendation' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  year: number;
  avatarColors: [string, string];
  initials: string;
  interests: Subject[];
  booksIssued: number;
  booksReturned: number;
  seatsReserved: number;
  studyHours: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  membership: Membership;
  libraPoints: number;
  pointHistory: PointEntry[];
  usageStats: UsageStats;
}

export interface Membership {
  status: 'active' | 'inactive' | 'none';
  startDate?: string;
  expiryDate?: string;
  monthlyFee: number;
}

export interface PointEntry {
  id: string;
  amount: number;
  reason: string;
  category: 'check-in' | 'checkout' | 'early-release' | 'no-show' | 'misuse' | 'completion';
  timestamp: string;
}

export interface UsageStats {
  totalReservations: number;
  successfulCheckIns: number;
  earlyReleases: number;
  noShows: number;
}

export type PriorityLevel = 'Standard' | 'High' | 'Very High';

export function getPriorityLevel(points: number): PriorityLevel {
  if (points >= 250) return 'Very High';
  if (points >= 100) return 'High';
  return 'Standard';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: Book[];
}

export interface OccupancyPoint {
  hour: number;
  label: string;
  occupancy: number;
  predicted?: boolean;
}

export interface AnalyticsData {
  visitorsThisWeek: { day: string; count: number }[];
  occupancyByHour: OccupancyPoint[];
  mostBorrowed: { title: string; count: number }[];
  mostSearched: { title: string; count: number }[];
  popularSubjects: { subject: Subject; count: number }[];
  monthlyUsage: { month: string; visits: number; borrows: number }[];
  peakHours: { label: string; count: number }[];
  frequentlyUnavailable: { title: string; author: string; searches: number }[];
}
