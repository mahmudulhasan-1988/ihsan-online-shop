'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';
import { 
  BarChart3, 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Megaphone, 
  FileText, 
  TrendingUp, 
  Headphones, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X, 
  DollarSign, 
  Truck, 
  Percent, 
  Tag, 
  Sparkles, 
  ArrowUpRight, 
  RefreshCw,
  ExternalLink,
  Save,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { 
  getStats, 
  getUsers, 
  updateUserStatus, 
  updateUserRole,
  getSellers, 
  updateSellerStatus, 
  updateSellerCommission, 
  getProducts, 
  createProduct, 
  updateProduct,
  deleteProduct, 
  getCategories, 
  getBrands, 
  getOrders, 
  updateOrderStatus, 
  deleteOrder,
  getPayments, 
  getSellerWithdrawals, 
  updateWithdrawalStatus, 
  getCoupons, 
  createCoupon, 
  getBanners, 
  getSupportTickets, 
  getSiteSettings, 
  updateSiteSettings,
  getPopupMessage,
  updatePopupMessage
} from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function AdminDashboardPage() {
  const { user, showToast } = useCart();
  const { isBangla, theme } = useThemeLanguage();

  // Active Menu Section
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'users' | 'sellers' | 'products' | 'orders' | 'payments' | 'marketing' | 'popup' | 'cms' | 'reports' | 'support' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [popupSettings, setPopupSettings] = useState({
    isActive: true,
    title: 'ইহসান অনলাইন শপ',
    titleEn: 'Ihsan Online Shop',
    badge: '🇵🇸 ফিলিস্তিন ও মানবতার কল্যাণে অনুদান',
    badgeEn: '🇵🇸 Palestine & Humanity Relief Support',
    message: '‘ইহসান অনলাইন শপ’ এর ব্যবসায়িক লাভের কিছু অংশ ফিলিস্তিনের মাজলুম পরিবারের জন্য এবং অসহায় দুস্থদের সহায়তার জন্য ব্যয় করা হয়। তাই ‘ইহসান অনলাইন শপ’ এই ফ্যামিলির সাথে যুক্ত হয়ে অসহায় দুস্থদের সহায়তার জন্য পাশে থাকুন।',
    messageEn: 'A portion of the profits from "Ihsan Online Shop" is dedicated to supporting the oppressed families of Palestine and helping underprivileged people. Join the Ihsan Online Shop family and stand with humanity!',
    buttonText: 'কেনাকাটা শুরু করুন',
    buttonTextEn: 'Start Shopping',
    buttonLink: '/products',
    image: '',
    showImage: false,
  });
  const [savingPopup, setSavingPopup] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Form State: Add Product
  const [newProd, setNewProd] = useState({
    name: '',
    name_bn: '',
    name_en: '',
    category_id: 1,
    price: '',
    regularPrice: '',
    stock_quantity: 50,
    sku: '',
    thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: '',
    is_featured: true,
  });

  // State: Edit Product Modal
  const [editingProd, setEditingProd] = useState(null);

  // Form State: Add Coupon
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'fixed',
    discount_value: '',
    min_purchase: 500,
    expiry_date: '2026-12-31',
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        usersRes,
        sellersRes,
        prodRes,
        catRes,
        brandRes,
        ordersRes,
        payRes,
        withRes,
        coupRes,
        banRes,
        tickRes,
        setRes,
        popupRes,
      ] = await Promise.all([
        getStats(),
        getUsers(),
        getSellers(),
        getProducts(),
        getCategories(),
        getBrands(),
        getOrders(),
        getPayments(),
        getSellerWithdrawals(),
        getCoupons(),
        getBanners(),
        getSupportTickets(),
        getSiteSettings(),
        getPopupMessage(),
      ]);

      setStats(statsRes?.data || null);
      setUsersList(usersRes?.data || []);
      setSellersList(sellersRes?.data || []);
      setProductsList(prodRes?.data || []);
      setCategoriesList(catRes?.data || []);
      setBrandsList(brandRes?.data || []);
      setOrdersList(ordersRes?.data || []);
      setPaymentsList(payRes?.data || []);
      setWithdrawalsList(withRes?.data || []);
      setCouponsList(coupRes?.data || []);
      setBannersList(banRes?.data || []);
      setTicketsList(tickRes?.data || []);
      setSiteSettings(setRes?.data || null);
      if (popupRes?.data) {
        setPopupSettings(popupRes.data);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleUserStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await updateUserStatus(userId, nextStatus);
    showToast(isBangla ? `ইউজার স্ট্যাটাস ${nextStatus} করা হয়েছে` : `User status changed to ${nextStatus}`);
    loadAllData();
  };

  const handleUserRoleChange = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
    setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    showToast(isBangla ? `ইউজার রোল ${newRole} এ পরিবর্তন করা হয়েছে!` : `User role updated to ${newRole}!`);
  };

  const handleSellerStatusChange = async (sellerId, newStatus) => {
    await updateSellerStatus(sellerId, newStatus);
    showToast(isBangla ? `সেলার স্ট্যাটাস ${newStatus} করা হয়েছে` : `Seller status updated to ${newStatus}`);
    loadAllData();
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    showToast(isBangla ? `অর্ডার স্ট্যাটাস ${newStatus} করা হয়েছে` : `Order status updated to ${newStatus}`);
    loadAllData();
  };

  const handleDeleteOrder = async (orderId) => {
    if (confirm(isBangla ? 'আপনি কি নিশ্চিত এই অর্ডারটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this order?')) {
      await deleteOrder(orderId);
      setOrdersList(ordersList.filter((o) => o.id !== orderId));
      showToast(isBangla ? 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে!' : 'Order deleted successfully!');
      loadAllData();
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProd?.name || !editingProd?.price) {
      showToast(isBangla ? 'পণ্যের নাম ও মূল্য দিন' : 'Please provide product name and price', 'error');
      return;
    }
    const targetId = editingProd._id || editingProd.id;
    const selectedCat = categoriesList.find((c) => c.id === Number(editingProd.category_id));
    const prodImg = editingProd.thumbnail || editingProd.images?.[0] || '';

    const payload = {
      ...editingProd,
      thumbnail: prodImg,
      images: editingProd.images && editingProd.images.length > 0 ? editingProd.images : (prodImg ? [prodImg] : []),
      category: selectedCat ? selectedCat.name : (editingProd.category || 'সকল পণ্য'),
      categorySlug: selectedCat ? selectedCat.slug : (editingProd.categorySlug || 'all'),
      name_bn: editingProd.name_bn || editingProd.name,
      name_en: editingProd.name_en || editingProd.nameEn || editingProd.name,
      nameEn: editingProd.name_en || editingProd.nameEn || editingProd.name,
      price: Number(editingProd.price),
      regularPrice: Number(editingProd.regularPrice || editingProd.price),
      stock_quantity: Number(editingProd.stock_quantity !== undefined ? editingProd.stock_quantity : 0),
      stock: Number(editingProd.stock_quantity !== undefined ? editingProd.stock_quantity : 0),
    };

    const res = await updateProduct(targetId, payload);
    if (res?.success !== false) {
      showToast(isBangla ? 'পণ্য ও ছবি সফলভাবে ডাটাবেসে আপডেট হয়েছে!' : 'Product and image updated successfully in database!');
      setEditingProd(null);
      loadAllData();
    } else {
      showToast(res?.message || (isBangla ? 'পণ্য আপডেট করতে সমস্যা হয়েছে' : 'Failed to update product'), 'error');
    }
  };

  const handleWithdrawStatus = async (withdrawId, status) => {
    await updateWithdrawalStatus(withdrawId, status);
    showToast(isBangla ? `উইথড্র রিকোয়েস্ট ${status} করা হয়েছে` : `Withdrawal ${status}`);
    loadAllData();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      showToast(isBangla ? 'পণ্যের নাম ও মূল্য দিন' : 'Please provide product name and price', 'error');
      return;
    }
    const selectedCat = categoriesList.find((c) => c.id === Number(newProd.category_id));
    const prodImg = newProd.thumbnail || '';

    const payload = {
      ...newProd,
      thumbnail: prodImg,
      images: prodImg ? [prodImg] : [],
      category: selectedCat ? selectedCat.name : 'সকল পণ্য',
      categorySlug: selectedCat ? selectedCat.slug : 'all',
      name_bn: newProd.name_bn || newProd.name,
      name_en: newProd.name_en || newProd.name,
      nameEn: newProd.name_en || newProd.name,
      slug: newProd.name_en ? newProd.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`,
      price: Number(newProd.price),
      regularPrice: Number(newProd.regularPrice || newProd.price),
      stock_quantity: Number(newProd.stock_quantity || 50),
      stock: Number(newProd.stock_quantity || 50),
    };

    const res = await createProduct(payload);
    if (res?.success !== false) {
      showToast(isBangla ? 'পণ্য ও ছবি সফলভাবে ডাটাবেসে যুক্ত হয়েছে!' : 'Product added successfully to database!');
      setNewProd({
        name: '',
        name_bn: '',
        name_en: '',
        category_id: 1,
        price: '',
        regularPrice: '',
        stock_quantity: 50,
        sku: '',
        thumbnail: '',
        description: '',
        is_featured: true,
      });
      setActiveSubTab('all');
      loadAllData();
    } else {
      showToast(res?.message || (isBangla ? 'পণ্য যুক্ত করতে সমস্যা হয়েছে' : 'Failed to add product'), 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount_value) {
      showToast(isBangla ? 'কুপন কোড ও মান দিন' : 'Provide coupon code and value', 'error');
      return;
    }
    await createCoupon({
      ...newCoupon,
      discount_value: Number(newCoupon.discount_value),
      min_purchase: Number(newCoupon.min_purchase),
      status: 'active',
    });
    showToast(isBangla ? 'কুপন সফলভাবে তৈরি হয়েছে!' : 'Coupon created successfully!');
    setNewCoupon({ code: '', discount_type: 'fixed', discount_value: '', min_purchase: 500, expiry_date: '2026-12-31' });
    loadAllData();
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await updateSiteSettings(siteSettings);
    showToast(isBangla ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!');
  };

  const handleUpdatePopup = async (e) => {
    if (e) e.preventDefault();
    setSavingPopup(true);
    try {
      const res = await updatePopupMessage(popupSettings);
      if (res?.success !== false) {
        showToast(isBangla ? 'পপআপ বার্তা সফলভাবে ডাটাবেসে সেভ হয়েছে!' : 'Popup notice saved successfully in database!');
      } else {
        showToast(res?.message || (isBangla ? 'সেভ করতে সমস্যা হয়েছে' : 'Failed to save popup notice'), 'error');
      }
    } catch (err) {
      showToast(isBangla ? 'ত্রুটি ঘটেছে' : 'An error occurred', 'error');
    } finally {
      setSavingPopup(false);
    }
  };

  // Nav Items Menu Configuration
  const navMenuItems = [
    { id: 'dashboard', label: isBangla ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard', icon: BarChart3, count: null },
    { id: 'users', label: isBangla ? 'ইউজার ম্যানেজমেন্ট' : 'User Management', icon: Users, count: usersList.length },
    { id: 'sellers', label: isBangla ? 'সেলার ম্যানেজমেন্ট' : 'Seller Management', icon: Store, count: sellersList.filter(s => s.status === 'pending').length || null, countColor: 'bg-amber-500' },
    { id: 'products', label: isBangla ? 'পণ্য ব্যবস্থাপনা' : 'Product Management', icon: Package, count: productsList.length },
    { id: 'orders', label: isBangla ? 'অর্ডার ম্যানেজমেন্ট' : 'Order Management', icon: ShoppingCart, count: ordersList.filter(o => o.status === 'Pending').length || null, countColor: 'bg-red-500' },
    { id: 'payments', label: isBangla ? 'পেমেন্ট ও উইথড্রয়াল' : 'Payment Management', icon: CreditCard, count: withdrawalsList.filter(w => w.status === 'pending').length || null },
    { id: 'popup', label: isBangla ? 'পপআপ বার্তা' : 'Popup Message', icon: MessageSquare, count: popupSettings.isActive ? 'Active' : 'Off', countColor: popupSettings.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white' },
    { id: 'marketing', label: isBangla ? 'মার্কেটিং ও অফার' : 'Marketing & Offers', icon: Megaphone, count: couponsList.length },
    { id: 'cms', label: isBangla ? 'কনটেন্ট (CMS)' : 'Content Management', icon: FileText, count: null },
    { id: 'reports', label: isBangla ? 'রিপোর্টস ও অ্যানালিটিক্স' : 'Reports & Export', icon: TrendingUp, count: null },
    { id: 'support', label: isBangla ? 'সাপোর্ট ও টিকেটস' : 'Support Tickets', icon: Headphones, count: ticketsList.filter(t => t.status === 'open').length || null, countColor: 'bg-emerald-500' },
    { id: 'settings', label: isBangla ? 'সিস্টেম সেটিংস' : 'System Settings', icon: Settings, count: null },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-[#0a150e] text-gray-900 dark:text-emerald-50 flex transition-colors">
      
      {/* 🔴 Collapsible Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#112318] border-r border-[#e0ebe2] dark:border-[#1d3b28] w-72 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } shadow-xl lg:shadow-none`}
      >
        {/* Sidebar Brand Header */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28]">
            <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                🌿
              </div>
              <div className={`transition-opacity duration-200 ${!isSidebarOpen && 'lg:hidden'}`}>
                <h2 className="font-extrabold text-sm sm:text-base leading-tight text-brand-950 dark:text-emerald-100">
                  {isBangla ? 'ইহসান অনলাইন শপ এডমিন' : 'Ihsan Online Shop Admin'}
                </h2>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Super Admin Panel
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900/40 text-gray-600 dark:text-emerald-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setActiveSubTab('all');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-brand-900 text-white shadow-md shadow-brand-950/20 dark:bg-emerald-600'
                      : 'text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className={`flex-1 text-left truncate ${!isSidebarOpen && 'lg:hidden'}`}>
                    {item.label}
                  </span>
                  {item.count !== null && item.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black text-white ${
                        item.countColor || 'bg-brand-800 dark:bg-emerald-800'
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

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-[#e0ebe2] dark:border-[#1d3b28]">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-gray-50 dark:bg-black/30">
            <div className="w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              AD
            </div>
            <div className={`flex-1 min-w-0 ${!isSidebarOpen && 'lg:hidden'}`}>
              <p className="text-xs font-bold truncate text-gray-900 dark:text-emerald-100">
                {isBangla ? 'এডমিন মডারেটর' : 'Admin Moderator'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">01700000000</p>
            </div>
            <Link
              href="/"
              target="_blank"
              className={`p-1.5 text-gray-500 hover:text-brand-900 dark:hover:text-emerald-300 rounded-xl hover:bg-white dark:hover:bg-emerald-950 ${
                !isSidebarOpen && 'lg:hidden'
              }`}
              title="Visit Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 🔴 Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 dark:bg-[#112318]/90 backdrop-blur-md border-b border-[#e0ebe2] dark:border-[#1d3b28] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border border-gray-200 dark:border-emerald-900 text-gray-700 dark:text-emerald-300 hover:bg-gray-50 dark:hover:bg-emerald-950"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-brand-900 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full">
                {navMenuItems.find((m) => m.id === activeMenu)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isBangla ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-2xl">
              <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Role</span>
                <span className="text-xs font-black uppercase text-purple-800 dark:text-purple-300">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs font-bold bg-gray-100 dark:bg-emerald-950 text-gray-800 dark:text-emerald-200 hover:bg-gray-200 px-3 py-2 rounded-xl transition-all"
            >
              🏪 {isBangla ? 'স্টোর ভিউ' : 'Storefront'}
            </Link>

            <Link
              href="/seller"
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-brand-950 px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              {isBangla ? 'সেলার' : 'Seller'}
            </Link>

            <Link
              href="/dashboard"
              className="text-xs font-bold bg-brand-900 hover:bg-brand-800 text-white px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              {isBangla ? 'কাস্টমার' : 'Customer'}
            </Link>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto pb-24">
          
          {/* ======================================================== */}
          {/* 1. 📊 DASHBOARD OVERVIEW & ANALYTICS                     */}
          {/* ======================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-2xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-emerald-400 font-semibold">{isBangla ? 'মোট রেভিনিউ' : 'Total Revenue'}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-100">৳ {stats.totalRevenue}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-2xl">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-emerald-400 font-semibold">{isBangla ? 'মোট অর্ডার' : 'Total Orders'}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-100">{stats.totalOrders}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-emerald-400 font-semibold">{isBangla ? 'পেন্ডিং অর্ডার' : 'Pending Orders'}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pendingOrders}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-2xl">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-emerald-400 font-semibold">{isBangla ? 'মোট ভেন্ডর/সেলার' : 'Active Sellers'}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-100">{sellersList.length}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-brand-900 dark:text-emerald-400" />
                    <span>{isBangla ? 'সাম্প্রতিক অর্ডারসমূহ' : 'Recent Orders'}</span>
                  </h3>
                  <button
                    onClick={() => setActiveMenu('orders')}
                    className="text-xs font-bold text-brand-900 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{isBangla ? 'সব অর্ডার দেখুন' : 'View All Orders'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                      {ordersList.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <td className="p-3 font-extrabold text-brand-900 dark:text-emerald-300">{order.orderId}</td>
                          <td className="p-3">
                            <p className="font-bold">{order.customerName}</p>
                            <span className="text-[11px] text-gray-500">{order.customerPhone}</span>
                          </td>
                          <td className="p-3">{order.items?.length || 1} items</td>
                          <td className="p-3 font-black text-brand-900 dark:text-secondary">৳ {order.totalAmount}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="px-2 py-1 bg-white dark:bg-black/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-bold"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. 👥 USER MANAGEMENT                                    */}
          {/* ======================================================== */}
          {activeMenu === 'users' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                    {isBangla ? 'ইউজার ম্যানেজমেন্ট' : 'User Management'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'রেজিস্টার্ড গ্রাহক ও ব্যবহারকারীদের পরিচালনা' : 'Manage registered customers and users'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSubTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'all' ? 'bg-brand-900 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    All ({usersList.length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('blocked')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'blocked' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    Blocked ({usersList.filter(u => u.status === 'blocked').length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Phone & Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                    {usersList
                      .filter((u) => (activeSubTab === 'blocked' ? u.status === 'blocked' : true))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <td className="p-3 flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-bold">{u.name}</span>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{u.phone}</p>
                            <span className="text-gray-500 text-[11px]">{u.email}</span>
                          </td>
                          <td className="p-3">
                            <select
                              value={u.role || 'customer'}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                              className="px-2.5 py-1 bg-white dark:bg-black/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-brand-900 dark:text-emerald-300 capitalize cursor-pointer hover:border-brand-900 focus:outline-none"
                            >
                              <option value="customer">Customer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-3">{u.orders_count || 0} Orders (৳ {u.total_spent || 0})</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleUserStatusToggle(u.id, u.status)}
                              className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all ${
                                u.status === 'active'
                                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                                  : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.status === 'active' ? (isBangla ? 'ব্লক করুন' : 'Block User') : (isBangla ? 'আনব্লক করুন' : 'Unblock')}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. 🏪 SELLER MANAGEMENT                                  */}
          {/* ======================================================== */}
          {activeMenu === 'sellers' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                    {isBangla ? 'ভেন্ডর ও সেলার ম্যানেজমেন্ট' : 'Seller & Vendor Management'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'নতুন সেলার অনুমোদন, কমিশন ও স্টোর সেটিংস' : 'Seller approvals, commission settings and shop policies'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSubTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                      activeSubTab === 'all' ? 'bg-brand-900 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    All ({sellersList.length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('pending')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                      activeSubTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    Pending ({sellersList.filter(s => s.status === 'pending').length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellersList
                  .filter((s) => (activeSubTab === 'pending' ? s.status === 'pending' : true))
                  .map((seller) => (
                    <div
                      key={seller.id}
                      className="bg-gray-50 dark:bg-black/20 p-5 rounded-3xl border border-gray-200 dark:border-emerald-900/60 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <img src={seller.shop_logo} alt={seller.shop_name} className="w-12 h-12 rounded-2xl object-cover border" />
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                          seller.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          seller.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {seller.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base leading-snug">{seller.shop_name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seller.shop_description}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-emerald-900/40 text-xs space-y-1 text-gray-600 dark:text-emerald-300">
                        <div className="flex justify-between">
                          <span>Trade License:</span>
                          <span className="font-semibold">{seller.trade_license}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission Rate:</span>
                          <span className="font-bold text-brand-900 dark:text-secondary">{seller.commission_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wallet Balance:</span>
                          <span className="font-bold text-emerald-600">৳ {seller.balance}</span>
                        </div>
                      </div>
                      <div className="pt-2 flex gap-2">
                        {seller.status === 'pending' ? (
                          <button
                            onClick={() => handleSellerStatusChange(seller.id, 'approved')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl"
                          >
                            Approve Seller
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSellerStatusChange(seller.id, seller.status === 'approved' ? 'suspended' : 'approved')}
                            className="flex-1 bg-gray-200 dark:bg-emerald-950 text-gray-800 dark:text-emerald-200 text-xs font-bold py-2 rounded-xl"
                          >
                            {seller.status === 'approved' ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. 📦 PRODUCT MANAGEMENT                                 */}
          {/* ======================================================== */}
          {activeMenu === 'products' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                    {isBangla ? 'পণ্য ব্যবস্থাপনা' : 'Product Management'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'ক্যাটালগ, ক্যাটাগরি, ব্র্যান্ড ও নতুন পণ্য সংযোজন' : 'Products catalog, categories and brands management'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSubTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                      activeSubTab === 'all' ? 'bg-brand-900 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    All Products ({productsList.length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('add')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                      activeSubTab === 'add' ? 'bg-brand-900 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {activeSubTab === 'all' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList.map((prod) => (
                    <div
                      key={prod._id || prod.id || prod.slug}
                      className="bg-gray-50 dark:bg-black/20 p-4 rounded-3xl border border-gray-200 dark:border-emerald-900/60 flex flex-col justify-between"
                    >
                      <div className="flex gap-3">
                        <img src={prod.thumbnail || prod.images?.[0]} alt={prod.name} className="w-20 h-20 rounded-2xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                            SKU: {prod.sku || 'GB-001'}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug">{prod.name}</h4>
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="text-base font-black text-brand-900 dark:text-secondary">৳ {prod.price}</span>
                            {prod.regularPrice > prod.price && (
                              <span className="text-xs text-gray-400 line-through">৳ {prod.regularPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Stock: <strong>{prod.stock_quantity || 50}</strong></span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingProd(prod)}
                            className="p-1.5 text-brand-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            title={isBangla ? 'এডিট করুন' : 'Edit Product'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(isBangla ? 'আপনি কি নিশ্চিত এই পণ্যটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this product?')) {
                                await deleteProduct(prod._id || prod.id);
                                showToast(isBangla ? 'পণ্য মুছে ফেলা হয়েছে' : 'Product deleted');
                                loadAllData();
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title={isBangla ? 'মুছে ফেলুন' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleCreateProduct} className="max-w-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Product Name (Bangla) *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: সুন্দরবনের খাঁটি মধু"
                        value={newProd.name}
                        onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Product Name (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Sundarban Pure Honey"
                        value={newProd.name_en}
                        onChange={(e) => setNewProd({ ...newProd, name_en: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Category *</label>
                      <select
                        value={newProd.category_id}
                        onChange={(e) => setNewProd({ ...newProd, category_id: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                      >
                        {categoriesList.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Sale Price (৳) *</label>
                      <input
                        type="number"
                        required
                        placeholder="950"
                        value={newProd.price}
                        onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Regular Price (৳)</label>
                      <input
                        type="number"
                        placeholder="1100"
                        value={newProd.regularPrice}
                        onChange={(e) => setNewProd({ ...newProd, regularPrice: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      label={isBangla ? 'পণ্যের ছবি আপলোড (ImgBB CDN) *' : 'Product Image Upload (ImgBB CDN) *'}
                      placeholder={isBangla ? 'ছবি আপলোড করতে ক্লিক করুন বা ড্র্যাগ করুন' : 'Click or drag image to upload to ImgBB'}
                      value={newProd.thumbnail}
                      onChange={(url) => setNewProd({ ...newProd, thumbnail: url })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newProd.description}
                      onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-900 hover:bg-brand-800 text-white font-black py-3 rounded-2xl shadow-lg"
                  >
                    Save Product
                  </button>
                </form>
              )}

              {/* ✏️ Edit Product Modal */}
              {editingProd && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#e0ebe2] dark:border-[#1d3b28] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-3">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                          <Edit className="w-5 h-5 text-brand-900 dark:text-emerald-400" />
                          <span>{isBangla ? 'পণ্য সম্পাদনা করুন' : 'Edit Product'}</span>
                        </h3>
                        <p className="text-xs text-gray-500">ID: #{editingProd.id}</p>
                      </div>
                      <button
                        onClick={() => setEditingProd(null)}
                        className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProduct} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">Product Name (Bangla) *</label>
                          <input
                            type="text"
                            required
                            value={editingProd.name || ''}
                            onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Product Name (English)</label>
                          <input
                            type="text"
                            value={editingProd.name_en || ''}
                            onChange={(e) => setEditingProd({ ...editingProd, name_en: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">Category *</label>
                          <select
                            value={editingProd.category_id || 1}
                            onChange={(e) => setEditingProd({ ...editingProd, category_id: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          >
                            {categoriesList.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Sale Price (৳) *</label>
                          <input
                            type="number"
                            required
                            value={editingProd.price || ''}
                            onChange={(e) => setEditingProd({ ...editingProd, price: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Regular Price (৳)</label>
                          <input
                            type="number"
                            value={editingProd.regularPrice || ''}
                            onChange={(e) => setEditingProd({ ...editingProd, regularPrice: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={editingProd.stock_quantity || 0}
                            onChange={(e) => setEditingProd({ ...editingProd, stock_quantity: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">SKU</label>
                          <input
                            type="text"
                            value={editingProd.sku || ''}
                            onChange={(e) => setEditingProd({ ...editingProd, sku: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <ImageUploader
                          label={isBangla ? 'পণ্যের ছবি আপডেট (ImgBB CDN) *' : 'Update Product Image (ImgBB CDN) *'}
                          placeholder={isBangla ? 'ছবি আপলোড করতে ক্লিক করুন বা ড্র্যাগ করুন' : 'Click or drag image to upload to ImgBB'}
                          value={editingProd.thumbnail || editingProd.images?.[0] || ''}
                          onChange={(url) => setEditingProd({ ...editingProd, thumbnail: url, images: [url] })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={editingProd.description || ''}
                          onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e0ebe2] dark:border-[#1d3b28]">
                        <button
                          type="button"
                          onClick={() => setEditingProd(null)}
                          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-emerald-900 text-xs font-bold hover:bg-gray-100"
                        >
                          {isBangla ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all"
                        >
                          {isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. 🛒 ORDER MANAGEMENT                                   */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                    {isBangla ? 'অর্ডার ম্যানেজমেন্ট' : 'Order Management'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'সকল অর্ডার ট্র্যাকিং ও প্রসেসিং' : 'Track and update fulfillment status'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setActiveSubTab(st)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeSubTab === st ? 'bg-brand-900 text-white' : 'bg-gray-100 dark:bg-black/30'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                    {ordersList
                      .filter((o) => (activeSubTab === 'all' ? true : o.status === activeSubTab))
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <td className="p-3 font-extrabold text-brand-900 dark:text-emerald-300">
                            {order.orderId}
                            <span className="block text-[10px] text-gray-400 font-normal">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.customerPhone}</p>
                          </td>
                          <td className="p-3 max-w-xs truncate">{order.deliveryAddress}</td>
                          <td className="p-3">
                            {order.items?.map((it, idx) => (
                              <div key={idx} className="text-[11px] text-gray-600 dark:text-emerald-300">
                                • {it.name} ({it.weight}) × {it.quantity}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-black text-brand-900 dark:text-secondary">
                            ৳ {order.totalAmount}
                            <span className="block text-[10px] uppercase text-gray-400 font-normal">
                              {order.paymentMethod} ({order.paymentStatus || 'unpaid'})
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                                    : order.status === 'Cancelled'
                                    ? 'bg-red-50 dark:bg-red-950/60 border-red-300 text-red-800 dark:text-red-300'
                                    : order.status === 'Shipped'
                                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-800 dark:text-blue-300'
                                    : order.status === 'Processing'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300'
                                    : 'bg-gray-50 dark:bg-black/40 border-gray-300 text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50 transition-colors shrink-0"
                                title={isBangla ? 'অর্ডার মুছে ফেলুন' : 'Delete Order'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. 💰 PAYMENT & WITHDRAWALS                              */}
          {/* ======================================================== */}
          {activeMenu === 'payments' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                    {isBangla ? 'পেমেন্ট ও সেলার পে-আউট' : 'Payment & Seller Payouts'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'লেনদেনের হিস্ট্রি ও সেলার উইথড্রয়াল রিকোয়েস্ট' : 'Transactions & Seller Withdrawal Requests'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSubTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                      activeSubTab === 'all' ? 'bg-brand-900 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    Withdrawals ({withdrawalsList.length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('transactions')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                      activeSubTab === 'transactions' ? 'bg-brand-900 text-white' : 'bg-gray-100 dark:bg-black/30'
                    }`}
                  >
                    Transactions ({paymentsList.length})
                  </button>
                </div>
              </div>

              {activeSubTab === 'all' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                      <tr>
                        <th className="p-3">Seller / Shop</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Payout Method</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                      {withdrawalsList.map((w) => (
                        <tr key={w.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <td className="p-3 font-bold">{w.shop_name}</td>
                          <td className="p-3 font-black text-brand-900 dark:text-secondary">৳ {w.amount}</td>
                          <td className="p-3 text-gray-600 dark:text-emerald-300">{w.account_details || w.method}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                              w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              w.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {w.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleWithdrawStatus(w.id, 'approved')}
                                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleWithdrawStatus(w.id, 'rejected')}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                      <tr>
                        <th className="p-3">Order Number</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Transaction ID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                      {paymentsList.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 font-bold">{p.order_number}</td>
                          <td className="p-3 uppercase font-semibold">{p.method}</td>
                          <td className="p-3 font-mono text-xs">{p.transaction_id}</td>
                          <td className="p-3 font-bold">৳ {p.amount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. 🎯 MARKETING & COUPONS                                */}
          {/* ======================================================== */}
          {activeMenu === 'marketing' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                    {isBangla ? 'মার্কেটিং ও কুপন ডিসকাউন্ট' : 'Marketing & Coupons'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'ডিসকাউন্ট কুপন, প্রোমো ব্যানার ও ফ্ল্যাশ সেল' : 'Discount vouchers, promo banners and flash sales'}
                  </p>
                </div>
              </div>

              {/* Add Coupon Form */}
              <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-3xl border border-gray-200 dark:border-emerald-900/60 space-y-3">
                <h4 className="font-bold text-sm text-brand-900 dark:text-emerald-300">
                  {isBangla ? 'নতুন কুপন কোড তৈরি করুন' : 'Create New Discount Coupon'}
                </h4>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Coupon Code (e.g. EID100)"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="px-3.5 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold uppercase"
                  />
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="px-3.5 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                  >
                    <option value="fixed">Fixed Discount (৳)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Discount Amount"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                    className="px-3.5 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 rounded-xl text-xs sm:text-sm"
                  >
                    Create Coupon
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {couponsList.map((coup) => (
                  <div key={coup.id} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-black text-brand-900 dark:text-emerald-300 bg-white dark:bg-black/40 px-2.5 py-1 rounded-lg border">
                        {coup.code}
                      </span>
                      <p className="text-xs font-bold text-gray-700 dark:text-emerald-200 mt-2">
                        {coup.discount_type === 'percentage' ? `${coup.discount_value}% OFF` : `৳ ${coup.discount_value} OFF`}
                      </p>
                      <span className="text-[10px] text-gray-500">Min Purchase: ৳ {coup.min_purchase}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Used: {coup.usage_count || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7.5. 📢 POPUP MESSAGE MANAGEMENT                        */}
          {/* ======================================================== */}
          {activeMenu === 'popup' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                      <span>🇵🇸</span>
                      <span>{isBangla ? 'পপআপ বার্তা ও ফিলিস্তিন সহায়তা নোটিশ' : 'Popup Message & Charity Notice'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-400">
                      {isBangla 
                        ? 'ওয়েবসাইট ওপেন বা রিফ্রেশ করলে ভিজিটরদের সামনে প্রদর্শিত পপআপ বার্তা পরিবর্তন ও নিয়ন্ত্রণ করুন'
                        : 'Manage dynamic announcement and charity popup shown upon site open / refresh'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      popupSettings.isActive 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${popupSettings.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                      <span>{popupSettings.isActive ? (isBangla ? 'সক্রিয় (Active)' : 'Active') : (isBangla ? 'নিষ্ক্রিয় (Disabled)' : 'Disabled')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                  {/* Left Form (7 cols) */}
                  <form onSubmit={handleUpdatePopup} className="lg:col-span-7 space-y-4">
                    
                    {/* Active Toggle Switch */}
                    <div className="p-4 bg-emerald-50/60 dark:bg-black/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-100">
                          {isBangla ? 'পপআপ নোটিশ চালু রাখুন' : 'Enable Popup Notice'}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-400">
                          {isBangla ? 'চালু থাকলে সকল ভিজিটর ওয়েবসাইট লোড করলে বার্তাটি দেখতে পাবে' : 'When active, visitors will see the popup on site load/refresh'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={popupSettings.isActive}
                          onChange={(e) => setPopupSettings({ ...popupSettings, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Title Bangla & English */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Title (Bangla) *</label>
                        <input
                          type="text"
                          required
                          value={popupSettings.title || ''}
                          onChange={(e) => setPopupSettings({ ...popupSettings, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                          placeholder="ইহসান অনলাইন শপ"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Title (English)</label>
                        <input
                          type="text"
                          value={popupSettings.titleEn || ''}
                          onChange={(e) => setPopupSettings({ ...popupSettings, titleEn: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          placeholder="Ihsan Online Shop"
                        />
                      </div>
                    </div>

                    {/* Badge Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Badge / Tag (Bangla)</label>
                        <input
                          type="text"
                          value={popupSettings.badge || ''}
                          onChange={(e) => setPopupSettings({ ...popupSettings, badge: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          placeholder="🇵🇸 ফিলিস্তিন ও মানবতার কল্যাণে অনুদান"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Badge / Tag (English)</label>
                        <input
                          type="text"
                          value={popupSettings.badgeEn || ''}
                          onChange={(e) => setPopupSettings({ ...popupSettings, badgeEn: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          placeholder="🇵🇸 Palestine & Humanity Relief Support"
                        />
                      </div>
                    </div>

                    {/* Message Bangla */}
                    <div>
                      <label className="block text-xs font-bold mb-1">Popup Message (Bangla) *</label>
                      <textarea
                        rows={4}
                        required
                        value={popupSettings.message || ''}
                        onChange={(e) => setPopupSettings({ ...popupSettings, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm leading-relaxed"
                        placeholder="পপআপের মূল বার্তাটি লিখুন..."
                      />
                    </div>

                    {/* Message English */}
                    <div>
                      <label className="block text-xs font-bold mb-1">Popup Message (English)</label>
                      <textarea
                        rows={3}
                        value={popupSettings.messageEn || ''}
                        onChange={(e) => setPopupSettings({ ...popupSettings, messageEn: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm leading-relaxed"
                        placeholder="Write English message (optional)..."
                      />
                    </div>

                    {/* CTA Button Text & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Button Text (Bangla)</label>
                        <input
                          type="text"
                          value={popupSettings.buttonText || ''}
                          onChange={(e) => setPopupSettings({ ...popupSettings, buttonText: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          placeholder="কেনাকাটা শুরু করুন"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Button Link</label>
                        <input
                          type="text"
                          value={popupSettings.buttonLink || ''}
                          onChange={(e) => setPopupSettings({ ...popupSettings, buttonLink: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                          placeholder="/products"
                        />
                      </div>
                    </div>

                    {/* Optional Image */}
                    <div>
                      <ImageUploader
                        label={isBangla ? 'পপআপ ব্যানার / ছবি (ঐচ্ছিক - ImgBB CDN)' : 'Popup Image / Banner (Optional - ImgBB CDN)'}
                        placeholder={isBangla ? 'পপআপের জন্য ছবি আপলোড করুন' : 'Upload popup image to ImgBB'}
                        value={popupSettings.image || ''}
                        onChange={(url) => setPopupSettings({ ...popupSettings, image: url, showImage: !!url })}
                      />
                      {popupSettings.image && (
                        <label className="flex items-center gap-2 mt-2 text-xs text-gray-700 dark:text-emerald-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={popupSettings.showImage}
                            onChange={(e) => setPopupSettings({ ...popupSettings, showImage: e.target.checked })}
                            className="rounded border-gray-300 text-brand-900 focus:ring-emerald-500"
                          />
                          <span>{isBangla ? 'পপআপে এই ছবিটি প্রদর্শন করুন' : 'Display this image in popup'}</span>
                        </label>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={savingPopup}
                      className="w-full bg-gradient-to-r from-brand-900 via-emerald-800 to-brand-950 hover:from-brand-800 hover:to-emerald-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {savingPopup ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>
                        {savingPopup 
                          ? (isBangla ? 'ডাটাবেসে সেভ হচ্ছে...' : 'Saving to Database...') 
                          : (isBangla ? 'পপআপ নোটিশ সংরক্ষণ করুন (Save to MongoDB)' : 'Save Popup Notice to MongoDB')}
                      </span>
                    </button>
                  </form>

                  {/* Right Live Preview (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        <span>{isBangla ? 'লাইভ প্রিভিউ (Live Preview)' : 'Live Preview'}</span>
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {isBangla ? 'ভিজিটররা যেভাবে দেখবে' : 'Visitor View'}
                      </span>
                    </div>

                    <div className="p-4 bg-gray-100 dark:bg-black/50 rounded-3xl border border-gray-200 dark:border-emerald-950">
                      <div className="bg-white dark:bg-[#0e2115] rounded-2xl border border-emerald-500/30 shadow-xl overflow-hidden text-center p-5 space-y-4">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700 -mx-5 -mt-5 mb-3" />
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold mx-auto">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{popupSettings.badge || '🇵🇸 ফিলিস্তিন ও মানবতার কল্যাণে অনুদান'}</span>
                        </div>

                        <div>
                          <h4 className="text-xl font-black text-gray-900 dark:text-emerald-100">
                            {popupSettings.title || 'ইহসান অনলাইন শপ'}
                          </h4>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {isBangla ? 'মানবতার সেবায় আপনার প্রতিটি কেনাকাটা' : 'Every purchase dedicated to humanity'}
                          </p>
                        </div>

                        {popupSettings.showImage && popupSettings.image && (
                          <div className="rounded-xl overflow-hidden max-h-32">
                            <img src={popupSettings.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="bg-emerald-50/70 dark:bg-black/30 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-gray-800 dark:text-emerald-100 leading-relaxed">
                          {popupSettings.message || 'পপআপের মেসেজ এখানে দেখাবে...'}
                        </div>

                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-2.5 rounded-xl text-xs shadow"
                          >
                            {popupSettings.buttonText || 'কেনাকাটা শুরু করুন'}
                          </button>
                          <button
                            type="button"
                            className="w-full bg-gray-100 dark:bg-emerald-950 text-gray-600 dark:text-emerald-300 font-semibold py-2 rounded-xl text-xs"
                          >
                            {isBangla ? 'ঠিক আছে, পাশে থাকব' : 'I Stand With You'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. 💬 SUPPORT & TICKETS                                  */}
          {/* ======================================================== */}
          {activeMenu === 'support' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                  {isBangla ? 'কাস্টমার ও সেলার সাপোর্ট টিকেটস' : 'Support Tickets & Helpdesk'}
                </h3>
              </div>

              <div className="space-y-3">
                {ticketsList.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-emerald-900/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-900 dark:text-emerald-300">
                        From: {ticket.user_name} ({ticket.user_role})
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        ticket.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm">{ticket.subject}</h4>
                    <p className="text-xs text-gray-600 dark:text-emerald-300 leading-relaxed">{ticket.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. ⚙️ SETTINGS                                           */}
          {/* ======================================================== */}
          {activeMenu === 'settings' && siteSettings && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6 max-w-3xl">
              <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100">
                  {isBangla ? 'সিস্টেম ও সাইট কনফিগারেশন' : 'System & Site Settings'}
                </h3>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Site Title</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Inside Dhaka Delivery (৳)</label>
                    <input
                      type="number"
                      value={siteSettings.insideDhakaShipping}
                      onChange={(e) => setSiteSettings({ ...siteSettings, insideDhakaShipping: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Outside Dhaka Delivery (৳)</label>
                    <input
                      type="number"
                      value={siteSettings.outsideDhakaShipping}
                      onChange={(e) => setSiteSettings({ ...siteSettings, outsideDhakaShipping: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Default Seller Commission (%)</label>
                    <input
                      type="number"
                      value={siteSettings.defaultCommissionRate}
                      onChange={(e) => setSiteSettings({ ...siteSettings, defaultCommissionRate: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Free Delivery Threshold (৳)</label>
                    <input
                      type="number"
                      value={siteSettings.freeDeliveryThreshold}
                      onChange={(e) => setSiteSettings({ ...siteSettings, freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-900 hover:bg-brand-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isBangla ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Fallback for other sections (CMS, Reports) */}
          {(activeMenu === 'cms' || activeMenu === 'reports') && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-8 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                📈
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-emerald-100">
                {activeMenu === 'cms' ? (isBangla ? 'কনটেন্ট ম্যানেজমেন্ট মডিউল (CMS)' : 'Content Management') : (isBangla ? 'রিপোর্টস ও এক্সপোর্ট হাব' : 'Reports Hub')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-emerald-400 max-w-md mx-auto">
                {isBangla ? 'সেলস রিপোর্ট, প্রোডাক্ট রিপোর্ট, হোমপেজ সেকশন ও পলিসি পেজ ম্যানেজমেন্ট সক্রিয় রয়েছে।' : 'Sales analytics, product performance, and homepage content configuration active.'}
              </p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
