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
  ShieldCheck
} from 'lucide-react';
import { 
  getOrders, 
  getAddresses, 
  saveAddress, 
  getNotifications, 
  getReviews, 
  createSupportTicket, 
  getProducts 
} from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function CustomerDashboardPage() {
  const { user, cart, showToast, addToCart } = useCart();
  const { isBangla } = useThemeLanguage();

  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'profile' | 'orders' | 'addresses' | 'wishlist' | 'cart' | 'reviews' | 'payments' | 'notifications' | 'support'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data States
  const [myOrders, setMyOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  // Profile Form
  const [profile, setProfile] = useState({
    name: user?.name || 'Md. Ariful Islam',
    phone: user?.phone || '01712345678',
    email: user?.email || 'arif@example.com',
  });

  // New Address Form
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    full_name: 'Md. Ariful Islam',
    phone: '01712345678',
    address_line: '',
    city: 'Dhaka',
    district: 'Dhaka',
  });

  // Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [ordRes, addrRes, notifRes, prodRes] = await Promise.all([
        getOrders({ userId: 2 }),
        getAddresses(2),
        getNotifications(2),
        getProducts(),
      ]);

      setMyOrders(ordRes?.data || []);
      setAddresses(addrRes?.data || []);
      setNotifications(notifRes?.data || []);
      setWishlistProducts((prodRes?.data || []).slice(0, 3));
    } catch (err) {
      console.error('Error loading customer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast(isBangla ? 'প্রোফাইল আপডেট সফল হয়েছে!' : 'Profile updated successfully!');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.address_line) {
      showToast(isBangla ? 'সম্পূর্ণ ঠিকানা দিন' : 'Enter address', 'error');
      return;
    }
    await saveAddress({ ...newAddr, user_id: 2 });
    showToast(isBangla ? 'ঠিকানা যুক্ত হয়েছে!' : 'Address added!');
    setNewAddr({ title: 'Home', full_name: profile.name, phone: profile.phone, address_line: '', city: 'Dhaka', district: 'Dhaka' });
    loadUserData();
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    await createSupportTicket({
      user_id: 2,
      user_name: profile.name,
      user_role: 'customer',
      subject: ticketSubject,
      message: ticketMsg,
    });
    showToast(isBangla ? 'টিকেট সাবমিট হয়েছে!' : 'Ticket submitted!');
    setTicketSubject('');
    setTicketMsg('');
  };

  const navMenuItems = [
    { id: 'dashboard', label: isBangla ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders', icon: ShoppingBag, count: myOrders.length },
    { id: 'profile', label: isBangla ? 'প্রোফাইল সেটিংস' : 'My Profile', icon: User },
    { id: 'addresses', label: isBangla ? 'ঠিকানা বই (Address)' : 'Address Book', icon: MapPin, count: addresses.length },
    { id: 'wishlist', label: isBangla ? 'পছন্দের তালিকা' : 'Wishlist', icon: Heart, count: wishlistProducts.length },
    { id: 'cart', label: isBangla ? 'শপিং কার্ট' : 'My Cart', icon: ShoppingCart, count: cart?.length || 0 },
    { id: 'notifications', label: isBangla ? 'বিজ্ঞপ্তি' : 'Notifications', icon: Bell, count: notifications.filter(n => !n.is_read).length || null },
    { id: 'support', label: isBangla ? 'সাহায্য ও টিকিট' : 'Support & Help', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-[#0a150e] text-gray-900 dark:text-emerald-50 flex transition-colors">
      
      {/* 🔵 Customer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#112318] border-r border-[#e0ebe2] dark:border-[#1d3b28] w-72 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } shadow-xl lg:shadow-none`}
      >
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28]">
            <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-brand-900 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                👤
              </div>
              <div className={`transition-opacity ${!isSidebarOpen && 'lg:hidden'}`}>
                <h2 className="font-extrabold text-sm leading-tight text-brand-950 dark:text-emerald-100">
                  {isBangla ? 'গ্রাহক ড্যাশবোর্ড' : 'Customer Center'}
                </h2>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Verified Member
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
                      ? 'bg-brand-900 text-white shadow-md font-black dark:bg-emerald-600'
                      : 'text-gray-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className={`flex-1 text-left truncate ${!isSidebarOpen && 'lg:hidden'}`}>
                    {item.label}
                  </span>
                  {item.count && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-700 text-white ${!isSidebarOpen && 'lg:hidden'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card Bottom */}
        <div className="p-3 border-t border-[#e0ebe2] dark:border-[#1d3b28]">
          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-800 text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className={`flex-1 min-w-0 ${!isSidebarOpen && 'lg:hidden'}`}>
              <p className="text-xs font-bold truncate text-gray-900 dark:text-emerald-100">{profile.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{profile.phone}</p>
            </div>
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
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-2xl">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Role:</span>
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
          
          {/* 1. Dashboard Overview */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-2xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'মোট অর্ডার' : 'Total Orders'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{myOrders.length}</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-2xl">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'উইশলিস্ট পণ্য' : 'Wishlist Items'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{wishlistProducts.length}</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'সেভ করা ঠিকানা' : 'Saved Addresses'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{addresses.length}</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-2xl">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{isBangla ? 'নতুন বিজ্ঞপ্তি' : 'Notifications'}</p>
                    <h3 className="text-xl sm:text-2xl font-black">{notifications.length}</h3>
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                <h3 className="text-lg font-black">{isBangla ? 'আমার সাম্প্রতিক অর্ডারসমূহ' : 'Recent Orders'}</h3>
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
                      {myOrders.map((ord) => (
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
                            <Link href={`/track-order`} className="text-brand-900 dark:text-emerald-400 font-bold hover:underline">
                              Track
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. My Orders */}
          {activeMenu === 'orders' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <h3 className="text-lg font-black border-b pb-4">{isBangla ? 'সকল অর্ডার হিস্ট্রি' : 'All Order History'}</h3>
              <div className="space-y-4">
                {myOrders.map((ord) => (
                  <div key={ord.id} className="p-5 rounded-3xl bg-gray-50 dark:bg-black/20 border space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <span className="text-sm font-black text-brand-900 dark:text-emerald-300">{ord.orderId}</span>
                        <span className="block text-xs text-gray-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-xs uppercase">
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><strong>ডেলিভারি ঠিকানা:</strong> {ord.deliveryAddress}</p>
                      <p><strong>মোট প্রদেয়:</strong> ৳ {ord.totalAmount} ({ord.paymentMethod})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Address Book */}
          {activeMenu === 'addresses' && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              <h3 className="text-lg font-black border-b pb-4">{isBangla ? 'ডেলিভারি ঠিকানা বই' : 'My Address Book'}</h3>

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
                <button type="submit" className="bg-brand-900 text-white px-4 py-2 rounded-xl text-xs font-bold">
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

          {/* 4. Wishlist */}
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
                      className="mt-3 w-full bg-brand-900 text-white font-bold py-2 rounded-xl text-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Support & Ticket */}
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
