'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneCall, Mail, MapPin, Facebook, Instagram, Youtube, ShieldCheck, Heart } from 'lucide-react';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function Footer() {
  const pathname = usePathname();
  const { isBangla, t } = useThemeLanguage();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-[#08150d] text-gray-300 pt-12 pb-24 md:pb-12 border-t border-[#162e1e] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-800 flex items-center justify-center text-white shadow-md border border-emerald-600/30">
                <span className="text-xl">🌿</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {t('appName')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {isBangla 
                ? 'ইহসান অনলাইন শপ - নিরাপদ ও খাঁটি খাদ্যের নির্ভরযোগ্য ঠিকানা। আমরা সরাসরি উৎস থেকে সংগৃহীত নির্ভেজাল মধু, গাওয়া ঘি, ঘানি ভাঙা তেল ও অন্যান্য পুষ্টিকর খাবার আপনার দোরগোড়ায় পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।' 
                : 'Ihsan Online Shop - Your trusted source for authentic organic food. Pure honey, cow ghee, cold-pressed mustard oil, and premium dates delivered safely at your doorstep.'}
            </p>
            <div className="flex items-center gap-3 text-white">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#112417] hover:bg-brand-800 flex items-center justify-center transition-colors border border-[#1d3d28]">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#112417] hover:bg-brand-800 flex items-center justify-center transition-colors border border-[#1d3d28]">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#112417] hover:bg-brand-800 flex items-center justify-center transition-colors border border-[#1d3d28]">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base uppercase tracking-wider mb-4 border-l-4 border-secondary pl-2">
              {isBangla ? 'জনপ্রিয় ক্যাটাগরি' : 'Popular Categories'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/products?category=honey" className="hover:text-secondary transition-colors">
                  {isBangla ? '🍯 সুন্দরবনের প্রাকৃতিক মধু' : '🍯 Pure Sundarban Honey'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=ghee" className="hover:text-secondary transition-colors">
                  {isBangla ? '🧈 খাঁটি গাওয়া ঘি' : '🧈 Pure Cow Ghee'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=oil" className="hover:text-secondary transition-colors">
                  {isBangla ? '🫒 ঘানি ভাঙা সরিষার তেল' : '🫒 Cold Pressed Mustard Oil'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=dates" className="hover:text-secondary transition-colors">
                  {isBangla ? '🌴 মদিনার প্রিমিয়াম আজওয়া খেজুর' : '🌴 Madinah Premium Dates'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=nuts-seeds" className="hover:text-secondary transition-colors">
                  {isBangla ? '🥜 অর্গানিক চিয়া সিড ও বাদাম' : '🥜 Organic Chia Seeds & Nuts'}
                </Link>
              </li>
              <li>
                <Link href="/products?category=spices" className="hover:text-secondary transition-colors">
                  {isBangla ? '🌶️ হিমালয়ান পিংক সল্ট ও মসলা' : '🌶️ Organic Spices & Pink Salt'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base uppercase tracking-wider mb-4 border-l-4 border-secondary pl-2">
              {isBangla ? 'গ্রাহক সেবা ও নীতি' : 'Customer Service'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/track-order" className="hover:text-secondary transition-colors">
                  📦 {t('trackOrder')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-secondary transition-colors">
                  🛒 {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-secondary transition-colors">
                  🛠️ {t('adminPanel')}
                </Link>
              </li>
              <li>
                <span className="text-gray-400">🚚 {t('freeDelivery')}</span>
              </li>
              <li>
                <span className="text-gray-400">🛡️ {isBangla ? '৭ দিনের রিটার্ন পলিসি' : '7 Days Return Policy'}</span>
              </li>
              <li>
                <span className="text-gray-400">🔒 {isBangla ? '১০০% নিরাপদ পেমেন্ট' : '100% Secure Checkout'}</span>
              </li>
            </ul>
          </div>

          {/* Contact & Hotline */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm sm:text-base uppercase tracking-wider mb-4 border-l-4 border-secondary pl-2">
              {isBangla ? 'যোগাযোগ ও হটলাইন' : 'Contact & Support'}
            </h4>
            
            <a href="tel:09613827282" className="flex items-start gap-3 p-3 bg-[#112417] rounded-2xl border border-[#1d3d28] hover:border-secondary transition-colors">
              <PhoneCall className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">{isBangla ? 'হটলাইন (সকাল ৯টা - রাত ১০টা)' : 'Hotline (9 AM - 10 PM)'}</p>
                <p className="text-sm font-bold text-white">09613-827282</p>
              </div>
            </a>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-400">
              <Mail className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>support@ihsanonlineshop.com</span>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>{isBangla ? 'মিরপুর ডিওএইচএস, ঢাকা - ১২১৬, বাংলাদেশ' : 'Mirpur DOHS, Dhaka - 1216, Bangladesh'}</span>
            </div>
          </div>

        </div>

        {/* Payment Methods & Copyright */}
        <div className="pt-8 border-t border-[#162e1e] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>{isBangla ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
            <span className="bg-[#112417] px-2.5 py-1 rounded-xl text-white font-semibold border border-[#1d3d28]">
              {isBangla ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
            </span>
            <span className="bg-pink-950/60 text-pink-300 px-2.5 py-1 rounded-xl font-semibold border border-pink-900/50">bKash</span>
            <span className="bg-amber-950/60 text-amber-300 px-2.5 py-1 rounded-xl font-semibold border border-amber-900/50">Nagad</span>
            <span className="bg-blue-950/60 text-blue-300 px-2.5 py-1 rounded-xl font-semibold border border-blue-900/50">Cards / Bank</span>
          </div>

          <p className="text-center md:text-right">
            © {new Date().getFullYear()} {t('appName')}. {isBangla ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
        </div>

      </div>
    </footer>
  );
}

