'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  LogOut,
  UserCheck,
  UserPlus,
  Image as ImageIcon,
  UploadCloud,
  Printer,
  FileSpreadsheet,
  History,
  Star,
  Send,
  CheckCircle
} from 'lucide-react';
import { 
  getStats, 
  getUsers, 
  createUser,
  deleteUser,
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
  getReviews,
  replyReview, 
  updateSiteSettings,
  getPopupMessage,
  updatePopupMessage
} from '@/lib/api';
import { uploadToImgBB } from '@/lib/imgbb';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, showToast } = useCart();
  const { isBangla, theme } = useThemeLanguage();

  // Active Menu Section
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Data States
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewReplyMap, setReviewReplyMap] = useState({});
  const [payoutSearchQuery, setPayoutSearchQuery] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');
  const [reviewSellerFilter, setReviewSellerFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [isReplyingReview, setIsReplyingReview] = useState(false);
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

  // Order Details Modal & Invoice Modal States
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellerFilter, setSelectedSellerFilter] = useState('all');
  const [selectedAdminCategoryFilter, setSelectedAdminCategoryFilter] = useState('all');

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

  // State: Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    status: 'active',
  });
  const [isUploadingUserImg, setIsUploadingUserImg] = useState(false);

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
        revRes,
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
        getReviews('all'),
      ]);

      setStats(statsRes?.data || null);
      setUsersList(usersRes?.data || []);
      setSellersList(sellersRes?.data || []);
      setProductsList(prodRes?.data || []);
      setCategoriesList(catRes?.data || []);
      setBrandsList(brandRes?.data || []);
      setOrdersList(ordersRes?.data || []);
      setReviewsList(revRes?.data || []);
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

    // Auto-refresh users online status every 15 seconds
    const interval = setInterval(async () => {
      try {
        const usersRes = await getUsers();
        if (usersRes?.data) {
          setUsersList(usersRes.data);
        }
      } catch (e) {
        // silent
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Format timestamp helper
  const formatLastActive = (dateString, isBn) => {
    if (!dateString) return isBn ? 'কখনো নয়' : 'Never';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return isBn ? 'অজানা' : 'Unknown';
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return isBn ? 'এইমাত্র সক্রিয়' : 'Just now';
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return isBn ? `${mins} মিনিট আগে` : `${mins} min ago`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return isBn ? `${hours} ঘণ্টা আগে` : `${hours} hr ago`;
    }
    return date.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format session duration helper
  const formatDuration = (minutes, isBn) => {
    if (!minutes || minutes <= 0) return isBn ? '১ মিনিটের কম' : '< 1 min';
    if (minutes < 60) return isBn ? `${minutes} মিনিট` : `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    if (remMins === 0) return isBn ? `${hrs} ঘণ্টা` : `${hrs} hrs`;
    return isBn ? `${hrs} ঘণ্টা ${remMins} মিনিট` : `${hrs}h ${remMins}m`;
  };

  // Refresh data trigger
  const handleRefreshData = async () => {
    await loadAllData();
    showToast(isBangla ? 'ডাটা সফলভাবে রিফ্রেশ হয়েছে! 🔄' : 'Data refreshed successfully! 🔄');
  };

  // Toggle Password Reveal
  const toggleRevealPassword = (userId) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Handlers
  
  const handleAdminReplyReview = async (reviewId) => {
    const text = (reviewReplyMap[reviewId] || '').trim();
    if (!text) {
      showToast(isBangla ? 'রিপ্লাই টেক্সট লিখুন' : 'Please enter reply text', 'error');
      return;
    }
    setIsReplyingReview(true);
    try {
      const res = await replyReview(reviewId, {
        replyText: text,
        role: 'admin',
        replierName: user?.name || 'Admin Moderator'
      });
      if (res?.success !== false) {
        showToast(isBangla ? 'রিভিউতে এডমিন রিপ্লাই সফল হয়েছে! 🎉' : 'Admin reply posted successfully! 🎉');
        setReviewReplyMap(prev => ({ ...prev, [reviewId]: '' }));
        await loadAllData();
      } else {
        showToast(res?.message || 'Failed to submit reply', 'error');
      }
    } catch (e) {
      showToast('Error replying to review', 'error');
    } finally {
      setIsReplyingReview(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await updateUserStatus(userId, nextStatus);
    showToast(isBangla ? `ইউজার স্ট্যাটাস ${nextStatus} করা হয়েছে` : `User status changed to ${nextStatus}`);
    loadAllData();
  };

  const handleUserRoleChange = async (userId, newRole) => {
    await updateUserRole(userId, newRole);
    setUsersList(prev => prev.map((u) => ((u.id === userId || u._id === userId) ? { ...u, role: newRole } : u)));
    showToast(isBangla ? `ইউজার রোল ${newRole} এ পরিবর্তন করা হয়েছে!` : `User role updated to ${newRole}!`);
    // Reload all data so both User Management and Seller Management stay in sync
    await loadAllData();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.name.trim()) {
      showToast(isBangla ? 'ইউজারের পূর্ণ নাম লিখুন' : 'Please enter full name', 'error');
      return;
    }
    const res = await createUser({
      name: newUserData.name.trim(),
      email: newUserData.email.trim(),
      phone: newUserData.phone.trim(),
      password: newUserData.password || '123456',
      role: newUserData.role || 'customer',
      avatar: newUserData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      status: newUserData.status || 'active'
    });

    if (res?.success !== false) {
      showToast(isBangla ? 'ইউজার সফলভাবে তৈরি হয়েছে এবং MongoDB তে সংরক্ষিত হয়েছে!' : 'User created and saved to MongoDB successfully!');
      setIsAddUserModalOpen(false);
      setNewUserData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        status: 'active'
      });
      loadAllData();
    } else {
      showToast(res?.message || (isBangla ? 'ইউজার তৈরি করা যায়নি' : 'Failed to create user'), 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (confirm(isBangla ? `আপনি কি নিশ্চিত ${userName || 'এই ইউজার'} মুছে ফেলতে চান? এটি MongoDB থেকে স্থায়ীভাবে ডিলিট হবে।` : `Are you sure you want to permanently delete ${userName || 'this user'} from MongoDB?`)) {
      const res = await deleteUser(userId);
      if (res?.success !== false) {
        showToast(isBangla ? 'ইউজার MongoDB থেকে মুছে ফেলা হয়েছে' : 'User deleted from MongoDB');
        loadAllData();
      } else {
        showToast(res?.message || 'Delete failed', 'error');
      }
    }
  };

  const handleSellerStatusChange = async (sellerId, newStatus) => {
    await updateSellerStatus(sellerId, newStatus);
    showToast(isBangla ? `সেলার স্ট্যাটাস ${newStatus} করা হয়েছে` : `Seller status updated to ${newStatus}`);
    loadAllData();
  };

  const handleOrderStatusChange = async (orderId, newStatus, note = '') => {
    const actorName = user?.name || 'Admin';
    const actorRole = user?.role || 'admin';
    const defaultNote = 
      newStatus === 'Confirmed' ? 'অর্ডারটি এডমিন কর্তৃক কনফার্ম করা হয়েছে' :
      newStatus === 'Packed' ? 'পণ্য প্যাকিং সম্পন্ন হয়েছে' :
      newStatus === 'Shipped' ? 'পণ্য কুরিয়ার/ডেলিভারির জন্য পাঠানো হয়েছে' :
      newStatus === 'Delivered' ? 'পণ্য কাস্টমারের কাছে সফলভাবে ডেলিভারি সম্পন্ন হয়েছে' :
      newStatus === 'Cancelled' ? 'অর্ডারটি বাতিল করা হয়েছে' : 'অর্ডার স্ট্যাটাস আপডেট করা হয়েছে';

    const res = await updateOrderStatus(orderId, {
      status: newStatus,
      changed_by: actorName,
      role: actorRole,
      note: note || defaultNote
    });

    if (res?.success !== false) {
      showToast(isBangla ? `অর্ডার স্ট্যাটাস "${newStatus}" করা হয়েছে!` : `Order status updated to ${newStatus}!`);
      await loadAllData();
      if (selectedOrderForModal && (selectedOrderForModal.id === orderId || selectedOrderForModal._id === orderId || selectedOrderForModal.orderId === orderId)) {
        const updatedRes = await getOrders({ search: selectedOrderForModal.orderId || orderId });
        if (updatedRes?.data && updatedRes.data.length > 0) {
          setSelectedOrderForModal(updatedRes.data[0]);
        }
      }
    } else {
      showToast(res?.message || 'Failed to update order status', 'error');
    }
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
    const selectedCat = categoriesList.find((c) => String(c.id) === String(editingProd.category_id) || c.slug === editingProd.category_id || String(c._id) === String(editingProd.category_id));
    const prodImg = editingProd.thumbnail || editingProd.images?.[0] || '';

    const payload = {
      ...editingProd,
      thumbnail: prodImg,
      images: editingProd.images && editingProd.images.length > 0 ? editingProd.images : (prodImg ? [prodImg] : []),
      category: selectedCat ? (selectedCat.name || selectedCat.name_bn) : (editingProd.category || 'সকল পণ্য'),
      categorySlug: selectedCat ? selectedCat.slug : (editingProd.categorySlug || 'all'),
      category_id: selectedCat ? (selectedCat.id || selectedCat._id) : 1,
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
    const selectedCat = categoriesList.find((c) => String(c.id) === String(newProd.category_id) || c.slug === newProd.category_id || String(c._id) === String(newProd.category_id));
    const prodImg = newProd.thumbnail || '';

    const payload = {
      ...newProd,
      thumbnail: prodImg,
      images: prodImg ? [prodImg] : [],
      category: selectedCat ? (selectedCat.name || selectedCat.name_bn) : 'সকল পণ্য',
      categorySlug: selectedCat ? selectedCat.slug : 'all',
      category_id: selectedCat ? (selectedCat.id || selectedCat._id) : 1,
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
    { id: 'reviews', label: isBangla ? 'রিভিউ ও ফিডব্যাক' : 'Reviews & Replies', icon: Star, count: reviewsList.length, countColor: 'bg-amber-600' },
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
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover shadow-md border border-emerald-500/30 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                  🌿
                </div>
              )}
              <div className={`transition-opacity duration-200 ${!isSidebarOpen && 'lg:hidden'}`}>
                <h2 className="font-extrabold text-xs sm:text-sm leading-tight text-brand-950 dark:text-emerald-100 truncate">
                  {isBangla ? 'ইহসান অনলাইন শপ' : 'Ihsan Online Shop'}
                </h2>
                <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                  {user?.role ? `${user.role.toUpperCase()} PANEL` : 'ADMIN PANEL'}
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
          <nav className="p-3 space-y-1 max-h-[calc(100vh-210px)] overflow-y-auto custom-scrollbar">
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

        {/* Sidebar Footer User Info & Actions */}
        <div className="p-3 border-t border-[#e0ebe2] dark:border-[#1d3b28] space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-emerald-950">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-emerald-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className={`flex-1 min-w-0 ${!isSidebarOpen && 'lg:hidden'}`}>
              <p className="text-xs font-bold truncate text-gray-900 dark:text-emerald-100">
                {user?.name || (isBangla ? 'এডমিন মডারেটর' : 'Admin Moderator')}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || user?.phone || '01700000000'}</p>
            </div>
          </div>

          <div className={`flex flex-col gap-1.5 ${!isSidebarOpen && 'lg:hidden'}`}>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-gray-800 dark:text-emerald-200 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBangla ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/auth');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/50 transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isBangla ? 'লগআউট' : 'Logout'}</span>
            </button>
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
            
            {/* Active User Info near Refresh */}
            <div className="flex items-center gap-2 bg-emerald-50/80 dark:bg-black/30 border border-emerald-200/70 dark:border-[#21432e] px-2.5 py-1 rounded-2xl">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-800 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-bold text-gray-800 dark:text-emerald-100 max-w-[120px] truncate hidden sm:inline">
                {user?.name || 'Admin'}
              </span>
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                user?.role === 'admin'
                  ? 'bg-purple-600 text-white'
                  : user?.role === 'seller'
                  ? 'bg-amber-500 text-brand-950'
                  : 'bg-emerald-600 text-white'
              }`}>
                {user?.role || 'ADMIN'}
              </span>
            </div>

            <button
              onClick={handleRefreshData}
              disabled={loading}
              className="p-2 text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-900"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{isBangla ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-bold bg-gray-100 dark:bg-emerald-950 text-gray-800 dark:text-emerald-200 hover:bg-gray-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBangla ? 'স্টোর ভিউ' : 'Storefront'}</span>
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
                    {isBangla ? 'ইউজার ম্যানেজমেন্ট ও রোল বিন্যাস' : 'User Management & Role Assignment'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'গ্রাহক, সেলার ও এডমিনদের তালিকা, পাসওয়ার্ড ও পারমিশন কন্ট্রোল' : 'Manage customers, sellers, admins, password reveal and role privileges'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Add New User Button */}
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-900 to-emerald-700 hover:from-brand-800 hover:to-emerald-600 dark:from-emerald-600 dark:to-teal-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex-shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isBangla ? '➕ নতুন ইউজার তৈরি করুন' : 'Add New User'}</span>
                  </button>

                  {/* Role & Online Specific Filter Tabs */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setActiveSubTab('all')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeSubTab === 'all' ? 'bg-brand-900 text-white shadow-sm dark:bg-emerald-600' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                      }`}
                    >
                      All ({usersList.length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('online')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'online' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Online ({usersList.filter(u => u.is_online).length})</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab('offline')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'offline' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span>Offline ({usersList.filter(u => !u.is_online).length})</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab('customer')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeSubTab === 'customer' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                      }`}
                    >
                      👤 Customers ({usersList.filter(u => (u.role || 'customer') === 'customer').length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('seller')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeSubTab === 'seller' ? 'bg-amber-500 text-brand-950 shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                      }`}
                    >
                      🏪 Sellers ({usersList.filter(u => u.role === 'seller').length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('admin')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeSubTab === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                      }`}
                    >
                      🛡️ Admins ({usersList.filter(u => u.role === 'admin').length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('blocked')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeSubTab === 'blocked' ? 'bg-red-700 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                      }`}
                    >
                      🚫 Blocked ({usersList.filter(u => u.status === 'blocked').length})
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                    <tr>
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Online Status & Activity</th>
                      <th className="p-3">Email & Phone</th>
                      <th className="p-3">Password (Show/Hide)</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Orders Activity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                    {usersList
                      .filter((u) => {
                        if (activeSubTab === 'online') return u.is_online === true;
                        if (activeSubTab === 'offline') return !u.is_online;
                        if (activeSubTab === 'blocked') return u.status === 'blocked';
                        if (activeSubTab === 'customer') return (u.role || 'customer') === 'customer';
                        if (activeSubTab === 'seller') return u.role === 'seller';
                        if (activeSubTab === 'admin') return u.role === 'admin';
                        return true;
                      })
                      .map((u) => (
                        <tr key={u.id || u._id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                          
                          {/* User Avatar & Name */}
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="relative">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-2xl object-cover border border-emerald-500/30 flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                  {u.name?.charAt(0) || 'U'}
                                </div>
                              )}
                              {/* Pulsing Dot on Avatar Corner */}
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                {u.is_online ? (
                                  <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-black"></span>
                                  </>
                                ) : (
                                  <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-black"></span>
                                  </>
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold block text-gray-900 dark:text-emerald-100">{u.name}</span>
                              <span className="text-[10px] text-gray-400">ID: #{String(u.id || u._id || '').slice(-6)}</span>
                            </div>
                          </td>

                          {/* 🟢/🔴 Online Status & Detailed Activity */}
                          <td className="p-3">
                            {u.is_online ? (
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800 shadow-sm">
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                  </span>
                                  <span>{isBangla ? 'অনলাইনে সক্রিয়' : 'Online Now'}</span>
                                </div>
                                <div className="text-[11px] text-gray-600 dark:text-emerald-300/90 leading-tight">
                                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                                    ⏱️ {isBangla ? 'সেশন:' : 'Session:'} {formatDuration(u.active_duration_minutes || u.session_duration_minutes, isBangla)}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {isBangla ? 'যুক্ত:' : 'Active since:'} {formatLastActive(u.session_started_at, isBangla)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 font-bold text-[11px] border border-red-200 dark:border-red-900/60 shadow-sm">
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                  </span>
                                  <span>{isBangla ? 'অফলাইন' : 'Offline'}</span>
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                                  <p className="font-medium">
                                    🕒 {isBangla ? 'সর্বশেষ:' : 'Last seen:'} {formatLastActive(u.last_active_at, isBangla)}
                                  </p>
                                  {(u.last_session_duration_minutes > 0 || u.session_duration_minutes > 0) && (
                                    <p className="text-[10px] text-gray-400">
                                      {isBangla ? 'সর্বশেষ ছিল:' : 'Last session:'} {formatDuration(u.last_session_duration_minutes || u.session_duration_minutes, isBangla)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Email & Phone */}
                          <td className="p-3">
                            <p className="font-medium text-gray-800 dark:text-gray-200">{u.phone || 'No phone'}</p>
                            <span className="text-gray-500 text-[11px] truncate block max-w-[180px]">{u.email || 'No email'}</span>
                          </td>

                          {/* Password with Eye Toggle */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-black/40 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-emerald-900/40 w-fit">
                              <span className="font-mono text-xs font-semibold text-gray-800 dark:text-emerald-200 min-w-[75px] select-all">
                                {revealedPasswords[u.id || u._id] ? (u.passwordText || u.password || 'user1234') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleRevealPassword(u.id || u._id)}
                                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-emerald-900 text-gray-600 hover:text-brand-900 dark:text-emerald-300 transition-colors"
                                title={revealedPasswords[u.id || u._id] ? 'Hide Password' : 'Click to View Password'}
                              >
                                {revealedPasswords[u.id || u._id] ? <EyeOff className="w-3.5 h-3.5 text-red-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                              </button>
                            </div>
                          </td>

                          {/* Role Switcher */}
                          <td className="p-3">
                            <select
                              value={u.role || 'customer'}
                              onChange={(e) => handleUserRoleChange(u.id || u._id, e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer border focus:outline-none transition-all ${
                                u.role === 'admin'
                                   ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300'
                                  : u.role === 'seller'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                              }`}
                            >
                              <option value="customer">👤 Customer</option>
                              <option value="seller">🏪 Seller</option>
                              <option value="admin">🛡️ Admin</option>
                            </select>
                          </td>

                          {/* Orders */}
                          <td className="p-3 font-semibold text-gray-700 dark:text-emerald-200">
                            {u.orders_count || 0} {isBangla ? 'অর্ডার' : 'Orders'} (৳ {u.total_spent || 0})
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}>
                              {u.status}
                            </span>
                          </td>

                          {/* Actions: Block/Unblock & Delete */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleUserStatusToggle(u.id || u._id, u.status)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                  u.status === 'active'
                                    ? 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                    : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                }`}
                              >
                                {u.status === 'active' ? (isBangla ? '🚫 ব্লক' : 'Block') : (isBangla ? '✅ আনব্লক' : 'Unblock')}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id || u._id, u.name)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                                title="Delete User from MongoDB"
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

          {/* Add User Modal */}
          {isAddUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 max-w-lg w-full border border-emerald-500/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1d3b28] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-900 dark:text-emerald-100">
                        {isBangla ? 'নতুন ইউজার তৈরি করুন (MongoDB)' : 'Create New User (MongoDB)'}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        ইউজারটি সাথে সাথে MongoDB ডেটাবেজে সংরক্ষিত হবে
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3.5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-emerald-300">
                      {isBangla ? 'ইউজারের পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admin / Rahim Ahmed"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        placeholder="user@example.com"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        placeholder="017XXXXXXXX"
                        value={newUserData.phone}
                        onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                      />
                    </div>
                  </div>

                  {/* Password & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'পাসওয়ার্ড' : 'Password'}
                      </label>
                      <input
                        type="text"
                        placeholder="Default: 123456"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'ইউজার রোল' : 'Role'}
                      </label>
                      <select
                        value={newUserData.role}
                        onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-900 cursor-pointer"
                      >
                        <option value="customer">👤 Customer</option>
                        <option value="seller">🏪 Seller</option>
                        <option value="admin">🛡️ Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Photo / ImgBB Upload */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-emerald-300">
                      {isBangla ? 'প্রোফাইল ছবি (ImgBB Upload / URL)' : 'Avatar Photo'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newUserData.avatar}
                        onChange={(e) => setNewUserData({ ...newUserData, avatar: e.target.value })}
                        className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                      />
                      <label className="cursor-pointer px-3 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{isUploadingUserImg ? '...' : 'ImgBB'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingUserImg(true);
                            try {
                              const uploadedUrl = await uploadToImgBB(file);
                              if (uploadedUrl) {
                                setNewUserData(prev => ({ ...prev, avatar: uploadedUrl }));
                                showToast(isBangla ? 'ছবি ImgBB তে আপলোড সফল!' : 'Uploaded to ImgBB!');
                              }
                            } catch (err) {
                              showToast(isBangla ? 'ছবি আপলোড ব্যর্থ' : 'Upload failed', 'error');
                            } finally {
                              setIsUploadingUserImg(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="flex-1 py-2.5 bg-gray-100 dark:bg-black/40 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-2xl transition-all"
                    >
                      {isBangla ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-brand-900 to-emerald-700 hover:from-brand-800 hover:to-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
                    >
                      {isBangla ? '💾 MongoDB তে সেভ করুন' : 'Save to MongoDB'}
                    </button>
                  </div>
                </form>
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
                  <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>🏪 {isBangla ? 'ভেন্ডর ও সেলার ম্যানেজমেন্ট' : 'Seller & Vendor Management'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                      {sellersList.length} {isBangla ? 'সেলার' : 'Sellers'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'User Management থেকে সেলার হিসেবে নির্ধারিত সকল ইউজার এবং ভেন্ডরদের তালিকা ও স্টোর সেটিংস' : 'All users assigned as seller in User Management automatically appear here'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setActiveSubTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'all' ? 'bg-brand-900 text-white shadow-sm dark:bg-emerald-600' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                    }`}
                  >
                    All ({sellersList.length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('approved')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                    }`}
                  >
                    Approved ({sellersList.filter(s => (s.status || 'approved') === 'approved').length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('pending')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'pending' ? 'bg-amber-500 text-brand-950 shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                    }`}
                  >
                    Pending ({sellersList.filter(s => s.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab('suspended')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'suspended' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300'
                    }`}
                  >
                    Suspended ({sellersList.filter(s => s.status === 'suspended').length})
                  </button>
                </div>
              </div>

              {sellersList.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed border-gray-300 dark:border-emerald-900/60 p-8">
                  <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-bold text-gray-700 dark:text-emerald-200">কোন সেলার পাওয়া যায়নি</p>
                  <p className="text-xs text-gray-400 mt-1">User Management থেকে যে কাউকে সেলার সিলেক্ট করলেই তিনি স্বয়ংক্রিয়ভাবে এখানে চলে আসবেন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sellersList
                    .filter((s) => {
                      if (activeSubTab === 'pending') return s.status === 'pending';
                      if (activeSubTab === 'approved') return (s.status || 'approved') === 'approved';
                      if (activeSubTab === 'suspended') return s.status === 'suspended';
                      return true;
                    })
                    .map((seller) => {
                      const sellerId = seller._id || seller.id;
                      const shopLogo = seller.shop_logo || seller.avatar || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                      const shopName = seller.shop_name || seller.name || 'Store';
                      const sellerName = seller.seller_name || seller.owner_name || seller.name || 'Seller';
                      const sellerStatus = seller.status || 'approved';

                      return (
                        <div
                          key={sellerId}
                          className="bg-gray-50 dark:bg-black/20 p-5 rounded-3xl border border-gray-200 dark:border-emerald-900/60 hover:border-emerald-500/50 transition-all space-y-3.5 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={shopLogo}
                                  alt={shopName}
                                  className="w-12 h-12 rounded-2xl object-cover border border-emerald-500/30 flex-shrink-0 bg-white"
                                />
                                <div>
                                  <h4 className="font-black text-sm sm:text-base leading-snug text-gray-900 dark:text-emerald-100">
                                    {shopName}
                                  </h4>
                                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <span>👤 {sellerName}</span>
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase flex-shrink-0 ${
                                sellerStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                sellerStatus === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}>
                                {sellerStatus}
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                              <p className="truncate">📞 {seller.phone || 'No phone'}</p>
                              <p className="truncate">✉️ {seller.email || 'No email'}</p>
                              {seller.shop_description && (
                                <p className="text-[11px] text-gray-400 line-clamp-2 pt-1">{seller.shop_description}</p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 dark:border-emerald-900/40 text-xs space-y-1.5 text-gray-600 dark:text-emerald-300">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Trade License:</span>
                              <span className="font-semibold font-mono text-[11px]">{seller.trade_license || 'TL-Active'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Commission Rate:</span>
                              <span className="font-bold text-brand-900 dark:text-secondary">{seller.commission_rate ?? 10}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Wallet Balance:</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">৳ {seller.balance || 0}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex gap-2">
                            {sellerStatus === 'pending' ? (
                              <button
                                onClick={() => handleSellerStatusChange(sellerId, 'approved')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-sm"
                              >
                                {isBangla ? '✅ অনুমোদন দিন' : 'Approve Seller'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSellerStatusChange(sellerId, sellerStatus === 'approved' ? 'suspended' : 'approved')}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors border ${
                                  sellerStatus === 'approved'
                                    ? 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                                    : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                              >
                                {sellerStatus === 'approved' ? (isBangla ? '🚫 সাসপেন্ড করুন' : 'Suspend') : (isBangla ? '🔄 পুনরায় সক্রিয় করুন' : 'Reactivate')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedAdminCategoryFilter}
                      onChange={(e) => {
                        setSelectedAdminCategoryFilter(e.target.value);
                        setActiveSubTab('all');
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-black/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 rounded-xl focus:outline-none cursor-pointer shadow-sm hover:bg-emerald-100 transition-colors"
                    >
                      <option value="all">📦 {isBangla ? 'সকল ক্যাটাগরি' : 'All Categories'} ({productsList.length})</option>
                      {categoriesList.map((cat) => {
                        const cCount = productsList.filter(p => p.categorySlug === cat.slug || p.category === cat.name || p.category_id === cat.id).length;
                        return (
                          <option key={cat.id || cat.slug} value={cat.slug || cat.name}>
                            {cat.icon || '🏷️'} {cat.name || cat.name_bn} ({cCount})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Seller Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedSellerFilter}
                      onChange={(e) => {
                        setSelectedSellerFilter(e.target.value);
                        setActiveSubTab('all');
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-50 dark:bg-black/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 rounded-xl focus:outline-none cursor-pointer shadow-sm hover:bg-amber-100 transition-colors"
                    >
                      <option value="all">🏪 {isBangla ? 'সকল সেলার' : 'All Sellers'} ({productsList.length})</option>
                      {Array.from(new Set(productsList.map(p => p.seller_name || p.sellerName || p.shop_name || 'সুন্দরবন অর্গানিক ফার্মস'))).map((sName) => {
                        const sCount = productsList.filter(p => (p.seller_name || p.sellerName || p.shop_name || 'সুন্দরবন অর্গানিক ফার্মস') === sName).length;
                        return (
                          <option key={sName} value={sName}>
                            🏷️ {sName} ({sCount})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubTab('all');
                      setSelectedSellerFilter('all');
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      activeSubTab === 'all' && selectedSellerFilter === 'all' ? 'bg-brand-900 text-white shadow' : 'bg-gray-100 dark:bg-black/30 text-gray-700 dark:text-emerald-300'
                    }`}
                  >
                    All Products ({productsList.length})
                  </button>

                  <button
                    onClick={() => setActiveSubTab('add')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      activeSubTab === 'add' ? 'bg-brand-900 text-white shadow' : 'bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {activeSubTab === 'all' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList
                    .filter((prod) => {
                      if (selectedSellerFilter !== 'all') {
                        const sName = prod.seller_name || prod.sellerName || prod.shop_name || 'সুন্দরবন অর্গানিক ফার্মস';
                        if (sName !== selectedSellerFilter) return false;
                      }
                      if (selectedAdminCategoryFilter !== 'all') {
                        const cMatch = prod.categorySlug === selectedAdminCategoryFilter || prod.category === selectedAdminCategoryFilter || String(prod.category_id) === selectedAdminCategoryFilter;
                        if (!cMatch) return false;
                      }
                      return true;
                    })
                    .map((prod) => {
                      const prodSeller = prod.seller_name || prod.sellerName || prod.shop_name || 'সুন্দরবন অর্গানিক ফার্মস';
                      const stockCount = prod.stock_quantity !== undefined ? Number(prod.stock_quantity) : (prod.stock !== undefined ? Number(prod.stock) : 50);

                      return (
                        <div
                          key={prod._id || prod.id || prod.slug}
                          className="bg-gray-50 dark:bg-black/20 p-4 rounded-3xl border border-gray-200 dark:border-emerald-900/60 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-sm"
                        >
                          <div>
                            <div className="flex gap-3">
                              <img src={prod.thumbnail || prod.images?.[0]} alt={prod.name} className="w-20 h-20 rounded-2xl object-cover border flex-shrink-0" />
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

                            {/* 🏪 Seller / Vendor Display under product */}
                            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/70 dark:border-amber-900/40 w-fit">
                              <Store className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{prodSeller}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                            <span className={`font-bold ${stockCount <= 0 ? 'text-red-600' : 'text-gray-600 dark:text-emerald-300'}`}>
                              Stock: <strong>{stockCount <= 0 ? (isBangla ? 'স্টক আউট (0)' : 'Out of Stock (0)') : stockCount}</strong>
                            </span>
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
                      );
                    })}
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
          {/* 5. 🛒 PREMIUM ORDER MANAGEMENT & REAL-TIME AUDIT LOGS     */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="space-y-6">
              
              {/* Header Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-50 flex items-center gap-2">
                    <span>🛒 {isBangla ? 'অর্ডার ম্যানেজমেন্ট ও লাইভ ট্র্যাকিং' : 'Order Management & Fulfillment'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-brand-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                      MongoDB Synced 🟢
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400 mt-0.5">
                    {isBangla 
                      ? 'অর্ডার গ্রহণ, ১-ক্লিকে কনফার্ম/ক্যান্সেল, সেলার প্যাকিং, ডেলিভারি ট্র্যাকিং, স্টক সিঙ্ক ও ইনভয়েস প্রিন্ট' 
                      : 'Real-time order lifecycle, 1-click status actions, audit logs and printable invoice/packing slips'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    className="px-3.5 py-2 bg-white dark:bg-[#112318] hover:bg-gray-50 dark:hover:bg-emerald-950/60 text-xs font-bold rounded-2xl border border-gray-200 dark:border-[#1d3b28] shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>🔄 {isBangla ? 'ডাটা রিফ্রেশ' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* 📊 6 Top Statistical KPI Cards for Orders */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Total Orders */}
                <div className="bg-white dark:bg-[#112318] p-4 rounded-3xl border border-gray-200 dark:border-[#1d3b28] shadow-sm space-y-1">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-emerald-400">{isBangla ? 'মোট অর্ডার' : 'Total Orders'}</p>
                  <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-emerald-100">{ordersList.length}</h4>
                  <span className="text-[10px] text-gray-400 block">৳ {ordersList.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)}</span>
                </div>

                {/* 2. Pending Orders */}
                <div className="bg-amber-50/80 dark:bg-black/30 p-4 rounded-3xl border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400">🟡 {isBangla ? 'অপেক্ষমাণ' : 'Pending'}</p>
                  <h4 className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-300">
                    {ordersList.filter(o => o.status === 'Pending').length}
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-500 font-bold block">{isBangla ? 'রিভিউ প্রয়োজন' : 'Needs Action'}</span>
                </div>

                {/* 3. Confirmed Orders */}
                <div className="bg-blue-50/80 dark:bg-black/30 p-4 rounded-3xl border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold text-blue-800 dark:text-blue-400">🔵 {isBangla ? 'কনফার্মড' : 'Confirmed'}</p>
                  <h4 className="text-lg sm:text-xl font-black text-blue-950 dark:text-blue-300">
                    {ordersList.filter(o => o.status === 'Confirmed').length}
                  </h4>
                  <span className="text-[10px] text-blue-600 block">{isBangla ? 'প্যাকিং অপেক্ষমাণ' : 'Ready to Pack'}</span>
                </div>

                {/* 4. Packed Orders */}
                <div className="bg-purple-50/80 dark:bg-black/30 p-4 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold text-purple-800 dark:text-purple-400">📦 {isBangla ? 'প্যাকড' : 'Packed'}</p>
                  <h4 className="text-lg sm:text-xl font-black text-purple-950 dark:text-purple-300">
                    {ordersList.filter(o => o.status === 'Packed' || o.status === 'Processing').length}
                  </h4>
                  <span className="text-[10px] text-purple-600 block">{isBangla ? 'শিপিং বাকি' : 'Ready to Ship'}</span>
                </div>

                {/* 5. Delivered Orders */}
                <div className="bg-emerald-50/80 dark:bg-black/30 p-4 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">✅ {isBangla ? 'ডেলিভারড' : 'Delivered'}</p>
                  <h4 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-300">
                    {ordersList.filter(o => o.status === 'Delivered').length}
                  </h4>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold block">{isBangla ? 'সফল ডেলিভারি' : 'Completed'}</span>
                </div>

                {/* 6. Cancelled Orders */}
                <div className="bg-red-50/80 dark:bg-black/30 p-4 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold text-red-800 dark:text-red-400">❌ {isBangla ? 'বাতিল' : 'Cancelled'}</p>
                  <h4 className="text-lg sm:text-xl font-black text-red-950 dark:text-red-300">
                    {ordersList.filter(o => o.status === 'Cancelled').length}
                  </h4>
                  <span className="text-[10px] text-red-600 block">{isBangla ? 'স্টক রিস্টোরড' : 'Restored'}</span>
                </div>
              </div>

              {/* Pending Orders Alert Banner */}
              {ordersList.filter(o => o.status === 'Pending').length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-l-4 border-amber-500 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🔔</span>
                    <div>
                      <h4 className="font-black text-sm text-amber-950 dark:text-amber-300">
                        {ordersList.filter(o => o.status === 'Pending').length} {isBangla ? 'টি নতুন অর্ডার অপেক্ষমাণ (Pending)!' : 'New Pending Orders!'}
                      </h4>
                      <p className="text-xs text-amber-900/80 dark:text-amber-400/80">
                        {isBangla ? 'কাস্টমার অর্ডার প্লেস করেছেন। নিচের তালিকা থেকে এক ক্লিকে Confirm অথবা Cancel করুন।' : 'Review pending orders and click Confirm or Cancel.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('Pending')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-brand-950 font-black text-xs rounded-xl shadow transition-all self-start sm:self-auto"
                  >
                    {isBangla ? 'অপেক্ষমাণ অর্ডারগুলো ফিল্টার করুন' : 'Filter Pending Orders'}
                  </button>
                </div>
              )}

              {/* Search & Filter Toolbar */}
              <div className="bg-white dark:bg-[#112318] p-5 rounded-3xl border border-gray-200 dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Status Filter Sub-Tabs */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { id: 'all', label: isBangla ? 'সকল অর্ডার' : 'All', count: ordersList.length },
                      { id: 'Pending', label: isBangla ? '🟡 অপেক্ষমাণ' : 'Pending', count: ordersList.filter(o => o.status === 'Pending').length },
                      { id: 'Confirmed', label: isBangla ? '🔵 কনফার্মড' : 'Confirmed', count: ordersList.filter(o => o.status === 'Confirmed').length },
                      { id: 'Packed', label: isBangla ? '📦 প্যাকড' : 'Packed', count: ordersList.filter(o => o.status === 'Packed' || o.status === 'Processing').length },
                      { id: 'Shipped', label: isBangla ? '🚚 শিপড' : 'Shipped', count: ordersList.filter(o => o.status === 'Shipped').length },
                      { id: 'Delivered', label: isBangla ? '✅ ডেলিভারড' : 'Delivered', count: ordersList.filter(o => o.status === 'Delivered').length },
                      { id: 'Cancelled', label: isBangla ? '❌ বাতিল' : 'Cancelled', count: ordersList.filter(o => o.status === 'Cancelled').length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                          activeSubTab === tab.id
                            ? 'bg-brand-900 text-white shadow-md dark:bg-emerald-600'
                            : 'bg-gray-100 dark:bg-black/30 text-gray-700 dark:text-emerald-300 hover:bg-gray-200 dark:hover:bg-emerald-950/60'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-black/15 dark:bg-white/15 rounded-full font-black">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isBangla ? 'অর্ডার আইডি, নাম বা ফোন দিয়ে খুঁজুন...' : 'Search by ID, name or phone...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                    />
                  </div>

                </div>

                {/* Orders List Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#f4f7f4] dark:bg-black/40 text-gray-700 dark:text-emerald-300 font-bold border-b border-gray-200 dark:border-emerald-900/60">
                      <tr>
                        <th className="p-3.5">Order ID & Date</th>
                        <th className="p-3.5">Customer Details</th>
                        <th className="p-3.5">Delivery Address</th>
                        <th className="p-3.5">Items & Quantity</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5 text-center">Lifecycle Status & Quick Action</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                      {ordersList
                        .filter((o) => {
                          if (activeSubTab === 'Packed') {
                            if (o.status !== 'Packed' && o.status !== 'Processing') return false;
                          } else if (activeSubTab !== 'all' && o.status !== activeSubTab) {
                            return false;
                          }
                          if (searchQuery.trim()) {
                            const q = searchQuery.toLowerCase().trim();
                            const idMatch = (o.orderId || o.id || '').toLowerCase().includes(q);
                            const nameMatch = (o.customerName || '').toLowerCase().includes(q);
                            const phoneMatch = (o.customerPhone || '').includes(q);
                            return idMatch || nameMatch || phoneMatch;
                          }
                          return true;
                        })
                        .map((order) => {
                          const orderKey = order.id || order._id || order.orderId;
                          const currentStatus = order.status || 'Pending';

                          return (
                            <tr key={orderKey} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
                              
                              {/* 1. Order ID & Date */}
                              <td className="p-3.5">
                                <span className="font-extrabold text-brand-900 dark:text-emerald-300 block font-mono text-sm">
                                  {order.orderId || order.id}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </td>

                              {/* 2. Customer Details */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  {order.customerAvatar ? (
                                    <img
                                      src={order.customerAvatar}
                                      alt={order.customerName || 'Customer'}
                                      className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white font-black text-sm flex items-center justify-center border-2 border-emerald-500/30 shadow-sm flex-shrink-0">
                                      {(order.customerName || 'C').charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-emerald-100 truncate">{order.customerName || 'Customer'}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">📞 {order.customerPhone}</p>
                                    {order.customerEmail ? (
                                      <p className="text-[10px] text-gray-400 dark:text-emerald-400/80 truncate max-w-[150px]">✉️ {order.customerEmail}</p>
                                    ) : (
                                      <p className="text-[10px] text-gray-400 italic">✉️ {isBangla ? 'ইমেইল নেই' : 'No email'}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 3. Delivery Address */}
                              <td className="p-3.5 max-w-[200px]">
                                <p className="text-xs text-gray-700 dark:text-emerald-200 line-clamp-2" title={order.deliveryAddress}>
                                  {order.deliveryAddress}
                                </p>
                                {order.deliveryZone && (
                                  <span className="text-[10px] px-2 py-0.2 bg-gray-100 dark:bg-black/30 rounded font-bold uppercase text-gray-500 mt-1 inline-block">
                                    {order.deliveryZone.replace('_', ' ')}
                                  </span>
                                )}
                              </td>

                              {/* 4. Ordered Items Preview */}
                              <td className="p-3.5">
                                <div className="space-y-1 max-w-[190px]">
                                  {order.items?.map((it, idx) => (
                                    <div key={idx} className="text-[11px] text-gray-700 dark:text-emerald-300 flex items-center justify-between gap-2">
                                      <span className="truncate">• {it.name} ({it.weight || 'Std'})</span>
                                      <span className="font-bold text-gray-900 dark:text-white shrink-0">×{it.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              {/* 5. Total & Payment Method */}
                              <td className="p-3.5">
                                <p className="font-black text-brand-900 dark:text-secondary text-sm">৳ {order.totalAmount}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] uppercase font-bold text-gray-500">
                                    {order.paymentMethod || 'COD'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                                    order.paymentStatus === 'Paid' 
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}>
                                    {order.paymentStatus || 'Pending'}
                                  </span>
                                </div>
                              </td>

                              {/* 6. Lifecycle Status & 1-Click Action Buttons */}
                              <td className="p-3.5 text-center">
                                <div className="inline-flex flex-col items-center gap-1.5">
                                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase inline-block shadow-sm ${
                                    currentStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' :
                                    currentStatus === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300' :
                                    currentStatus === 'Packed' || currentStatus === 'Processing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300' :
                                    currentStatus === 'Confirmed' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300' :
                                    currentStatus === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300' :
                                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse'
                                  }`}>
                                    {currentStatus === 'Pending' ? '🟡 Pending' :
                                     currentStatus === 'Confirmed' ? '🔵 Confirmed' :
                                     currentStatus === 'Packed' || currentStatus === 'Processing' ? '📦 Packed' :
                                     currentStatus === 'Shipped' ? '🚚 Shipped' :
                                     currentStatus === 'Delivered' ? '✅ Delivered' : '❌ Cancelled'}
                                  </span>

                                  {/* 1-Click Quick Transition Actions */}
                                  {currentStatus === 'Pending' && (
                                    <div className="flex gap-1 pt-0.5">
                                      <button
                                        onClick={() => handleOrderStatusChange(order.id, 'Confirmed', 'অর্ডারটি এডমিন কর্তৃক এক-ক্লিকে নিশ্চিত (Confirmed) করা হয়েছে')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shadow transition-all flex items-center gap-0.5"
                                        title={isBangla ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order'}
                                      >
                                        ✓ {isBangla ? 'Confirm' : 'Confirm'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(isBangla ? 'আপনি কি নিশ্চিত এই অর্ডারটি বাতিল (Cancel) করতে চান? এতে স্টক রিস্টোর হবে।' : 'Are you sure you want to cancel this order?')) {
                                            handleOrderStatusChange(order.id, 'Cancelled', 'অর্ডারটি এডমিন কর্তৃক বাতিল করা হয়েছে ও স্টক রিস্টোর হয়েছে');
                                          }
                                        }}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black shadow transition-all flex items-center gap-0.5"
                                        title={isBangla ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}
                                      >
                                        ✕ {isBangla ? 'Cancel' : 'Cancel'}
                                      </button>
                                    </div>
                                  )}

                                  {currentStatus === 'Confirmed' && (
                                    <button
                                      onClick={() => handleOrderStatusChange(order.id, 'Packed', 'পণ্য প্যাকিং সম্পন্ন করা হয়েছে')}
                                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black shadow transition-all"
                                    >
                                      📦 {isBangla ? 'Mark Packed' : 'Mark Packed'}
                                    </button>
                                  )}

                                  {(currentStatus === 'Packed' || currentStatus === 'Processing') && (
                                    <button
                                      onClick={() => handleOrderStatusChange(order.id, 'Shipped', 'পণ্য কুরিয়ারে হস্তান্তর করা হয়েছে')}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black shadow transition-all"
                                    >
                                      🚚 {isBangla ? 'Ship Order' : 'Ship Order'}
                                    </button>
                                  )}

                                  {currentStatus === 'Shipped' && (
                                    <button
                                      onClick={() => handleOrderStatusChange(order.id, 'Delivered', 'কাস্টমার পণ্য গ্রহণ করেছেন এবং পেমেন্ট সম্পন্ন হয়েছে')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shadow transition-all"
                                    >
                                      ✅ {isBangla ? 'Mark Delivered' : 'Mark Delivered'}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* 7. Action Icons */}
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View Details Modal */}
                                  <button
                                    onClick={() => setSelectedOrderForModal(order)}
                                    className="p-1.5 text-brand-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-900 transition-colors shadow-sm"
                                    title={isBangla ? 'অর্ডারের বিস্তারিত ও অডিট ট্র্যাকিং লগ' : 'Order Details & Audit Trail'}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  {/* Print Invoice */}
                                  <button
                                    onClick={() => setSelectedOrderForInvoice(order)}
                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 transition-colors shadow-sm"
                                    title={isBangla ? 'ইনভয়েস / প্যাকিং স্লিপ প্রিন্ট করুন' : 'Print Invoice / Packing Slip'}
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>

                                  {/* Delete Order */}
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
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 📋 ORDER DETAILS & LIVE AUDIT TRAIL MODAL                */}
              {/* ======================================================== */}
              {selectedOrderForModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
                  <div className="bg-white dark:bg-[#112318] rounded-3xl max-w-3xl w-full border border-[#e0ebe2] dark:border-[#1d3b28] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto p-6 sm:p-8 my-auto">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-emerald-100">
                            {isBangla ? 'অর্ডার বিবরণ ও লাইভ অডিট ট্র্যাকিং' : 'Order Details & Audit Trail'}
                          </h3>
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-emerald-100 text-brand-900 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
                            #{selectedOrderForModal.orderId || selectedOrderForModal.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-emerald-400 mt-0.5">
                          {isBangla ? 'অর্ডার সময়:' : 'Placed at:'} {new Date(selectedOrderForModal.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrderForModal(null)}
                        className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Summary Info Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{isBangla ? 'স্ট্যাটাস' : 'Status'}</span>
                        <p className="text-xs sm:text-sm font-black text-brand-900 dark:text-emerald-300 mt-0.5">
                          {selectedOrderForModal.status}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{isBangla ? 'মোট মূল্য' : 'Total Amount'}</span>
                        <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-secondary mt-0.5">
                          ৳ {selectedOrderForModal.totalAmount}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{isBangla ? 'পেমেন্ট পদ্ধতি' : 'Payment'}</span>
                        <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-emerald-200 uppercase mt-0.5">
                          {selectedOrderForModal.paymentMethod || 'COD'}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{isBangla ? 'পেমেন্ট স্ট্যাটাস' : 'Pay Status'}</span>
                        <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase mt-0.5">
                          {selectedOrderForModal.paymentStatus || 'Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60 space-y-3">
                        <h4 className="text-xs font-black uppercase text-brand-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <span>👤 {isBangla ? 'কাস্টমার তথ্য ও প্রোফাইল ছবি' : 'Customer Information & Profile Photo'}</span>
                        </h4>
                        <div className="flex items-center gap-3.5">
                          {selectedOrderForModal.customerAvatar ? (
                            <img
                              src={selectedOrderForModal.customerAvatar}
                              alt={selectedOrderForModal.customerName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white font-black text-lg flex items-center justify-center border-2 border-emerald-500/30 shadow-md flex-shrink-0">
                              {(selectedOrderForModal.customerName || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-xs space-y-1 text-gray-700 dark:text-emerald-200 min-w-0 flex-1">
                            <p className="font-black text-sm text-gray-900 dark:text-emerald-100">{selectedOrderForModal.customerName || 'Customer'}</p>
                            <p><strong>{isBangla ? 'মোবাইল:' : 'Phone:'}</strong> <span className="font-mono">{selectedOrderForModal.customerPhone}</span></p>
                            <p><strong>{isBangla ? 'ইমেইল:' : 'Email:'}</strong> {selectedOrderForModal.customerEmail || (isBangla ? 'প্রদান করা হয়নি' : 'Not provided')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-emerald-900/60 space-y-2">
                        <h4 className="text-xs font-black uppercase text-brand-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <span>📍 {isBangla ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}</span>
                        </h4>
                        <div className="text-xs space-y-1 text-gray-700 dark:text-emerald-200">
                          <p>{selectedOrderForModal.deliveryAddress}</p>
                          {selectedOrderForModal.deliveryZone && (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                              Zone: {selectedOrderForModal.deliveryZone} (৳{selectedOrderForModal.deliveryCharge || 70})
                            </p>
                          )}
                          {selectedOrderForModal.notes && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                              Note: {selectedOrderForModal.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-brand-900 dark:text-emerald-300">
                        📦 {isBangla ? 'অর্ডারকৃত পণ্যের তালিকা' : 'Ordered Products'}
                      </h4>
                      <div className="border border-gray-200 dark:border-emerald-900/60 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f4f7f4] dark:bg-black/30 font-bold text-gray-600 dark:text-emerald-300">
                            <tr>
                              <th className="p-3">Product</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                            {selectedOrderForModal.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-3 flex items-center gap-3">
                                  {item.image && (
                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border" />
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-emerald-100">{item.name}</p>
                                    <span className="text-[10px] text-gray-400 font-semibold">{item.weight || 'Standard'}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-center font-black">× {item.quantity}</td>
                                <td className="p-3 text-right font-semibold">৳ {item.price}</td>
                                <td className="p-3 text-right font-black text-brand-900 dark:text-secondary">
                                  ৳ {item.price * item.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Live Tracking Status Logs (Audit Trail) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-brand-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <span>🕒 {isBangla ? 'অর্ডার ট্র্যাকিং হিস্ট্রি ও স্ট্যাটাস লগ (Audit Trail)' : 'Order Status Audit Logs'}</span>
                      </h4>
                      <div className="bg-gray-50 dark:bg-black/30 p-4 rounded-2xl border border-gray-200 dark:border-emerald-900/60 space-y-3">
                        {(!selectedOrderForModal.order_status_logs || selectedOrderForModal.order_status_logs.length === 0) ? (
                          <div className="text-xs text-gray-400 py-2 text-center">
                            {isBangla ? 'কোন ট্র্যাকিং লগ পাওয়া যায়নি' : 'No status change logs available'}
                          </div>
                        ) : (
                          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-300 dark:before:bg-emerald-800">
                            {selectedOrderForModal.order_status_logs.map((log, idx) => (
                              <div key={idx} className="relative group">
                                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 ring-2 ring-emerald-300 dark:ring-emerald-900"></span>
                                <div className="text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-brand-900 dark:text-emerald-300">
                                      {log.status}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-bold">
                                      {log.changed_by} ({log.role})
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  {log.note && (
                                    <p className="text-[11px] text-gray-600 dark:text-emerald-400/80 mt-0.5 italic">
                                      "{log.note}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Change Control Inside Modal */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-emerald-950/40 border border-amber-200 dark:border-emerald-800 space-y-3">
                      <h4 className="text-xs font-black uppercase text-amber-950 dark:text-amber-300">
                        ⚙️ {isBangla ? 'স্ট্যাটাস পরিবর্তন করুন' : 'Change Order Status'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={selectedNewStatus || selectedOrderForModal.status}
                          onChange={(e) => setSelectedNewStatus(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-black/50 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs font-bold"
                        >
                          <option value="Pending">Pending (🟡 অপেক্ষমাণ)</option>
                          <option value="Confirmed">Confirmed (🔵 কনফার্মড)</option>
                          <option value="Packed">Packed (📦 প্যাকড)</option>
                          <option value="Shipped">Shipped (🚚 শিপড)</option>
                          <option value="Delivered">Delivered (✅ ডেলিভারড)</option>
                          <option value="Cancelled">Cancelled (❌ বাতিল)</option>
                        </select>
                        <input
                          type="text"
                          placeholder={isBangla ? 'পরিবর্তনের কারণ বা নোট (ঐচ্ছিক)' : 'Reason or note (optional)'}
                          value={statusUpdateNote}
                          onChange={(e) => setStatusUpdateNote(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-black/50 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const targetSt = selectedNewStatus || selectedOrderForModal.status;
                            handleOrderStatusChange(selectedOrderForModal.id, targetSt, statusUpdateNote);
                            setStatusUpdateNote('');
                            setSelectedNewStatus('');
                          }}
                          className="px-5 py-2 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow transition-all"
                        >
                          💾 {isBangla ? 'স্ট্যাটাস আপডেট করুন' : 'Save Status'}
                        </button>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e0ebe2] dark:border-[#1d3b28]">
                      <button
                        onClick={() => {
                          setSelectedOrderForInvoice(selectedOrderForModal);
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{isBangla ? 'ইনভয়েস / স্লিপ প্রিন্ট করুন' : 'Print Invoice'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedOrderForModal(null)}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-black/40 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-all"
                      >
                        {isBangla ? 'বন্ধ করুন' : 'Close'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 🖨️ PRINTABLE INVOICE / PACKING SLIP MODAL               */}
              {/* ======================================================== */}
              {selectedOrderForInvoice && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
                  <div className="bg-white text-gray-900 rounded-3xl max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto p-6 sm:p-10 my-auto border border-gray-200">
                    
                    {/* Actions Bar on Top */}
                    <div className="flex items-center justify-between border-b pb-4 print:hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📄</span>
                        <h4 className="font-extrabold text-base text-gray-900">
                          {isBangla ? 'ইনভয়েস ও প্যাকিং স্লিপ প্রিভিউ' : 'Invoice & Packing Slip'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition-all"
                        >
                          <Printer className="w-4 h-4" />
                          <span>{isBangla ? '🖨️ প্রিন্ট করুন' : 'Print Now'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrderForInvoice(null)}
                          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* PRINTABLE INVOICE CONTENT */}
                    <div className="space-y-6 text-sm">
                      {/* Invoice Top Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-emerald-900 pb-4">
                        <div>
                          <h2 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">
                            Ihsan Online Shop
                          </h2>
                          <p className="text-xs text-gray-600 font-bold">ইহসান অনলাইন শপ — ১০০% খাঁটি ও নির্ভেজাল পণ্য</p>
                          <p className="text-[11px] text-gray-500">ঢাকা, বাংলাদেশ | হটলাইন: 01317539641</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-gray-500 uppercase block">INVOICE NO</span>
                          <span className="text-lg font-black text-emerald-900 font-mono">
                            #{selectedOrderForInvoice.orderId || selectedOrderForInvoice.id}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Bill To & Ship To */}
                      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <div>
                          <h5 className="text-[11px] font-black uppercase text-gray-500">BILL & SHIP TO:</h5>
                          <p className="font-extrabold text-sm text-gray-900 mt-1">{selectedOrderForInvoice.customerName}</p>
                          <p className="text-xs text-gray-700">📞 {selectedOrderForInvoice.customerPhone}</p>
                          <p className="text-xs text-gray-600 mt-1">{selectedOrderForInvoice.deliveryAddress}</p>
                        </div>
                        <div className="text-right">
                          <h5 className="text-[11px] font-black uppercase text-gray-500">ORDER INFO:</h5>
                          <p className="text-xs font-bold mt-1">Payment Method: <span className="uppercase text-emerald-800">{selectedOrderForInvoice.paymentMethod || 'COD'}</span></p>
                          <p className="text-xs font-bold">Payment Status: <span className="uppercase text-emerald-800">{selectedOrderForInvoice.paymentStatus || 'Pending'}</span></p>
                          <p className="text-xs font-bold">Order Status: <span className="uppercase text-purple-800">{selectedOrderForInvoice.status}</span></p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-emerald-900 text-white font-bold">
                          <tr>
                            <th className="p-2.5">SL</th>
                            <th className="p-2.5">Item Description</th>
                            <th className="p-2.5 text-center">Weight/Unit</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Unit Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedOrderForInvoice.items?.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-2.5 font-bold">{idx + 1}</td>
                              <td className="p-2.5 font-bold">{item.name}</td>
                              <td className="p-2.5 text-center">{item.weight || 'Std'}</td>
                              <td className="p-2.5 text-center font-bold">×{item.quantity}</td>
                              <td className="p-2.5 text-right">৳ {item.price}</td>
                              <td className="p-2.5 text-right font-black text-emerald-900">৳ {item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Total Calculations */}
                      <div className="flex justify-end">
                        <div className="w-64 space-y-1.5 text-xs">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-bold">৳ {selectedOrderForInvoice.subtotal || (selectedOrderForInvoice.totalAmount - (selectedOrderForInvoice.deliveryCharge || 70))}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Delivery Charge:</span>
                            <span className="font-bold">৳ {selectedOrderForInvoice.deliveryCharge || 70}</span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-emerald-900 border-t-2 border-emerald-900 pt-2">
                            <span>Grand Total:</span>
                            <span>৳ {selectedOrderForInvoice.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Signatures & Footer Note */}
                      <div className="pt-10 flex items-center justify-between text-[11px] text-gray-500 border-t">
                        <div className="text-center">
                          <div className="w-32 border-b border-gray-400 mb-1"></div>
                          <span>Prepared By</span>
                        </div>
                        <div className="text-center">
                          <div className="w-32 border-b border-gray-400 mb-1"></div>
                          <span>Checked & Packed By</span>
                        </div>
                        <div className="text-center">
                          <div className="w-32 border-b border-gray-400 mb-1"></div>
                          <span>Customer Signature</span>
                        </div>
                      </div>

                      <p className="text-center text-[10px] text-gray-400 pt-4">
                        Thank you for shopping with Ihsan Online Shop! For support, contact 01317539641
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 6. 💰 PAYMENT & SELLER PAYOUTS MANAGEMENT (DETAILED)     */}
          {/* ======================================================== */}
          {activeMenu === 'payments' && (
            <div className="space-y-6">
              
              {/* Header & Stats Banner */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-emerald-950 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2.5">
                      <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300">💰</span>
                      <span>{isBangla ? 'পেমেন্ট ও সেলার পে-আউট ব্যবস্থাপনা' : 'Payment & Seller Payouts Management'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-400 mt-1">
                      {isBangla ? 'সেলারদের সকল উইথড্রয়াল রিকোয়েস্টের পুরো বিবরণ দেখুন এবং সরাসরি অনুমোদন (Approve) বা বাতিল (Reject) করুন।' : 'Review complete seller details for payout requests and approve or reject in realtime.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSubTab('all')}
                      className={'px-4 py-2 text-xs font-bold rounded-2xl transition-all ' + (
                        activeSubTab === 'all'
                          ? 'bg-amber-500 text-brand-950 font-black shadow-md'
                          : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300 hover:bg-gray-200'
                      )}
                    >
                      {isBangla ? 'উইথড্রয়াল রিকোয়েস্ট' : 'Withdrawals'} ({withdrawalsList.length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('transactions')}
                      className={'px-4 py-2 text-xs font-bold rounded-2xl transition-all ' + (
                        activeSubTab === 'transactions'
                          ? 'bg-amber-500 text-brand-950 font-black shadow-md'
                          : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300 hover:bg-gray-200'
                      )}
                    >
                      {isBangla ? 'পেমেন্ট লেনদেন' : 'Transactions'} ({paymentsList.length})
                    </button>
                    <button
                      onClick={loadAllData}
                      className="p-2 rounded-xl border border-gray-200 dark:border-emerald-900 text-gray-600 dark:text-emerald-300 hover:bg-gray-100 dark:hover:bg-emerald-950 transition-all"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'অপেক্ষমান রিকোয়েস্ট' : 'Pending Requests'}</span>
                      <h4 className="text-lg font-black text-amber-900 dark:text-amber-200">
                        {withdrawalsList.filter(w => w.status === 'pending').length} {isBangla ? 'টি' : ''}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'অনুমোদিত পেআউট' : 'Approved Payouts'}</span>
                      <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                        ৳ {withdrawalsList.filter(w => w.status === 'approved').reduce((acc, w) => acc + (Number(w.amount) || 0), 0).toLocaleString()}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3">
                    <span className="text-2xl">🏪</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'মোট সেলার উইথড্রয়াল' : 'Total Withdrawals'}</span>
                      <h4 className="text-lg font-black text-blue-800 dark:text-blue-300">
                        ৳ {withdrawalsList.reduce((acc, w) => acc + (Number(w.amount) || 0), 0).toLocaleString()}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'মোট কাস্টমার পেমেন্ট' : 'Customer Payments'}</span>
                      <h4 className="text-lg font-black text-purple-800 dark:text-purple-300">
                        ৳ {paymentsList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0).toLocaleString()}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Filters Toolbar */}
                {activeSubTab === 'all' && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={isBangla ? 'সেলার বা দোকানের নাম, ফোন অথবা একাউন্ট নম্বর দিয়ে খুঁজুন...' : 'Search by seller name, shop, phone or account number...'}
                        value={payoutSearchQuery}
                        onChange={(e) => setPayoutSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-900"
                      />
                    </div>

                    <select
                      value={payoutStatusFilter}
                      onChange={(e) => setPayoutStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-bold focus:outline-none"
                    >
                      <option value="all">{isBangla ? 'সকল স্ট্যাটাস (All Status)' : 'All Status'}</option>
                      <option value="pending">{isBangla ? '⏳ অপেক্ষমান (Pending)' : 'Pending'}</option>
                      <option value="approved">{isBangla ? '✅ অনুমোদিত (Approved)' : 'Approved'}</option>
                      <option value="rejected">{isBangla ? '❌ বাতিল (Rejected)' : 'Rejected'}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 1. SELLER WITHDRAWALS & PAYOUTS LIST (DETAILED) */}
              {activeSubTab === 'all' ? (
                (() => {
                  const filteredWithdrawals = withdrawalsList.filter((w) => {
                    const q = (payoutSearchQuery || '').toLowerCase().trim();
                    const sName = (w.shop_name || w.seller_name || '').toLowerCase();
                    const sPhone = (w.phone || '').toLowerCase();
                    const sAcc = (w.account_details || w.method || '').toLowerCase();
                    const matchesQ = !q || sName.includes(q) || sPhone.includes(q) || sAcc.includes(q);

                    const matchesStatus = payoutStatusFilter === 'all' || w.status === payoutStatusFilter;

                    return matchesQ && matchesStatus;
                  });

                  if (filteredWithdrawals.length === 0) {
                    return (
                      <div className="text-center py-16 bg-white dark:bg-[#112318] rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-3">
                        <Wallet className="w-12 h-12 text-gray-300 dark:text-emerald-900 mx-auto" />
                        <h4 className="font-bold text-sm text-gray-700 dark:text-emerald-300">{isBangla ? 'কোনো উইথড্রয়াল রিকোয়েস্ট পাওয়া যায়নি' : 'No Withdrawal Requests Found'}</h4>
                        <p className="text-xs text-gray-400">
                          {isBangla ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try adjusting your search query or status filter.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredWithdrawals.map((w) => {
                        const withdrawId = w._id || w.id;
                        const isPending = w.status === 'pending';
                        const isApproved = w.status === 'approved';
                        const isRejected = w.status === 'rejected';

                        return (
                          <div
                            key={withdrawId}
                            className="bg-white dark:bg-[#112318] rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-4 transition-all hover:shadow-md"
                          >
                            {/* 1. Header: Seller Identity & Trade License */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-emerald-950 pb-3.5">
                              <div className="flex items-center gap-3.5">
                                {w.shop_logo ? (
                                  <img
                                    src={w.shop_logo}
                                    alt={w.shop_name}
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/40 shadow-sm flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-brand-950 font-black flex items-center justify-center text-lg shadow-md flex-shrink-0">
                                    🏪
                                  </div>
                                )}

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-black text-sm sm:text-base text-gray-900 dark:text-emerald-100">
                                      {w.shop_name}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-800">
                                      {isBangla ? 'ভেরিফাইড সেলার' : 'Verified Seller'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-emerald-400 mt-1 flex-wrap">
                                    <span>👤 <strong>{w.seller_name || 'সেলার'}</strong></span>
                                    {w.phone && (
                                      <>
                                        <span>•</span>
                                        <span>📞 {w.phone}</span>
                                      </>
                                    )}
                                    {w.email && (
                                      <>
                                        <span>•</span>
                                        <span>✉️ {w.email}</span>
                                      </>
                                    )}
                                    {w.trade_license && (
                                      <>
                                        <span>•</span>
                                        <span className="bg-gray-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-700 dark:text-emerald-300">
                                          লাইসেন্স: {w.trade_license}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="self-start sm:self-auto">
                                <span className={'px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase flex items-center gap-1.5 ' + (
                                  isApproved ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                                  isPending ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse' :
                                  'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                                )}>
                                  <span>{isApproved ? '✅' : isPending ? '⏳' : '❌'}</span>
                                  <span>{isApproved ? (isBangla ? 'অনুমোদিত (Approved)' : 'Approved') : isPending ? (isBangla ? 'অপেক্ষমান (Pending)' : 'Pending') : (isBangla ? 'বাতিল (Rejected)' : 'Rejected')}</span>
                                </span>
                              </div>
                            </div>

                            {/* 2. Payout Details & Financial Summary Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#f8faf8] dark:bg-black/30 rounded-2xl border border-gray-200/60 dark:border-emerald-950">
                              <div>
                                <span className="text-[10px] text-gray-500 dark:text-emerald-400 font-bold block uppercase">{isBangla ? 'উইথড্রয়াল পরিমাণ' : 'Withdrawal Amount'}</span>
                                <h3 className="text-xl font-black text-brand-900 dark:text-secondary mt-0.5">৳ {Number(w.amount).toLocaleString()}</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">আবেদনের তারিখ: {w.requested_at || 'সম্প্রতি'}</p>
                              </div>

                              <div>
                                <span className="text-[10px] text-gray-500 dark:text-emerald-400 font-bold block uppercase">{isBangla ? 'পেমেন্ট মেথড ও একাউন্ট' : 'Payout Method & Account'}</span>
                                <p className="text-xs font-black text-gray-900 dark:text-emerald-100 mt-0.5">{w.method}</p>
                                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5 font-mono">{w.account_details}</p>
                              </div>

                              <div>
                                <span className="text-[10px] text-gray-500 dark:text-emerald-400 font-bold block uppercase">{isBangla ? 'সেলার স্টোর ব্যালেন্স' : 'Store Balance'}</span>
                                <p className="text-xs font-bold text-gray-800 dark:text-emerald-200 mt-0.5">
                                  ব্যালেন্স: <strong>৳ {Number(w.balance || 0).toLocaleString()}</strong>
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  মোট সেলস: ৳ {Number(w.total_sales || 0).toLocaleString()} • কমিশন: {w.commission_rate ?? 10}%
                                </p>
                              </div>
                            </div>

                            {/* 3. Note / Reason if provided */}
                            {w.note && (
                              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200">
                                <strong>নোট / বিবরণ:</strong> {w.note}
                              </div>
                            )}

                            {/* 4. Action Buttons (Approve / Reject) */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-emerald-950">
                              <div className="text-[11px] text-gray-400">
                                {w.processed_at ? (
                                  <span>প্রসেসিং সম্পন্ন: {new Date(w.processed_at).toLocaleString('bn-BD')}</span>
                                ) : (
                                  <span>এডমিন যাচাইকরণ ও একাউন্ট ট্রান্সফার পেন্ডিং</span>
                                )}
                              </div>

                              {isPending ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleWithdrawStatus(withdrawId, 'approved')}
                                    className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>{isBangla ? 'অনুমোদন করুন (Approve)' : 'Approve Payout'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleWithdrawStatus(withdrawId, 'rejected')}
                                    className="flex-1 sm:flex-initial px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>{isBangla ? 'বাতিল করুন (Reject)' : 'Reject'}</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                  {isApproved && (
                                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>{isBangla ? 'এই পেআউটটি সফলভাবে সম্পন্ন হয়েছে' : 'Payout Completed'}</span>
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                      <XCircle className="w-4 h-4" />
                                      <span>{isBangla ? 'এই পেআউট রিকোয়েস্টটি বাতিল করা হয়েছে' : 'Payout Rejected'}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                /* 2. PAYMENT TRANSACTIONS TABLE */
                <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold border-b border-gray-200 dark:border-emerald-900/60">
                      <tr>
                        <th className="p-3.5">Order Number</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">Transaction ID</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                      {paymentsList.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-emerald-950/20">
                          <td className="p-3.5 font-bold font-mono text-brand-900 dark:text-emerald-300">{p.order_number || p.order_id}</td>
                          <td className="p-3.5 font-semibold">{p.customer_name || 'Customer'}</td>
                          <td className="p-3.5 uppercase font-bold text-xs">{p.method}</td>
                          <td className="p-3.5 font-mono text-xs text-gray-500">{p.transaction_id}</td>
                          <td className="p-3.5 font-black text-brand-950 dark:text-emerald-100">৳ {p.amount}</td>
                          <td className="p-3.5 text-xs text-gray-400">{p.created_at || 'সম্প্রতি'}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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

          {/* ======================================================== */}
          {/* 7. CUSTOMER REVIEWS & REPLIES MANAGEMENT (ADMIN VIEW)     */}
          {/* ======================================================== */}
          {activeMenu === 'reviews' && (
            <div className="space-y-6">
              
              {/* Header & Stats Banner */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-emerald-950 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2.5">
                      <span className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">⭐</span>
                      <span>{isBangla ? 'গ্রাহকদের রিভিউ ও রেটিং ব্যবস্থাপনা (সকল সেলার ও পণ্য)' : 'Customer Reviews & Replies Hub (All Sellers & Products)'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-400 mt-1">
                      {isBangla ? 'কোন কাস্টমার মন্তব্য করেছে তার সম্পূর্ণ প্রোফাইল ও কোন সেলারের পণ্যে রিভিউ দিয়েছে তা বিস্তারিত দেখুন এবং এডমিন হিসেবে সরাসরি উত্তর দিন।' : 'Detailed customer profile, product details, seller attribution, and direct Admin moderation response.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
                      {reviewsList.length} {isBangla ? 'টি মোট রিভিউ' : 'Total Reviews'}
                    </span>
                    <button
                      onClick={loadAllData}
                      className="p-2 rounded-xl border border-gray-200 dark:border-emerald-900 text-gray-600 dark:text-emerald-300 hover:bg-gray-100 dark:hover:bg-emerald-950 transition-all"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rating Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'গড় রেটিং' : 'Avg Rating'}</span>
                      <h4 className="text-lg font-black text-amber-950 dark:text-amber-200">
                        {reviewsList.length > 0 ? (reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviewsList.length).toFixed(1) : '5.0'} / 5.0
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'উত্তর দেওয়া হয়েছে' : 'Replied'}</span>
                      <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                        {reviewsList.filter(r => r.admin_reply || r.seller_reply || (r.replies && r.replies.length > 0)).length}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'উত্তর বাকি' : 'Pending Reply'}</span>
                      <h4 className="text-lg font-black text-blue-800 dark:text-blue-300">
                        {reviewsList.filter(r => !r.admin_reply && !r.seller_reply && (!r.replies || r.replies.length === 0)).length}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'ভেরিফাইড বায়ার' : 'Verified Buyers'}</span>
                      <h4 className="text-lg font-black text-purple-800 dark:text-purple-300">
                        {reviewsList.filter(r => r.is_verified_buyer !== false).length}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Filters & Live Search */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={isBangla ? 'কাস্টমারের নাম, ফোন, পণ্যের নাম বা সেলার দিয়ে খুঁজুন...' : 'Search by customer name, phone, product or seller...'}
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-900"
                    />
                  </div>

                  {/* Rating filter */}
                  <select
                    value={reviewRatingFilter}
                    onChange={(e) => setReviewRatingFilter(e.target.value)}
                    className="px-3.5 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-bold focus:outline-none"
                  >
                    <option value="all">{isBangla ? 'সব রেটিং (All Stars)' : 'All Ratings'}</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Star</option>
                    <option value="4">⭐⭐⭐⭐ 4 Star</option>
                    <option value="3">⭐⭐⭐ 3 Star</option>
                    <option value="2">⭐⭐ 2 Star</option>
                    <option value="1">⭐ 1 Star</option>
                  </select>

                  {/* Seller Filter */}
                  <select
                    value={reviewSellerFilter}
                    onChange={(e) => setReviewSellerFilter(e.target.value)}
                    className="px-3.5 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-bold focus:outline-none max-w-[200px]"
                  >
                    <option value="all">{isBangla ? 'সব সেলার (All Sellers)' : 'All Sellers'}</option>
                    {Array.from(new Set(reviewsList.map(r => r.product?.seller_name || r.seller_name || 'সেলার').filter(Boolean))).map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                    className="px-3.5 py-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-bold focus:outline-none"
                  >
                    <option value="all">{isBangla ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                    <option value="replied">{isBangla ? 'উত্তর দেওয়া হয়েছে' : 'Replied'}</option>
                    <option value="pending">{isBangla ? 'উত্তর বাকি' : 'Pending Reply'}</option>
                  </select>
                </div>
              </div>

              {/* Reviews Cards List */}
              {(() => {
                const filteredReviews = reviewsList.filter((rev) => {
                  const q = reviewSearchQuery.trim().toLowerCase();
                  const custName = (rev.customerName || rev.userName || '').toLowerCase();
                  const custPhone = (rev.customerPhone || '').toLowerCase();
                  const prodName = (rev.product?.name || rev.product?.name_bn || rev.product_name || '').toLowerCase();
                  const sName = (rev.product?.seller_name || rev.seller_name || '').toLowerCase();
                  const comment = (rev.comment || '').toLowerCase();

                  const matchesQuery = !q || custName.includes(q) || custPhone.includes(q) || prodName.includes(q) || sName.includes(q) || comment.includes(q);

                  const matchesRating = reviewRatingFilter === 'all' || String(Math.round(Number(rev.rating) || 5)) === String(reviewRatingFilter);

                  const matchesSeller = reviewSellerFilter === 'all' || (rev.product?.seller_name || rev.seller_name) === reviewSellerFilter;

                  const hasReply = Boolean(rev.admin_reply || rev.seller_reply || (rev.replies && rev.replies.length > 0));
                  const matchesStatus = reviewStatusFilter === 'all' || 
                                        (reviewStatusFilter === 'replied' && hasReply) || 
                                        (reviewStatusFilter === 'pending' && !hasReply);

                  return matchesQuery && matchesRating && matchesSeller && matchesStatus;
                });

                if (filteredReviews.length === 0) {
                  return (
                    <div className="text-center py-16 bg-white dark:bg-[#112318] rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-3">
                      <Star className="w-12 h-12 text-gray-300 dark:text-emerald-900 mx-auto" />
                      <h4 className="font-bold text-sm text-gray-700 dark:text-emerald-300">{isBangla ? 'কোনো রিভিউ পাওয়া যায়নি' : 'No Reviews Found'}</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        {isBangla ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try adjusting your search query or filters.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filteredReviews.map((rev) => {
                      const reviewId = rev._id || rev.id;
                      const prod = rev.product || productsList.find(p => String(p._id) === String(rev.productId || rev.product_id) || String(p.id) === String(rev.productId || rev.product_id));
                      const prodName = prod ? (prod.name_bn || prod.name) : (rev.product_name || 'খাঁটি পণ্য');
                      const prodImage = prod?.thumbnail || (prod?.images && prod?.images[0]) || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80';
                      const prodPrice = prod?.price || 850;
                      const prodCat = prod?.category || prod?.category_name || 'খাঁটি পণ্য';
                      const sName = prod?.seller_name || prod?.shop_name || rev.seller_name || 'সুন্দরবন অর্গানিক ফার্মস';

                      return (
                        <div
                          key={reviewId}
                          className="bg-white dark:bg-[#112318] rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm space-y-4 transition-all hover:shadow-md"
                        >
                          {/* 1. Header: Customer Profile & Order Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-emerald-950 pb-3.5">
                            <div className="flex items-center gap-3">
                              {rev.customerAvatar ? (
                                <img
                                  src={rev.customerAvatar}
                                  alt={rev.customerName || 'Customer'}
                                  className="w-11 h-11 rounded-2xl object-cover border border-emerald-500/30 shadow-sm flex-shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                                  {rev.customerName?.charAt(0) || 'U'}
                                </div>
                              )}

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-sm text-gray-900 dark:text-emerald-100">{rev.customerName || rev.userName || 'Customer'}</h4>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                    <span>✓</span>
                                    <span>{isBangla ? 'ভেরিফাইড বায়ার' : 'Verified Buyer'}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-emerald-400 mt-0.5 flex-wrap">
                                  {rev.customerPhone && (
                                    <span>📞 {rev.customerPhone}</span>
                                  )}
                                  {rev.customerEmail && (
                                    <span>✉️ {rev.customerEmail}</span>
                                  )}
                                  {rev.orderId && (
                                    <span className="font-semibold text-gray-600 dark:text-emerald-300 bg-gray-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">Order: #{rev.orderId}</span>
                                  )}
                                  <span>•</span>
                                  <span>{rev.date || 'সম্প্রতি'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Star Rating Badge */}
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-2xl border border-amber-200 dark:border-amber-900/50 self-start sm:self-auto">
                              <div className="flex text-amber-500 text-xs">
                                {Array.from({ length: Math.min(5, Math.max(1, Number(rev.rating) || 5)) }).map((_, idx) => (
                                  <span key={idx}>⭐</span>
                                ))}
                              </div>
                              <span className="font-black text-xs text-amber-950 dark:text-amber-200 ml-1">{rev.rating || 5}/5</span>
                            </div>
                          </div>

                          {/* 2. Product & Seller Card Preview */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#f8faf8] dark:bg-black/30 rounded-2xl border border-gray-200/60 dark:border-emerald-950">
                            <div className="flex items-center gap-3">
                              <img
                                src={prodImage}
                                alt={prodName}
                                className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-emerald-900 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold inline-block">
                                  {prodCat}
                                </span>
                                <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-100 truncate mt-0.5">{prodName}</h5>
                                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">৳ {prodPrice}</p>
                              </div>
                            </div>

                            {/* Seller Shop Attribution Badge (Prominent in Admin) */}
                            <div className="flex items-center gap-2 text-xs bg-amber-50/80 dark:bg-amber-950/40 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-900/60 self-start sm:self-auto flex-shrink-0">
                              <Store className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <div>
                                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block">{isBangla ? 'পণ্য সরবরাহকারী সেলার:' : 'Product Seller:'}</span>
                                <span className="font-black text-amber-950 dark:text-amber-200">{sName}</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. Customer Review Comment Text */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-black/20 border border-gray-200/70 dark:border-emerald-950 space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                              {isBangla ? 'গ্রাহকের মন্তব্য (Customer Comment):' : 'Customer Review:'}
                            </span>
                            <p className="text-xs sm:text-sm text-gray-800 dark:text-emerald-50 font-medium leading-relaxed">
                              "{rev.comment}"
                            </p>
                          </div>

                          {/* 4. Existing Replies Thread (Seller / Admin) */}
                          <div className="space-y-2">
                            {rev.seller_reply && (
                              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                                    <span>🏪</span>
                                    <span>{isBangla ? 'সেলার উত্তর (Seller Shop Reply):' : 'Seller Reply:'}</span>
                                  </span>
                                  {rev.replied_at && (
                                    <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70">
                                      {new Date(rev.replied_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium leading-relaxed">{rev.seller_reply}</p>
                              </div>
                            )}

                            {rev.admin_reply && (
                              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-purple-900 dark:text-purple-300 flex items-center gap-1">
                                    <span>🛡️</span>
                                    <span>{isBangla ? 'এডমিন মডারেটর উত্তর (Admin Official Reply):' : 'Admin Reply:'}</span>
                                  </span>
                                  {rev.replied_at && (
                                    <span className="text-[10px] text-purple-700/70 dark:text-purple-400/70">
                                      {new Date(rev.replied_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium leading-relaxed">{rev.admin_reply}</p>
                              </div>
                            )}
                          </div>

                          {/* 5. Admin Moderation Reply Input Form */}
                          <div className="pt-2 border-t border-gray-100 dark:border-emerald-950">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={isBangla ? 'এডমিন হিসেবে গ্রাহককে উত্তর বা নির্দেশনা দিন...' : 'Write an official Admin reply to customer...'}
                                value={reviewReplyMap[reviewId] || ''}
                                onChange={(e) => setReviewReplyMap({ ...reviewReplyMap, [reviewId]: e.target.value })}
                                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900 font-medium"
                              />
                              <button
                                onClick={() => handleAdminReplyReview(reviewId)}
                                disabled={isReplyingReview}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-brand-900 hover:from-emerald-600 hover:to-brand-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isBangla ? 'এডমিন উত্তর দিন' : 'Admin Reply'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

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
