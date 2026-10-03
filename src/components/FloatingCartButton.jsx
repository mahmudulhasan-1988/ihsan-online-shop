'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function FloatingCartButton() {
  const pathname = usePathname();
  const { totalItems, subtotal, openCartDrawer } = useCart();
  const { isBangla } = useThemeLanguage();

  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard');
  if (isDashboard) return null;

  return (
    <aside aria-label="Quick Shopping Cart" className="fixed right-2 sm:right-4 top-[38%] -translate-y-1/2 z-40 print:hidden">
      <button
        onClick={openCartDrawer}
        className="group relative flex flex-col items-center bg-gradient-to-b from-brand-900 via-brand-800 to-emerald-950 dark:from-[#11281c] dark:via-[#0d1e15] dark:to-[#07130d] text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border-2 border-emerald-500/40 hover:border-secondary hover:shadow-emerald-900/40 hover:scale-105 transition-all duration-300 backdrop-blur-md"
        title={isBangla ? 'শপিং কার্ট খুলুন' : 'Open Shopping Cart'}
        aria-label="Open Shopping Cart"
      >
        {/* Glow backdrop pulse */}
        <span className="absolute -inset-0.5 bg-emerald-500/30 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity -z-10" />

        {/* Top Icon with Notification Counter */}
        <div className="relative mb-1">
          <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-emerald-500/20 flex items-center justify-center text-secondary group-hover:rotate-12 transition-transform duration-300">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 dark:text-emerald-400" />
          </div>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2.5 bg-amber-400 text-brand-950 font-black text-[10px] sm:text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {totalItems}
            </span>
          )}
        </div>

        {/* Text Label */}
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-200 group-hover:text-white transition-colors">
          {isBangla ? 'কার্ট' : 'Your Cart'}
        </span>

        {/* Price Amount */}
        <div className="mt-1 px-1.5 py-0.5 rounded-md bg-emerald-950/80 dark:bg-emerald-900/60 border border-emerald-500/30 text-[10px] sm:text-xs font-black text-amber-300">
          ৳ {subtotal}
        </div>
      </button>
    </aside>
  );
}
