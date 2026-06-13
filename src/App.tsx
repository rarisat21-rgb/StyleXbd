import React, { useState, useEffect } from 'react';
import { StyleXDb } from './lib/db';
import { UserProfile } from './types';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import ChatSupport from './components/ChatSupport';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load user session on mount
  useEffect(() => {
    StyleXDb.getCurrentUserProfile().then(profile => {
      if (profile) {
        setUser(profile);
      }
    });
  }, []);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    await StyleXDb.signOut();
    setUser(null);
    setView('store');
  };

  return (
    <div id="stylex-app" className="min-h-screen bg-[#0F0F0F] text-neutral-100 antialiased font-sans">
      {/* View routing: Storefront node or Admin dashboard pane */}
      {view === 'store' ? (
        <Storefront
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenAdmin={() => setView('admin')}
        />
      ) : (
        <AdminPanel
          onBackToStore={() => setView('store')}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Floating active chat bubble support hub */}
      {view === 'store' && (
        <ChatSupport
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Login / registration gate panel overlay */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
