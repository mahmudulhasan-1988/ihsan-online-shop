'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  ShoppingCart, 
  Star, 
  CreditCard, 
  Bell, 
  Headphones, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Menu, 
  X, 
  Plus, 
  Save, 
  Trash2, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Printer, 
  Eye, 
  Check, 
  RefreshCw, 
  Home,
  Sun,
  Moon,
  PieChart,
  TrendingUp,
  Activity,
  Award,
  Settings
} from 'lucide-react';
import { 
  getOrders, 
  getAddresses, 
  saveAddress, 
  getNotifications, 
  getReviews, 
  createSupportTicket, 
  getProducts, 
  updateUserProfile 
} from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function CustomerDashboardPage() {
  const { user, logout, cart, showToast, addToCart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { isBangla, theme, toggleTheme } = useThemeLanguage();

  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'profile' | 'orders' | 'addresses' | 'wishlist' | 'cart' | 'notifications' | 'support'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data States
  const [myOrders, setMyOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [expandedOrderLogs, setExpandedOrderLogs] = useState({});

  // Profile Form State
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    address: user?.address || '',
    city: user?.city || 'Dhaka',
    district: user?.district || 'Dhaka',
    currentPassword: '',
    newPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Update profile state when user context changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        avatar: user.avatar || '',
        address: user.address || '',
        city: user.city || 'Dhaka',
        district: user.district || 'Dhaka',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user]);

  // New Address Form
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line: '',
    city: 'Dhaka',
    district: 'Dhaka',
  });

  // Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  const loadUserData = async (isManual = false, showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const currentUserId = user?.id || user?._id || user?.userId;
      const [ordRes, addrRes, notifRes, prodRes] = await Promise.all([
        getOrders({ 
          userId: currentUserId, 
          customerPhone: user?.phone, 
          customerEmail: user?.email 
        }),
        getAddresses(currentUserId || 2),
        getNotifications(currentUserId || 2),
        getProducts(),
      ]);

      setMyOrders(ordRes?.data || []);
      setAddresses(addrRes?.data || []);
      setNotifications(notifRes?.data || []);
      setWishlistProducts((prodRes?.data || []).slice(0, 3));

      if (isManual) {
        showToast(isBangla ? 'ডাটা সফলভাবে রিফ্রেশ হয়েছে!' : 'Data refreshed successfully!');
      }
    } catch (err) {
      console.error('Error loading customer dashboard', err);
      if (isManual) {
        showToast(isBangla ? 'ডাটা রিফ্রেশ করতে সমস্যা হয়েছে' : 'Failed to refresh data', 'error');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData(false, true);

      // Silent Auto Sync every 45s without buffering or screen jumps
      const interval = setInterval(() => {
        loadUserData(false, false);
      }, 45000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      showToast(isBangla ? 'দয়া করে আপনার নাম লিখুন' : 'Please provide your name', 'error');
      return;
    }
    if (!profile.phone.trim()) {
      showToast(isBangla ? 'দয়া করে মোবাইল নম্বর দিন' : 'Please provide phone number', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const currentUserId = user?.id || user?._id || user?.userId;
      const res = await updateUserProfile({
        userId: currentUserId,
        id: currentUserId,
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        email: profile.email ? profile.email.trim() : '',
        avatar: profile.avatar || '',
        address: profile.address || '',
        city: profile.city || 'Dhaka',
        district: profile.district || 'Dhaka',
        currentPassword: profile.currentPassword || '',
        newPassword: profile.newPassword || '',
      });

      if (res?.success !== false) {
        showToast(isBangla ? '🎉 প্রোফাইল সফলভাবে ডাটাবেসে আপডেট হয়েছে!' : 'Profile updated successfully!');
        if (typeof window !== 'undefined' && res.user) {
          localStorage.setItem('gb_user', JSON.stringify(res.user));
        }
        setProfile((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        loadUserData(false);
      } else {
        showToast(res?.message || (isBangla ? 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' : 'Failed to update profile'), 'error');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showToast(isBangla ? 'সার্ভার ত্রুটি ঘটেছে' : 'Server error occurred', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.address_line) {
      showToast(isBangla ? 'সম্পূর্ণ ঠিকানা দিন' : 'Enter address', 'error');
      return;
    }
    await saveAddress({ ...newAddr, user_id: user?.id || user?._id || 2 });
    showToast(isBangla ? 'ঠিকানা যুক্ত হয়েছে!' : 'Address added!');
    setNewAddr({ title: 'Home', full_name: profile.name, phone: profile.phone, address_line: '', city: 'Dhaka', district: 'Dhaka' });
    loadUserData(false);
  };

  const getStepProgress = (status) => {
    const steps = [
      { key: 'Pending', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending', icon: '🟡' },
      { key: 'Confirmed', labelBn: 'কনফার্মড', labelEn: 'Confirmed', icon: '🔵' },
      { key: 'Packed', labelBn: 'প্যাকড', labelEn: 'Packed', icon: '📦' },
      { key: 'Shipped', labelBn: 'শিপড', labelEn: 'Shipped', icon: '🚚' },
      { key: 'Delivered', labelBn: 'ডেলিভারড', labelEn: 'Delivered', icon: '✅' },
    ];

    if (status === 'Cancelled') {
      return { currentStep: -1, isCancelled: true, steps };
    }

    let currentStep = 0;
    if (status === 'Pending') currentStep = 0;
    else if (status === 'Confirmed') currentStep = 1;
    else if (status === 'Packed' || status === 'Processing') currentStep = 2;
    else if (status === 'Shipped') currentStep = 3;
    else if (status === 'Delivered') currentStep = 4;

    return { currentStep, isCancelled: false, steps };
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    await createSupportTicket({
      user_id: user?.id || user?._id || 2,
      user_name: profile.name,
      user_role: 'customer',
      subject: ticketSubject,
      message: ticketMsg,
    });
    showToast(isBangla ? 'টিকেট সাবমিট হয়েছে!' : 'Ticket submitted!');
    setTicketSubject('');
    setTicketMsg('');
  };

  // Dynamic calculations for Customer Charts & Visualizations
  const customerSpendingData = React.useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNameBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'][d.getDay()];
      const dayNameEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      
      const dayOrders = (myOrders || []).filter(o => {
        const oDate = o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : (o.date ? new Date(o.date).toISOString().split('T')[0] : '');
        return oDate === dateStr;
      });

      const daySpent = dayOrders.reduce((sum, o) => sum + (Number(o.total_amount || o.totalPrice || o.total || 0)), 0);
      days.push({
        date: dateStr,
        dayLabel: isBangla ? dayNameBn : dayNameEn,
        ordersCount: dayOrders.length,
        spent: daySpent,
      });
    }

    const maxSpent = Math.max(...days.map(d => d.spent), 500);
    return { days, maxSpent };
  }, [myOrders, isBangla]);

  const customerOrderJourney = React.useMemo(() => {
    const total = myOrders.length || 1;
    const delivered = myOrders.filter(o => (o.status || '').toLowerCase() === 'delivered' || (o.status || '').toLowerCase() === 'completed').length;
    const inTransit = myOrders.filter(o => ['shipped', 'processing', 'confirmed', 'packed'].includes((o.status || '').toLowerCase())).length;
    const pending = myOrders.filter(o => (o.status || '').toLowerCase() === 'pending').length;
    const cancelled = myOrders.filter(o => ['cancelled', 'returned'].includes((o.status || '').toLowerCase())).length;

    return {
      delivered: { count: delivered, pct: Math.round((delivered / total) * 100) },
      inTransit: { count: inTransit, pct: Math.round((inTransit / total) * 100) },
      pending: { count: pending, pct: Math.round((pending / total) * 100) },
      cancelled: { count: cancelled, pct: Math.round((cancelled / total) * 100) },
      total: myOrders.length
    };
  }, [myOrders]);

  const loyaltySavingsData = React.useMemo(() => {
    const totalSpent = (myOrders || []).reduce((sum, o) => sum + (Number(o.total_amount || o.totalPrice || o.total || 0)), 0);
    const estimatedSavings = Math.round(totalSpent * 0.12); // ~12% overall discount savings
    const loyaltyPoints = Math.floor(totalSpent / 100); // 1 point per ৳100 spent
    const nextTierGoal = 10000;
    const progressPct = Math.min(Math.round((totalSpent / nextTierGoal) * 100), 100);

    let tierName = 'Bronze Member';
    if (totalSpent >= 15000) tierName = 'VIP Platinum 👑';
    else if (totalSpent >= 7000) tierName = 'Gold Member 🥇';
    else if (totalSpent >= 2500) tierName = 'Silver Member 🥈';

    return {
      totalSpent,
      estimatedSavings,
      loyaltyPoints,
      progressPct,
      tierName
    };
  }, [myOrders]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/30">
            🔒
          </div>
          <h2 className="text-2xl font-black mb-2">{isBangla ? 'লগইন প্রয়োজন' : 'Login Required'}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {isBangla
              ? 'ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে আপনার একাউন্টে লগইন অথবা রেজিস্ট্রেশন করুন।'
              : 'Please login or register with your account to access your customer dashboard.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition-all text-center text-sm"
            >
              🔐 {isBangla ? 'লগইন / রেজিস্ট্রেশন করুন' : 'Login / Register Now'}
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-2xl transition-all text-center text-sm"
            >
              🏠 {isBangla ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Strict Role Guard: Sellers cannot view Customer Dashboard
  if (user && user.role === 'seller') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/30">
            🏪
          </div>
          <h2 className="text-2xl font-black mb-2">{isBangla ? 'সেলার একাউন্ট সনাক্ত হয়েছে' : 'Seller Account Detected'}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {isBangla
              ? 'কাস্টমার ড্যাশবোর্ড শুধুমাত্র ক্রেতা ও এডমিনের জন্য। সেলারদের জন্য আলাদা সেলার ড্যাশবোর্ড রয়েছে।'
              : 'Customer Dashboard is reserved for customers and admin. Please use your designated Seller Dashboard.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/seller"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all text-center text-sm"
            >
              🏪 {isBangla ? 'সেলার ড্যাশবোর্ডে প্রবেশ করুন' : 'Go to Seller Dashboard'}
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-2xl transition-all text-center text-sm"
            >
              🏠 {isBangla ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navMenuItems = [
    { id: 'dashboard', label: isBangla ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders', icon: ShoppingBag, count: myOrders.length },
    { id: 'cart', label: isBangla ? 'আমার কার্ট (Cart)' : 'My Cart', icon: ShoppingCart, count: cart?.length || 0, countColor: 'bg-emerald-600 text-white' },
    { id: 'profile', label: isBangla ? 'প্রোফাইল সেটিংস' : 'My Profile', icon: User },
    { id: 'addresses', label: isBangla ? 'ঠিকানা বই (Address)' : 'Address Book', icon: MapPin, count: addresses.length },
    { id: 'wishlist', label: isBangla ? 'পছন্দের তালিকা' : 'Wishlist', icon: Heart, count: wishlistProducts.length },
    { id: 'notifications', label: isBangla ? 'বিজ্ঞপ্তি' : 'Notifications', icon: Bell, count: notifications.filter(n => !n.is_read).length || null },
    { id: 'support', label: isBangla ? 'সাহায্য ও টিকিট' : 'Support & Help', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-[#0a150e] text-gray-900 dark:text-emerald-50 flex transition-colors">
      
      {/* 🔵 Customer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#112318] border-r border-[#e0ebe2] dark:border-[#1d3b28] w-72 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } shadow-xl lg:shadow-none`}
      >
        <div>
          {/* Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28]">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-500/30 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`transition-opacity duration-200 ${!isSidebarOpen && 'lg:hidden'}`}>
                <h2 className="font-extrabold text-xs sm:text-sm text-brand-950 dark:text-emerald-100 truncate">
                  {user?.name || 'Customer Account'}
                </h2>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  CUSTOMER DASHBOARD
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-270px)] overflow-y-auto custom-scrollbar">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-brand-900 text-white shadow-md dark:bg-emerald-600'
                      : 'text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className={`flex-1 text-left truncate ${!isSidebarOpen && 'lg:hidden'}`}>
                    {item.label}
                  </span>
                  {item.count !== null && item.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        item.countColor || 'bg-brand-800 text-white'
                      } ${!isSidebarOpen && 'lg:hidden'}`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Quick Actions (Profile, Settings, Theme) */}
        <div className="p-3 border-t border-[#e0ebe2] dark:border-[#1d3b28] space-y-2">
          {/* Avatar Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-emerald-950">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-xl object-cover border" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-brand-800 text-white flex items-center justify-center font-bold text-xs">
                {(user?.name || 'U').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className={`flex-1 min-w-0 ${!isSidebarOpen && 'lg:hidden'}`}>
              <p className="text-xs font-bold truncate text-gray-900 dark:text-emerald-100">{user?.name || profile.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || user?.phone || profile.phone}</p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <div className={`${!isSidebarOpen && 'lg:hidden'}`}>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-black/40 dark:hover:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 transition-all shadow-sm"
              title={isBangla ? 'থিম পরিবর্তন' : 'Toggle Theme'}
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-amber-600" />
                )}
                <span>{theme === 'dark' ? (isBangla ? 'লাইট মোড' : 'Light Mode') : (isBangla ? 'ডার্ক মোড' : 'Dark Mode')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-emerald-900 font-extrabold uppercase shadow-sm">
                {theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 hover:bg-slate-200 transition-all text-center"
              title="Back to Home"
            >
              <span>🏠</span>
              <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Home</span>
            </Link>
            <button
              onClick={() => {
                logout();
                window.location.href = '/auth';
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all text-center"
              title="Logout"
            >
              <span>🚪</span>
              <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 🔵 Customer Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        
        {/* Top Header */}
        <header className="h-16 bg-white/90 dark:bg-[#112318]/90 backdrop-blur-md border-b border-[#e0ebe2] dark:border-[#1d3b28] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border border-gray-200 dark:border-emerald-900 text-gray-700 dark:text-emerald-300 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-brand-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
              {navMenuItems.find((m) => m.id === activeMenu)?.label}
            </span>
            <button
              onClick={() => loadUserData(true)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{isBangla ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-2xl">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-5 h-5 rounded-full object-cover border border-emerald-400" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand-800 text-white flex items-center justify-center text-[10px] font-bold">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">{user?.name || 'Customer'}:</span>
              <span className="text-xs font-black uppercase text-brand-900 dark:text-emerald-300">
                {user?.role || 'CUSTOMER'}
              </span>
            </div>

            <Link
              href="/"
              className="text-xs font-bold bg-gray-100 dark:bg-emerald-950 text-gray-800 dark:text-emerald-200 hover:bg-gray-200 px-3 py-2 rounded-xl transition-all"
            >
              🏪 {isBangla ? 'হোমপেজ' : 'Store'}
            </Link>

            {/* Master Admin Switch */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 rounded-xl transition-all shadow-sm"
              >
                {isBangla ? 'এডমিন' : 'Admin'}
              </Link>
            )}

            <Link
              href="/products"
              className="text-xs font-bold bg-secondary hover:bg-gold-600 text-brand-950 px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              {isBangla ? '🛒 কেনাকাটা করুন' : 'Shop Now'}
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto pb-24">
          
          {/* ======================================================== */}
          {/* 1. 📊 DASHBOARD OVERVIEW                                  */}
          {/* ======================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveMenu('orders')}
                  className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-2xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'মোট অর্ডার' : 'Total Orders'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{myOrders.length}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveMenu('cart')}
                  className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                  <div className="p-3 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-2xl">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'কার্ট আইটেম' : 'Cart Items'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{cart.length}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveMenu('wishlist')}
                  className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-2xl">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'উইশলিস্ট পণ্য' : 'Wishlist Items'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{wishlistProducts.length}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveMenu('addresses')}
                  className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'সেভ করা ঠিকানা' : 'Saved Addresses'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{addresses.length}</h3>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 📈 3 INTERACTIVE CUSTOMER CHARTS & VISUALIZATIONS        */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Customer Spending Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span>{isBangla ? 'কেনাকাটার খরচ ও ব্যয় পরিসংখ্যান' : 'My Spending & Purchase Trend'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'গত ৭ দিনে আপনার মোট কেনাকাটা ও খরচের হিসাব' : 'Daily spending pattern and purchase history'}
                      </p>
                    </div>
                    <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full self-start sm:self-auto">
                      {loyaltySavingsData.tierName}
                    </span>
                  </div>

                  {/* SVG Bar Chart with Tooltips */}
                  <div className="pt-2">
                    <div className="h-48 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 pb-4 pt-6 bg-[#f8faf8] dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-emerald-950/80">
                      {customerSpendingData.days.map((item, idx) => {
                        const heightPct = Math.max(Math.round((item.spent / (customerSpendingData.maxSpent || 1)) * 100), item.spent > 0 ? 15 : 6);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-xl shadow-xl whitespace-nowrap">
                              <span>৳ {item.spent.toLocaleString()}</span>
                              <span className="text-emerald-400 block text-[9px]">{item.ordersCount} {isBangla ? 'অর্ডার' : 'orders'}</span>
                            </div>

                            {/* Bar Pillar */}
                            <div className="w-full max-w-[38px] bg-emerald-100/60 dark:bg-emerald-950/40 rounded-xl flex items-end p-1 h-full">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-lg transition-all duration-500 relative ${
                                  item.spent > 0
                                    ? 'bg-gradient-to-t from-brand-900 via-emerald-600 to-teal-400 shadow-md group-hover:brightness-110'
                                    : 'bg-gray-200 dark:bg-gray-800'
                                }`}
                              >
                                {item.ordersCount > 0 && (
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-emerald-800 dark:text-emerald-300">
                                    {item.ordersCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* X-Axis Label */}
                            <span className="text-[11px] font-extrabold text-gray-600 dark:text-emerald-300 mt-2">
                              {item.dayLabel}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">
                              {item.date.split('-')[2]}/{item.date.split('-')[1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200 dark:border-emerald-900/50">
                        <span className="text-[10px] text-gray-500 font-semibold block">{isBangla ? '৭ দিনের খরচ' : '7-Day Total'}</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">
                          ৳ {customerSpendingData.days.reduce((s, d) => s + d.spent, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-black/30 border border-blue-200 dark:border-blue-900/50">
                        <span className="text-[10px] text-gray-500 font-semibold block">{isBangla ? 'অর্ডারের সংখ্যা' : 'Orders Placed'}</span>
                        <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300">
                          {customerSpendingData.days.reduce((s, d) => s + d.ordersCount, 0)} {isBangla ? 'টি' : 'orders'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-purple-50/70 dark:bg-black/30 border border-purple-200 dark:border-purple-900/50 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-gray-500 font-semibold block">{isBangla ? 'রিওয়ার্ড পয়েন্ট' : 'Reward Points'}</span>
                        <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300">
                          🌟 {loyaltySavingsData.loyaltyPoints} Pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Order Fulfillment Status Doughnut Chart */}
                <div className="bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        <span>{isBangla ? 'অর্ডার প্রসেসিং অবস্থা' : 'Order Lifecycle Status'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'আপনার সকল অর্ডারের বর্তমান অবস্থা' : 'Distribution of orders by journey stages'}
                      </p>
                    </div>

                    {/* Doughnut SVG Ring */}
                    <div className="py-3 flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3.8" className="text-gray-100 dark:text-emerald-950" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.8"
                            strokeDasharray={`${customerOrderJourney.delivered.pct} 100`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3.8"
                            strokeDasharray={`${customerOrderJourney.inTransit.pct} 100`}
                            strokeDashoffset={`-${customerOrderJourney.delivered.pct}`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3.8"
                            strokeDasharray={`${customerOrderJourney.pending.pct} 100`}
                            strokeDashoffset={`-${customerOrderJourney.delivered.pct + customerOrderJourney.inTransit.pct}`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-xl font-black text-gray-900 dark:text-emerald-100">{myOrders.length}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{isBangla ? 'অর্ডার' : 'Orders'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Journey Legends */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          <span>{isBangla ? 'ডেলিভারড' : 'Delivered'}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-emerald-100">{customerOrderJourney.delivered.count} ({customerOrderJourney.delivered.pct}%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-black/30 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                        <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                          <span>{isBangla ? 'শিপড / প্রসেসিং' : 'In Transit'}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-emerald-100">{customerOrderJourney.inTransit.count} ({customerOrderJourney.inTransit.pct}%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-black/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          <span>{isBangla ? 'পেন্ডিং' : 'Pending'}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-emerald-100">{customerOrderJourney.pending.count} ({customerOrderJourney.pending.pct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Customer Savings & Loyalty Rewards Visualizer */}
                <div className="lg:col-span-3 bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>{isBangla ? 'ইহসান প্রিমিয়াম লয়ালটি ও সঞ্চয় ট্র্যাকার' : 'Ihsan Loyalty & Savings Tracker'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'আপনার কেনাকাটায় মোট ছাড়, লয়ালটি রিওয়ার্ড পয়েন্ট এবং ভিআইপি লেভেল' : 'Total money saved, reward points balance, and loyalty progression'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200 dark:border-emerald-900/60">
                      <p className="text-xs text-gray-500 font-bold">{isBangla ? 'মোট কেনাকাটা' : 'Total Spend'}</p>
                      <h4 className="text-xl font-black text-gray-900 dark:text-emerald-100 mt-1">৳ {loyaltySavingsData.totalSpent.toLocaleString()}</h4>
                      <div className="w-full bg-emerald-200 dark:bg-emerald-950 h-2 rounded-full mt-3 overflow-hidden">
                        <div style={{ width: `${Math.max(loyaltySavingsData.progressPct, 10)}%` }} className="bg-emerald-500 h-full rounded-full" />
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold mt-1 block">Tier Progress: {loyaltySavingsData.progressPct}%</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-black/30 border border-amber-200 dark:border-amber-900/60">
                      <p className="text-xs text-gray-500 font-bold">{isBangla ? 'মোট সাশ্রয় (Savings)' : 'Estimated Savings'}</p>
                      <h4 className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">৳ {loyaltySavingsData.estimatedSavings.toLocaleString()}</h4>
                      <div className="w-full bg-amber-200 dark:bg-amber-950 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-amber-500 h-full w-[65%] rounded-full" />
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-extrabold mt-1 block">Discounts & Offers Saved</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-black/30 border border-purple-200 dark:border-purple-900/60">
                      <p className="text-xs text-gray-500 font-bold">{isBangla ? 'রিওয়ার্ড ক্লাব স্ট্যাটাস' : 'Club Membership'}</p>
                      <h4 className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">{loyaltySavingsData.tierName}</h4>
                      <div className="w-full bg-purple-200 dark:bg-purple-950 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-purple-500 h-full w-full rounded-full" />
                      </div>
                      <span className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold mt-1 block">🌟 {loyaltySavingsData.loyaltyPoints} Reward Points Active</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Orders List */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black">{isBangla ? 'আমার সাম্প্রতিক অর্ডারসমূহ' : 'Recent Orders'}</h3>
                  <button
                    onClick={() => loadUserData(true)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-emerald-950 rounded-xl text-gray-500 transition-colors"
                    title="Refresh Orders"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </div>
                {myOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    {isBangla ? 'এখনো কোন অর্ডার নেই' : 'No recent orders placed'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#f4f7f4] dark:bg-black/30 font-bold">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Items</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {myOrders.slice(0, 5).map((ord) => (
                          <tr key={ord.id}>
                            <td className="p-3 font-extrabold text-brand-900 dark:text-emerald-300">{ord.orderId}</td>
                            <td className="p-3">{ord.items?.[0]?.name || 'Pure Organic Product'}</td>
                            <td className="p-3 font-black text-brand-900 dark:text-secondary">৳ {ord.totalAmount}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => setActiveMenu('orders')}
                                className="text-brand-900 dark:text-emerald-400 font-bold hover:underline"
                              >
                                {isBangla ? 'ট্র্যাক করুন' : 'Track'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 📦 2. CUSTOMER ORDERS & LIVE 5-STEP LIFECYCLE TRACKING   */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>📦 {isBangla ? 'আমার অর্ডারসমূহ ও লাইভ ট্র্যাকিং' : 'My Orders & Live Tracking'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-brand-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {myOrders.length} {isBangla ? 'টি অর্ডার' : 'Orders'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400 mt-0.5">
                    {isBangla ? 'আপনার প্রতিটি অর্ডারের লাইভ অগ্রগতি (Pending ➔ Confirmed ➔ Packed ➔ Shipped ➔ Delivered)' : 'Track live status transitions for each of your orders'}
                  </p>
                </div>
                <button
                  onClick={() => loadUserData(true)}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-black/40 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all self-start sm:self-auto flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 shadow-sm active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isBangla ? 'রিফ্রেশ করুন' : 'Refresh'}</span>
                </button>
              </div>

              {myOrders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed p-8">
                  <ShoppingBag className="w-14 h-14 text-gray-300 dark:text-emerald-900 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 dark:text-emerald-200">{isBangla ? 'আপনার কোন অর্ডার নেই' : 'You have no orders yet'}</h4>
                  <p className="text-xs text-gray-400 mt-1 mb-4">{isBangla ? 'পছন্দের পণ্য কার্টে যুক্ত করে সহজে অর্ডার সম্পন্ন করুন।' : 'Explore our collection and place your first order.'}</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-900 text-white text-xs font-black rounded-xl shadow-lg hover:bg-brand-800 transition-all"
                  >
                    <span>🛒 {isBangla ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {myOrders.map((ord) => {
                    const orderKey = ord.id || ord._id || ord.orderId;
                    const { currentStep, isCancelled, steps } = getStepProgress(ord.status);
                    const isLogsExpanded = !!expandedOrderLogs[orderKey];

                    return (
                      <div
                        key={orderKey}
                        className="p-5 sm:p-6 rounded-3xl bg-gray-50/80 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60 shadow-sm space-y-5 transition-all hover:border-emerald-500/40"
                      >
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-emerald-900/40 pb-4">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-sm sm:text-base font-black text-brand-900 dark:text-emerald-300">
                                #{ord.orderId || ord.id}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isCancelled ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                                ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                ord.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                                ord.status === 'Packed' || ord.status === 'Processing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                                ord.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                              }`}>
                                {ord.status === 'Pending' ? '🟡 Pending' :
                                 ord.status === 'Confirmed' ? '🔵 Confirmed' :
                                 ord.status === 'Packed' || ord.status === 'Processing' ? '📦 Packed' :
                                 ord.status === 'Shipped' ? '🚚 Shipped' :
                                 ord.status === 'Delivered' ? '✅ Delivered' : '❌ Cancelled'}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              {new Date(ord.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Invoice Button */}
                            <button
                              onClick={() => setSelectedOrderForInvoice(ord)}
                              className="px-3 py-1.5 bg-white dark:bg-black/40 border border-gray-200 dark:border-emerald-900 hover:bg-gray-100 text-brand-900 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{isBangla ? 'ইনভয়েস' : 'Invoice'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 🌟 5-STEP VISUAL PROGRESS TRACKER */}
                        {isCancelled ? (
                          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-center gap-3">
                            <span className="text-2xl">❌</span>
                            <div>
                              <h5 className="font-black text-xs sm:text-sm text-red-900 dark:text-red-300">
                                {isBangla ? 'এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে' : 'This order has been cancelled'}
                              </h5>
                              <p className="text-[11px] text-red-700/80 dark:text-red-400/80">
                                {isBangla ? 'কোন প্রশ্ন থাকলে আমাদের হেল্পলাইন বা সাপোর্টে যোগাযোগ করুন।' : 'If you have questions, please reach out to our support.'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 px-1 sm:px-4">
                            <div className="relative flex items-center justify-between">
                              {/* Background Connecting Line */}
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 dark:bg-emerald-950 -z-0">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-500"
                                  style={{
                                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                                  }}
                                ></div>
                              </div>

                              {/* Steps */}
                              {steps.map((st, idx) => {
                                const isPassed = idx <= currentStep;
                                const isCurrent = idx === currentStep;

                                return (
                                  <div key={st.key} className="relative z-10 flex flex-col items-center group">
                                    <div
                                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all shadow-md ${
                                        isCurrent
                                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 dark:ring-emerald-900 scale-110'
                                          : isPassed
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-400'
                                      }`}
                                    >
                                      {isPassed ? (
                                        <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                                      ) : (
                                        <span>{idx + 1}</span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-[10px] sm:text-xs font-bold mt-2 text-center whitespace-nowrap ${
                                        isCurrent
                                          ? 'text-brand-900 dark:text-emerald-300 font-extrabold'
                                          : isPassed
                                          ? 'text-gray-800 dark:text-emerald-200'
                                          : 'text-gray-400'
                                      }`}
                                    >
                                      {isBangla ? st.labelBn : st.labelEn}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Items Breakdown */}
                        <div className="bg-white dark:bg-black/30 p-4 rounded-2xl border border-gray-100 dark:border-emerald-900/40 space-y-3">
                          <h5 className="text-xs font-black uppercase text-brand-900 dark:text-emerald-300">
                            {isBangla ? 'অর্ডারের পণ্যসমূহ:' : 'Ordered Items:'}
                          </h5>
                          <div className="divide-y divide-gray-100 dark:divide-emerald-900/30">
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  {it.image && (
                                    <img src={it.image} alt={it.name} className="w-10 h-10 rounded-xl object-cover border flex-shrink-0" />
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-emerald-100">{it.name}</p>
                                    <span className="text-[10px] text-gray-400">{it.weight || 'Standard'} × {it.quantity}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-gray-900 dark:text-white">৳ {it.price * it.quantity}</span>
                                  <span className="block text-[10px] text-gray-400 font-mono">৳{it.price} each</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Summary & Delivery Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1 text-gray-600 dark:text-emerald-200">
                            <p><strong>{isBangla ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}</strong> {ord.deliveryAddress}</p>
                            <p><strong>{isBangla ? 'পেমেন্ট পদ্ধতি:' : 'Payment:'}</strong> <span className="uppercase font-bold">{ord.paymentMethod || 'COD'}</span> ({ord.paymentStatus || 'Pending'})</p>
                          </div>
                          <div className="sm:text-right space-y-0.5">
                            <p className="text-gray-500">{isBangla ? 'মোট প্রদেয় মূল্য:' : 'Total Amount:'}</p>
                            <p className="text-lg font-black text-brand-900 dark:text-secondary">৳ {ord.totalAmount}</p>
                          </div>
                        </div>

                        {/* Expandable Order Status History Logs (Audit Trail) */}
                        {ord.order_status_logs && ord.order_status_logs.length > 0 && (
                          <div className="pt-2 border-t border-gray-200 dark:border-emerald-900/40">
                            <button
                              onClick={() => {
                                setExpandedOrderLogs(prev => ({ ...prev, [orderKey]: !prev[orderKey] }));
                              }}
                              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <span>🕒 {isLogsExpanded ? (isBangla ? 'ট্র্যাকিং হিস্ট্রি লুকান ▲' : 'Hide Tracking History ▲') : (isBangla ? 'বিস্তারিত ট্র্যাকিং হিস্ট্রি দেখুন ▼' : 'View Detailed Tracking Logs ▼')}</span>
                            </button>

                            {isLogsExpanded && (
                              <div className="mt-3 p-3 bg-gray-100 dark:bg-black/40 rounded-2xl border text-xs space-y-2.5 animate-in fade-in">
                                {ord.order_status_logs.map((log, lIdx) => (
                                  <div key={lIdx} className="flex items-start gap-2.5 border-b border-gray-200 dark:border-emerald-900/30 last:border-0 pb-1.5 last:pb-0">
                                    <span className="text-sm mt-0.5">🟢</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-brand-900 dark:text-emerald-300">{log.status}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                      </div>
                                      {log.note && (
                                        <p className="text-[11px] text-gray-600 dark:text-emerald-400 mt-0.5 italic">
                                          "{log.note}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Printable Invoice Modal for Customer */}
              {selectedOrderForInvoice && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
                  <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border">
                    
                    <div className="flex items-center justify-between border-b pb-4 print:hidden">
                      <h4 className="font-black text-base text-gray-900">📄 {isBangla ? 'অর্ডার ইনভয়েস' : 'Order Invoice'}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
                        >
                          <Printer className="w-4 h-4" />
                          <span>{isBangla ? 'প্রিন্ট' : 'Print'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrderForInvoice(null)}
                          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-start border-b pb-3">
                        <div>
                          <h3 className="text-xl font-black text-emerald-900">Ihsan Online Shop</h3>
                          <p className="text-gray-500 text-[11px]">ঢাকা, বাংলাদেশ | ফোন: 01317539641</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-900">#{selectedOrderForInvoice.orderId || selectedOrderForInvoice.id}</p>
                          <p className="text-gray-400 text-[10px]">{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border">
                        <p><strong>Customer:</strong> {selectedOrderForInvoice.customerName} ({selectedOrderForInvoice.customerPhone})</p>
                        <p><strong>Address:</strong> {selectedOrderForInvoice.deliveryAddress}</p>
                        <p><strong>Status:</strong> <span className="font-bold uppercase text-emerald-800">{selectedOrderForInvoice.status}</span></p>
                      </div>

                      <table className="w-full border rounded-xl overflow-hidden text-left">
                        <thead className="bg-emerald-900 text-white font-bold">
                          <tr>
                            <th className="p-2.5">Item</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedOrderForInvoice.items?.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-bold">{it.name} ({it.weight || 'Std'})</td>
                              <td className="p-2.5 text-center font-black">×{it.quantity}</td>
                              <td className="p-2.5 text-right">৳ {it.price}</td>
                              <td className="p-2.5 text-right font-black">৳ {it.price * it.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="flex justify-end pt-2">
                        <div className="w-56 space-y-1 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Delivery Charge:</span>
                            <span>৳ {selectedOrderForInvoice.deliveryCharge || 70}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm text-emerald-900 border-t pt-1">
                            <span>Grand Total:</span>
                            <span>৳ {selectedOrderForInvoice.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 🛒 3. MY SHOPPING CART                                   */}
          {/* ======================================================== */}
          {activeMenu === 'cart' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>🛒 {isBangla ? 'আমার শপিং কার্ট' : 'My Shopping Cart'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-brand-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {cart.length} {isBangla ? 'টি পণ্য' : 'Items'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400 mt-0.5">
                    {isBangla ? 'আপনার নির্বাচিত পণ্যের পরিমাণ পরিবর্তন করুন এবং সহজে চেকআউট সম্পন্ন করুন' : 'Review items in your cart and proceed to checkout'}
                  </p>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/50 transition-all flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'কার্ট খালি করুন' : 'Clear Cart'}</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed p-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-emerald-900 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 dark:text-emerald-200 text-base">{isBangla ? 'আপনার কার্টে কোনো পণ্য নেই' : 'Your Cart is Currently Empty'}</h4>
                  <p className="text-xs text-gray-400 mt-1 mb-5">{isBangla ? 'আমাদের প্রিমিয়াম অর্গানিক পণ্যসমূহ দেখুন এবং কার্টে যুক্ত করুন।' : 'Browse our products and add them to your cart.'}</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white text-xs font-black rounded-xl shadow-lg transition-all"
                  >
                    <span>🛍️ {isBangla ? 'পণ্যসমূহ দেখুন' : 'Explore Products'}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#f4f7f4] dark:bg-black/40 text-gray-700 dark:text-emerald-300 font-bold border-b border-gray-200 dark:border-emerald-900/60">
                        <tr>
                          <th className="p-3.5">Product</th>
                          <th className="p-3.5">Unit Price</th>
                          <th className="p-3.5 text-center">Quantity</th>
                          <th className="p-3.5 text-right">Subtotal</th>
                          <th className="p-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                        {cart.map((item, idx) => (
                          <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-12 h-12 rounded-xl object-cover border flex-shrink-0" />
                                <div>
                                  <h5 className="font-bold text-gray-900 dark:text-emerald-100 leading-snug">{item.name}</h5>
                                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{item.weight || 'Standard'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-bold text-gray-800 dark:text-emerald-200">
                              ৳ {item.price}
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="inline-flex items-center border border-gray-200 dark:border-emerald-900 rounded-xl bg-white dark:bg-black/40 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                                  className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-600 dark:text-emerald-300 font-black text-xs"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 font-bold text-xs">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                                  className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-600 dark:text-emerald-300 font-black text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-right font-black text-brand-900 dark:text-secondary">
                              ৳ {item.price * item.quantity}
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => removeFromCart(item.productId, item.weight)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Checkout Summary Card */}
                  <div className="bg-gray-50 dark:bg-black/30 p-5 rounded-2xl border border-gray-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-xs text-gray-600 dark:text-emerald-300">
                      <p>Subtotal: <strong className="text-gray-900 dark:text-white">৳ {subtotal}</strong></p>
                      <p>Delivery: <strong className="text-gray-900 dark:text-white">৳ 70</strong> (ঢাকা) / <strong>৳ 120</strong> (ঢাকার বাইরে)</p>
                      <p className="text-base font-black text-brand-900 dark:text-secondary">
                        মোট প্রদেয়: ৳ {subtotal + 70}
                      </p>
                    </div>
                    <Link
                      href="/checkout"
                      className="w-full sm:w-auto px-8 py-3 bg-brand-900 hover:bg-brand-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <span>🛍️ {isBangla ? 'চেকআউট ও অর্ডার কনফার্ম করুন' : 'Proceed to Checkout'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 👤 4. MY PROFILE EDIT & SAVE (ENHANCED UI & MONGODB SYNC) */}
          {/* ======================================================== */}
          {activeMenu === 'profile' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <User className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-emerald-100">
                      {isBangla ? 'আমার প্রোফাইল সেটিংস ও সম্পাদনা' : 'My Profile & Account Settings'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'আপনার ব্যক্তিগত তথ্য, ছবি, ডেলিভারি ঠিকানা ও পাসওয়ার্ড সরাসরি MongoDB-তে আপডেট করুন।' : 'Update your personal profile, photo, delivery addresses, and security credentials.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isBangla ? 'ভেরিফাইড কাস্টমার' : 'Verified Member'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Overview (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm text-center space-y-4">
                    <div className="relative inline-block mx-auto">
                      {profile.avatar || user?.avatar ? (
                        <img
                          src={profile.avatar || user?.avatar}
                          alt="Customer Avatar"
                          className="w-28 h-28 rounded-3xl object-cover border-4 border-emerald-500/30 shadow-xl mx-auto"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-brand-900 via-emerald-800 to-teal-700 text-white font-black text-3xl flex items-center justify-center shadow-xl mx-auto">
                          {user?.name?.charAt(0) || profile?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-black flex items-center justify-center text-[10px] text-white">
                        ✓
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                        {profile.name || user?.name || 'Customer'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-emerald-400 font-mono mt-0.5">{profile.phone || user?.phone || '01XXXXXXXXX'}</p>
                      {profile.email && <p className="text-[11px] text-gray-400">{profile.email}</p>}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-emerald-950/60 grid grid-cols-2 gap-2 text-left text-xs">
                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-black/20">
                        <span className="text-[10px] text-gray-400 block">{isBangla ? 'মোট অর্ডার' : 'Total Orders'}</span>
                        <span className="font-bold text-brand-900 dark:text-emerald-400 text-sm">{myOrders.length} {isBangla ? 'টি' : ''}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-black/20">
                        <span className="text-[10px] text-gray-400 block">{isBangla ? 'মোট কেনাকাটা' : 'Total Spent'}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">৳ {myOrders.reduce((acc, o) => acc + (Number(o.totalAmount || o.total_amount || 0)), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-brand-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h5 className="font-black text-sm">{isBangla ? 'নিরাপদ শপিং নিশ্চয়তা' : 'Secure Shopping Account'}</h5>
                    </div>
                    <p className="text-xs text-emerald-100/80 leading-relaxed">
                      {isBangla
                        ? 'আপনার অ্যাকাউন্ট ও ডেলিভারি তথ্য সম্পূর্ণ সুরক্ষিত। অর্ডারের ট্র্যাকিং তথ্য সরাসরি এসএমএস এবং এই ড্যাশবোর্ডে পাবেন।'
                        : 'Your personal data and address are safely encrypted. You can track all your orders seamlessly.'}
                    </p>
                  </div>
                </div>

                {/* Right Form (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm">
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      
                      {/* Avatar Upload */}
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>{isBangla ? 'প্রোফাইল ছবি পরিবর্তন করুন (ImgBB CDN)' : 'Change Profile Avatar (ImgBB CDN)'}</span>
                        </h4>
                        <ImageUploader
                          label={isBangla ? 'নতুন প্রোফাইল ছবি আপলোড করুন' : 'Upload New Profile Photo'}
                          value={profile.avatar}
                          onChange={(url) => setProfile({ ...profile, avatar: url })}
                        />
                      </div>

                      {/* Personal Information */}
                      <div className="pt-4 border-t border-gray-100 dark:border-emerald-950 space-y-4">
                        <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                          <span>📋 {isBangla ? 'ব্যক্তিগত ও ডেলিভারি তথ্য' : 'Personal & Delivery Details'}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                              {isBangla ? 'পূর্ণ নাম *' : 'Full Name *'}
                            </label>
                            <input
                              type="text"
                              required
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              placeholder="e.g. Abdullah Al Mamun"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                              {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                            </label>
                            <input
                              type="tel"
                              required
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              placeholder="017XXXXXXXX"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                              {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                            </label>
                            <input
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              placeholder="user@example.com"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                              {isBangla ? 'শহর / জেলা' : 'City / District'}
                            </label>
                            <input
                              type="text"
                              value={profile.city}
                              onChange={(e) => setProfile({ ...profile, city: e.target.value, district: e.target.value })}
                              placeholder="e.g. Dhaka"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                            {isBangla ? 'ডিফল্ট ডেলিভারি ঠিকানা' : 'Default Delivery Address'}
                          </label>
                          <textarea
                            rows={3}
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder={isBangla ? 'বাসা নং, রোড নং, এলাকা, থানা, জেলা...' : 'House, Road, Area, Thana, District...'}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900 leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Password Change Section */}
                      <div className="pt-4 border-t border-gray-100 dark:border-emerald-950 space-y-4">
                        <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>{isBangla ? 'পাসওয়ার্ড পরিবর্তন (Password Update)' : 'Change Password'}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                              {isBangla ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক)' : 'New Password (Optional)'}
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={profile.newPassword || ''}
                              onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                              {isBangla ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={profile.currentPassword || ''}
                              onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="w-full bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-800 hover:from-brand-800 hover:to-teal-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all text-sm disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              <span>{isBangla ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to MongoDB...'}</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              <span>{isBangla ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন (Save to MongoDB)' : 'Save Profile Changes to MongoDB'}</span>
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 📍 5. ADDRESS BOOK                                        */}
          {/* ======================================================== */}
          {activeMenu === 'addresses' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-black">{isBangla ? 'ডেলিভারি ঠিকানা বই' : 'My Address Book'}</h3>
                <button
                  onClick={() => loadUserData(true)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-emerald-950 rounded-xl text-gray-500"
                  title="Refresh Addresses"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border space-y-3 max-w-xl">
                <h4 className="font-bold text-xs uppercase text-brand-900 dark:text-emerald-300">+ নতুন ঠিকানা যোগ করুন</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Address Title (Home/Office)"
                    value={newAddr.title}
                    onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-black/50 border rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="px-3 py-2 bg-white dark:bg-black/50 border rounded-xl text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="সম্পূর্ণ ঠিকানা (বাসা নং, রোড, এরিয়া)..."
                  value={newAddr.address_line}
                  onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/50 border rounded-xl text-xs"
                />
                <button type="submit" className="bg-brand-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow">
                  Save Address
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-2xl border bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1 text-xs">
                    <span className="font-bold text-sm text-brand-900 dark:text-emerald-300">{addr.title}</span>
                    <p className="text-gray-700 dark:text-emerald-200">{addr.address_line}</p>
                    <p className="text-gray-500">ফোন: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ❤️ 6. WISHLIST                                           */}
          {/* ======================================================== */}
          {activeMenu === 'wishlist' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <h3 className="text-lg font-black border-b pb-4">{isBangla ? 'আমার পছন্দের তালিকা (Wishlist)' : 'My Wishlist'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {wishlistProducts.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border bg-gray-50 dark:bg-black/20 flex flex-col justify-between">
                    <img src={p.thumbnail} alt={p.name} className="w-full h-36 object-cover rounded-xl mb-2" />
                    <h4 className="font-bold text-xs line-clamp-2">{p.name}</h4>
                    <p className="text-sm font-black text-brand-900 dark:text-secondary mt-1">৳ {p.price}</p>
                    <button
                      onClick={() => {
                        addToCart(p, null, 1, true);
                        showToast(isBangla ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
                      }}
                      className="mt-3 w-full bg-brand-900 text-white font-bold py-2 rounded-xl text-xs shadow"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🔔 7. NOTIFICATIONS                                      */}
          {/* ======================================================== */}
          {activeMenu === 'notifications' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                  <span>🔔 {isBangla ? 'আমার নোটিফিকেশন ও আপডেট' : 'My Notifications'}</span>
                </h3>
                <button
                  onClick={() => loadUserData(true)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-emerald-950 rounded-xl text-gray-500"
                  title="Refresh Notifications"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-emerald-900" />
                  <p>{isBangla ? 'কোন নতুন নোটিফিকেশন নেই' : 'No new notifications'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n, i) => (
                    <div key={i} className="p-4 rounded-2xl border bg-gray-50 dark:bg-black/30 flex items-start gap-3">
                      <span className="text-xl mt-0.5">🔔</span>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-emerald-100">{n.title}</h5>
                        <p className="text-xs text-gray-600 dark:text-emerald-300 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-gray-400 block mt-1">{new Date(n.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 🎧 8. HELP & SUPPORT TICKET                              */}
          {/* ======================================================== */}
          {activeMenu === 'support' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6 max-w-xl">
              <h3 className="text-lg font-black border-b pb-4">{isBangla ? 'সাহায্য ও সাপোর্ট টিকেট' : 'Help & Support'}</h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Ticket Subject (বিষয়)"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border rounded-xl text-xs sm:text-sm"
                />
                <textarea
                  rows={4}
                  required
                  placeholder="আপনার সমস্যা বা প্রশ্নের বিস্তারিত লিখুন..."
                  value={ticketMsg}
                  onChange={(e) => setTicketMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border rounded-xl text-xs sm:text-sm"
                />
                <button type="submit" className="w-full bg-brand-900 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-md">
                  Submit Ticket
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
