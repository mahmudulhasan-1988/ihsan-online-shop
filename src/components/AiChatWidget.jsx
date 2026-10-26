'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RotateCcw,
  ShoppingBag,
  Zap,
  ArrowRight,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  Truck,
  PhoneCall
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { sendAiChatMessage, getAiChatHistory, clearAiChatHistory } from '@/lib/api';

export default function AiChatWidget() {
  const pathname = usePathname();
  const { isAiChatOpen, openAiChat, closeAiChat, toggleAiChat, aiInitialPrompt, setAiInitialPrompt, openFastOrder, user } = useCart();
  const { isBangla, isDark } = useThemeLanguage();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quickReplies, setQuickReplies] = useState([
    '🍯 খাঁটি মধুর দাম কত?',
    '🧈 গাওয়া ঘি ও সরিষার তেল',
    '🌴 মদিনার আজওয়া খেজুর',
    '🚚 ডেলিভারি চার্জ কত?',
    '📦 অর্ডার কিভাবে করব?'
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Exclude dashboard / admin pages from floating AI chat
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard');

  // Generate or retrieve persistent Session ID
  useEffect(() => {
    try {
      let savedSession = localStorage.getItem('ihsan_ai_chat_session');
      if (!savedSession) {
        savedSession = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('ihsan_ai_chat_session', savedSession);
      }
      setSessionId(savedSession);
    } catch (e) {
      setSessionId('sess_' + Date.now());
    }
  }, []);

  // Play subtle synthesized audio beep
  const playSound = (type = 'receive') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'send') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Audio autoplay policy ignored safely
    }
  };

  // Load chat history from MongoDB on initial mount once sessionId is ready
  useEffect(() => {
    if (!sessionId) return;
    const fetchHistory = async () => {
      try {
        const res = await getAiChatHistory(sessionId);
        if (res?.success && Array.isArray(res.history) && res.history.length > 0) {
          const loaded = [];
          res.history.forEach(h => {
            if (h.userMessage) {
              loaded.push({
                id: 'u_' + (h._id || Math.random()),
                sender: 'user',
                text: h.userMessage,
                timestamp: h.createdAt ? new Date(h.createdAt).toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : ''
              });
            }
            if (h.aiReply) {
              loaded.push({
                id: 'ai_' + (h._id || Math.random()),
                sender: 'ai',
                text: h.aiReply,
                suggestedProducts: h.suggestedProducts || [],
                timestamp: h.createdAt ? new Date(h.createdAt).toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : ''
              });
            }
          });
          setMessages(loaded);
        } else {
          // Default Welcome greeting
          setMessages([
            {
              id: 'welcome_1',
              sender: 'ai',
              text: isBangla
                ? 'আসসালামু আলাইকুম! ইহসান অনলাইন শপের স্মার্ট AI অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম। 🌿\n\nসুন্দরবনের খাঁটি মধু, দেশি গাওয়া ঘি, ঘানি ভাঙা সরিষার তেল, মদিনার আজওয়া খেজুরসহ যেকোনো পণ্যের দাম, স্টক বা ডেলিভারি সম্পর্কে জানতে যেকোনো প্রশ্ন করতে পারেন!'
                : 'Welcome to Ihsan Online Shop AI Assistant! 🌿\n\nFeel free to ask me anything about our organic products, prices, stock, delivery charges, or ordering process.',
              suggestedProducts: [],
              timestamp: new Date().toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    fetchHistory();
  }, [sessionId, isBangla]);

  // Handle external open with prompt (e.g. from Header or product page)
  useEffect(() => {
    if (aiInitialPrompt && isAiChatOpen) {
      handleSendMessage(aiInitialPrompt);
      setAiInitialPrompt('');
    }
  }, [aiInitialPrompt, isAiChatOpen]);

  // Auto scroll to bottom only on new messages or on open
  const prevMsgCountRef = useRef(0);

  useEffect(() => {
    if (isAiChatOpen) {
      if (messages.length > prevMsgCountRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      prevMsgCountRef.current = messages.length;
    }
  }, [messages.length, isAiChatOpen]);

  useEffect(() => {
    if (isAiChatOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isAiChatOpen]);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isBangla ? 'bn-BD' : 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [isBangla]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert(isBangla ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই।' : 'Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Send message to Backend + MongoDB
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsgObj = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputText('');
    setIsLoading(true);
    playSound('send');

    try {
      const res = await sendAiChatMessage({
        message: query,
        sessionId,
        userId: user?.id || user?._id || null,
        userName: user?.name || 'Customer',
        lang: isBangla ? 'bn' : 'en'
      });

      if (res?.success) {
        const aiMsgObj = {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: res.reply || (isBangla ? 'আমি আপনার প্রশ্নের উত্তর প্রস্তুত করতে পারিনি।' : 'Could not generate reply.'),
          suggestedProducts: res.suggestedProducts || [],
          timestamp: new Date().toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsgObj]);
        if (Array.isArray(res.quickReplies) && res.quickReplies.length > 0) {
          setQuickReplies(res.quickReplies);
        }
        playSound('receive');
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err_' + Date.now(),
            sender: 'ai',
            text: res?.message || (isBangla ? 'দুঃখিত, সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Connection error. Please try again.'),
            suggestedProducts: [],
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: isBangla ? 'সার্ভারের সাথে যোগাযোগে বিঘ্ন ঘটেছে।' : 'Failed to connect to AI server.',
          suggestedProducts: [],
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    if (!window.confirm(isBangla ? 'আপনি কি চ্যাট হিস্ট্রি মুছে ফেলতে চান?' : 'Clear all chat history?')) return;
    try {
      await clearAiChatHistory(sessionId);
      setMessages([
        {
          id: 'welcome_reset',
          sender: 'ai',
          text: isBangla ? 'চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে। পণ্য সংক্রান্ত নতুন যেকোনো প্রশ্ন করতে পারেন।' : 'Chat history cleared. You can ask fresh questions.',
          suggestedProducts: [],
          timestamp: new Date().toLocaleTimeString(isBangla ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      // silent
    }
  };

  if (isDashboard) return null;

  return (
    <>
      {/* 🌟 FLOATING TRIGGER BUTTON - Positioned at bottom-right, slightly up from the bottom */}
      <aside
        aria-label="AI Auto Chat Assistant"
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 print:hidden select-none"
      >
        <button
          onClick={toggleAiChat}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-brand-950 via-emerald-800 to-teal-950 hover:from-black hover:to-emerald-900 text-white pl-3.5 pr-4 py-3 rounded-full shadow-2xl border-2 border-emerald-400/50 hover:border-amber-400 hover:shadow-emerald-900/50 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl"
          title={isBangla ? 'পণ্য বা দাম জানতে AI-কে প্রশ্ন করুন' : 'Ask AI about products & pricing'}
          aria-label="Open AI Assistant Chat"
        >
          {/* Animated Glow Aura Ring */}
          <span className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 via-amber-400/30 to-teal-400/40 rounded-full blur-md opacity-70 group-hover:opacity-100 animate-pulse -z-10" />

          {/* Bot Icon with glowing badge */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-secondary to-yellow-300 text-brand-950 flex items-center justify-center shadow-md transform group-hover:rotate-12 transition-transform">
              <Bot className="w-5 h-5 text-brand-950" />
            </div>
            {/* Online Green Pulsing Indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          {/* Text Labels */}
          <div className="flex flex-col text-left leading-none">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                {isBangla ? 'AI চ্যাট' : 'AI Assistant'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            </div>
            <span className="text-[10px] text-emerald-200/90 font-medium mt-0.5">
              {isBangla ? 'পণ্যের তথ্য ও দাম' : 'Ask Any Question'}
            </span>
          </div>
        </button>
      </aside>

      {/* 🌟 SLIDING CHAT WINDOW MODAL */}
      {isAiChatOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-lenis-prevent="true"
          className="lenis-prevent fixed bottom-4 right-2 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[430px] h-[600px] max-h-[85vh] flex flex-col bg-white/95 dark:bg-[#0c1a12]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-emerald-500/30 dark:border-emerald-500/20 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          {/* Top Bar / Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-secondary to-yellow-300 text-brand-950 flex items-center justify-center shadow-lg border border-amber-300">
                  <Bot className="w-6 h-6 text-brand-950" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-brand-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                    {isBangla ? 'ইহসান AI শপিং অ্যাসিস্ট্যান্ট' : 'Ihsan AI Shopping Assistant'}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-200/90 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isBangla ? 'অনলাইন • সরাসরি পণ্য ও দাম জানুন' : 'Online • Instant Product & Price Info'}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title={isBangla ? 'চ্যাট মুছুন' : 'Clear Chat'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={closeAiChat}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title={isBangla ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="flex-shrink-0 bg-emerald-50/90 dark:bg-[#12281b] border-b border-emerald-100 dark:border-[#1d3d29] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-brand-900 dark:text-emerald-300 font-medium">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isBangla ? 'সারাদেশে ক্যাশ অন ডেলিভারি' : 'Cash on Delivery Nationwide'}</span>
            </span>
            <a href="tel:09611-562080" className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 hover:underline font-bold">
              <PhoneCall className="w-3 h-3 text-secondary animate-pulse" />
              <span>09611-562080</span>
            </a>
          </div>

          {/* Messages Scroll Area */}
          <div
            tabIndex={0}
            data-lenis-prevent="true"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
            className="lenis-prevent flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3.5 select-text touch-pan-y scrollbar-thin scrollbar-thumb-emerald-400 dark:scrollbar-thumb-emerald-600"
            style={{
              overflowY: 'auto',
              maxHeight: '100%',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
          >
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-800 to-emerald-900 text-white flex items-center justify-center text-xs flex-shrink-0 shadow-sm mt-1">
                      <Bot className="w-4 h-4 text-amber-300" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        isAi
                          ? 'bg-[#f4f8f5] dark:bg-[#13281c] text-gray-900 dark:text-gray-100 rounded-tl-sm border border-[#e1ece2] dark:border-[#22442e]'
                          : 'bg-gradient-to-r from-brand-900 to-emerald-800 text-white rounded-tr-sm shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Interactive Product Suggestion Cards (MongoDB Products) */}
                    {isAi && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {isBangla ? '🛒 সরাসরি অর্ডারের জন্য পণ্যসমূহ:' : '🛒 Matching Products from Store:'}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestedProducts.map((p, idx) => (
                            <div
                              key={p.id || p._id || idx}
                              className="flex items-center gap-2.5 p-2 bg-white dark:bg-[#162f21] rounded-2xl border border-emerald-100 dark:border-[#244b34] shadow-sm hover:shadow-md transition-all group"
                            >
                              <img
                                src={p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=200&q=80'}
                                alt={p.name}
                                className="w-14 h-14 object-cover rounded-xl border border-gray-100 dark:border-[#21432e] flex-shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {isBangla ? p.name : (p.nameEn || p.name)}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs font-black text-brand-900 dark:text-amber-400">
                                    ৳ {p.price}
                                  </span>
                                  {p.regularPrice > p.price && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      ৳ {p.regularPrice}
                                    </span>
                                  )}
                                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-md font-semibold">
                                    {p.unit || '১ কেজি'}
                                  </span>
                                </div>

                                {/* Buttons: Fast Order + View */}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <button
                                    onClick={() => {
                                      closeAiChat();
                                      openFastOrder(p);
                                    }}
                                    className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-brand-950 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-sm transition-transform active:scale-95"
                                  >
                                    <Zap className="w-3 h-3 fill-brand-950" />
                                    <span>{isBangla ? '১-ক্লিক অর্ডার' : 'Fast Order'}</span>
                                  </button>

                                  <Link
                                    href={`/product/${p.slug || p.id || p._id}`}
                                    onClick={closeAiChat}
                                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline px-2 py-1"
                                  >
                                    <span>{isBangla ? 'বিস্তারিত' : 'View'}</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-[10px] text-gray-400 dark:text-gray-500 px-1 ${isAi ? 'text-left' : 'text-right'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-9">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {isBangla ? 'AI উত্তর লিখছে...' : 'AI is typing...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {quickReplies.length > 0 && (
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="lenis-prevent flex-shrink-0 p-2 bg-gray-50/90 dark:bg-[#0e2115] border-t border-gray-100 dark:border-[#1d3d29] flex items-center gap-1.5 overflow-x-auto no-scrollbar overscroll-contain"
              style={{
                overflowX: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qr)}
                  className="flex-shrink-0 text-[11px] bg-white dark:bg-[#163022] hover:bg-emerald-50 dark:hover:bg-[#1f422f] text-gray-700 dark:text-emerald-200 border border-gray-200 dark:border-[#274f36] px-2.5 py-1 rounded-full font-medium transition-colors shadow-2xs whitespace-nowrap"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Input Area */}
          <div className="flex-shrink-0 p-2.5 sm:p-3 bg-white dark:bg-[#0c1a12] border-t border-gray-100 dark:border-[#1b3826]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice recognition toggle */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-2xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-[#14291d] text-gray-600 dark:text-gray-300 hover:text-brand-800 dark:hover:text-emerald-400'
                }`}
                title={isListening ? 'কথা বলা শেষ করুন' : 'মুখে বলুন (Voice Input)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isBangla ? 'পণ্যের নাম, দাম বা প্রশ্ন লিখুন...' : 'Ask about products, price, stock...'}
                className="flex-1 bg-[#f4f7f4] dark:bg-[#14291d] border border-gray-200 dark:border-[#22442e] text-gray-900 dark:text-white rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-900 to-emerald-800 hover:from-brand-950 hover:to-emerald-900 disabled:opacity-40 text-white font-bold transition-all shadow-md transform active:scale-95 flex-shrink-0"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Scoped Scrollbar Styling for Chat Widget */}
      <style jsx>{`
        .lenis-prevent::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .lenis-prevent::-webkit-scrollbar-track {
          background: transparent;
        }
        .lenis-prevent::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.4);
          border-radius: 9999px;
        }
        .lenis-prevent::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </>
  );
}
