import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, Phone, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { StyleXDb } from '../lib/db';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please provide your email address.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { user, error: loginErr } = await StyleXDb.signIn(email);
        if (loginErr) {
          setError(loginErr);
        } else if (user) {
          setSuccess('Access approved! Resuming luxury profile session.');
          setTimeout(() => {
            onAuthSuccess(user);
            onClose();
          }, 1200);
        }
      } else {
        if (!fullName) {
          setError('FullName is required for registering.');
          setLoading(false);
          return;
        }
        const { user, error: regErr } = await StyleXDb.signUp(email, fullName, phone);
        if (regErr) {
          setError(regErr);
        } else if (user) {
          setSuccess('Membership registered! Welcome to Style X.');
          setTimeout(() => {
            onAuthSuccess(user);
            onClose();
          }, 1200);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during authorization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-purple-500/20 bg-neutral-950 p-8 shadow-[0_0_50px_rgba(109,40,217,0.15)]"
        >
          {/* Accent Gold Light */}
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-purple-950/40 text-yellow-500 mb-3 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-neutral-100">
              Style X <span className="text-yellow-500 font-light">Portal</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
              {isLogin ? 'Sign in to access your luxury drawer' : 'Enroll as a premium collective member'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-center text-xs text-red-400 leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-green-500/30 bg-green-950/20 p-3 text-center text-xs text-green-400 leading-relaxed"
              >
                {success}
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-yellow-500/40 focus:outline-none focus:ring-1 focus:ring-yellow-500/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* SignUp Specific Fields */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Majestic Name"
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-yellow-500/40 focus:outline-none focus:ring-1 focus:ring-yellow-500/40 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                    Phone Number (WhatsApp Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:border-yellow-500/40 focus:outline-none focus:ring-1 focus:ring-yellow-500/40 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password notice for absolute ease-of-use */}
            {isLogin && (
              <p className="text-[10px] text-neutral-500 leading-normal text-center">
                Note: No system password is required. Entering your registered email instantly logs you into your exclusive portal.
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-purple-800 to-indigo-900 py-3 text-xs font-bold uppercase tracking-widest text-neutral-100 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_15px_rgba(109,40,217,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                {loading ? 'Processing...' : isLogin ? 'Authenticate Access' : 'Create Golden Membership'}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="mt-6 text-center text-xs">
            <span className="text-neutral-400">
              {isLogin ? 'New to the Collective?' : 'Already a registered user?'}
            </span>{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="font-semibold text-yellow-500 hover:text-yellow-400 border-b border-transparent hover:border-yellow-400/50 pb-0.5 transition-all text-xs outline-none cursor-pointer"
            >
              {isLogin ? 'Register Premium Membership' : 'Sign In Now'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
