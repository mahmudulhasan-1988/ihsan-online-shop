'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Zap, Star, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function ProductCard({ product }) {
  const { addToCart, openFastOrder } = useCart();
  const { isBangla, t } = useThemeLanguage();
  
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(
    hasVariants ? product.variants[0] : null
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentRegularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
  const discountPercent = currentRegularPrice > currentPrice
    ? Math.round(((currentRegularPrice - currentPrice) / currentRegularPrice) * 100)
    : product.discountPercentage || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariant, 1, true);
  };

  const handleFastOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openFastOrder(product, selectedVariant);
  };

  const displayName = isBangla ? product.name : (product.nameEn || product.name);
  const displaySubName = isBangla ? product.nameEn : product.name;

  return (
    <div className="bg-white dark:bg-[#112318] rounded-3xl border border-[#e4ede5] dark:border-[#1d3b28] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 dark:hover:shadow-black/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Media Thumbnail & Badges */}
      <Link 
        href={`/product/${product.slug || product.id || product._id}`} 
        className="block relative overflow-hidden bg-[#f4f7f4] dark:bg-[#0c1a12] aspect-square"
      >
        <img
          src={product.images?.[0] || product.thumbnail || product.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Ambient Hover Shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges (Discount, Best Seller, New) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>-{discountPercent}% {isBangla ? 'ছাড়' : 'OFF'}</span>
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-brand-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
              {isBangla ? 'বেস্ট সেলার' : 'Best Seller'}
            </span>
          )}
        </div>

        {/* 100% Pure Organic Floating Status Pill */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0e2115]/95 backdrop-blur-md text-brand-900 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm border border-emerald-100 dark:border-[#22442e]">
          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{isBangla ? '১০০% খাঁটি ও নির্ভেজাল' : '100% Pure Organic'}</span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating Stars & Count */}
          <div className="flex items-center gap-1 text-amber-500 text-xs mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold ml-1">
              ({product.ratingCount || 18})
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug || product.id || product._id}`}>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-brand-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
              {displayName}
            </h3>
          </Link>
          
          {displaySubName && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {displaySubName}
            </p>
          )}

          {/* Variant Selector Buttons */}
          {hasVariants && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all ${
                    selectedVariant?.weight === v.weight
                      ? 'bg-brand-800 dark:bg-emerald-600 text-white border-brand-800 dark:border-emerald-600 shadow-sm scale-105'
                      : 'bg-[#f4f7f4] dark:bg-[#14291d] text-gray-700 dark:text-gray-300 border-[#dce6dd] dark:border-[#22442f] hover:border-brand-700'
                  }`}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          )}

          {/* Price Tag with Currency */}
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-black text-brand-900 dark:text-emerald-400">
              ৳ {currentPrice}
            </span>
            {currentRegularPrice > currentPrice && (
              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 line-through">
                ৳ {currentRegularPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: 1-Click Fast Order + Add to Cart */}
        <div className="mt-4 pt-3.5 border-t border-[#edf4ee] dark:border-[#1d3b28] flex gap-2">
          
          {/* Fast Order / 1-Click Buy */}
          <button
            onClick={handleFastOrder}
            className="flex-1 bg-gradient-to-r from-amber-400 via-secondary to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-brand-950 text-xs sm:text-sm font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-brand-950" />
            <span>{isBangla ? 'অর্ডার করুন' : 'Order Now'}</span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="bg-emerald-50 dark:bg-[#163323] hover:bg-emerald-100 dark:hover:bg-[#1d432e] text-brand-900 dark:text-emerald-300 text-xs sm:text-sm font-bold py-2.5 px-3.5 rounded-2xl flex items-center justify-center gap-1.5 border border-emerald-200/80 dark:border-[#285338] transition-all active:scale-95"
            title={isBangla ? 'কার্টে যোগ করুন' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

