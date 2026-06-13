import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Shield, Headset, Circle } from 'lucide-react';
import { StyleXDb } from '../lib/db';
import { Chat, ChatMessage, UserProfile } from '../types';

interface ChatSupportProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export default function ChatSupport({ user, onOpenAuth }: ChatSupportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat directory
  useEffect(() => {
    if (user && isOpen) {
      loadChat();
    }
  }, [user, isOpen]);

  const loadChat = async () => {
    if (!user) return;
    try {
      const activeChat = await StyleXDb.getUserChat(user.id);
      setChat(activeChat);
      const history = await StyleXDb.getChatMessages(activeChat.id);
      setMessages(history);
    } catch (err) {
      console.error('Error fetching chat nodes:', err);
    }
  };

  // Subscribe to virtual response broadcast events dispatched by our db layer
  useEffect(() => {
    const handleNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail as ChatMessage;
      if (chat && detail.chat_id === chat.id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => {
            // Check for duplicates
            if (prev.some(m => m.id === detail.id)) return prev;
            return [...prev, detail];
          });
        }, 1000);
      }
    };

    window.addEventListener('stylex_new_message', handleNewMessage);
    return () => {
      window.removeEventListener('stylex_new_message', handleNewMessage);
    };
  }, [chat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    let activeChat = chat;
    if (!activeChat) {
      activeChat = await StyleXDb.getUserChat(user.id);
      setChat(activeChat);
    }

    const textToSend = inputValue.trim();
    setInputValue('');

    try {
      // Send user message
      const sent = await StyleXDb.sendChatMessage(
        activeChat.id,
        user.id,
        user.role,
        textToSend
      );

      setMessages(prev => [...prev, sent]);

      // Emulate typing status during administrative triage
      setLocalStorageTyping(true);
    } catch (err) {
      console.error('Error sending support node:', err);
    }
  };

  const setLocalStorageTyping = (typing: boolean) => {
    if (typing) {
      setTimeout(() => setIsTyping(true), 400);
      setTimeout(() => setIsTyping(false), 2400);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Floating Chat Bubble Toggle */}
      <motion.button
        id="support-chat-toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-700 to-yellow-600 text-white shadow-[0_4px_25px_rgba(109,40,217,0.4)] cursor-pointer outline-none border border-yellow-500/30"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={20} />
              {!user && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="support-chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="mb-4 w-[340px] h-[460px] flex flex-col overflow-hidden rounded-2xl border border-purple-500/25 bg-neutral-950 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 to-purple-950/50 border-b border-purple-500/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-purple-900/40 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Headset size={18} />
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-neutral-950" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-100 flex items-center gap-1">
                    Style X Concierge
                  </h3>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wide flex items-center gap-1">
                    <Shield size={9} className="text-yellow-500" /> Secure Live Channel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950 text-xs">
              {/* Informational Welcome Message */}
              <div className="flex gap-2 max-w-[85%]">
                <div className="h-6 w-6 rounded-full bg-purple-900/30 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 text-[10px] font-bold">
                  SX
                </div>
                <div className="p-3 rounded-2xl rounded-tl-none bg-neutral-900/60 border border-neutral-800 text-neutral-300 leading-relaxed">
                  Welcome to the exclusive <strong>Style X Concierge</strong>. Place orders, request size alterations, or track local shipments instantly.
                </div>
              </div>

              {!user && (
                <div className="p-4 rounded-xl border border-yellow-500/15 bg-yellow-500/5 text-center my-2 space-y-2">
                  <p className="text-[10px] text-neutral-400 leading-normal uppercase tracking-wider">
                    Sign in to sync your purchase logs and unlock dedicated support agents.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuth();
                    }}
                    className="inline-flex rounded-lg bg-yellow-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#0F0F0F] hover:bg-yellow-400 transition-colors cursor-pointer"
                  >
                    Authenticate Portal
                  </button>
                </div>
              )}

              {/* Chat history list */}
              {user && messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAdmin && (
                      <div className="h-6 w-6 rounded-full bg-[#1A1A1A] border border-yellow-500/30 flex items-center justify-center text-yellow-500 shrink-0 text-[9px] font-semibold">
                        AD
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl leading-relaxed ${
                        isAdmin
                          ? 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-200 rounded-tl-none'
                          : 'bg-gradient-to-tr from-purple-900/80 to-indigo-950/80 border border-purple-500/15 text-neutral-100 rounded-tr-none'
                      }`}
                    >
                      {msg.message}
                      <span className="block text-[8px] text-neutral-500 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 justify-start items-center">
                  <div className="h-6 w-6 rounded-full bg-neutral-900 border border-purple-500/20 flex items-center justify-center text-yellow-500 shrink-0 text-[9px] font-bold">
                    SX
                  </div>
                  <div className="bg-neutral-900/60 p-3 rounded-2xl rounded-tl-none border border-neutral-800/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 bg-neutral-900/40 border-t border-purple-500/10 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={user ? "Type your prompt..." : "Log in to respond..."}
                disabled={!user}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!user || !inputValue.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-800 text-white hover:bg-purple-700 disabled:opacity-45 transition-all shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
