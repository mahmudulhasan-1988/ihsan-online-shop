'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function ProductSection({ 
  title, 
  titleEn, 
  subtitle, 
  subtitleEn, 
  products = [], 
  viewAllLink = '/products', 
  badge = '', 
  badgeEn = '',
  coverImage = '',
  icon = '🌿'
}) {
  const { isBangla, t } = useThemeLanguage();

  if (!products || products.length === 0) return null;

  const displayTitle = isBangla ? title : (titleEn || title);
  const displaySubtitle = isBangla ? subtitle : (subtitleEn || subtitle);
  const displayBadge = isBangla ? badge : (badgeEn || badge);

  return (
    <section className="max-w-7xl mx-auto px-4 my-8 sm:my-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 pb-3 border-b border-[#e5eee6] dark:border-[#1c3826]">
        <div>
          {displayBadge && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-900 dark:text-emerald-300 bg-emerald-100/90 dark:bg-[#183925] px-3 py-0.5 rounded-full mb-2 border border-emerald-200/80 dark:border-[#254b32]">
              <span className="text-sm">{icon}</span>
              <Sparkles className="w-3 h-3 text-secondary" />
              <span>{displayBadge}</span>
            </span>
          )}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <span>{displayTitle}</span>
          </h2>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{displaySubtitle}</p>
          )}
        </div>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-800 hover:from-brand-800 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-brand-950/15 transition-all transform active:scale-95 group flex-shrink-0 border border-emerald-600/30"
          >
            <span>{isBangla ? 'সকল পণ্য পেজে যান (Go to All Products)' : 'Go to All Products Page'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Category Cover Showcase Banner */}
      {coverImage && (
        <div className="relative mb-6 rounded-3xl overflow-hidden shadow-md border border-gray-200/80 dark:border-emerald-900/40 h-32 sm:h-44 md:h-52 group">
          <img
            src={coverImage}
            alt={displayTitle}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          {/* Rich Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center p-4 sm:p-8">
            <div className="max-w-lg text-white space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl">{icon}</span>
                <span className="text-[10px] sm:text-xs uppercase font-black tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-sm">
                  {displayBadge || (isBangla ? 'প্রিমিয়াম কালেকশন' : 'Premium Collection')}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {products.length} {isBangla ? 'টি পণ্য' : 'Items'}
                </span>
              </div>
              <h3 className="text-base sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow">
                {displayTitle}
              </h3>
              {displaySubtitle && (
                <p className="text-xs sm:text-sm text-gray-200/90 line-clamp-1 sm:line-clamp-2 drop-shadow">
                  {displaySubtitle}
                </p>
              )}
              {viewAllLink && (
                <Link
                  href={viewAllLink}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-secondary hover:text-white transition-colors group/link pt-0.5"
                >
                  <span>{isBangla ? 'এই ক্যাটাগরির সব দেখুন →' : 'Explore All in Category →'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </section>
  );
}


