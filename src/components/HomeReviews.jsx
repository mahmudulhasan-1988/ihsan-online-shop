'use client';

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function HomeReviews({ reviews = [] }) {
  const { isBangla, t } = useThemeLanguage();

  const defaultReviews = [
    {
      id: 1,
      customerName: isBangla ? 'তানভীর আহমেদ' : 'Tanvir Ahmed',
      rating: 5,
      comment: isBangla 
        ? 'মাশাল্লাহ, খাঁটি সুন্দরবনের মধুর আসল স্বাদ পেয়েছি। প্যাকেজিং খুবই দারুণ ছিল।' 
        : 'SubhanAllah, truly authentic raw Sundarban honey. Packaging and delivery was super fast!',
      date: isBangla ? '২ দিন আগে' : '2 days ago'
    },
    {
      id: 2,
      customerName: isBangla ? 'ফারহানা ইসলাম' : 'Farhana Islam',
      rating: 5,
      comment: isBangla 
        ? 'গাওয়া ঘির সুবাস আর কোয়ালিটি অনেক চমৎকার। পরিবারের সবার খুবই পছন্দ হয়েছে।' 
        : 'The aroma and pure texture of the cow ghee is unmatched. Highly recommended!',
      date: isBangla ? '৫ দিন আগে' : '5 days ago'
    },
    {
      id: 3,
      customerName: isBangla ? 'মাহমুদুল হাসান' : 'Mahmudul Hasan',
      rating: 5,
      comment: isBangla 
        ? 'সরিষার তেলের ঝাঁঝ এবং আজওয়া খেজুরের কোয়ালিটি ১০০% খাঁটি। নিয়মিত কাস্টমার হয়ে গেলাম।' 
        : 'Cold pressed mustard oil has that rich authentic pungent taste. Grade-1 Ajwa dates are fresh and soft.',
      date: isBangla ? '১ সপ্তাহ আগে' : '1 week ago'
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <div className="max-w-7xl mx-auto px-4 my-10 sm:my-14">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[11px] font-bold text-brand-900 dark:text-emerald-300 bg-emerald-100/80 dark:bg-[#183925] px-3 py-1 rounded-full uppercase border border-emerald-200/60 dark:border-[#254b32]">
          {t('customerFeedback')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mt-2.5">
          {isBangla ? 'হাজারো সন্তুষ্ট গ্রাহকের বিশ্বাস' : 'Trusted by Thousands of Happy Families'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isBangla 
            ? 'ইহসান অনলাইন শপ থেকে পণ্য কিনে গ্রাহকরা কী বলছেন দেখে নিন' 
            : 'See real customer testimonials on our 100% natural organic products'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {displayReviews.slice(0, 3).map((rev, idx) => (
          <div
            key={rev.id || idx}
            className="bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e4ede5] dark:border-[#1d3b28] shadow-sm hover:shadow-lg transition-all space-y-3"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "{rev.comment}"
            </p>
            <div className="pt-2.5 border-t border-gray-100 dark:border-[#1e3b2a] flex items-center justify-between">
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{rev.customerName}</h5>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('verifiedBuyer')}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{rev.date || (isBangla ? 'সম্প্রতি' : 'Recently')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
