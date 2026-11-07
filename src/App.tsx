import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { Navbar } from './components/Navbar.tsx';
import { CustomerSidebar } from './components/CustomerSidebar.tsx';
import { AdminSidebar } from './components/AdminSidebar.tsx';

// Pages
import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { Dashboard } from './pages/customer/Dashboard.tsx';
import { CheckBalance } from './pages/customer/CheckBalance.tsx';
import { Withdraw } from './pages/customer/Withdraw.tsx';
import { Deposit } from './pages/customer/Deposit.tsx';
import { Transfer } from './pages/customer/Transfer.tsx';
import { TransactionHistory } from './pages/customer/TransactionHistory.tsx';
import { AccountDetails } from './pages/customer/AccountDetails.tsx';
import { Notifications } from './pages/customer/Notifications.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { CustomerManagement } from './pages/admin/CustomerManagement.tsx';
import { AccountManagement } from './pages/admin/AccountManagement.tsx';
import { TransactionManagement } from './pages/admin/TransactionManagement.tsx';
import { Reports } from './pages/admin/Reports.tsx';
import { AuditLogs } from './pages/admin/AuditLogs.tsx';
import { AdminProfile } from './pages/admin/AdminProfile.tsx';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Sync default view on authentication changes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (isAdmin && (currentView === 'home' || currentView === 'login' || currentView === 'register' || currentView === 'dashboard')) {
          setCurrentView('admin-dashboard');
        } else if (!isAdmin && (currentView === 'home' || currentView === 'login' || currentView === 'register' || currentView.startsWith('admin-'))) {
          setCurrentView('dashboard');
        }
      } else {
        if (currentView !== 'login' && currentView !== 'register') {
          setCurrentView('home');
        }
      }
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold tracking-wide">
          Connecting to Apex Bank Digital ATM Switch...
        </p>
      </div>
    );
  }

  // Unauthenticated Public Layout (Home, Login, Register)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
        <main className="flex-1">
          {currentView === 'home' && <Home onNavigate={handleNavigate} />}
          {currentView === 'login' && <Login onNavigate={handleNavigate} />}
          {currentView === 'register' && <Register onNavigate={handleNavigate} />}
        </main>
      </div>
    );
  }

  // Authenticated Layout (Customer or Administrator)
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      {/* Top Bar Contract Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex">
        {/* Dynamic Sidebar */}
        {isAdmin ? (
          <AdminSidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        ) : (
          <CustomerSidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 max-w-7xl w-full mx-auto">
          {/* Customer Views */}
          {!isAdmin && (
            <>
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
              {currentView === 'check-balance' && <CheckBalance onNavigate={handleNavigate} />}
              {currentView === 'withdraw' && <Withdraw onNavigate={handleNavigate} />}
              {currentView === 'deposit' && <Deposit onNavigate={handleNavigate} />}
              {currentView === 'transfer' && <Transfer onNavigate={handleNavigate} />}
              {currentView === 'transactions' && <TransactionHistory onNavigate={handleNavigate} />}
              {currentView === 'account-details' && <AccountDetails onNavigate={handleNavigate} />}
              {currentView === 'notifications' && <Notifications onNavigate={handleNavigate} />}
              {currentView === 'settings' && <AccountDetails onNavigate={handleNavigate} />}
            </>
          )}

          {/* Administrator Views */}
          {isAdmin && (
            <>
              {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
              {currentView === 'admin-customers' && <CustomerManagement onNavigate={handleNavigate} />}
              {currentView === 'admin-accounts' && <AccountManagement onNavigate={handleNavigate} />}
              {currentView === 'admin-transactions' && <TransactionManagement onNavigate={handleNavigate} />}
              {currentView === 'admin-reports' && <Reports onNavigate={handleNavigate} />}
              {currentView === 'admin-audit' && <AuditLogs onNavigate={handleNavigate} />}
              {currentView === 'admin-profile' && <AdminProfile onNavigate={handleNavigate} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
