import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { POSPage } from './pages/POSPage';
import { CustomerPointsPage } from './pages/CustomerPointsPage';
import { RewardCatalogPage } from './pages/RewardCatalogPage';
import { StaffAttendancePage } from './pages/StaffAttendancePage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminPackagesPage } from './pages/AdminPackagesPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminFinancePage } from './pages/AdminFinancePage';

export function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kinderfun_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Show Login Page by default if no active session
  });

  const handleSwitchRole = (newRole) => {
    setUser((prev) => {
      const updated = {
        ...(prev || { id: 1, email: 'admin@kinderfun.com' }),
        role: newRole,
        name: newRole === 'admin' ? 'Admin Kinderfun' : 'Staff Kasir 1'
      };
      localStorage.setItem('kinderfun_user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('kinderfun_token');
    localStorage.removeItem('kinderfun_user');
    setUser(null);
  };

  // Render Login Page if unauthenticated
  if (!user) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }
          }}
        />
        <LoginPage onLoginSuccess={setUser} />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex bg-slate-100">
        {/* Toast Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }
          }}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            user={user}
            onSwitchRole={handleSwitchRole}
          />

          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<POSPage user={user} />} />
              <Route path="/customers" element={<CustomerPointsPage />} />
              <Route path="/rewards" element={<RewardCatalogPage user={user} />} />
              <Route path="/attendance" element={<StaffAttendancePage user={user} />} />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/staff"
                element={user.role === 'admin' ? <AdminStaffPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/admin/packages"
                element={user.role === 'admin' ? <AdminPackagesPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/admin/reports"
                element={user.role === 'admin' ? <AdminReportsPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/admin/finance"
                element={user.role === 'admin' ? <AdminFinancePage /> : <Navigate to="/" replace />}
              />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
