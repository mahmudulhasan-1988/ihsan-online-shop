'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Heart, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import { getPopupMessage } from '@/lib/api';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function PopupMessage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isBangla } = useThemeLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't show inside admin or dashboard routes to avoid disrupting management
    if (pathname?.startsWith('/admin')) {
      return;
    }

    let isMounted = true;
    async function fetchPopup() {
      try {
        const res = await getPopupMessage();
        if (isMounted && res?.success && res?.data) {
          setPopupData(res.data);
          if (res.data.isActive !== false) {
            // Slight delay for smooth entrance transition after page load/refresh
            const timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, 600);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.error('Failed to load popup notice', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPopup();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !popupData || popupData.isActive === false) {
    return null;
  }

  const title = isBangla
    ? popupData.title || 'ইহসান অনলাইন শপ'
    : popupData.titleEn || popupData.title || 'Ihsan Online Shop';

  const badge = isBangla
    ? popupData.badge || '🇵🇸 ফিলিস্তিন ও মানবতার কল্যাণে অনুদান'
    : popupData.badgeEn || popupData.badge || '🇵🇸 Palestine & Humanity Relief Support';

  const message = isBangla
    ? popupData.message ||
      '‘ইহসান অনলাইন শপ’ এর ব্যবসায়িক লাভের কিছু অংশ ফিলিস্তিনের মাজলুম পরিবারের জন্য এবং অসহায় দুস্থদের সহায়তার জন্য ব্যয় করা হয়। তাই ‘ইহসান অনলাইন শপ’ এই ফ্যামিলির সাথে যুক্ত হয়ে অসহায় দুস্থদের সহায়তার জন্য পাশে থাকুন।'
    : popupData.messageEn ||
      popupData.message ||
      'A portion of the profits from "Ihsan Online Shop" is dedicated to supporting the oppressed families of Palestine and helping underprivileged people. Join the Ihsan Online Shop family and stand with humanity!';

  const buttonText = isBangla
    ? popupData.buttonText || 'কেনাকাটা শুরু করুন'
    : popupData.buttonTextEn || popupData.buttonText || 'Start Shopping';

  const buttonLink = popupData.buttonLink || '/products';

  const handleActionClick = () => {
    setIsOpen(false);
    if (buttonLink) {
      router.push(buttonLink);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0e2115] border border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scaleUp">
        
        {/* Top Decorative Gradient Ribbon */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700 w-full" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-gray-600 dark:text-emerald-300 transition-colors z-20 shadow-sm"
          aria-label="Close Popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Badge & Top Icon */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span>{badge}</span>
            </div>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-700 via-brand-800 to-emerald-950 flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 border-2 border-amber-400/40 transform hover:scale-105 transition-transform">
              <Heart className="w-8 h-8 text-rose-300 fill-rose-400 animate-pulse" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-emerald-100 tracking-tight">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                {isBangla ? 'মানবতার সেবায় আপনার প্রতিটি কেনাকাটা' : 'Every purchase dedicated to humanity'}
              </p>
            </div>
          </div>

          {/* Optional Image */}
          {popupData.showImage && popupData.image && (
            <div className="rounded-2xl overflow-hidden max-h-48 border border-emerald-900/20 shadow-inner">
              <img
                src={popupData.image}
                alt="Popup Announcement"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Message Box */}
          <div className="relative bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50 dark:from-[#09170e] dark:via-[#0c1f13] dark:to-[#07130c] p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm text-center">
            <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-emerald-100 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50/60 dark:bg-black/30 rounded-xl border border-emerald-200/40 dark:border-emerald-900/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isBangla ? '১০০% বিশ্বস্ত ও হালাল' : '100% Trusted & Halal'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50/60 dark:bg-black/30 rounded-xl border border-emerald-200/40 dark:border-emerald-900/40">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{isBangla ? 'সরাসরি সহায়তা তহবিলে' : 'Direct Relief Aid'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleActionClick}
              className="flex-1 bg-gradient-to-r from-brand-900 via-emerald-800 to-brand-950 hover:from-brand-800 hover:to-emerald-900 text-white font-black py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{buttonText}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-emerald-950 hover:bg-gray-200 dark:hover:bg-emerald-900 text-gray-700 dark:text-emerald-200 font-bold text-sm transition-colors"
            >
              {isBangla ? 'ঠিক আছে, পাশে থাকব' : 'I Stand With You'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
