import type { Book, Difficulty, Subject } from '../types';

const SUBJECT_KEYWORDS: Record<string, Subject[]> = {
  python: ['Programming', 'Data Science'],
  javascript: ['Web Development'],
  'machine learning': ['AI/ML'],
  ml: ['AI/ML'],
  'deep learning': ['AI/ML'],
  ai: ['AI/ML'],
  'artificial intelligence': ['AI/ML'],
  algorithms: ['Programming'],
  'data structures': ['Programming'],
  'data science': ['Data Science'],
  pandas: ['Data Science'],
  numpy: ['Data Science'],
  mathematics: ['Mathematics'],
  'linear algebra': ['Mathematics'],
  calculus: ['Mathematics'],
  'discrete math': ['Mathematics'],
  physics: ['Physics'],
  electrodynamics: ['Physics'],
  electronics: ['Electronics'],
  circuits: ['Electronics'],
  'web development': ['Web Development'],
  react: ['Web Development'],
  node: ['Web Development'],
  cybersecurity: ['Cybersecurity'],
  security: ['Cybersecurity'],
  hacking: ['Cybersecurity'],
  cryptography: ['Cybersecurity', 'Mathematics'],
  'web app': ['Web Development'],
};

const DIFFICULTY_KEYWORDS: Record<string, Difficulty> = {
  beginner: 'Beginner',
  easy: 'Beginner',
  start: 'Beginner',
  starting: 'Beginner',
  introduction: 'Beginner',
  intro: 'Beginner',
  fundamentals: 'Beginner',
  intermediate: 'Intermediate',
  medium: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Advanced',
};

export interface BookRecommendation {
  book: Book;
  reason: string;
  order: number;
}

export function recommendBooks(
  query: string,
  allBooks: Book[],
  interests: Subject[] = [],
): BookRecommendation[] {
  const q = query.toLowerCase();

  const matchedSubjects = new Set<Subject>();
  for (const [kw, subs] of Object.entries(SUBJECT_KEYWORDS)) {
    if (q.includes(kw)) subs.forEach((s) => matchedSubjects.add(s));
  }
  // also include user interests if query is generic
  if (matchedSubjects.size === 0 && interests.length > 0) {
    interests.forEach((s) => matchedSubjects.add(s));
  }
  // direct subject match
  (Object.values(allBooks[0] ? ['Programming', 'AI/ML', 'Data Science', 'Mathematics', 'Physics', 'Electronics', 'Web Development', 'Cybersecurity'] : []) as Subject[]).forEach((s) => {
    if (q.includes(s.toLowerCase())) matchedSubjects.add(s);
  });

  const targetDifficulty: Difficulty | undefined = Object.entries(DIFFICULTY_KEYWORDS).find(
    ([kw]) => q.includes(kw),
  )?.[1];

  let candidates = allBooks.filter((b) => matchedSubjects.has(b.subject));

  if (candidates.length === 0) {
    candidates = allBooks.filter((b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.tags.some((t) => q.includes(t.toLowerCase())),
    );
  }

  if (candidates.length === 0) {
    return [];
  }

  const difficultyOrder: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };
  const sorted = [...candidates].sort((a, b) => {
    if (targetDifficulty) {
      const da = Math.abs(difficultyOrder[a.difficulty] - difficultyOrder[targetDifficulty]);
      const db = Math.abs(difficultyOrder[b.difficulty] - difficultyOrder[targetDifficulty]);
      if (da !== db) return da - db;
    } else {
      // ascending difficulty for learning paths
      if (difficultyOrder[a.difficulty] !== difficultyOrder[b.difficulty]) {
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
    }
    return b.rating - a.rating;
  });

  const top = sorted.slice(0, 5);

  return top.map((book, i) => {
    let reason = '';
    if (i === 0 && !targetDifficulty) {
      reason = `Recommended as a starting point for learning ${book.subject}. Covers fundamentals in a beginner-friendly way.`;
    } else if (targetDifficulty) {
      reason = `Matches your request for a ${targetDifficulty.toLowerCase()}-level resource in ${book.subject}. Highly rated by students.`;
    } else {
      reason = `Recommended as your next step after understanding the fundamentals of ${book.subject}. Builds on prior concepts.`;
    }
    if (book.availableCopies > 0) {
      reason += ' Currently available in the library.';
    } else {
      reason += ' Currently issued — you can join the waitlist.';
    }
    return { book, reason, order: i + 1 };
  });
}

export function generateAssistantResponse(
  query: string,
  allBooks: Book[],
  rooms: { name: string; totalSeats: number; occupiedSeats: number; reservedSeats: number }[],
  interests: Subject[] = [],
): { content: string; recommendations?: Book[] } {
  const q = query.toLowerCase();

  // Seat / occupancy queries
  if (q.includes('crowd') || q.includes('occup') || q.includes('reading room') || q.includes('seat') || q.includes('vacant') || q.includes('empty')) {
    const roomMentions = rooms.filter((r) => q.includes(r.name.toLowerCase().replace('reading room ', 'room ')) || q.includes(r.name.toLowerCase()));
    const targetRooms = roomMentions.length > 0 ? roomMentions : rooms;
    const lines = targetRooms.map((r) => {
      const pct = Math.round((r.occupiedSeats / r.totalSeats) * 100);
      const avail = r.totalSeats - r.occupiedSeats - r.reservedSeats;
      const vibe = pct < 50 ? 'a good time to visit' : pct < 80 ? 'getting busy' : 'quite crowded';
      return `• **${r.name}**: ${pct}% occupied (${avail} seats free) — ${vibe}.`;
    });
    const bestRoom = [...targetRooms].sort(
      (a, b) => a.occupiedSeats / a.totalSeats - b.occupiedSeats / b.totalSeats,
    )[0];
    const bestPct = Math.round((bestRoom.occupiedSeats / bestRoom.totalSeats) * 100);
    return {
      content: `Here's the current seat availability:\n\n${lines.join('\n')}\n\n**${bestRoom.name}** is your best bet right now at ${bestPct}% occupancy. You can reserve a seat from the Study Seats page to guarantee your spot.`,
    };
  }

  // Book location queries
  if (q.includes('where') && (q.includes('find') || q.includes('locate') || q.includes('book'))) {
    const matched = matchBooks(q, allBooks);
    if (matched.length > 0) {
      const b = matched[0];
      return {
        content: `**${b.title}** by ${b.author} is located at:\n\n${b.location.block} → ${b.location.room} → Shelf ${b.location.shelf} → Row ${b.location.row}\n\n${b.availableCopies > 0 ? `It's currently available (${b.availableCopies} of ${b.totalCopies} copies on shelf).` : `It's currently issued — all ${b.totalCopies} copies are out. You can join the notify list.`}`,
        recommendations: [b],
      };
    }
  }

  // Recommendation queries
  if (q.includes('recommend') || q.includes('suggest') || q.includes('best book') || q.includes('help me learn') || q.includes('want to learn') || q.includes('which book')) {
    const recs = recommendBooks(query, allBooks, interests);
    if (recs.length > 0) {
      const lines = recs.map(
        (r) => `${r.order}. **${r.book.title}** — ${r.book.difficulty}, ${r.book.availableCopies > 0 ? 'Available' : 'Issued'}\n   ${r.reason}`,
      );
      return {
        content: `Based on your query, here's a suggested learning path:\n\n${lines.join('\n\n')}\n\nYou can check out the AI Book Recommendation page for a more detailed breakdown.`,
        recommendations: recs.map((r) => r.book),
      };
    }
  }

  // Find/availability queries
  if (q.includes('find') || q.includes('available') || q.includes('show me') || q.includes('list')) {
    const matched = matchBooks(q, allBooks);
    if (matched.length > 0) {
      const lines = matched.slice(0, 5).map(
        (b) => `• **${b.title}** by ${b.author} — ${b.availableCopies > 0 ? `Available (${b.availableCopies}/${b.totalCopies})` : 'Issued'} — ${b.location.room}, Shelf ${b.location.shelf}`,
      );
      return {
        content: `I found ${matched.length} matching book${matched.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}\n\nHead to the Books page for full details and locations.`,
        recommendations: matched.slice(0, 5),
      };
    }
  }

  // Generic fallback
  const matched = matchBooks(q, allBooks);
  if (matched.length > 0) {
    return {
      content: `Here's what I found related to "${query}":\n\n${matched.slice(0, 3).map((b) => `• **${b.title}** — ${b.subject}, ${b.difficulty}`).join('\n')}\n\nTry asking about seat availability, book locations, or recommendations for a specific topic.`,
      recommendations: matched.slice(0, 3),
    };
  }

  return {
    content: `I'm your library study assistant. I can help you:\n\n• Find books by subject, author, or title\n• Locate a book's exact shelf and row\n• Check reading room occupancy\n• Recommend books for your learning goals\n\nTry asking: "Recommend a beginner book for Machine Learning" or "Is Reading Room 2 crowded?"`,
  };
}

function matchBooks(q: string, allBooks: Book[]): Book[] {
  const scored = allBooks
    .map((b) => {
      let score = 0;
      const title = b.title.toLowerCase();
      const author = b.author.toLowerCase();
      if (title.includes(q)) score += 10;
      if (author.includes(q)) score += 8;
      b.tags.forEach((t) => {
        if (q.includes(t.toLowerCase())) score += 5;
      });
      if (q.includes(b.subject.toLowerCase())) score += 6;
      // word-level title match
      const qWords = q.split(/\s+/).filter((w) => w.length > 3);
      qWords.forEach((w) => {
        if (title.includes(w)) score += 2;
        if (author.includes(w)) score += 1;
      });
      return { b, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.b);
}

export const SUGGESTED_PROMPTS = [
  { label: 'Find a book', text: 'Where can I find Python books?', icon: 'search' },
  { label: 'Find a seat', text: 'Is Reading Room 2 crowded right now?', icon: 'armchair' },
  { label: 'Recommend resources', text: 'Recommend a beginner book for Machine Learning', icon: 'sparkles' },
  { label: 'Help me choose', text: 'Which books can help me learn Data Structures?', icon: 'book-open' },
];
