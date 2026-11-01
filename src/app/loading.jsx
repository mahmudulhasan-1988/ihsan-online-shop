'use client';

import React from 'react';
import { GlobalSpinner, ProductCardSkeleton } from '@/components/SkeletonLoaders';

export default function Loading() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Top Animated Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-emerald-100 dark:bg-emerald-950 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-brand-600 to-teal-400 animate-[shimmer_1.5s_infinite] w-full origin-left" />
      </div>

      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-800/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Glass Center Loading Card */}
      <div className="max-w-md w-full bg-white/80 dark:bg-[#112419]/90 backdrop-blur-xl border border-emerald-100 dark:border-[#21432e] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/5 text-center flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glowing Logo & Spinner */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-950 via-brand-900 to-emerald-700 text-white flex items-center justify-center shadow-xl shadow-brand-900/20 relative">
            <span className="text-3xl animate-bounce select-none">🌿</span>
          </div>
          
          {/* Orbiting Spinner Ring */}
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-500/50 dark:border-emerald-400/50 animate-[spin_4s_linear_infinite]" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-extrabold text-brand-950 dark:text-emerald-100">
            ইহসান অনলাইন শপ
          </h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-400/90 font-medium">
            ১০০% খাঁটি ও নিরাপদ অর্গানিক খাদ্য
          </p>
        </div>

        {/* Loading Spinner & Shimmer Bar */}
        <div className="w-full space-y-3 pt-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
              লোড হচ্ছে...
            </span>
          </div>

          <div className="w-full h-1.5 bg-gray-100 dark:bg-[#193524] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-700 via-emerald-500 to-teal-400 rounded-full animate-shimmer w-full" />
          </div>
        </div>

      </div>

      {/* Subtle Ghost Preview Skeleton Beneath */}
      <div className="max-w-7xl w-full mx-auto mt-12 px-4 opacity-40 dark:opacity-25 pointer-events-none select-none hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

