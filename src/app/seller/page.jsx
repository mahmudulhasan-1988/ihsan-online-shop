'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Store, 
  Star, 
  Tag, 
  Headphones, 
  User, 
  Plus, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  Send, 
  Save, 
  Menu, 
  X, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  getProducts, 
  createProduct, 
  getOrders, 
  getSellerWithdrawals, 
  requestSellerWithdrawal, 
  getReviews, 
  replyReview, 
  getCoupons, 
  createCoupon, 
  getSellers 
} from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function SellerDashboardPage() {
  const { user, showToast } = useCart();
  const { isBangla } = useThemeLanguage();

  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'products' | 'orders' | 'earnings' | 'store' | 'reviews' | 'promotions' | 'support' | 'profile'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Seller Data
  const [sellerInfo, setSellerInfo] = useState({
    shop_name: 'সুন্দরবন অর্গানিক ফার্মস (Sundarban Pure Farms)',
    shop_logo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=200&q=80',
    shop_banner: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    shop_description: 'আমরা সরাসরি সুন্দরবনের প্রত্যন্ত অঞ্চল থেকে সংগৃহীত খাঁটি মধু ও বনজ প্রাকৃতিক খাদ্য সরবরাহ করি।',
    trade_license: 'TRAD/DSCC/019283/2023',
    balance: 45200,
    total_sales: 128000,
    rating: 4.9,
  });

  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myWithdrawals, setMyWithdrawals] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [replyTextMap, setReplyTextMap] = useState({});

  // Withdraw Request Form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('01811223344');

  // Add Product Form
  const [newProd, setNewProd] = useState({
    name: '',
    name_bn: '',
    name_en: '',
    price: '',
    regularPrice: '',
    stock_quantity: 40,
    thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: '',
  });

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, withRes, revRes] = await Promise.all([
        getProducts({ sellerId: 1 }),
        getOrders(),
        getSellerWithdrawals(),
        getReviews(),
      ]);

      setMyProducts(prodRes?.data || []);
      setMyOrders(ordRes?.data || []);
      setMyWithdrawals(withRes?.data || []);
      setMyReviews(revRes?.data || []);
    } catch (err) {
      console.error('Error loading seller data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, []);

  const handleRequestWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      showToast(isBangla ? 'সঠিক পরিমাণ লিখুন' : 'Enter valid amount', 'error');
      return;
    }
    if (Number(withdrawAmount) > sellerInfo.balance) {
      showToast(isBangla ? 'পর্যাপ্ত ব্যালেন্স নেই' : 'Insufficient balance', 'error');
      return;
    }

    await requestSellerWithdrawal({
      seller_id: 1,
      shop_name: sellerInfo.shop_name,
      amount: Number(withdrawAmount),
      method: 'bKash / Nagad',
      account_details: withdrawAccount,
    });

    setSellerInfo({
      ...sellerInfo,
      balance: sellerInfo.balance - Number(withdrawAmount),
    });
    setWithdrawAmount('');
    showToast(isBangla ? 'উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!' : 'Withdrawal request submitted!');
    loadSellerData();
  };

  const handleReplyReview = async (reviewId) => {
    const text = replyTextMap[reviewId];
    if (!text) return;
    await replyReview(reviewId, text);
    showToast(isBangla ? 'রিভিউ এর উত্তর দেওয়া হয়েছে!' : 'Reply submitted!');
    setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
    loadSellerData();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      showToast(isBangla ? 'পণ্যের নাম ও দাম লিখুন' : 'Provide product name and price', 'error');
      return;
    }
    await createProduct({
      ...newProd,
      name_bn: newProd.name_bn || newProd.name,
      name_en: newProd.name_en || newProd.name,
      slug: newProd.name.toLowerCase().replace(/\s+/g, '-'),
      category_id: 1,
      seller_id: 1,
      price: Number(newProd.price),
      regularPrice: Number(newProd.regularPrice || newProd.price),
      stock_quantity: Number(newProd.stock_quantity),
    });
    showToast(isBangla ? 'পণ্যটি সফলভাবে যুক্ত হয়েছে!' : 'Product added successfully!');
    setNewProd({ name: '', name_bn: '', name_en: '', price: '', regularPrice: '', stock_quantity: 40, thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', description: '' });
    loadSellerData();
  };

  const navMenuItems = [
    { id: 'dashboard', label: isBangla ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard', icon: BarChart3 },
    { id: 'products', label: isBangla ? 'পণ্য ব্যবস্থাপনা' : 'Products & Stock', icon: Package, count: myProducts.length },
    { id: 'orders', label: isBangla ? 'অর্ডার প্রসেসিং' : 'Orders Fulfillment', icon: ShoppingCart, count: myOrders.length },
    { id: 'earnings', label: isBangla ? 'আর্নিংস ও উইথড্র' : 'Earnings & Payouts', icon: Wallet },
    { id: 'store', label: isBangla ? 'স্টোর প্রোফাইল' : 'Store Settings', icon: Store },
    { id: 'reviews', label: isBangla ? 'গ্রাহক রিভিউ ও রেটিং' : 'Reviews & Replies', icon: Star, count: myReviews.length },
    { id: 'support', label: isBangla ? 'সাপোর্ট ও সাহায্য' : 'Help & Support', icon: Headphones },
    { id: 'profile', label: isBangla ? 'ব্যক্তিগত সেটিংস' : 'Profile Settings', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-[#0a150e] text-gray-900 dark:text-emerald-50 flex transition-colors">
      
      {/* 🟢 Seller Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#112318] border-r border-[#e0ebe2] dark:border-[#1d3b28] w-72 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } shadow-xl lg:shadow-none`}
      >
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28]">
            <Link href="/seller" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-brand-950 flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                🏪
              </div>
              <div className={`transition-opacity ${!isSidebarOpen && 'lg:hidden'}`}>
                <h2 className="font-extrabold text-sm leading-tight text-brand-950 dark:text-emerald-100">
                  {isBangla ? 'সেলার সেন্টার' : 'Seller Center'}
                </h2>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Verified Vendor
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-900 text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-amber-500 text-brand-950 shadow-md font-black'
                      : 'text-gray-700 dark:text-emerald-200 hover:bg-amber-50 dark:hover:bg-emerald-950/40'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className={`flex-1 text-left truncate ${!isSidebarOpen && 'lg:hidden'}`}>
                    {item.label}
                  </span>
                  {item.count && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-600 text-white ${!isSidebarOpen && 'lg:hidden'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Shop Info */}
        <div className="p-3 border-t border-[#e0ebe2] dark:border-[#1d3b28]">
          <div className="p-2.5 rounded-2xl bg-amber-50/80 dark:bg-emerald-950/60 border border-amber-200 dark:border-emerald-800 flex items-center gap-2.5">
            <img src={sellerInfo.shop_logo} alt={sellerInfo.shop_name} className="w-9 h-9 rounded-xl object-cover border" />
            <div className={`flex-1 min-w-0 ${!isSidebarOpen && 'lg:hidden'}`}>
              <p className="text-xs font-bold truncate text-gray-900 dark:text-emerald-100">{sellerInfo.shop_name}</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold">Balance: ৳ {sellerInfo.balance}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 🟢 Seller Workspace */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 dark:bg-[#112318]/90 backdrop-blur-md border-b border-[#e0ebe2] dark:border-[#1d3b28] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border border-gray-200 dark:border-emerald-900 text-gray-700 dark:text-emerald-300 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
              {navMenuItems.find((m) => m.id === activeMenu)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-2xl">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Role:</span>
              <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                {user?.role || 'SELLER'}
              </span>
            </div>

            <Link
              href="/"
              className="text-xs font-bold bg-gray-100 dark:bg-emerald-950 text-gray-800 dark:text-emerald-200 hover:bg-gray-200 px-3 py-2 rounded-xl transition-all"
            >
              🏪 {isBangla ? 'স্টোর ভিউ' : 'Store'}
            </Link>

            <Link
              href="/admin"
              className="text-xs font-bold bg-brand-900 hover:bg-brand-800 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              {isBangla ? 'এডমিন' : 'Admin'}
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 px-3.5 py-2 rounded-xl"
            >
              {isBangla ? 'কাস্টমার' : 'Customer'}
            </Link>
          </div>
        </header>

        {/* Seller Content Body */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto pb-24">
          
          {/* 1. Dashboard Overview */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'উইথড্র যোগ্য ব্যালেন্স' : 'Available Balance'}</p>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-600">৳ {sellerInfo.balance}</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-2xl">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'মোট সেলস রেভিনিউ' : 'Total Sales'}</p>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-100">৳ {sellerInfo.total_sales}</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-2xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'লিস্টেড পণ্য' : 'Listed Products'}</p>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-100">{myProducts.length}</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 rounded-2xl">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'শপ রেটিং' : 'Shop Rating'}</p>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-100">⭐ {sellerInfo.rating}</h3>
                  </div>
                </div>
              </div>

              {/* Quick Withdraw Request Card */}
              <div className="bg-gradient-to-r from-brand-900 to-emerald-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-lg sm:text-xl font-black">{isBangla ? 'আপনার উপার্জিত টাকা তুলুন (Instant Payout)' : 'Withdraw Your Earnings'}</h3>
                  <p className="text-xs text-emerald-200">{isBangla ? 'বিকাশ, নগদ বা ব্যাংক একাউন্টে সরাসরি টাকা তোলার অনুরোধ পাঠান।' : 'Request payout directly to your bKash, Nagad or Bank account.'}</p>
                </div>
                <button
                  onClick={() => setActiveMenu('earnings')}
                  className="bg-amber-400 hover:bg-amber-500 text-brand-950 font-black px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
                >
                  {isBangla ? 'টাকা তোলার অনুরোধ করুন' : 'Request Withdraw'}
                </button>
              </div>
            </div>
          )}

          {/* 2. Products Management */}
          {activeMenu === 'products' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-black">{isBangla ? 'আপনার পণ্যসমূহ ও স্টক' : 'My Store Products'}</h3>
              </div>

              {/* Add Product Inline Form */}
              <form onSubmit={handleAddProduct} className="p-4 bg-gray-50 dark:bg-black/30 rounded-2xl border space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  {isBangla ? 'নতুন পণ্য যোগ করুন' : 'Add New Store Item'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Product Name (e.g. সুন্দরবনের মধু)"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="px-3.5 py-2.5 bg-white dark:bg-black/50 border rounded-xl text-xs sm:text-sm"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Price (৳)"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="px-3.5 py-2.5 bg-white dark:bg-black/50 border rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <ImageUploader
                    label={isBangla ? 'পণ্যের ছবি (ImgBB CDN)' : 'Product Image (ImgBB CDN)'}
                    value={newProd.thumbnail}
                    onChange={(url) => setNewProd({ ...newProd, thumbnail: url })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-brand-950 font-black py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all"
                >
                  + {isBangla ? 'পণ্যটি স্টোরে যুক্ত করুন' : 'Add Product to Store'}
                </button>
              </form>

              {/* Products List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myProducts.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border bg-gray-50 dark:bg-black/20 flex items-center gap-3">
                    <img src={p.thumbnail} alt={p.name} className="w-16 h-16 rounded-xl object-cover border" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm truncate">{p.name}</h4>
                      <p className="font-black text-brand-900 dark:text-secondary mt-1">৳ {p.price}</p>
                      <span className="text-[10px] text-gray-500">Stock: {p.stock_quantity || 40}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Earnings & Withdraw */}
          {activeMenu === 'earnings' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-black">{isBangla ? 'আর্নিংস ও উইথড্রয়াল হিস্ট্রি' : 'Earnings & Withdrawals'}</h3>
              </div>

              {/* Request Payout Card */}
              <form onSubmit={handleRequestWithdraw} className="bg-amber-50 dark:bg-emerald-950/40 p-5 rounded-3xl border border-amber-200 dark:border-emerald-800 space-y-3">
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-300">
                  {isBangla ? 'টাকা তোলার অনুরোধ পাঠান (Available: ৳ ' + sellerInfo.balance + ')' : 'Submit Withdraw Request'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    required
                    placeholder="Amount to withdraw (৳)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="px-3.5 py-2.5 bg-white dark:bg-black/50 border rounded-xl text-xs sm:text-sm font-bold"
                  />
                  <input
                    type="text"
                    required
                    placeholder="bKash / Nagad Number"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    className="px-3.5 py-2.5 bg-white dark:bg-black/50 border rounded-xl text-xs sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-brand-950 font-black py-2.5 rounded-xl text-xs sm:text-sm"
                  >
                    Send Request
                  </button>
                </div>
              </form>

              {/* Withdrawals Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 dark:bg-black/30 font-bold">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Account</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {myWithdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="p-3">{new Date(w.requested_at).toLocaleDateString()}</td>
                        <td className="p-3 font-bold text-brand-900 dark:text-secondary">৳ {w.amount}</td>
                        <td className="p-3">{w.account_details || w.method}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Reviews & Replies */}
          {activeMenu === 'reviews' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-black">{isBangla ? 'গ্রাহকদের রিভিউ ও উত্তর' : 'Customer Reviews & Replies'}</h3>
              </div>

              <div className="space-y-4">
                {myReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{rev.user_name}</span>
                      <span className="text-amber-500 font-bold text-xs">⭐ {rev.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-emerald-200">{rev.comment}</p>
                    
                    {rev.seller_reply ? (
                      <div className="p-2.5 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-xl text-xs text-brand-900 dark:text-emerald-300 font-medium">
                        <strong>Shop Reply:</strong> {rev.seller_reply}
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write reply to customer..."
                          value={replyTextMap[rev.id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-black/40 border rounded-xl text-xs"
                        />
                        <button
                          onClick={() => handleReplyReview(rev.id)}
                          className="bg-brand-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
