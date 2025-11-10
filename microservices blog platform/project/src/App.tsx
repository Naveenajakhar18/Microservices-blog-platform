import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { PostView } from './pages/PostView';

type Page = 'home' | 'signin' | 'signup' | 'dashboard' | 'editor' | 'post' | 'profile';

interface NavigationData {
  blogId?: string;
  postId?: string;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [navData, setNavData] = useState<NavigationData>({});

  const handleNavigate = (page: string, data?: NavigationData) => {
    setCurrentPage(page as Page);
    if (data) {
      setNavData(data);
    } else {
      setNavData({});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user && (currentPage === 'dashboard' || currentPage === 'editor' || currentPage === 'profile')) {
    setCurrentPage('signin');
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'signin':
        return <SignIn onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'editor':
        return (
          <Editor
            blogId={navData.blogId!}
            postId={navData.postId}
            onNavigate={handleNavigate}
          />
        );
      case 'post':
        return (
          <PostView
            blogId={navData.blogId!}
            postId={navData.postId!}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  if (currentPage === 'editor') {
    return renderPage();
  }

  return (
    <Layout
      currentPage={currentPage === 'home' || currentPage === 'dashboard' || currentPage === 'profile' ? currentPage : undefined}
      onNavigate={handleNavigate}
    >
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
