'use client';

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Award } from 'lucide-react';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function TrustBadges() {
  const { isBangla } = useThemeLanguage();

  const badges = [
    {
      icon: <Award className="w-7 h-7 text-brand-700 dark:text-emerald-400" />,
      title: isBangla ? '১০০% খাঁটি ও প্রাকৃতিক' : '100% Pure & Organic',
      desc: isBangla ? 'কোনো ভেজাল ও কেমিক্যাল নেই' : 'Zero chemicals or additives',
    },
    {
      icon: <Truck className="w-7 h-7 text-brand-700 dark:text-emerald-400" />,
      title: isBangla ? 'দ্রুত হোম ডেলিভারি' : 'Fast Nationwide Delivery',
      desc: isBangla ? 'সারা দেশে ক্যাশ অন ডেলিভারি' : 'Cash on delivery across BD',
    },
    {
      icon: <RotateCcw className="w-7 h-7 text-brand-700 dark:text-emerald-400" />,
      title: isBangla ? 'সহজ রিটার্ন পলিসি' : 'Easy Return Policy',
      desc: isBangla ? 'পছন্দ না হলে সহজ ফেরত' : '100% satisfaction guarantee',
    },
    {
      icon: <Headphones className="w-7 h-7 text-brand-700 dark:text-emerald-400" />,
      title: isBangla ? '২৪/৭ কাস্টমার সাপোর্ট' : '24/7 Dedicated Support',
      desc: isBangla ? 'যেকোনো প্রয়োজনে কল করুন' : 'Always here to help you',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 my-6 sm:my-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white dark:bg-[#112318] p-5 sm:p-7 rounded-3xl shadow-sm border border-[#e4ede5] dark:border-[#1e3b29]">
        {badges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 group hover:bg-emerald-50/50 dark:hover:bg-[#173323]/50 rounded-2xl transition-colors">
            <div className="p-3 bg-[#f2f7f3] dark:bg-[#152e20] rounded-2xl group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-all flex-shrink-0 border border-emerald-100 dark:border-[#22442e]">
              {badge.icon}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">{badge.title}</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

