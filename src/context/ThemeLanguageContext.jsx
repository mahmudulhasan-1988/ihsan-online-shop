'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeLanguageContext = createContext();

export const translations = {
  bn: {
    appName: 'ইহসান অনলাইন শপ',
    appTagline: '১০০% খাঁটি ও প্রাকৃতিক খাবার',
    offerText: '১০০% খাঁটি ও নির্ভেজাল খাবার সারা দেশে হোম ডেলিভারি!',
    trackOrder: 'অর্ডার ট্র্যাক করুন',
    hotline: 'হটলাইন',
    searchPlaceholder: 'মধু, খাঁটি ঘি, সরিষার তেল, খেজুর ইত্যাদি খুঁজুন...',
    login: 'লগইন',
    adminPanel: 'এডমিন প্যানেল',
    cart: 'আপনার কার্ট',
    allProducts: 'সকল পণ্য',
    categories: 'ক্যাটাগরি সমূহ',
    home: 'হোম',
    fastOrder: 'অর্ডার করুন',
    fastOrderTitle: '১-ক্লিক ফাস্ট অর্ডার',
    addToCart: 'কার্টে যোগ করুন',
    addedToCart: 'কার্টে যোগ করা হয়েছে!',
    pure100: '১০০% খাঁটি',
    bestSeller: 'বেস্ট সেলার',
    discountOff: 'ছাড়',
    reviews: 'রিভিউ',
    outOfStock: 'স্টক শেষ',
    inStock: 'স্টকে আছে',
    currency: '৳',
    freeDelivery: 'সারা দেশে ক্যাশ অন ডেলিভারি',
    viewAll: 'সবগুলো দেখুন',
    customerFeedback: 'গ্রাহকদের মতামত',
    verifiedBuyer: 'ভেরিফাইড ক্রেতা',
    dark: 'ডার্ক মোড',
    light: 'লাইট মোড',
    orderSummary: 'অর্ডার সারসংক্ষেপ',
    deliveryCharge: 'ডেলিভারি চার্জ',
    total: 'সর্বমোট',
  },
  en: {
    appName: 'Ihsan Online Shop',
    appTagline: '100% Pure & Organic Natural Food',
    offerText: '100% pure & organic food delivered nationwide at your doorstep!',
    trackOrder: 'Track Order',
    hotline: 'Hotline',
    searchPlaceholder: 'Search honey, pure ghee, mustard oil, dates...',
    login: 'Login',
    adminPanel: 'Admin Panel',
    cart: 'Your Cart',
    allProducts: 'All Products',
    categories: 'Categories',
    home: 'Home',
    fastOrder: 'Order Now',
    fastOrderTitle: '1-Click Fast Order',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to cart!',
    pure100: '100% Pure',
    bestSeller: 'Best Seller',
    discountOff: 'OFF',
    reviews: 'Reviews',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    currency: '৳',
    freeDelivery: 'Nationwide Cash on Delivery',
    viewAll: 'View All',
    customerFeedback: 'Customer Feedback',
    verifiedBuyer: 'Verified Buyer',
    dark: 'Dark Mode',
    light: 'Light Mode',
    orderSummary: 'Order Summary',
    deliveryCharge: 'Delivery Charge',
    total: 'Total',
  }
};

export function ThemeLanguageProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('bn');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('gb_theme') || 'light';
      const savedLang = localStorage.getItem('gb_lang') || 'bn';
      setTheme(savedTheme);
      setLang(savedLang);
      
      const root = document.documentElement;
      if (savedTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'ghorerbazar');
      }
      root.lang = savedLang;
    } catch (e) {
      console.error(e);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('gb_theme', nextTheme);
      const root = document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'ghorerbazar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    try {
      localStorage.setItem('gb_lang', nextLang);
      document.documentElement.lang = nextLang;
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key, fallbackBn = '', fallbackEn = '') => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    return lang === 'bn' ? fallbackBn : fallbackEn;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === 'dark',
        lang,
        setLang,
        toggleLanguage,
        isBangla: lang === 'bn',
        t,
        mounted
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export const useThemeLanguage = () => useContext(ThemeLanguageContext);
