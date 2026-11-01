'use client';

import React from 'react';

/**
 * 🌿 Global Organic Spinner
 * Modern SVG-based pulsing spinner with organic branding.
 */
export function GlobalSpinner({ size = 'md', text = '', className = '' }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse ring */}
        <div className={`absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 animate-ping`} />
        
        {/* Spinning SVG ring */}
        <svg
          className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-700 dark:text-emerald-400`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        {/* Center Organic Leaf Dot */}
        <span className="absolute text-xs select-none pointer-events-none">🌿</span>
      </div>

      {text && (
        <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-emerald-300 animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * 📦 Product Card Skeleton
 * Exactly mirrors the structure of ProductCard.jsx
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#112419] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-100 dark:border-[#21432e] shadow-sm animate-pulse flex flex-col justify-between h-full">
      {/* Thumbnail Aspect Square Placeholder */}
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-[#1a3826] overflow-hidden mb-3">
        {/* Discount Badge Placeholder */}
        <div className="absolute top-2 left-2 w-12 h-5 rounded-full bg-gray-300 dark:bg-[#254d35]" />
        {/* Wishlist Placeholder */}
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-300 dark:bg-[#254d35]" />
        {/* Shimmer bar */}
        <div className="w-full h-full animate-shimmer" />
      </div>

      {/* Info Block */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category Tag */}
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          
          {/* Title Lines */}
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          <div className="h-3.5 w-3/5 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          
          {/* Rating Stars Placeholder */}
          <div className="flex items-center gap-1 pt-1">
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="h-3 w-8 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* Price Line */}
          <div className="flex items-baseline gap-2">
            <div className="h-5 w-20 rounded-md bg-gray-300 dark:bg-[#254d35]" />
            <div className="h-3.5 w-12 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className="h-9 rounded-xl bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="h-9 rounded-xl bg-gray-300 dark:bg-[#254d35]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 📦 Grid of Product Card Skeletons
 */
export function ProductGridSkeleton({ count = 8, className = '' }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 🖼️ Product Detail Page Skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full aspect-square rounded-3xl bg-gray-200 dark:bg-[#1a3826] relative overflow-hidden">
            <div className="w-full h-full animate-shimmer" />
          </div>
          {/* Thumbnails */}
          <div className="flex items-center gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-200 dark:bg-[#1a3826]" />
            ))}
          </div>
        </div>

        {/* Right Info (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Badge */}
          <div className="h-5 w-28 rounded-full bg-gray-200 dark:bg-[#1e3f2b]" />

          {/* Title */}
          <div className="h-8 w-4/5 rounded-lg bg-gray-200 dark:bg-[#1e3f2b]" />
          <div className="h-6 w-3/5 rounded-lg bg-gray-200 dark:bg-[#1e3f2b]" />

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-gray-100 dark:bg-[#14291d] flex items-baseline gap-3">
            <div className="h-8 w-28 rounded-lg bg-gray-300 dark:bg-[#254d35]" />
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>

          {/* Variants Selector */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="flex gap-2">
              <div className="h-10 w-24 rounded-xl bg-gray-200 dark:bg-[#1e3f2b]" />
              <div className="h-10 w-24 rounded-xl bg-gray-200 dark:bg-[#1e3f2b]" />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-full rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="h-3.5 w-5/6 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="h-3.5 w-4/6 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="h-13 rounded-2xl bg-gray-300 dark:bg-[#254d35]" />
            <div className="h-13 rounded-2xl bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-[#1d3b28]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-[#14291d]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🏷️ Category Nav Skeleton
 */
export function CategoryNavSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 animate-pulse">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-200 dark:bg-[#1a3826] w-32 h-11"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 📊 Dashboard Stats Cards Skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#112419] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-[#21432e] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
            <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-[#1e3f2b]" />
          </div>
          <div className="h-7 w-24 rounded-lg bg-gray-300 dark:bg-[#254d35]" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-[#1e3f2b]" />
        </div>
      ))}
    </div>
  );
}

/**
 * 📋 Table Rows Skeleton (Admin / Seller / Orders)
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full bg-white dark:bg-[#112419] rounded-2xl border border-gray-100 dark:border-[#21432e] overflow-hidden animate-pulse">
      {/* Header Row */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#14291d] border-b border-gray-100 dark:border-[#21432e]">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="flex-1 h-4 rounded bg-gray-300 dark:bg-[#254d35]" />
        ))}
      </div>

      {/* Body Rows */}
      <div className="divide-y divide-gray-100 dark:divide-[#21432e]">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="flex items-center gap-4 p-4">
            {[...Array(cols)].map((_, c) => (
              <div key={c} className="flex-1 h-3.5 rounded bg-gray-200 dark:bg-[#1a3826]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 🎪 Hero Slider Skeleton
 */
export function HeroBannerSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <div className="w-full aspect-[16/7] sm:aspect-[21/9] max-h-[460px] rounded-3xl bg-gray-200 dark:bg-[#14291d] animate-pulse relative overflow-hidden flex flex-col justify-end p-6 sm:p-12">
        <div className="w-full h-full absolute inset-0 animate-shimmer" />
        <div className="space-y-3 max-w-lg z-10">
          <div className="h-5 w-32 rounded-full bg-gray-300 dark:bg-[#254d35]" />
          <div className="h-8 sm:h-10 w-4/5 rounded-lg bg-gray-300 dark:bg-[#254d35]" />
          <div className="h-4 w-3/5 rounded bg-gray-300 dark:bg-[#254d35]" />
          <div className="h-11 w-36 rounded-2xl bg-gray-400 dark:bg-[#2e5d41] mt-4" />
        </div>
      </div>
    </div>
  );
}

