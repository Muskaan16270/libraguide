import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { BookDetails } from './pages/BookDetails';
import { StudySeats } from './pages/StudySeats';
import { AIAssistant } from './pages/AIAssistant';
import { AIRecommend } from './pages/AIRecommend';
import { Reservations } from './pages/Reservations';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Membership } from './pages/Membership';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { ManageBooks } from './pages/admin/ManageBooks';
import { ManageSeats } from './pages/admin/ManageSeats';
import { ManageStudents } from './pages/admin/ManageStudents';
import { OccupancyMonitor } from './pages/admin/OccupancyMonitor';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  books: 'Books',
  'book-details': 'Book Details',
  seats: 'Study Seats',
  'ai-assistant': 'AI Study Assistant',
  'ai-recommend': 'AI Recommendations',
  reservations: 'My Reservations',
  notifications: 'Notifications',
  profile: 'Profile',
  membership: 'Membership',
  'admin-dashboard': 'Admin Dashboard',
  'admin-books': 'Manage Books',
  'admin-seats': 'Manage Seats',
  'admin-students': 'Students',
  'admin-analytics': 'Analytics',
  'admin-occupancy': 'Occupancy Monitor',
};

function AppContent() {
  const { role } = useApp();
  const [page, setPage] = useState(role === 'admin' ? 'admin-dashboard' : 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookId, setBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const defaultPage = role === 'admin' ? 'admin-dashboard' : 'dashboard';
    setPage(defaultPage);
  }, [role]);

  const navigate = (p: string) => {
    setPage(p);
    setSidebarOpen(false);
    if (p !== 'book-details') setBookId(null);
  };

  const openBook = (id: string) => {
    setBookId(id);
    setPage('book-details');
  };

  const searchBooks = (q: string) => {
    setSearchQuery(q);
    setPage('books');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} onSearch={searchBooks} />;
      case 'books':
        return <Books onOpenBook={openBook} initialQuery={searchQuery} />;
      case 'book-details':
        return bookId ? <BookDetails bookId={bookId} onBack={() => navigate('books')} /> : <Books onOpenBook={openBook} />;
      case 'seats':
        return <StudySeats onNavigate={navigate} />;
      case 'ai-assistant':
        return <AIAssistant onOpenBook={openBook} />;
      case 'ai-recommend':
        return <AIRecommend onOpenBook={openBook} />;
      case 'reservations':
        return <Reservations />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      case 'membership':
        return <Membership onNavigate={navigate} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-analytics':
        return <AdminAnalytics />;
      case 'admin-books':
        return <ManageBooks />;
      case 'admin-seats':
        return <ManageSeats />;
      case 'admin-students':
        return <ManageStudents />;
      case 'admin-occupancy':
        return <OccupancyMonitor />;
      default:
        return <Dashboard onNavigate={navigate} onSearch={searchBooks} />;
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar page={page} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={PAGE_TITLES[page] || 'LibraGuide'} onMenuClick={() => setSidebarOpen(true)} onNavigate={navigate} />
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <div key={page} className="animate-fade-in">
            {renderPage()}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
