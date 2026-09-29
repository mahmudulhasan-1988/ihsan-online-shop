'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneCall } from 'lucide-react';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function HomePromoBanner() {
  const { isBangla, t } = useThemeLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 my-6 sm:my-8">
      <div className="bg-gradient-to-r from-emerald-950 via-brand-950 to-[#072114] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
        
        <div className="space-y-3 z-10 text-center md:text-left">
          <span className="inline-block bg-secondary text-brand-950 text-[11px] sm:text-xs font-black px-3.5 py-1 rounded-full uppercase shadow-sm">
            {isBangla ? 'শতভাগ ভেজালমুক্ত নিশ্চয়তা' : '100% Organic & Pure Guarantee'}
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
            {isBangla ? 'সুস্থ জীবনের জন্য বেছে নিন প্রাকৃতিক খাবার' : 'Choose 100% Pure Organic Food for Healthy Life'}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-normal leading-relaxed">
            {isBangla
              ? 'আমরা নিজস্ব তত্ত্বাবধানে এবং বিশ্বস্ত কৃষকদের থেকে সরাসরি খাবার সংগ্রহ করি। কোনো প্রকার রাসায়নিক বা প্রিজারভেটিভ ব্যবহার করা হয় না।'
              : 'Directly sourced from organic farmlands under our strict supervision. Free of artificial colors, chemicals, and preservatives.'}
          </p>
        </div>

        <div className="z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/products"
            className="bg-white hover:bg-emerald-50 text-brand-950 font-black px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all text-center"
          >
            {isBangla ? 'এখনই অর্ডার করুন' : 'Shop All Products'}
          </Link>
          <a
            href="tel:09613827282"
            className="bg-secondary hover:bg-gold-600 text-brand-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>09613-827282</span>
          </a>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
      </div>
    </div>
  );
}
