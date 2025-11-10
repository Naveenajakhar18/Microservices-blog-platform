import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PenSquare, LogOut, Home, BookOpen, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage?: 'home' | 'dashboard' | 'profile';
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-2xl font-bold text-slate-800 hover:text-slate-600 transition-colors"
              >
                <PenSquare className="w-8 h-8 text-blue-600" />
                <span>BlogSpace</span>
              </button>

              {user && (
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={() => onNavigate('home')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'home'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === 'dashboard'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>My Blogs</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('profile')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 'profile'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{profile?.display_name}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('signin')}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2025 BlogSpace. A modern blogging platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
