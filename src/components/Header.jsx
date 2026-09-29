'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  PhoneCall, 
  Search, 
  ShoppingBag, 
  User, 
  Truck, 
  Menu, 
  X, 
  ChevronDown,
  Sun, 
  Moon, 
  Globe, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { getProducts } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, totalItems, subtotal, openCartDrawer, user, logout } = useCart();
  const { isDark, toggleTheme, isBangla, toggleLanguage, t, lang } = useThemeLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getProducts({ search: searchQuery.trim(), limit: 5 });
        if (res.success && res.data) {
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isDashboardRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard');

  if (isDashboardRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0d1c13]/95 backdrop-blur-md shadow-sm border-b border-[#e7eee8] dark:border-[#1b3626] transition-colors duration-300">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-secondary text-brand-950 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              {isBangla ? 'অফার' : 'OFFER'}
            </span>
            <span className="text-emerald-100/90 text-xs truncate">
              {t('offerText')}
            </span>
          </div>

          {/* Top Quick Actions (Track, Hotline, Language, Theme) */}
          <div className="flex items-center gap-3 sm:gap-5 text-emerald-100 text-xs">
            
            <Link href="/track-order" className="hover:text-white flex items-center gap-1 transition-colors">
              <Truck className="w-3.5 h-3.5 text-secondary" />
              <span>{t('trackOrder')}</span>
            </Link>
            
            <span className="opacity-40 hidden sm:inline">|</span>
            
            <a href="tel:09613827282" className="hover:text-white flex items-center gap-1 font-semibold transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>{t('hotline')}: 09613-827282</span>
            </a>

            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/15 transition-all text-[11px] font-bold"
              title={isBangla ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-3 h-3 text-secondary" />
              <span>{isBangla ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all transform active:scale-95"
              title={isDark ? 'লাইট মোড অন করুন' : 'ডার্ক মোড অন করুন'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-emerald-200" />}
            </button>

          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-brand-800 dark:hover:text-emerald-400 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-brand-800 to-emerald-950 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-emerald-600/30">
              <span className="text-xl sm:text-2xl">🌿</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-brand-900 dark:text-emerald-400 tracking-tight leading-none">
                {t('appName')}
              </span>
              <span className="text-[10px] sm:text-xs text-brand-700 dark:text-emerald-300/80 font-medium tracking-wide mt-0.5">
                {t('appTagline')}
              </span>
            </div>
          </Link>

          {/* Search Bar with Live Suggestions Dropdown */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className="w-full pl-4 pr-12 py-2.5 bg-[#f4f7f4] dark:bg-[#13281c] border border-[#d6e3d7] dark:border-[#21432e] text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 text-sm shadow-inner transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="absolute right-1 p-2 bg-brand-800 hover:bg-brand-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-full transition-colors shadow-sm"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#122419] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#244530] overflow-hidden z-50">
                <div className="p-3 bg-[#f8faf8] dark:bg-[#0e1d14] border-b border-gray-100 dark:border-[#244530] text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex justify-between items-center">
                  <span>{isBangla ? 'পণ্য ফলাফল' : 'Products'} ({searchResults.length})</span>
                  {isSearching && <span className="text-brand-700 animate-spin">⏳</span>}
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-[#1d3927] max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id || item._id}
                        href={`/product/${item.slug || item.id || item._id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-[#173222] transition-colors"
                      >
                        <img
                          src={item.images?.[0] || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-[#2b4c37]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {isBangla ? item.name : (item.nameEn || item.name)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-black text-brand-800 dark:text-emerald-400">৳ {item.price}</span>
                            {item.regularPrice > item.price && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">৳ {item.regularPrice}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isBangla ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No products found'}
                  </div>
                )}
                <div className="p-2.5 bg-[#f8faf8] dark:bg-[#0e1d14] text-center border-t border-gray-100 dark:border-[#244530]">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-brand-800 dark:text-emerald-400 hover:underline"
                  >
                    {isBangla ? 'সব ফলাফল দেখুন →' : 'View All Results →'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Hotline, Auth, Cart */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Quick Hotline Call */}
            <a 
              href="tel:09613827282" 
              className="hidden xl:flex items-center gap-2.5 bg-emerald-50/80 dark:bg-[#14291d] text-brand-900 dark:text-emerald-300 px-3.5 py-2 rounded-2xl border border-emerald-200/80 dark:border-[#254933] hover:bg-emerald-100/80 dark:hover:bg-[#1a3827] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-800 dark:bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                  {isBangla ? 'কল করে অর্ডার করুন' : 'Call to Order'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-brand-900 dark:text-emerald-300 leading-tight">09613-827282</p>
              </div>
            </a>

            {/* Auth / Profile */}
            <div className="relative group">
              {user ? (
                <div className="flex items-center gap-2 cursor-pointer bg-[#f4f7f4] dark:bg-[#14291d] px-3 py-2 rounded-2xl border border-gray-200 dark:border-[#254933] hover:bg-gray-100 dark:hover:bg-[#1b3627]">
                  <div className="w-7 h-7 rounded-full bg-brand-800 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full mt-0.5 ${
                      user.role === 'admin'
                        ? 'bg-purple-600 text-white'
                        : user.role === 'seller'
                        ? 'bg-amber-500 text-brand-950'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {user.role || 'customer'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200 hover:text-brand-800 dark:hover:text-emerald-400 px-3 py-2 rounded-2xl hover:bg-emerald-50 dark:hover:bg-[#14291d] text-sm font-semibold transition-colors"
                >
                  <User className="w-5 h-5 text-brand-800 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{t('login')}</span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#122419] rounded-2xl shadow-xl border border-gray-100 dark:border-[#244530] py-2 hidden group-hover:block z-50">
                <div className="px-4 py-1.5 border-b border-gray-100 dark:border-[#244530] mb-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-emerald-100">
                    {user?.name || (isBangla ? 'স্বাগতম' : 'Welcome')}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{user?.phone || '017XXXXXXXX'}</p>
                </div>

                <Link href="/dashboard" className="block px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-[#1a3827]">
                  👤 {isBangla ? 'কাস্টমার ড্যাশবোর্ড' : 'Customer Dashboard'}
                </Link>

                <Link href="/seller" className="block px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#1a3827]">
                  🏪 {isBangla ? 'সেলার সেন্টার' : 'Seller Dashboard'}
                </Link>

                <Link href="/admin" className="block px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#1a3827]">
                  🛠️ {t('adminPanel')}
                </Link>

                <Link href="/track-order" className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a3827]">
                  📦 {t('trackOrder')}
                </Link>

                {user ? (
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-gray-100 dark:border-[#244530] mt-1"
                  >
                    🚪 {isBangla ? 'লগআউট' : 'Logout'}
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    className="block px-4 py-2 text-xs font-bold text-brand-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#1a3827] border-t border-gray-100 dark:border-[#244530] mt-1"
                  >
                    🔑 {isBangla ? 'লগইন / রেজিস্টার' : 'Login / Register'}
                  </Link>
                )}
              </div>
            </div>

            {/* Cart Drawer Trigger Button */}
            <button
              onClick={openCartDrawer}
              className="flex items-center gap-2.5 bg-gradient-to-r from-brand-800 to-emerald-900 dark:from-emerald-700 dark:to-teal-800 hover:from-brand-900 hover:to-emerald-950 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95 border border-emerald-600/30"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-brand-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-emerald-200">{t('cart')}</span>
                <span className="text-xs font-extrabold">৳ {subtotal}</span>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Search Bar & Theme/Lang Quick bar */}
        <div className="mt-2.5 md:hidden flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-[#f4f7f4] dark:bg-[#13281c] border border-gray-200 dark:border-[#21432e] text-gray-900 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:border-brand-700"
            />
            <button
              type="submit"
              className="absolute right-1 p-1 text-brand-800 dark:text-emerald-400"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-[#14291d] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#254933]"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Mobile Lang Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-[#14291d] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#254933] text-xs font-bold"
          >
            {isBangla ? 'EN' : 'বাং'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-[#1e3b2b] bg-white dark:bg-[#0e1d14] px-4 py-3 space-y-2 shadow-inner">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-800 dark:hover:text-emerald-400"
          >
            {t('home')}
          </Link>
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-800 dark:hover:text-emerald-400"
          >
            {t('allProducts')}
          </Link>
          <Link
            href="/track-order"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-800 dark:hover:text-emerald-400"
          >
            {t('trackOrder')}
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-brand-800 dark:text-emerald-400 bg-emerald-50 dark:bg-[#173322] px-3 rounded-xl"
          >
            {t('adminPanel')}
          </Link>
        </div>
      )}
    </header>
  );
}

