'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  Truck, 
  Search, 
  ArrowLeft, 
  PhoneCall, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function NotFound() {
  const router = useRouter();
  const { isBangla } = useThemeLanguage() || { isBangla: true };
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-[#0b1710] dark:via-[#0d1e14] dark:to-[#0b1710] relative overflow-hidden">
      {/* Background Decorative Glowing Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        
        {/* Animated 404 Illustration Badge */}
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl md:text-[140px] font-black tracking-tight bg-gradient-to-r from-brand-900 via-emerald-700 to-amber-600 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400 bg-clip-text text-transparent select-none leading-none drop-shadow-sm">
            404
          </span>
          <div className="absolute -top-3 -right-4 bg-amber-500 text-brand-950 px-3 py-1 rounded-full text-xs sm:text-sm font-black shadow-lg flex items-center gap-1 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBangla ? 'পেজ পাওয়া যায়নি!' : 'Page Not Found!'}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-emerald-100">
            {isBangla ? 'দুঃখিত! এই পেজটি খুঁজে পাওয়া যায়নি' : 'Oops! The Page You Requested Does Not Exist'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
            {isBangla 
              ? 'আপনি যে লিংকটি খুঁজছেন তা মুছে ফেলা হয়েছে, নাম পরিবর্তন হয়েছে অথবা লিংকটি ভুল ছিল।' 
              : 'The link you clicked may be broken, removed, or the URL was mistyped. Let us help you find what you need.'}
          </p>
        </div>

        {/* Search Helper Box */}
        <form 
          onSubmit={handleSearch}
          className="max-w-md mx-auto flex items-center bg-white dark:bg-[#12251a] rounded-2xl p-1.5 border border-emerald-200 dark:border-emerald-900/60 shadow-lg focus-within:border-brand-800 transition-all"
        >
          <div className="pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder={isBangla ? 'পণ্য বা ক্যাটাগরি সার্চ করুন...' : 'Search products or categories...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-gray-900 dark:text-emerald-100 focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-brand-800 to-emerald-900 hover:from-brand-900 hover:to-emerald-950 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 flex-shrink-0"
          >
            <span>{isBangla ? 'খুঁজুন' : 'Search'}</span>
          </button>
        </form>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-800 to-emerald-900 hover:from-brand-900 hover:to-emerald-950 text-white text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{isBangla ? 'হোম পেজে ফিরে যান' : 'Back to Home'}</span>
          </Link>

          <Link
            href="/products"
            className="px-5 py-3 rounded-2xl bg-white dark:bg-[#12251a] text-gray-800 dark:text-emerald-200 hover:bg-gray-50 dark:hover:bg-[#183324] border border-gray-200 dark:border-emerald-900/60 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isBangla ? 'সকল পণ্য দেখুন' : 'All Products'}</span>
          </Link>

          <Link
            href="/track-order"
            className="px-5 py-3 rounded-2xl bg-white dark:bg-[#12251a] text-gray-800 dark:text-emerald-200 hover:bg-gray-50 dark:hover:bg-[#183324] border border-gray-200 dark:border-emerald-900/60 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-amber-500" />
            <span>{isBangla ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</span>
          </Link>
        </div>

        {/* Customer Assistance Callout */}
        <div className="pt-6 border-t border-gray-200/60 dark:border-emerald-950/60 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {isBangla ? 'কোনো সমস্যা বা সাহায্যের প্রয়োজন?' : 'Need immediate assistance?'}
          </span>
          <a
            href="tel:09613827282"
            className="flex items-center gap-1.5 font-bold text-brand-900 dark:text-amber-400 hover:underline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span>{isBangla ? 'হটলাইন' : 'Hotline'}: 09613-827282</span>
          </a>
        </div>

      </div>
    </div>
  );
}
