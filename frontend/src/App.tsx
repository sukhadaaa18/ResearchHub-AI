import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SearchPapers from './components/SearchPapers';
import Workspace from './components/Workspace';
import Chatbot from './components/Chatbot';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} onLogout={handleLogout} />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route
              path="/dashboard"
              element={
                <AuthenticatedLayout onLogout={handleLogout}>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/search"
              element={
                <AuthenticatedLayout onLogout={handleLogout}>
                  <SearchPapers workspaceId={selectedWorkspace} />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/workspace"
              element={
                <AuthenticatedLayout onLogout={handleLogout}>
                  <Workspace onSelectWorkspace={setSelectedWorkspace} />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/chat"
              element={
                <AuthenticatedLayout onLogout={handleLogout}>
                  <Chatbot workspaceId={selectedWorkspace} />
                </AuthenticatedLayout>
              }
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

// Authenticated Layout Component
const AuthenticatedLayout: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({
  children,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">ResearchHub AI</h1>
                <p className="text-xs text-slate-500">Intelligent Research Assistant</p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <Link to="/dashboard" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/search" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">
                Search Papers
              </Link>
              <Link to="/workspace" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">
                Workspaces
              </Link>
              <Link to="/chat" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">
                AI Chat
              </Link>

              <button
                onClick={onLogout}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">{children}</div>
    </div>
  );
};

export default App;