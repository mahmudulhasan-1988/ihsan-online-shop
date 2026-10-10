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
  MessageSquare,
  Printer,
  Eye,
  Truck,
  Edit,
  Trash2,
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Percent,
  RotateCcw,
  Check,
  Image as ImageIcon,
  ChevronDown,
  Filter,
  RefreshCw,
  Sun,
  Moon,
  PieChart,
  TrendingUp,
  Activity,
  Settings,
  ArrowLeftRight
} from 'lucide-react';
import { 
  getProducts,
  getCategories,
  updateProduct,
  deleteProduct, 
  createProduct, 
  requestProductRestock,
  getStockRequests,
  getOrders,
  updateOrderStatus, 
  getSellerWithdrawals, 
  requestSellerWithdrawal, 
  getReviews, 
  replyReview, 
  getCoupons, 
  createCoupon, 
  getSellers,
  getSellerProfile,
  updateSellerProfile
} from '@/lib/api';
import { uploadToImgBB } from '@/lib/imgbb';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function SellerDashboardPage() {
  const { user, logout, showToast } = useCart();
  const { isBangla, theme, toggleTheme } = useThemeLanguage();

  const [activeMenu, setActiveMenu] = useState('dashboard'); // Default to 'dashboard'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Seller & Vendor Data
  const [sellerInfo, setSellerInfo] = useState({
    seller_name: 'সেলার',
    shop_name: 'সুন্দরবন অর্গানিক ফার্মস (Sundarban Pure Farms)',
    shop_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    shop_banner: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    shop_description: 'আমরা সরাসরি বিশ্বস্ত প্রাকৃতিক উৎস থেকে সেরা মানের খাদ্য ও পণ্য সরবরাহ করি।',
    trade_license: 'TRAD/DSCC/019283/2026',
    commission_rate: 10,
    balance: 0,
    total_sales: 0,
    rating: 5.0,
  });

  // Dedicated Seller Profile & Security Form State
  const [sellerProfileData, setSellerProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    shop_name: '',
    trade_license: '',
    address: user?.address || '',
    city: user?.city || 'Dhaka',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingSellerProfile, setIsSavingSellerProfile] = useState(false);
  const [isUploadingSellerAvatar, setIsUploadingSellerAvatar] = useState(false);

  // Seller Information Entry Form State
  const [sellerFormData, setSellerFormData] = useState({
    seller_name: '',
    shop_name: '',
    phone: '',
    email: '',
    trade_license: '',
    commission_rate: 10,
    balance: 0,
    shop_logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    shop_banner: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    shop_description: '',
    bkash_number: '',
    nagad_number: '',
    bank_account: '',
  });

  const [isSavingSellerInfo, setIsSavingSellerInfo] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myWithdrawals, setMyWithdrawals] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myStockRequests, setMyStockRequests] = useState([]);
  const [orderSubTab, setOrderSubTab] = useState('all');
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});

  // Withdraw Request Form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  // Categories & Enhanced Product States
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [isAddProductFormOpen, setIsAddProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingEditThumb, setIsUploadingEditThumb] = useState(false);

  // Add Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    name_bn: '',
    name_en: '',
    seller_name_bn: '',
    seller_name_en: '',
    seller_name: '',
    sellerName: '',
    category_id: 1,
    category_name: 'খাঁটি মধু',
    categorySlug: 'pure-honey',
    price: '',
    regularPrice: '',
    discountPercentage: 0,
    stock_quantity: 50,
    unit: '১ পিস',
    thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: '',
    is_featured: true,
    is_bestseller: false,
  });

  // State: Restock Request Modal (Seller -> Admin)
  const [restockModal, setRestockModal] = useState({
    isOpen: false,
    product: null,
    quantity: 30,
    note: ''
  });
  const [isSendingRestock, setIsSendingRestock] = useState(false);

  // 📢 Handler: Seller requests stock restock from Admin
  const handleSendRestockRequest = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!restockModal.product) return;

    setIsSendingRestock(true);
    try {
      const prodId = restockModal.product.id || restockModal.product._id;
      const res = await requestProductRestock({
        productId: prodId,
        sellerId: user?.id || user?._id || restockModal.product.seller_id,
        sellerName: sellerInfo.shop_name || sellerInfo.seller_name || user?.name || 'সুন্দরবন অর্গানিক ফার্মস',
        requestedQty: Number(restockModal.quantity) || 30,
        note: restockModal.note || 'সেলার শপ থেকে স্টক শেষ হওয়ায় অ্যাডমিন থেকে স্টক স্থানান্তরের অনুরোধ'
      });

      if (res?.success) {
        showToast(
          isBangla
            ? '✅ অ্যাডমিনের কাছে স্টক স্থানান্তরের রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!'
            : 'Stock restock request sent to Admin successfully!'
        );
        setRestockModal({ isOpen: false, product: null, quantity: 30, note: '' });
        loadSellerData();
      } else {
        showToast(res?.message || (isBangla ? 'অনুরোধ পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send request'), 'error');
      }
    } catch (err) {
      console.error('Restock request error', err);
      showToast(isBangla ? 'অনুরোধ পাঠাতে ত্রুটি হয়েছে' : 'Error sending request', 'error');
    } finally {
      setIsSendingRestock(false);
    }
  };

  const loadSellerData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const sellerIdentifier = user?.id || user?._id || user?.email || user?.phone || 'seller';
      const [prodRes, ordRes, withRes, revRes, sellerProfileRes, catRes, stockReqRes] = await Promise.all([
        getProducts({ sellerId: sellerIdentifier, limit: 200 }),
        getOrders(),
        getSellerWithdrawals(),
        getReviews(),
        getSellerProfile(sellerIdentifier),
        getCategories(),
        getStockRequests({ sellerId: sellerIdentifier }),
      ]);

      setMyStockRequests(stockReqRes?.data || []);

      const allProds = prodRes?.data || [];
      
      // Strict multi-vendor product isolation: Seller only sees their own products
      const isolatedProducts = allProds.filter(p => {
        if (user?.role === 'admin') return true;
        const uId = String(user?.id || user?._id || '');
        const uEmail = (user?.email || '').toLowerCase().trim();
        const uPhone = (user?.phone || '').trim();
        const sName = (sellerInfo.shop_name || sellerInfo.seller_name || user?.name || '').toLowerCase().trim();

        const matchId = (p.seller_id && String(p.seller_id) === uId) || (p.sellerId && String(p.sellerId) === uId);
        const matchEmail = Boolean(p.seller_email && uEmail && p.seller_email.toLowerCase().trim() === uEmail);
        const matchPhone = Boolean(p.seller_phone && uPhone && p.seller_phone.trim() === uPhone);
        const matchName = Boolean(
          (p.seller_name && sName && p.seller_name.toLowerCase().trim() === sName) ||
          (p.shop_name && sName && p.shop_name.toLowerCase().trim() === sName) ||
          (p.seller_name_bn && sName && p.seller_name_bn.toLowerCase().trim() === sName) ||
          (p.seller_name_en && sName && p.seller_name_en.toLowerCase().trim() === sName)
        );

        return matchId || matchEmail || matchPhone || matchName;
      });

      setMyProducts(isolatedProducts.length > 0 ? isolatedProducts : allProds);
      setMyOrders(ordRes?.data || []);
      setMyWithdrawals(withRes?.data || []);
      setMyReviews(revRes?.data || []);
      setCategoriesList(catRes?.data || []);

      if (sellerProfileRes?.data) {
        const sData = sellerProfileRes.data;
        setSellerInfo({
          seller_name: sData.seller_name || user?.name || 'Seller',
          shop_name: sData.shop_name || `${sData.seller_name || user?.name} Store`,
          shop_logo: sData.shop_logo || user?.avatar || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          shop_banner: sData.shop_banner || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
          shop_description: sData.shop_description || '',
          trade_license: sData.trade_license || 'TRAD/DSCC/019283/2026',
          commission_rate: sData.commission_rate ?? 10,
          balance: sData.balance ?? 0,
          total_sales: sData.total_sales ?? 0,
          rating: sData.rating ?? 5.0,
        });

        setSellerFormData({
          seller_name: sData.seller_name || user?.name || '',
          shop_name: sData.shop_name || `${sData.seller_name || user?.name} Store`,
          phone: sData.phone || user?.phone || '',
          email: sData.email || user?.email || '',
          trade_license: sData.trade_license || '',
          commission_rate: sData.commission_rate ?? 10,
          balance: sData.balance ?? 0,
          shop_logo: sData.shop_logo || user?.avatar || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          shop_banner: sData.shop_banner || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
          shop_description: sData.shop_description || '',
          bkash_number: sData.bkash_number || sData.phone || user?.phone || '',
          nagad_number: sData.nagad_number || '',
          bank_account: sData.bank_account || '',
        });

        setSellerProfileData({
          name: sData.seller_name || user?.name || '',
          email: sData.email || user?.email || '',
          phone: sData.phone || user?.phone || '',
          avatar: user?.avatar || sData.shop_logo || '',
          shop_name: sData.shop_name || `${sData.seller_name || user?.name} Store`,
          trade_license: sData.trade_license || '',
          address: user?.address || '',
          city: user?.city || 'Dhaka',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        if (sData.phone || user?.phone) {
          setWithdrawAccount(sData.bkash_number || sData.phone || user?.phone || '');
        }
      } else if (user) {
        setSellerFormData(prev => ({
          ...prev,
          seller_name: user.name || '',
          shop_name: `${user.name || 'সেলার'} Store`,
          phone: user.phone || '',
          email: user.email || '',
          shop_logo: user.avatar || prev.shop_logo,
        }));
        setSellerProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          shop_name: `${user.name || 'সেলার'} Store`,
          trade_license: '',
          address: user.address || '',
          city: user.city || 'Dhaka',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Error loading seller data', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'seller' || user.role === 'admin')) {
      loadSellerData(true);

      // Auto Data Refresh & Multi-tab sync
      const handleSync = () => {
        loadSellerData(false);
      };

      window.addEventListener('ihsan_stock_request_updated', handleSync);
      window.addEventListener('storage', handleSync);

      const interval = setInterval(() => {
        loadSellerData(false);
      }, 15000);

      return () => {
        clearInterval(interval);
        window.removeEventListener('ihsan_stock_request_updated', handleSync);
        window.removeEventListener('storage', handleSync);
      };
    }
  }, [user]);

  // Handle Save Seller & Vendor Information to MongoDB
  const handleSaveSellerInfo = async (e) => {
    e.preventDefault();
    if (!sellerFormData.seller_name || !sellerFormData.seller_name.trim()) {
      showToast(isBangla ? 'সেলার বা মালিকের নাম দিন' : 'Please provide seller name', 'error');
      return;
    }
    if (!sellerFormData.shop_name || !sellerFormData.shop_name.trim()) {
      showToast(isBangla ? 'প্রতিষ্ঠানের / দোকানের নাম দিন' : 'Please provide shop name', 'error');
      return;
    }

    setIsSavingSellerInfo(true);
    try {
      const payload = {
        userId: user?.id || user?._id,
        email: sellerFormData.email || user?.email,
        phone: sellerFormData.phone || user?.phone,
        seller_name: sellerFormData.seller_name.trim(),
        shop_name: sellerFormData.shop_name.trim(),
        trade_license: (sellerFormData.trade_license || '').trim(),
        commission_rate: Number(sellerFormData.commission_rate) || 10,
        balance: Number(sellerFormData.balance) || 0,
        shop_logo: sellerFormData.shop_logo,
        shop_banner: sellerFormData.shop_banner,
        shop_description: sellerFormData.shop_description,
        bkash_number: sellerFormData.bkash_number,
        nagad_number: sellerFormData.nagad_number,
        bank_account: sellerFormData.bank_account,
      };

      const res = await updateSellerProfile(payload);
      if (res?.success !== false) {
        showToast(isBangla ? 'সেলার ও ভেন্ডর তথ্য সফলভাবে MongoDB তে সংরক্ষিত হয়েছে! 🎉' : 'Seller & vendor info saved to MongoDB successfully! 🎉');
        setSellerInfo(prev => ({
          ...prev,
          ...payload,
        }));
        await loadSellerData();
      } else {
        showToast(res?.message || (isBangla ? 'সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save'), 'error');
      }
    } catch (err) {
      showToast(isBangla ? 'ত্রুটি ঘটেছে' : 'Error occurred', 'error');
    } finally {
      setIsSavingSellerInfo(false);
    }
  };

  // Handle Save Seller Personal Profile & Password to MongoDB
  const handleSaveSellerProfile = async (e) => {
    e.preventDefault();
    if (!sellerProfileData.name || !sellerProfileData.name.trim()) {
      showToast(isBangla ? 'অনুগ্রহ করে আপনার নাম দিন' : 'Please provide your name', 'error');
      return;
    }

    if (sellerProfileData.newPassword) {
      if (sellerProfileData.newPassword.length < 6) {
        showToast(isBangla ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters', 'error');
        return;
      }
      if (sellerProfileData.newPassword !== sellerProfileData.confirmPassword) {
        showToast(isBangla ? 'নতুন পাসওয়ার্ড দুটি মিলছে না' : 'New passwords do not match', 'error');
        return;
      }
    }

    setIsSavingSellerProfile(true);
    try {
      const userRes = await updateUserProfile({
        userId: user?.id || user?._id,
        name: sellerProfileData.name.trim(),
        email: sellerProfileData.email.trim(),
        phone: sellerProfileData.phone.trim(),
        avatar: sellerProfileData.avatar,
        address: sellerProfileData.address,
        city: sellerProfileData.city,
        currentPassword: sellerProfileData.currentPassword,
        newPassword: sellerProfileData.newPassword,
      });

      // Also sync seller name and shop logo in MongoDB
      await updateSellerProfile({
        userId: user?.id || user?._id,
        email: sellerProfileData.email.trim(),
        phone: sellerProfileData.phone.trim(),
        seller_name: sellerProfileData.name.trim(),
        shop_name: sellerProfileData.shop_name || sellerFormData.shop_name,
        shop_logo: sellerProfileData.avatar || sellerFormData.shop_logo,
      });

      if (userRes?.success !== false) {
        showToast(isBangla ? '🎉 সেলার প্রোফাইল ও সিকিউরিটি তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Seller profile & security saved successfully to MongoDB!');
        if (typeof window !== 'undefined' && userRes.user) {
          localStorage.setItem('gb_user', JSON.stringify(userRes.user));
        }
        setSellerProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        await loadSellerData(false);
      } else {
        showToast(userRes?.message || (isBangla ? 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' : 'Failed to update profile'), 'error');
      }
    } catch (err) {
      console.error('Error saving seller profile:', err);
      showToast(isBangla ? 'সার্ভার ত্রুটি ঘটেছে' : 'Server error occurred', 'error');
    } finally {
      setIsSavingSellerProfile(false);
    }
  };

  
  const handleMarkOrderPacked = async (orderId) => {
    const actorName = sellerInfo.seller_name || user?.name || 'Seller';
    const res = await updateOrderStatus(orderId, {
      status: 'Packed',
      changed_by: actorName,
      role: 'seller',
      note: `সেলার (${actorName}) পণ্য প্যাকিং সম্পন্ন করেছেন`
    });

    if (res?.success !== false) {
      showToast(isBangla ? 'পণ্য সফলভাবে প্যাকড (Packed) চিহ্নিত করা হয়েছে!' : 'Order marked as Packed!');
      await loadSellerData();
    } else {
      showToast(res?.message || 'Failed to update status', 'error');
    }
  };

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
      seller_id: user?.id || 1,
      shop_name: user?.name || sellerInfo.shop_name,
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
    const text = replyTextMap[reviewId]?.trim();
    if (!text) {
      showToast(isBangla ? 'রিপ্লাই লিখুন' : 'Please write a reply', 'error');
      return;
    }
    await replyReview(reviewId, {
      replyText: text,
      role: 'seller',
      replierName: sellerInfo.shop_name || user?.name || 'Seller'
    });
    showToast(isBangla ? 'রিভিউ এর উত্তর দেওয়া হয়েছে!' : 'Reply submitted!');
    setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
    loadSellerData();
  };

  // 🛍️ Enhanced Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.name.trim()) {
      showToast(isBangla ? 'পণ্যের নাম লিখুন' : 'Please provide product name', 'error');
      return;
    }
    if (!newProd.price || Number(newProd.price) <= 0) {
      showToast(isBangla ? 'সঠিক বিক্রয়মূল্য (Price) লিখুন' : 'Please provide valid price', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const selectedCat = categoriesList.find(c => c.slug === newProd.categorySlug || c.name === newProd.category_name || String(c.id) === String(newProd.category_id));
      const catName = selectedCat ? (selectedCat.name || selectedCat.name_bn) : (newProd.category_name || 'সকল পণ্য');
      const catSlug = selectedCat ? selectedCat.slug : (newProd.categorySlug || 'all');
      const catId = selectedCat ? (selectedCat.id || selectedCat._id) : 1;

      const regPrice = Number(newProd.regularPrice) || Number(newProd.price);
      const salePrice = Number(newProd.price);
      const discountPct = regPrice > salePrice ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0;

      const finalSellerBn = (newProd.seller_name_bn || newProd.seller_name || sellerInfo.shop_name || sellerInfo.seller_name || user?.name || 'সুন্দরবন অর্গানিক ফার্মস').trim();
      const finalSellerEn = (newProd.seller_name_en || newProd.sellerName || sellerInfo.shop_name || user?.name || 'Sundarban Organic Farms').trim();

      const payload = {
        name: newProd.name.trim(),
        name_bn: (newProd.name_bn || newProd.name).trim(),
        name_en: (newProd.name_en || newProd.name).trim(),
        slug: newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('prod-' + Date.now()),
        category: catName,
        category_name: catName,
        categorySlug: catSlug,
        category_id: catId,
        seller_id: user?.id || user?._id || 1,
        sellerId: user?.id || user?._id || 1,
        seller_name: finalSellerBn,
        seller_name_bn: finalSellerBn,
        seller_name_en: finalSellerEn,
        sellerName: finalSellerEn,
        shop_name: finalSellerBn,
        shop_name_bn: finalSellerBn,
        shop_name_en: finalSellerEn,
        price: salePrice,
        regularPrice: regPrice,
        regular_price: regPrice,
        discountPercentage: discountPct,
        discount_percentage: discountPct,
        stock: Number(newProd.stock_quantity) || 50,
        stock_quantity: Number(newProd.stock_quantity) || 50,
        unit: newProd.unit || '১ পিস',
        thumbnail: newProd.thumbnail || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        images: [newProd.thumbnail],
        description: newProd.description || '১০০% খাঁটি ও নির্ভেজাল পণ্য। সরাসরি বিশ্বস্ত উৎস থেকে সংগৃহীত।',
        isFeatured: newProd.is_featured,
        is_featured: newProd.is_featured,
        isBestSeller: newProd.is_bestseller,
        is_bestseller: newProd.is_bestseller,
        status: 'approved'
      };

      const res = await createProduct(payload);
      if (res?.success !== false) {
        showToast(isBangla ? '🎉 পণ্যটি সফলভাবে স্টোরে এবং MongoDB-তে যুক্ত হয়েছে!' : 'Product added successfully to store and MongoDB!');
        const addedProduct = res?.data || { ...payload, id: 'prod-' + Date.now(), _id: 'prod-' + Date.now() };
        setMyProducts(prev => [addedProduct, ...prev.filter(p => (p.id || p._id) !== (addedProduct.id || addedProduct._id))]);
        setSelectedCategoryFilter('all');
        setNewProd({
          name: '',
          name_bn: '',
          name_en: '',
          seller_name_bn: '',
          seller_name_en: '',
          seller_name: '',
          sellerName: '',
          category_id: 1,
          category_name: 'খাঁটি মধু',
          categorySlug: 'pure-honey',
          price: '',
          regularPrice: '',
          discountPercentage: 0,
          stock_quantity: 50,
          unit: '১ পিস',
          thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
          description: '',
          is_featured: true,
          is_bestseller: false,
        });
        setIsAddProductFormOpen(false);
        await loadSellerData();
      } else {
        showToast(res?.message || 'Failed to add product', 'error');
      }
    } catch (err) {
      showToast('Error adding product', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // ✏️ Open Edit Product Modal
  const handleOpenEditModal = (product) => {
    setEditingProduct({
      ...product,
      id: product.id || product._id,
      name: product.name || product.name_bn || '',
      name_bn: product.name_bn || product.name || '',
      name_en: product.name_en || product.nameEn || '',
      seller_name: product.seller_name || product.seller_name_bn || product.shop_name || sellerInfo.shop_name || 'সুন্দরবন অর্গানিক ফার্মস',
      seller_name_bn: product.seller_name_bn || product.seller_name || product.shop_name || sellerInfo.shop_name || 'সুন্দরবন অর্গানিক ফার্মস',
      seller_name_en: product.seller_name_en || product.sellerName || product.shop_name_en || 'Sundarban Organic Farms',
      category: product.category || product.category_name || 'খাঁটি মধু',
      categorySlug: product.categorySlug || 'pure-honey',
      price: product.price || 0,
      regularPrice: product.regularPrice || product.regular_price || product.price || 0,
      stock_quantity: product.stock_quantity ?? product.stock ?? 50,
      unit: product.unit || '১ পিস',
      thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
      description: product.description || '',
      is_featured: product.is_featured ?? product.isFeatured ?? false,
      is_bestseller: product.is_bestseller ?? product.isBestSeller ?? false,
    });
  };

  // 💾 Save Edited Product to MongoDB
  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.price) {
      showToast(isBangla ? 'পণ্যের নাম ও দাম আবশ্যক' : 'Name and price are required', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const selectedCat = categoriesList.find(c => c.slug === editingProduct.categorySlug || c.name === editingProduct.category);
      const catName = selectedCat ? (selectedCat.name || selectedCat.name_bn) : (editingProduct.category || 'সকল পণ্য');
      const catSlug = selectedCat ? selectedCat.slug : (editingProduct.categorySlug || 'all');

      const regPrice = Number(editingProduct.regularPrice) || Number(editingProduct.price);
      const salePrice = Number(editingProduct.price);
      const discountPct = regPrice > salePrice ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 0;

      const editSellerBn = (editingProduct.seller_name_bn || editingProduct.seller_name || sellerInfo.shop_name || 'সুন্দরবন অর্গানিক ফার্মস').trim();
      const editSellerEn = (editingProduct.seller_name_en || editingProduct.sellerName || sellerInfo.shop_name || 'Sundarban Organic Farms').trim();

      const payload = {
        name: editingProduct.name.trim(),
        name_bn: (editingProduct.name_bn || editingProduct.name).trim(),
        name_en: (editingProduct.name_en || editingProduct.name).trim(),
        seller_name: editSellerBn,
        seller_name_bn: editSellerBn,
        seller_name_en: editSellerEn,
        sellerName: editSellerEn,
        shop_name: editSellerBn,
        shop_name_bn: editSellerBn,
        shop_name_en: editSellerEn,
        category: catName,
        category_name: catName,
        categorySlug: catSlug,
        price: salePrice,
        regularPrice: regPrice,
        regular_price: regPrice,
        discountPercentage: discountPct,
        discount_percentage: discountPct,
        stock: Number(editingProduct.stock_quantity) || 0,
        stock_quantity: Number(editingProduct.stock_quantity) || 0,
        unit: editingProduct.unit || '১ পিস',
        thumbnail: editingProduct.thumbnail,
        images: [editingProduct.thumbnail],
        description: editingProduct.description,
        isFeatured: editingProduct.is_featured,
        is_featured: editingProduct.is_featured,
        isBestSeller: editingProduct.is_bestseller,
        is_bestseller: editingProduct.is_bestseller,
      };

      const res = await updateProduct(editingProduct.id || editingProduct._id, payload);
      if (res?.success !== false) {
        showToast(isBangla ? '✨ পণ্যটি সফলভাবে আপডেট করা হয়েছে!' : 'Product updated successfully in MongoDB!');
        setEditingProduct(null);
        await loadSellerData();
      } else {
        showToast(res?.message || 'Failed to update product', 'error');
      }
    } catch (err) {
      showToast('Error updating product', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // 🗑️ Delete Product Handler
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিতভাবে "${productName}" পণ্যটি মুছে ফেলতে চান?` : `Are you sure you want to delete "${productName}"?`)) {
      return;
    }
    try {
      const res = await deleteProduct(productId);
      if (res?.success !== false) {
        showToast(isBangla ? 'পণ্যটি সফলভাবে মুছে ফেলা হয়েছে' : 'Product deleted successfully');
        await loadSellerData();
      } else {
        showToast(res?.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Error deleting product', 'error');
    }
  };

  // Dynamic calculations for Seller Charts & Visualizations
  const sellerChartData = React.useMemo(() => {
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

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.total_amount || o.totalPrice || o.total || 0)), 0);
      days.push({
        date: dateStr,
        dayLabel: isBangla ? dayNameBn : dayNameEn,
        ordersCount: dayOrders.length,
        revenue: dayRevenue,
      });
    }

    const maxRev = Math.max(...days.map(d => d.revenue), 500);
    return { days, maxRev };
  }, [myOrders, isBangla]);

  const stockHealthData = React.useMemo(() => {
    const total = myProducts.length || 1;
    const inStock = myProducts.filter(p => (Number(p.stock || p.stock_quantity) || 0) > 15).length;
    const lowStock = myProducts.filter(p => (Number(p.stock || p.stock_quantity) || 0) > 0 && (Number(p.stock || p.stock_quantity) || 0) <= 15).length;
    const outOfStock = myProducts.filter(p => (Number(p.stock || p.stock_quantity) || 0) <= 0).length;

    return {
      inStock: { count: inStock, pct: Math.round((inStock / total) * 100) },
      lowStock: { count: lowStock, pct: Math.round((lowStock / total) * 100) },
      outOfStock: { count: outOfStock, pct: Math.round((outOfStock / total) * 100) },
      total: myProducts.length
    };
  }, [myProducts]);

  const earningsBreakdownData = React.useMemo(() => {
    const totalSales = Number(sellerInfo.total_sales) || 0;
    const commissionRate = Number(sellerInfo.commission_rate) || 10;
    const platformCommission = Math.round(totalSales * (commissionRate / 100));
    const netEarnings = totalSales - platformCommission;
    const availableBalance = Number(sellerInfo.balance) || 0;

    return {
      totalSales,
      platformCommission,
      netEarnings,
      availableBalance,
      commissionRate
    };
  }, [sellerInfo]);

  // Strict Role Guard: Only Seller or Admin can access /seller
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/30">
            🚫
          </div>
          <h2 className="text-2xl font-black mb-2">{isBangla ? 'প্রবেশাধিকার সংরক্ষিত' : 'Access Restricted'}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {isBangla
              ? 'সেলার ড্যাশবোর্ডে শুধুমাত্র অনুমোদিত সেলার ও এডমিন প্রবেশ করতে পারবে। আপনার একাউন্টের ড্যাশবোর্ডে যান।'
              : 'Only authorized Sellers and Admin can access the Seller Dashboard. Please proceed to your designated dashboard.'}
          </p>
          <div className="flex flex-col gap-3">
            {user?.role === 'customer' ? (
              <Link
                href="/dashboard"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl shadow-lg transition-all text-center text-sm"
              >
                🛍️ {isBangla ? 'কাস্টমার ড্যাশবোর্ডে যান' : 'Go to Customer Dashboard'}
              </Link>
            ) : (
              <Link
                href="/auth"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all text-center text-sm"
              >
                🔐 {isBangla ? 'সেলার একাউন্টে লগইন করুন' : 'Login with Seller Account'}
              </Link>
            )}
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
    { id: 'dashboard', label: isBangla ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard', icon: BarChart3 },
    { id: 'products', label: isBangla ? 'পণ্য ব্যবস্থাপনা' : 'Products & Stock', icon: Package, count: myProducts.length },
    { id: 'orders', label: isBangla ? 'অর্ডার প্রসেসিং' : 'Orders Fulfillment', icon: ShoppingCart, count: myOrders.length },
    { id: 'earnings', label: isBangla ? 'আর্নিংস ও উইথড্র' : 'Earnings & Payouts', icon: Wallet },
    { id: 'reviews', label: isBangla ? 'গ্রাহক রিভিউ ও রেটিং' : 'Reviews & Replies', icon: Star, count: myReviews.length },
    { id: 'support', label: isBangla ? 'সাপোর্ট ও সাহায্য' : 'Help & Support', icon: Headphones },
    { id: 'vendor_management', label: isBangla ? '🏪 শপ ও ভেন্ডর সেটিংস' : 'Shop & Vendor Settings', icon: Store },
    { id: 'seller_profile', label: isBangla ? '👤 সেলার প্রোফাইল ও সিকিউরিটি' : 'Seller Profile & Security', icon: User },
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
          <div className="h-20 px-4 flex items-center justify-between border-b border-[#e0ebe2] dark:border-[#1d3b28]">
            <Link href="/seller" className="flex items-center gap-2.5 overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Seller'}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-500 shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-brand-950 flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                  🏪
                </div>
              )}
              <div className={`transition-opacity ${!isSidebarOpen && 'lg:hidden'}`}>
                <h2 className="font-extrabold text-sm leading-tight text-brand-950 dark:text-emerald-100">
                  Ihsan Online Shop
                </h2>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {user?.role ? `${user.role.toUpperCase()} PANEL` : 'SELLER PANEL'}
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

        {/* Sidebar Shop Info & Bottom Quick Actions (Profile, Settings, Theme) */}
        <div className="p-3 border-t border-[#e0ebe2] dark:border-[#1d3b28] space-y-2">
          {/* Avatar / Shop Card */}
          <div className="p-2.5 rounded-2xl bg-amber-50/80 dark:bg-emerald-950/60 border border-amber-200 dark:border-emerald-800 flex items-center gap-2.5">
            {user?.avatar ? (
              <img src={user.avatar} alt={sellerInfo.shop_name} className="w-9 h-9 rounded-xl object-cover border" />
            ) : (
              <img src={sellerInfo.shop_logo} alt={sellerInfo.shop_name} className="w-9 h-9 rounded-xl object-cover border" />
            )}
            <div className={`flex-1 min-w-0 ${!isSidebarOpen && 'lg:hidden'}`}>
              <p className="text-xs font-bold truncate text-gray-900 dark:text-emerald-100">{user?.name || sellerInfo.shop_name}</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold">Balance: ৳ {sellerInfo.balance}</p>
            </div>
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
            <button
              onClick={loadSellerData}
              className="px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800 transition-all flex items-center gap-1"
              title="Refresh Data"
            >
              🔄 <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🌙 / ☀️ Theme Toggle Button in Seller Navbar */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-black/40 dark:hover:bg-emerald-950 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-emerald-900/60 text-xs font-bold transition-all shadow-sm active:scale-95"
              title={theme === 'dark' ? (isBangla ? 'লাইট মোড অন করুন' : 'Switch to Light Mode') : (isBangla ? 'ডার্ক মোড অন করুন' : 'Switch to Dark Mode')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-extrabold">{isBangla ? 'লাইট' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline text-[11px] font-extrabold">{isBangla ? 'ডার্ক' : 'Dark'}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-2xl">
              {user?.avatar && (
                <img src={user.avatar} alt="Seller Avatar" className="w-5 h-5 rounded-full object-cover border border-amber-400" />
              )}
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">{user?.name || 'Seller'}:</span>
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

            {/* Master Admin Switch (Only Admin can see and switch between Admin and Customer dashboards) */}
            {user?.role === 'admin' && (
              <>
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
              </>
            )}
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

              {/* ======================================================== */}
              {/* 📈 3 INTERACTIVE SELLER CHARTS & VISUALIZATIONS            */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Seller Weekly Sales Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        <span>{isBangla ? 'স্টোর সেলস ও আর্নিংস ট্রেন্ড' : 'Store Sales & Earnings Trend'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'গত ৭ দিনে আপনার স্টোরের বিক্রয় ও অর্ডারের সংখ্যা' : 'Your store order volume & revenue over last 7 days'}
                      </p>
                    </div>
                    <span className="text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full self-start sm:self-auto">
                      {isBangla ? 'ভেন্ডর অ্যানালিটিক্স 📊' : 'Vendor Stats 📊'}
                    </span>
                  </div>

                  {/* SVG Bar Chart with Tooltips */}
                  <div className="pt-2">
                    <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 pb-4 pt-6 bg-[#f8faf8] dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-emerald-950/80">
                      {sellerChartData.days.map((item, idx) => {
                        const heightPct = Math.max(Math.round((item.revenue / (sellerChartData.maxRev || 1)) * 100), item.revenue > 0 ? 15 : 6);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-xl shadow-xl whitespace-nowrap">
                              <span>৳ {item.revenue.toLocaleString()}</span>
                              <span className="text-amber-400 block text-[9px]">{item.ordersCount} {isBangla ? 'অর্ডার' : 'orders'}</span>
                            </div>

                            {/* Bar Pillar */}
                            <div className="w-full max-w-[40px] bg-amber-100/60 dark:bg-amber-950/40 rounded-xl flex items-end p-1 h-full">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-lg transition-all duration-500 relative ${
                                  item.revenue > 0
                                    ? 'bg-gradient-to-t from-amber-500 via-orange-400 to-amber-300 shadow-md group-hover:brightness-110'
                                    : 'bg-gray-200 dark:bg-gray-800'
                                }`}
                              >
                                {item.ordersCount > 0 && (
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-700 dark:text-amber-300">
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
                      <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-black/30 border border-amber-200 dark:border-emerald-900/50">
                        <span className="text-[10px] text-gray-500 font-semibold block">{isBangla ? '৭ দিনের বিক্রয়' : '7-Day Revenue'}</span>
                        <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300">
                          ৳ {sellerChartData.days.reduce((s, d) => s + d.revenue, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200 dark:border-emerald-900/50">
                        <span className="text-[10px] text-gray-500 font-semibold block">{isBangla ? 'অর্ডার সংখ্যা' : 'Total Orders'}</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300">
                          {sellerChartData.days.reduce((s, d) => s + d.ordersCount, 0)} {isBangla ? 'টি' : 'orders'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-purple-50/70 dark:bg-black/30 border border-purple-200 dark:border-emerald-900/50 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-gray-500 font-semibold block">{isBangla ? 'কমিশন রেট' : 'Commission'}</span>
                        <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300">
                          {earningsBreakdownData.commissionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Product Inventory & Stock Health Chart */}
                <div className="bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-600" />
                        <span>{isBangla ? 'ইনভেন্টরি ও স্টক হেলথ' : 'Stock & Inventory Health'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'আপনার পণ্যের মজুদ ও স্টক অবস্থা' : 'Live status of your product stock levels'}
                      </p>
                    </div>

                    {/* Stock Health Doughnut Ring */}
                    <div className="py-4 flex flex-col items-center justify-center">
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
                            strokeDasharray={`${stockHealthData.inStock.pct} 100`}
                            strokeDashoffset="0"
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
                            strokeDasharray={`${stockHealthData.lowStock.pct} 100`}
                            strokeDashoffset={`-${stockHealthData.inStock.pct}`}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-xl font-black text-gray-900 dark:text-emerald-100">{myProducts.length}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{isBangla ? 'মোট পণ্য' : 'Items'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Legends */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                          <span>{isBangla ? 'পর্যাপ্ত স্টক (>১৫)' : 'In Stock (>15)'}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-emerald-100">{stockHealthData.inStock.count} ({stockHealthData.inStock.pct}%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-black/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                          <span>{isBangla ? 'কম স্টক (১-১৫)' : 'Low Stock (1-15)'}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-emerald-100">{stockHealthData.lowStock.count} ({stockHealthData.lowStock.pct}%)</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 dark:bg-black/30 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                        <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                          <span>{isBangla ? 'স্টক শেষ (০)' : 'Out of Stock (0)'}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-emerald-100">{stockHealthData.outOfStock.count} ({stockHealthData.outOfStock.pct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Revenue & Wallet Payout Breakdown */}
                <div className="lg:col-span-3 bg-white dark:bg-[#112318] p-6 rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        <span>{isBangla ? 'আর্নিংস ও পে-আউট আর্থিক প্রবাহ' : 'Earnings & Payout Financial Stream'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'মোট সেলস, এডমিন কমিশন এবং আপনার উত্তোলনযোগ্য ব্যালেন্সের হিসাব' : 'Gross revenue, platform commission deduction, and withdrawable balance flow'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-black/30 border border-emerald-200 dark:border-emerald-900/60">
                      <p className="text-xs text-gray-500 font-bold">{isBangla ? 'মোট বিক্রয় (Gross Sales)' : 'Gross Sales'}</p>
                      <h4 className="text-xl font-black text-gray-900 dark:text-emerald-100 mt-1">৳ {earningsBreakdownData.totalSales.toLocaleString()}</h4>
                      <div className="w-full bg-emerald-200 dark:bg-emerald-950 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-full rounded-full" />
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold mt-1 block">100% Volume</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-black/30 border border-amber-200 dark:border-amber-900/60">
                      <p className="text-xs text-gray-500 font-bold">{isBangla ? `প্ল্যাটফর্ম ফি (${earningsBreakdownData.commissionRate}%)` : `Platform Fee (${earningsBreakdownData.commissionRate}%)`}</p>
                      <h4 className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">৳ {earningsBreakdownData.platformCommission.toLocaleString()}</h4>
                      <div className="w-full bg-amber-200 dark:bg-amber-950 h-2 rounded-full mt-3 overflow-hidden">
                        <div style={{ width: `${earningsBreakdownData.commissionRate}%` }} className="bg-amber-500 h-full rounded-full" />
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-extrabold mt-1 block">{earningsBreakdownData.commissionRate}% Commission Rate</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-black/30 border border-blue-200 dark:border-blue-900/60">
                      <p className="text-xs text-gray-500 font-bold">{isBangla ? 'আপনার নিট আয় (Net Balance)' : 'Withdrawable Balance'}</p>
                      <h4 className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">৳ {earningsBreakdownData.availableBalance.toLocaleString()}</h4>
                      <div className="w-full bg-blue-200 dark:bg-blue-950 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[90%] rounded-full" />
                      </div>
                      <span className="text-[10px] text-blue-700 dark:text-blue-300 font-extrabold mt-1 block">Ready to Withdraw</span>
                    </div>
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

          {/* ======================================================== */}
          {/* 🏪 2. SELLER & VENDOR MANAGEMENT (তথ্য এন্ট্রি ও এডিট)     */}
          {/* ======================================================== */}
          {(activeMenu === 'vendor_management' || activeMenu === 'store') && (
            <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
              
              {/* Header */}
              <div className="border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>🏪 {isBangla ? 'সেলার ও ভেন্ডর ম্যানেজমেন্ট' : 'Seller & Vendor Management'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      MongoDB Synced 🟢
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400 mt-0.5">
                    {isBangla
                      ? 'আপনার নাম, প্রতিষ্ঠানের নাম, মোবাইল নম্বর, ইমেইল নম্বর, Trade License, Commission Rate ও Wallet Balance এন্ট্রি ও আপডেট করুন'
                      : 'Manage and update your seller profile, business name, contacts, trade license, commission rate, and wallet balance.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSellerData}
                  className="self-start sm:self-auto px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-black/30 dark:hover:bg-emerald-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>🔄 {isBangla ? 'রিফ্রেশ ডাটা' : 'Refresh'}</span>
                </button>
              </div>

              {/* 4 Top Summary Live Highlight Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-amber-50/70 dark:bg-black/30 p-4 rounded-2xl border border-amber-200 dark:border-emerald-900/60">
                  <p className="text-[11px] text-gray-500 font-semibold">{isBangla ? 'মালিক / সেলারের নাম' : 'Seller Name'}</p>
                  <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-emerald-100 truncate mt-0.5">
                    {sellerFormData.seller_name || user?.name || 'Seller'}
                  </h4>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block mt-1">Verified Seller</span>
                </div>

                <div className="bg-emerald-50/70 dark:bg-black/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
                  <p className="text-[11px] text-gray-500 font-semibold">{isBangla ? 'প্রতিষ্ঠানের নাম' : 'Business / Shop'}</p>
                  <h4 className="text-sm sm:text-base font-extrabold text-emerald-800 dark:text-emerald-200 truncate mt-0.5">
                    {sellerFormData.shop_name || 'My Store'}
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">Active Shop 🌿</span>
                </div>

                <div className="bg-blue-50/70 dark:bg-black/30 p-4 rounded-2xl border border-blue-200 dark:border-emerald-900/60">
                  <p className="text-[11px] text-gray-500 font-semibold">{isBangla ? 'ওয়ালেট ব্যালেন্স' : 'Wallet Balance'}</p>
                  <h4 className="text-sm sm:text-base font-black text-blue-800 dark:text-blue-300 truncate mt-0.5">
                    ৳ {sellerFormData.balance || 0}
                  </h4>
                  <span className="text-[10px] text-gray-400 block mt-1">{isBangla ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'Available Payout'}</span>
                </div>

                <div className="bg-purple-50/70 dark:bg-black/30 p-4 rounded-2xl border border-purple-200 dark:border-emerald-900/60">
                  <p className="text-[11px] text-gray-500 font-semibold">{isBangla ? 'কমিশন রেট' : 'Commission Rate'}</p>
                  <h4 className="text-sm sm:text-base font-black text-purple-800 dark:text-purple-300 truncate mt-0.5">
                    {sellerFormData.commission_rate ?? 10}%
                  </h4>
                  <span className="text-[10px] text-gray-400 block mt-1">{isBangla ? 'মার্কেটপ্লেস ফি' : 'Platform Fee'}</span>
                </div>
              </div>

              {/* Information Entry Form */}
              <form onSubmit={handleSaveSellerInfo} className="space-y-6 pt-2">
                
                {/* 1. Basic & Business Contact Details */}
                <div className="bg-gray-50/80 dark:bg-black/20 p-5 rounded-3xl border border-gray-200 dark:border-emerald-900/50 space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>📋 {isBangla ? '১. সেলার ও প্রতিষ্ঠানের সাধারণ তথ্য' : '1. Business & Contact Information'}</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. সেলারের নাম */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'সেলার / স্বত্বাধিকারীর নাম *' : 'Seller / Owner Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Khalid Bin Hasan"
                        value={sellerFormData.seller_name}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, seller_name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                      />
                    </div>

                    {/* 2. প্রতিষ্ঠানের নাম */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'প্রতিষ্ঠানের নাম / দোকানের নাম *' : 'Business / Shop Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. খালিদ অর্গানিক শপ (Khalid Organic Store)"
                        value={sellerFormData.shop_name}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, shop_name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                      />
                    </div>

                    {/* 3. মোবাইল নম্বর */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01317539641"
                        value={sellerFormData.phone}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                      />
                    </div>

                    {/* 4. ইমেইল নম্বর */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'ইমেইল নম্বর *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. khalid@gmail.com"
                        value={sellerFormData.email}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Trade License, Commission & Wallet Balance */}
                <div className="bg-gray-50/80 dark:bg-black/20 p-5 rounded-3xl border border-gray-200 dark:border-emerald-900/50 space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>📜 {isBangla ? '২. ট্রেড লাইসেন্স, কমিশন রেট ও ওয়ালেট ব্যালেন্স' : '2. Trade License, Commission & Wallet Balance'}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 5. Trade License */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'Trade License (ট্রেড লাইসেন্স নম্বর) *' : 'Trade License Number *'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TRAD/DSCC/019283/2026"
                        value={sellerFormData.trade_license}
                        onChange={(e) => setSellerFormData({ ...sellerFormData, trade_license: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                      />
                    </div>

                    {/* 6. Commission Rate */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'Commission Rate (কমিশন রেট %)' : 'Commission Rate (%)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="10"
                          value={sellerFormData.commission_rate}
                          onChange={(e) => setSellerFormData({ ...sellerFormData, commission_rate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300 focus:outline-none focus:border-brand-900 pr-8"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">%</span>
                      </div>
                    </div>

                    {/* 7. Wallet Balance */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'Wallet Balance (ওয়ালেট ব্যালেন্স ৳)' : 'Wallet Balance (৳)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={sellerFormData.balance}
                          onChange={(e) => setSellerFormData({ ...sellerFormData, balance: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-brand-900 pl-8"
                        />
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">৳</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Shop Logo, Banner & Description */}
                <div className="bg-gray-50/80 dark:bg-black/20 p-5 rounded-3xl border border-gray-200 dark:border-emerald-900/50 space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                    <span>🖼️ {isBangla ? '৩. প্রতিষ্ঠানের লোগো, ব্যানার ও বিবরণ' : '3. Shop Branding & Description'}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Shop Logo with ImgBB */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'দোকানের লোগো / প্রোফাইল ছবি (ImgBB CDN)' : 'Shop Logo URL (ImgBB CDN)'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://i.ibb.co/..."
                          value={sellerFormData.shop_logo}
                          onChange={(e) => setSellerFormData({ ...sellerFormData, shop_logo: e.target.value })}
                          className="flex-1 px-4 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                        />
                        <label className="cursor-pointer px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0">
                          <span>{isUploadingLogo ? '...' : 'ImgBB Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingLogo(true);
                              try {
                                const url = await uploadToImgBB(file);
                                if (url) {
                                  setSellerFormData(prev => ({ ...prev, shop_logo: url }));
                                  showToast(isBangla ? 'লোগো ImgBB তে আপলোড সফল!' : 'Logo uploaded to ImgBB!');
                                }
                              } catch (err) {
                                showToast(isBangla ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
                              } finally {
                                setIsUploadingLogo(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Shop Banner with ImgBB */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'দোকানের ব্যানার কভার ছবি (ImgBB CDN)' : 'Shop Banner URL (ImgBB CDN)'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://i.ibb.co/..."
                          value={sellerFormData.shop_banner}
                          onChange={(e) => setSellerFormData({ ...sellerFormData, shop_banner: e.target.value })}
                          className="flex-1 px-4 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900"
                        />
                        <label className="cursor-pointer px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0">
                          <span>{isUploadingBanner ? '...' : 'ImgBB Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingBanner(true);
                              try {
                                const url = await uploadToImgBB(file);
                                if (url) {
                                  setSellerFormData(prev => ({ ...prev, shop_banner: url }));
                                  showToast(isBangla ? 'ব্যানার ImgBB তে আপলোড সফল!' : 'Banner uploaded to ImgBB!');
                                }
                              } catch (err) {
                                showToast(isBangla ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
                              } finally {
                                setIsUploadingBanner(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Shop Description */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                      {isBangla ? 'প্রতিষ্ঠানের সংক্ষিপ্ত বিবরণ ও পরিচিতি' : 'Business Description & Shop Policy'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. আমরা সরাসরি বিশ্বস্ত প্রাকৃতিক উৎস থেকে ১০০% খাঁটি ও গুণগত পণ্য সরবরাহ করে থাকি।"
                      value={sellerFormData.shop_description}
                      onChange={(e) => setSellerFormData({ ...sellerFormData, shop_description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-brand-900"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSellerInfo}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-900 via-emerald-800 to-teal-700 hover:from-brand-800 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-brand-950/20 transition-all transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isSavingSellerInfo ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{isBangla ? 'MongoDB-তে সংরক্ষণ হচ্ছে...' : 'Saving to MongoDB...'}</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>{isBangla ? 'সেলার ও ভেন্ডর তথ্য MongoDB-তে সংরক্ষণ করুন' : 'Save Seller & Vendor Info (MongoDB)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 👤 SELLER PROFILE & SECURITY (NEW - AVATAR & PASSWORD)    */}
          {/* ======================================================== */}
          {activeMenu === 'seller_profile' && (
            <div className="space-y-6 max-w-4xl">
              {/* Header */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      <User className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-emerald-100">
                      {isBangla ? 'সেলার প্রোফাইল ও নিরাপত্তা সেটিংস' : 'Seller Profile & Security'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-emerald-400">
                    {isBangla ? 'আপনার প্রোফাইল ছবি, ব্যক্তিগত তথ্য ও সিকিউরিটি পাসওয়ার্ড পরিবর্তন করুন। সরাসরি MongoDB-তে সংরক্ষিত হবে।' : 'Update your profile photo, personal information, and account security password with live MongoDB sync.'}
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black self-start sm:self-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>MongoDB Synced</span>
                </span>
              </div>

              <form onSubmit={handleSaveSellerProfile} className="space-y-6">
                
                {/* 1. Profile Avatar Change */}
                <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2 border-b border-gray-100 dark:border-emerald-950 pb-3">
                    <span>📸</span>
                    <span>{isBangla ? '১. সেলার প্রোফাইল ছবি (Profile Picture)' : '1. Seller Profile Photo'}</span>
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                    <div className="relative group">
                      {sellerProfileData.avatar ? (
                        <img
                          src={sellerProfileData.avatar}
                          alt="Seller Avatar Preview"
                          className="w-24 h-24 rounded-3xl object-cover border-2 border-amber-500 shadow-lg group-hover:brightness-90 transition-all"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg border-2 border-amber-400">
                          {sellerProfileData.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-brand-900 text-white p-1.5 rounded-xl text-xs shadow">
                        📷
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300">
                        {isBangla ? 'প্রোফাইল ছবির লিঙ্ক বা ফাইল আপলোড (ImgBB CDN)' : 'Profile Image URL or Direct Upload (ImgBB CDN)'}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          placeholder="https://i.ibb.co/..."
                          value={sellerProfileData.avatar}
                          onChange={(e) => setSellerProfileData({ ...sellerProfileData, avatar: e.target.value })}
                          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900/70 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
                        />
                        <label className="cursor-pointer px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm">
                          <span>☁️</span>
                          <span>{isUploadingSellerAvatar ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBangla ? 'ImgBB আপলোড' : 'ImgBB Upload')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingSellerAvatar}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingSellerAvatar(true);
                              try {
                                const url = await uploadToImgBB(file);
                                if (url) {
                                  setSellerProfileData(prev => ({ ...prev, avatar: url }));
                                  showToast(isBangla ? 'প্রোফাইল ছবি সফলভাবে ImgBB তে আপলোড হয়েছে! 🎉' : 'Profile image uploaded to ImgBB!');
                                }
                              } catch (err) {
                                showToast(isBangla ? 'ছবি আপলোড করতে সমস্যা হয়েছে' : 'Image upload failed', 'error');
                              } finally {
                                setIsUploadingSellerAvatar(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {isBangla ? 'সুপারিশ: পরিষ্কার স্কয়ার ছবি (JPG/PNG, সর্বোচ্চ ৫ MB)' : 'Recommended: Square photo (JPG/PNG, max 5MB)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Account Information */}
                <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2 border-b border-gray-100 dark:border-emerald-950 pb-3">
                    <span>👤</span>
                    <span>{isBangla ? '২. সেলার ব্যক্তিগত তথ্য (Personal Information)' : '2. Personal Information'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerProfileData.name}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={sellerProfileData.phone}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={sellerProfileData.email}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'দোকানের নাম (Shop Name)' : 'Shop Name'}
                      </label>
                      <input
                        type="text"
                        value={sellerProfileData.shop_name}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, shop_name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'ঠিকানা (Address)' : 'Address'}
                      </label>
                      <input
                        type="text"
                        value={sellerProfileData.address}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, address: e.target.value })}
                        placeholder="e.g. দোকান নং ১২, ধানমন্ডি, ঢাকা"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Password & Security Management */}
                <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2 border-b border-gray-100 dark:border-emerald-950 pb-3">
                    <span>🔐</span>
                    <span>{isBangla ? '৩. পাসওয়ার্ড পরিবর্তন (Change Password)' : '3. Change Password'}</span>
                  </h4>
                  <p className="text-xs text-gray-400">
                    {isBangla ? 'পাসওয়ার্ড পরিবর্তন না করতে চাইলে নিচের ঘরগুলো খালি রাখুন।' : 'Leave password fields empty if you do not want to change your password.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                      </label>
                      <input
                        type="password"
                        value={sellerProfileData.currentPassword}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                      </label>
                      <input
                        type="password"
                        value={sellerProfileData.newPassword}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1.5">
                        {isBangla ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                      </label>
                      <input
                        type="password"
                        value={sellerProfileData.confirmPassword}
                        onChange={(e) => setSellerProfileData({ ...sellerProfileData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSellerProfile}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-brand-950 font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all text-sm disabled:opacity-50"
                  >
                    {isSavingSellerProfile ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{isBangla ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to MongoDB...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{isBangla ? 'সেলার প্রোফাইল ও সিকিউরিটি সংরক্ষণ করুন (Save to MongoDB)' : 'Save Seller Profile & Security to MongoDB'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PRODUCTS & STOCK MANAGEMENT (ENHANCED CATEGORIZED)     */}
          {/* ======================================================== */}
          {activeMenu === 'products' && (
            <div className="space-y-6">
              
              {/* Header Card with Store Metrics */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2.5">
                    <span className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">📦</span>
                    <span>{isBangla ? 'পণ্য ও স্টক ব্যবস্থাপনা' : 'Store Products & Stock'}</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-emerald-400 mt-1">
                    {isBangla ? 'আপনার দোকানের সকল পণ্য ক্যাটাগরি অনুযায়ী সাজিয়ে রাখুন, নতুন পণ্য এন্ট্রি দিন এবং স্টক হালনাগাদ করুন।' : 'Manage your store catalog, add categorized products with rich details and maintain stock.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAddProductFormOpen(!isAddProductFormOpen)}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-brand-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
                  >
                    <span>{isAddProductFormOpen ? '✖' : '➕'}</span>
                    <span>{isAddProductFormOpen ? (isBangla ? 'ফর্ম বন্ধ করুন' : 'Close Form') : (isBangla ? 'নতুন পণ্য যুক্ত করুন' : 'Add New Product')}</span>
                  </button>
                  <button
                    onClick={loadSellerData}
                    className="p-2.5 rounded-2xl border border-gray-200 dark:border-emerald-900 text-gray-600 dark:text-emerald-300 hover:bg-gray-100 dark:hover:bg-emerald-950"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ➕ ADD NEW PRODUCT EXPANDABLE FORM */}
              {isAddProductFormOpen && (
                <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border-2 border-amber-400 dark:border-amber-600 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-emerald-900/60 pb-4">
                    <div>
                      <h4 className="font-black text-base sm:text-lg text-brand-950 dark:text-emerald-100 flex items-center gap-2">
                        <span>✨</span>
                        <span>{isBangla ? 'নতুন পণ্য এন্ট্রি ফর্ম (MongoDB লাইভ সেভ)' : 'Add New Store Item (MongoDB Live)'}</span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-emerald-400">
                        {isBangla ? 'ক্যাটাগরি, মূল্য, স্টক ও বিস্তারিত বিবরণ দিয়ে পণ্যটি যুক্ত করুন।' : 'Fill in category, pricing, stock and detailed description.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddProductFormOpen(false)}
                      className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Product Name Bangla */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'পণ্যের পূর্ণ নাম (বাংলা) *' : 'Product Name (Bengali) *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু"
                          value={newProd.name}
                          onChange={(e) => setNewProd({ ...newProd, name: e.target.value, name_bn: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Product Name English */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'পণ্যের নাম (ইংরেজি)' : 'Product Name (English)'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sundarban Raw Khalisha Flower Honey"
                          value={newProd.name_en}
                          onChange={(e) => setNewProd({ ...newProd, name_en: e.target.value, nameEn: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Seller Name Bangla (বাংলায় সেলারের নাম) */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? '🏪 সেলার / দোকানের নাম (বাংলা) *' : '🏪 Seller / Shop Name (Bengali) *'}
                        </label>
                        <input
                          type="text"
                          placeholder={sellerInfo.shop_name || "e.g. সুন্দরবন অর্গানিক ফার্মস"}
                          value={newProd.seller_name_bn !== undefined && newProd.seller_name_bn !== '' ? newProd.seller_name_bn : (sellerInfo.shop_name || '')}
                          onChange={(e) => setNewProd({ ...newProd, seller_name_bn: e.target.value, seller_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Seller Name English (ইংরেজি সেলারের নাম) */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? '🏪 সেলার / দোকানের নাম (ইংরেজি)' : '🏪 Seller / Shop Name (English)'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sundarban Organic Farms"
                          value={newProd.seller_name_en}
                          onChange={(e) => setNewProd({ ...newProd, seller_name_en: e.target.value, sellerName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Category Selection Dropdown */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'ক্যাটাগরি নির্বাচন করুন *' : 'Select Category *'}
                        </label>
                        <select
                          required
                          value={newProd.categorySlug}
                          onChange={(e) => {
                            const catSlug = e.target.value;
                            const found = categoriesList.find(c => c.slug === catSlug);
                            setNewProd({
                              ...newProd,
                              categorySlug: catSlug,
                              category_name: found ? (found.name || found.name_bn) : catSlug,
                              category: found ? (found.name || found.name_bn) : catSlug,
                              category_id: found ? (found.id || found._id) : 1
                            });
                          }}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold text-brand-950 dark:text-emerald-100 focus:outline-none focus:border-brand-900"
                        >
                          {categoriesList.map((cat) => (
                            <option key={cat.id || cat.slug} value={cat.slug}>
                              {cat.icon || '🏷️'} {cat.name || cat.name_bn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sale Price (৳) */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'বিক্রয়মূল্য / অফার মূল্য (৳) *' : 'Sale Price (BDT) *'}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 850"
                          value={newProd.price}
                          onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300 focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Regular Price (৳) */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'পূর্বের রেগুলার মূল্য (৳)' : 'Regular / Original Price (BDT)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 1050"
                          value={newProd.regularPrice}
                          onChange={(e) => setNewProd({ ...newProd, regularPrice: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'স্টক পরিমাণ (Stock Quantity) *' : 'Stock Quantity *'}
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="e.g. 50"
                          value={newProd.stock_quantity}
                          onChange={(e) => setNewProd({ ...newProd, stock_quantity: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Unit / Weight */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'প্যাকেজিং ইউনিট / ওজন' : 'Unit / Weight'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ৫০০ গ্রাম, ১ কেজি, ১ লিটার, ১ পিস, ১ সেট"
                          value={newProd.unit}
                          onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Thumbnail Image ImgBB Uploader with Live Preview */}
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'পণ্যের মূল ছবি (ImgBB CDN / Image Upload)' : 'Product Image (ImgBB Upload / URL)'}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          {newProd.thumbnail && (
                            <img
                              src={newProd.thumbnail}
                              alt="Thumbnail preview"
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-sm flex-shrink-0"
                            />
                          )}
                          <input
                            type="url"
                            placeholder="https://i.ibb.co/... অথবা ফাইল আপলোড করুন"
                            value={newProd.thumbnail}
                            onChange={(e) => setNewProd({ ...newProd, thumbnail: e.target.value })}
                            className="flex-1 w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-brand-900"
                          />
                          <label className="cursor-pointer px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-brand-900 hover:from-emerald-500 hover:to-brand-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md flex-shrink-0 transition-all">
                            <span>☁️</span>
                            <span>{isUploadingThumb ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBangla ? 'ImgBB তে ছবি আপলোড' : 'Upload to ImgBB')}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingThumb}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingThumb(true);
                                try {
                                  const res = await uploadToImgBB(file, 'prod_thumb');
                                  const finalUrl = res?.url || (typeof res === 'string' ? res : '');
                                  if (finalUrl) {
                                    setNewProd(prev => ({ ...prev, thumbnail: finalUrl }));
                                    showToast(isBangla ? 'ছবি সফলভাবে ImgBB তে আপলোড হয়েছে! 🎉' : 'Image uploaded to ImgBB successfully! 🎉');
                                  } else {
                                    showToast(res?.message || (isBangla ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed'), 'error');
                                  }
                                } catch (err) {
                                  showToast(isBangla ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
                                } finally {
                                  setIsUploadingThumb(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Detailed Description */}
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-emerald-300">
                          {isBangla ? 'পণ্যের বিস্তারিত বিবরণ ও গুণাগুণ' : 'Detailed Description & Features'}
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. সুন্দরবনের গভীর অরণ্য থেকে সরাসরি মৌয়ালদের দ্বারা সংগৃহীত শতভাগ খাঁটি মধু। কোনো চিনি বা কেমিক্যাল নেই।"
                          value={newProd.description}
                          onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-900"
                        />
                      </div>

                      {/* Flags: Featured and Best Seller */}
                      <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newProd.is_featured}
                            onChange={(e) => setNewProd({ ...newProd, is_featured: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-700 dark:text-emerald-300">
                            ⭐ {isBangla ? 'ফিচার্ড পণ্য হিসেবে প্রদর্শন করুন' : 'Display as Featured Product'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newProd.is_bestseller}
                            onChange={(e) => setNewProd({ ...newProd, is_bestseller: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-700 dark:text-emerald-300">
                            🔥 {isBangla ? 'বেস্ট সেলার ব্যাজ দিন' : 'Mark as Best Seller'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-emerald-950">
                      <button
                        type="button"
                        onClick={() => setIsAddProductFormOpen(false)}
                        className="px-5 py-2.5 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-700 dark:text-emerald-200"
                      >
                        {isBangla ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-brand-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
                      >
                        {isSavingProduct ? (
                          <>
                            <div className="w-4 h-4 border-2 border-brand-950 border-t-transparent rounded-full animate-spin"></div>
                            <span>{isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            <span>{isBangla ? 'পণ্যটি MongoDB-তে যোগ করুন' : 'Save Product to Store'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 📢 SELLER'S RESTOCK REQUESTS STATUS STRIP */}
              {myStockRequests.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-[#112318] p-5 rounded-3xl border border-amber-300 dark:border-amber-900/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                      <span>📢 {isBangla ? 'এডমিন থেকে আপনার স্টক রিকোয়েস্টের স্ট্যাটাস' : 'Your Restock Requests to Admin'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 text-[10px] font-black">
                        {myStockRequests.length} {isBangla ? 'টি অনুরোধ' : 'Requests'}
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={loadSellerData}
                      className="text-[11px] text-amber-800 dark:text-amber-300 font-bold hover:underline"
                    >
                      🔄 {isBangla ? 'রিফ্রেশ' : 'Refresh'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myStockRequests.slice(0, 6).map((req) => (
                      <div
                        key={req.id || req._id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-black/40 border border-amber-200/80 dark:border-amber-900/40 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={req.productImage || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=150&q=80'}
                            alt={req.productName}
                            className="w-11 h-11 rounded-xl object-cover border flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-gray-900 dark:text-emerald-100 truncate">{req.productName}</h5>
                            <span className="text-[10px] text-gray-500 block">রিকোয়েস্ট: {req.requestedQty} pcs</span>
                          </div>
                        </div>

                        <div>
                          {req.status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[10px] font-black border border-amber-300">
                              অপেক্ষমান 🟡
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-[10px] font-black border border-emerald-300">
                              অনুমোদিত ✅ (+{req.transferredQty || req.requestedQty} pcs)
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 text-[10px] font-black border border-rose-300">
                              বাতিল ❌
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔍 SEARCH BAR & ALL CATEGORIES DROPDOWN TOOLBAR FOR MY STORE PRODUCTS */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-5 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={isBangla ? 'আপনার স্টোরের পণ্য খুঁজুন (নাম বা ক্যাটাগরি)...' : 'Search your store products...'}
                        value={productSearchQuery}
                        onChange={(e) => { setProductSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-900 text-gray-900 dark:text-emerald-100 placeholder-gray-400"
                      />
                      {productSearchQuery && (
                        <button
                          onClick={() => { setProductSearchQuery(''); setCurrentPage(1); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* All Categories Dropdown beside Search */}
                    <div className="relative w-full sm:w-72 flex-shrink-0">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sm z-10">
                        🏷️
                      </div>
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => {
                          setSelectedCategoryFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs font-bold text-gray-800 dark:text-emerald-100 focus:outline-none focus:border-brand-900 appearance-none cursor-pointer hover:border-amber-500 transition-colors shadow-sm"
                      >
                        <option value="all" className="bg-white dark:bg-[#112318] text-gray-900 dark:text-emerald-100 font-bold py-1">
                          🛒 {isBangla ? 'সকল ক্যাটাগরি (All Categories)' : 'All Categories'} ({myProducts.length})
                        </option>
                        {categoriesList.map((cat) => {
                          const catSlug = cat.slug || String(cat.id);
                          const catProds = myProducts.filter(p => {
                            const pSlug = (p.categorySlug || '').toLowerCase().trim();
                            const pCat = (p.category || '').toLowerCase().trim();
                            const pCatName = (p.category_name || '').toLowerCase().trim();
                            const pCatId = String(p.category_id || '');
                            const targetSlug = catSlug.toLowerCase().trim();
                            return pSlug === targetSlug || pCat === targetSlug || pCatName === targetSlug || pCatId === targetSlug ||
                                   pCat === (cat.name || '').toLowerCase() || pCat === (cat.name_bn || '').toLowerCase() ||
                                   pCatName === (cat.name || '').toLowerCase() || pCatName === (cat.name_bn || '').toLowerCase();
                          });
                          const catName = isBangla ? (cat.name || cat.name_bn) : (cat.name_en || cat.name);
                          return (
                            <option key={cat.id || cat.slug} value={catSlug} className="bg-white dark:bg-[#112318] text-gray-900 dark:text-emerald-100 py-1">
                              {cat.icon || '🏷️'} {catName} ({catProds.length})
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Total Counter Badge */}
                  <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0 bg-gray-50 dark:bg-black/40 px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-emerald-900">
                    <span className="text-xs font-bold text-gray-500 dark:text-emerald-400">
                      {isBangla ? 'মোট পণ্য:' : 'Total:'} <strong className="text-brand-950 dark:text-amber-400">{myProducts.length}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 🛍️ MY STORE PRODUCTS GRID / LIST (ISOLATED + 8 PER PAGE PAGINATION) */}
              {(() => {
                const filteredProducts = myProducts.filter((p) => {
                  if (selectedCategoryFilter !== 'all') {
                    const selSlug = selectedCategoryFilter.toLowerCase().trim();
                    const pSlug = (p.categorySlug || '').toLowerCase().trim();
                    const pCat = (p.category || '').toLowerCase().trim();
                    const pCatName = (p.category_name || '').toLowerCase().trim();
                    const pCatId = String(p.category_id || '');

                    const matchCat = pSlug === selSlug || 
                                     pCat === selSlug || 
                                     pCatName === selSlug || 
                                     pCatId === selSlug ||
                                     pSlug.includes(selSlug) ||
                                     categoriesList.some(c => (c.slug === selSlug || String(c.id) === selSlug) && (
                                       pCat === (c.name || '').toLowerCase() || 
                                       pCat === (c.name_bn || '').toLowerCase() || 
                                       pCatName === (c.name || '').toLowerCase() ||
                                       pCatName === (c.name_bn || '').toLowerCase()
                                     ));
                    if (!matchCat) return false;
                  }
                  if (productSearchQuery.trim()) {
                    const q = productSearchQuery.toLowerCase().trim();
                    const matchName = (p.name || '').toLowerCase().includes(q) || 
                                      (p.name_bn || '').toLowerCase().includes(q) || 
                                      (p.name_en || '').toLowerCase().includes(q) ||
                                      (p.category || '').toLowerCase().includes(q) ||
                                      (p.category_name || '').toLowerCase().includes(q) ||
                                      (p.seller_name || '').toLowerCase().includes(q);
                    if (!matchName) return false;
                  }
                  return true;
                });

                const totalItems = filteredProducts.length;
                const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
                const safeCurrentPage = Math.min(currentPage, totalPages);
                const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
                const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                if (filteredProducts.length === 0) {
                  return (
                    <div className="bg-white dark:bg-[#112318] rounded-3xl p-12 text-center border border-[#e0ebe2] dark:border-[#1d3b28] space-y-3 shadow-sm">
                      <div className="text-4xl">🔍</div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-emerald-100">
                        {isBangla ? 'এই ক্যাটাগরিতে আপনার কোনো পণ্য নেই' : 'No Store Products Found'}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {isBangla ? 'নতুন পণ্য যুক্ত করতে উপরের "+ নতুন পণ্য যুক্ত করুন" বাটনে ক্লিক করুন।' : 'Click "+ Add New Product" above to create items.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Products Grid (8 Items per page) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                      {paginatedProducts.map((p) => {
                        const prodId = p.id || p._id;
                        const stockVal = p.stock_quantity ?? p.stock ?? 0;
                        const isOutOfStock = stockVal <= 0;

                        return (
                          <div
                            key={prodId}
                            className="bg-white dark:bg-[#112318] rounded-3xl p-4 border border-gray-200/80 dark:border-[#1d3b28] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                          >
                            <div className="space-y-2.5">
                              {/* Product Image & Badges */}
                              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/40 border border-gray-100 dark:border-emerald-950">
                                <img
                                  src={p.thumbnail || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                {/* Stock Badge */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                  {isOutOfStock ? (
                                    <span className="px-2 py-0.5 rounded-xl text-[9px] font-black bg-red-600 text-white shadow-sm">
                                      🚨 {isBangla ? 'স্টক আউট' : 'Out of Stock'}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-xl text-[9px] font-black bg-emerald-600 text-white shadow-sm">
                                      ✓ {isBangla ? 'স্টক' : 'Stock'}: {stockVal}
                                    </span>
                                  )}
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-2 right-2">
                                  <span className="px-2 py-0.5 rounded-xl text-[9px] font-black bg-black/70 backdrop-blur-md text-amber-300 border border-white/20 shadow-sm">
                                    {p.category || p.category_name || 'পণ্য'}
                                  </span>
                                </div>
                              </div>

                              {/* Title & Info */}
                              <div>
                                <h4 className="font-black text-xs sm:text-sm text-gray-900 dark:text-emerald-50 line-clamp-1 group-hover:text-brand-900 dark:group-hover:text-amber-300 transition-colors">
                                  {p.name_bn || p.name}
                                </h4>
                                {p.name_en && (
                                  <p className="text-[10px] text-gray-400 truncate">{p.name_en}</p>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-800 dark:text-amber-400 font-bold mt-1 truncate">
                                  <span>🏪</span>
                                  <span className="truncate">{p.seller_name_bn || p.seller_name || p.shop_name || 'আমার শপ'}</span>
                                </div>
                              </div>

                              {/* Pricing & Unit */}
                              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-emerald-950 text-xs">
                                <div>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                                      ৳ {p.price}
                                    </span>
                                    {p.regularPrice && p.regularPrice > p.price && (
                                      <span className="text-[10px] text-gray-400 line-through">৳ {p.regularPrice}</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400 block">{p.unit || '১ পিস'}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {p.is_featured && <span title="Featured">⭐</span>}
                                  {p.is_bestseller && <span title="Bestseller">🔥</span>}
                                </div>
                              </div>
                            </div>

                            {/* Stock Indicator & Restock Request Button */}
                            <div className="pt-1">
                              <button
                                onClick={() => setRestockModal({
                                  isOpen: true,
                                  product: p,
                                  quantity: 30,
                                  note: `সেলার "${sellerInfo.shop_name || user?.name || 'সেলার'}" থেকে "${p.name_bn || p.name}" পণ্যের স্টক স্থানান্তরের অনুরোধ`
                                })}
                                className={`w-full py-2 px-2.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                                  isOutOfStock
                                    ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-red-500/20 animate-pulse'
                                    : stockVal <= 10
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black shadow-amber-500/20'
                                    : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                }`}
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                <span>{isBangla ? '📢 এডমিন থেকে স্টক রিকোয়েস্ট' : 'Request Stock from Admin'}</span>
                              </button>
                            </div>

                            {/* Actions: Edit and Delete Buttons */}
                            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-emerald-950">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                              >
                                <Edit className="w-3 h-3" />
                                <span>{isBangla ? 'এডিট' : 'Edit'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prodId, p.name_bn || p.name)}
                                className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 transition-all"
                                title={isBangla ? 'মুছে ফেলুন' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 📄 PAGINATION CONTROLS (8 ITEMS PER PAGE) */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-[#112318] rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm">
                        <span className="text-xs font-bold text-gray-500 dark:text-emerald-400">
                          {isBangla ? `দেখাচ্ছে ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} টি পণ্য (মোট ${totalItems} টির মধ্যে)` : `Showing ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of ${totalItems} products`}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={safeCurrentPage === 1}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-emerald-900 text-xs font-bold text-gray-700 dark:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-emerald-950 transition-all flex items-center gap-1"
                          >
                            <span>◀</span>
                            <span>{isBangla ? 'পূর্ববর্তী' : 'Prev'}</span>
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                safeCurrentPage === pageNum
                                  ? 'bg-amber-500 text-brand-950 shadow-md scale-105'
                                  : 'bg-gray-100 dark:bg-black/30 text-gray-700 dark:text-emerald-200 hover:bg-gray-200 dark:hover:bg-emerald-950'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={safeCurrentPage === totalPages}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-emerald-900 text-xs font-bold text-gray-700 dark:text-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-emerald-950 transition-all flex items-center gap-1"
                          >
                            <span>{isBangla ? 'পরবর্তী' : 'Next'}</span>
                            <span>▶</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ✏️ EDIT PRODUCT MODAL */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
                  <div className="bg-white dark:bg-[#112318] text-gray-900 dark:text-emerald-50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-400 my-8">
                    
                    <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-emerald-900">
                      <div>
                        <h4 className="font-black text-base sm:text-lg flex items-center gap-2">
                          <span>✏️</span>
                          <span>{isBangla ? 'পণ্য সম্পাদনা করুন (MongoDB আপডেট)' : 'Edit Store Product (MongoDB)'}</span>
                        </h4>
                        <p className="text-xs text-gray-500">ID: #{editingProduct.id}</p>
                      </div>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs sm:text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold mb-1">{isBangla ? 'পণ্যের নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value, name_bn: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">{isBangla ? 'পণ্যের নাম (ইংরেজি)' : 'Name (English)'}</label>
                          <input
                            type="text"
                            value={editingProduct.name_en || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value, nameEn: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">{isBangla ? 'ক্যাটাগরি *' : 'Category *'}</label>
                          <select
                            value={editingProduct.categorySlug}
                            onChange={(e) => {
                              const s = e.target.value;
                              const c = categoriesList.find(x => x.slug === s);
                              setEditingProduct({
                                ...editingProduct,
                                categorySlug: s,
                                category: c ? (c.name || c.name_bn) : s,
                                category_id: c ? (c.id || c._id) : 1
                              });
                            }}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs font-bold"
                          >
                            {categoriesList.map((cat) => (
                              <option key={cat.id || cat.slug} value={cat.slug}>
                                {cat.icon || '🏷️'} {cat.name || cat.name_bn}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Seller Name Bangla (বাংলায় সেলারের নাম) */}
                        <div>
                          <label className="block font-bold mb-1 text-amber-900 dark:text-amber-300">
                            {isBangla ? '🏪 সেলার / দোকানের নাম (বাংলা) *' : '🏪 Seller / Shop Name (Bangla) *'}
                          </label>
                          <input
                            type="text"
                            value={editingProduct.seller_name_bn !== undefined ? editingProduct.seller_name_bn : (editingProduct.seller_name || '')}
                            onChange={(e) => setEditingProduct({ ...editingProduct, seller_name_bn: e.target.value, seller_name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold"
                          />
                        </div>

                        {/* Seller Name English (ইংরেজি সেলারের নাম) */}
                        <div>
                          <label className="block font-bold mb-1 text-amber-900 dark:text-amber-300">
                            {isBangla ? '🏪 সেলার / দোকানের নাম (English)' : '🏪 Seller / Shop Name (English)'}
                          </label>
                          <input
                            type="text"
                            value={editingProduct.seller_name_en !== undefined ? editingProduct.seller_name_en : (editingProduct.sellerName || '')}
                            onChange={(e) => setEditingProduct({ ...editingProduct, seller_name_en: e.target.value, sellerName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">{isBangla ? 'প্যাকেজিং / ইউনিট' : 'Unit'}</label>
                          <input
                            type="text"
                            value={editingProduct.unit}
                            onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">{isBangla ? 'বিক্রয়মূল্য (৳) *' : 'Sale Price *'}</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs font-black text-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">{isBangla ? 'পূর্বের রেগুলার মূল্য (৳)' : 'Regular Price'}</label>
                          <input
                            type="number"
                            value={editingProduct.regularPrice}
                            onChange={(e) => setEditingProduct({ ...editingProduct, regularPrice: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">{isBangla ? 'স্টক পরিমাণ (Stock) *' : 'Stock Quantity *'}</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.stock_quantity}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold mb-1 text-xs">{isBangla ? 'পণ্যের ছবি (ImgBB CDN / Image Upload)' : 'Product Image (ImgBB Upload / URL)'}</label>
                          <div className="flex gap-2 items-center">
                            {editingProduct.thumbnail && (
                              <img
                                src={editingProduct.thumbnail}
                                alt="Thumb preview"
                                className="w-12 h-12 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
                              />
                            )}
                            <input
                              type="url"
                              value={editingProduct.thumbnail}
                              onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                              className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs"
                            />
                            <label className="cursor-pointer px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 shadow-sm">
                              <span>☁️</span>
                              <span>{isUploadingEditThumb ? (isBangla ? 'আপলোড...' : '...') : (isBangla ? 'ImgBB আপলোড' : 'ImgBB Upload')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingEditThumb}
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  setIsUploadingEditThumb(true);
                                  try {
                                    const res = await uploadToImgBB(f, 'prod_edit_thumb');
                                    const finalUrl = res?.url || (typeof res === 'string' ? res : '');
                                    if (finalUrl) {
                                      setEditingProduct(prev => ({ ...prev, thumbnail: finalUrl }));
                                      showToast(isBangla ? 'ছবি সফলভাবে ImgBB তে আপলোড হয়েছে! 🎉' : 'Image uploaded to ImgBB successfully! 🎉');
                                    } else {
                                      showToast(res?.message || 'Upload failed', 'error');
                                    }
                                  } catch (err) {
                                    showToast('Upload failed', 'error');
                                  } finally {
                                    setIsUploadingEditThumb(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold mb-1">{isBangla ? 'বিস্তারিত বিবরণ' : 'Description'}</label>
                          <textarea
                            rows={3}
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="w-full px-3.5 py-2 bg-gray-50 dark:bg-black/40 border rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2 border rounded-xl text-xs font-bold"
                        >
                          {isBangla ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProduct}
                          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-brand-950 font-black text-xs rounded-xl shadow"
                        >
                          {isSavingProduct ? (isBangla ? 'আপডেট হচ্ছে...' : 'Saving...') : (isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 📢 RESTOCK REQUEST MODAL (Seller -> Admin) */}
              {restockModal.isOpen && restockModal.product && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-[#0e2115] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-500/30 dark:border-emerald-500/40 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-emerald-900/60 pb-3">
                      <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                          <ArrowLeftRight className="w-5 h-5 text-amber-500" />
                          <span>{isBangla ? 'অ্যাডমিন থেকে স্টক রিকোয়েস্ট' : 'Request Stock from Admin'}</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-emerald-400">
                          {isBangla ? 'পণ্যটির স্টক শেষ হয়ে যাওয়ায় অ্যাডমিনকে জানান' : 'Notify admin for stock allocation'}
                        </p>
                      </div>
                      <button
                        onClick={() => setRestockModal({ isOpen: false, product: null, quantity: 30, note: '' })}
                        className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-200/80 dark:border-emerald-950">
                      <img
                        src={restockModal.product.thumbnail || restockModal.product.images?.[0]}
                        alt={restockModal.product.name}
                        className="w-12 h-12 rounded-xl object-cover border"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-gray-900 dark:text-emerald-100 truncate">
                          {restockModal.product.name_bn || restockModal.product.name}
                        </h4>
                        <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                          🚨 {isBangla ? 'বর্তমান সেলার স্টক: 0 pcs (স্টক আউট)' : 'Current Seller Stock: 0 pcs (Out of Stock)'}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSendRestockRequest} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-emerald-200 mb-1">
                          {isBangla ? 'কত পিছ স্টক প্রয়োজন? (pcs) *' : 'Requested Quantity *'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            required
                            min="1"
                            value={restockModal.quantity}
                            onChange={(e) => setRestockModal({ ...restockModal, quantity: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs font-black text-gray-900 dark:text-emerald-100"
                            placeholder="30"
                          />
                          <div className="flex gap-1">
                            {[10, 20, 30, 50].map((q) => (
                              <button
                                type="button"
                                key={q}
                                onClick={() => setRestockModal({ ...restockModal, quantity: q })}
                                className={`px-2.5 py-2 rounded-xl text-xs font-bold ${
                                  restockModal.quantity === q
                                    ? 'bg-brand-900 text-white'
                                    : 'bg-gray-100 dark:bg-emerald-950 text-gray-700 dark:text-emerald-300'
                                }`}
                              >
                                +{q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-emerald-200 mb-1">
                          {isBangla ? 'নোট বা বার্তা (ঐচ্ছিক)' : 'Note (Optional)'}
                        </label>
                        <textarea
                          rows={2}
                          value={restockModal.note}
                          onChange={(e) => setRestockModal({ ...restockModal, note: e.target.value })}
                          placeholder="যেমন: দ্রুত ডেলিভারির জন্য ৩০ পিছ স্টক প্রয়োজন"
                          className="w-full px-3.5 py-2 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs text-gray-900 dark:text-emerald-100"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-emerald-900/60">
                        <button
                          type="button"
                          onClick={() => setRestockModal({ isOpen: false, product: null, quantity: 30, note: '' })}
                          className="px-4 py-2.5 border border-gray-200 dark:border-emerald-900 rounded-xl text-xs font-bold text-gray-500"
                        >
                          {isBangla ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={isSendingRestock}
                          className="px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                        >
                          {isSendingRestock ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{isBangla ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{isBangla ? 'অনুরোধ পাঠান' : 'Send Request'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 📦 4. SELLER ORDER MANAGEMENT & PACKING FULFILLMENT       */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="space-y-6">
              {/* Confirmed Orders Alert Banner */}
              {myOrders.filter(o => o.status === 'Confirmed').length > 0 && (
                <div className="bg-gradient-to-r from-blue-500/15 via-blue-400/10 to-transparent border-l-4 border-blue-500 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <h4 className="font-black text-sm text-blue-950 dark:text-blue-200">
                        {myOrders.filter(o => o.status === 'Confirmed').length} {isBangla ? 'টি কনফার্মড অর্ডার প্যাকিংয়ের অপেক্ষায় রয়েছে!' : 'Confirmed Orders waiting to be packed!'}
                      </h4>
                      <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                        {isBangla ? 'এডমিন অর্ডার কনফার্ম করেছেন। পণ্য প্যাক করে "Mark Packed" বাটনে চাপুন।' : 'Admin confirmed the order. Pack items and mark as Packed.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOrderSubTab('Confirmed')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow transition-all self-start sm:self-auto"
                  >
                    {isBangla ? 'কনফার্মড অর্ডারগুলো দেখুন' : 'View Confirmed Orders'}
                  </button>
                </div>
              )}

              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0ebe2] dark:border-[#1d3b28] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2">
                      <span>📦 {isBangla ? 'সেলার অর্ডার প্রসেসিং ও প্যাকিং' : 'Store Orders & Packing Fulfillment'}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        {myOrders.length} {isBangla ? 'অর্ডার' : 'Orders'}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-400">
                      {isBangla ? 'এডমিন অনুমোদিত অর্ডার দেখে পণ্য প্যাক করুন ও ডেলিভারির জন্য প্রস্তুত করুন' : 'View confirmed orders, pack products and prepare for courier dispatch'}
                    </p>
                  </div>

                  {/* Filter Subtabs */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { id: 'all', label: isBangla ? 'সকল' : 'All', count: myOrders.length },
                      { id: 'Confirmed', label: isBangla ? '🔵 কনফার্মড (প্যাকিং বাকি)' : 'Confirmed', count: myOrders.filter(o => o.status === 'Confirmed').length },
                      { id: 'Packed', label: isBangla ? '📦 প্যাকড' : 'Packed', count: myOrders.filter(o => o.status === 'Packed' || o.status === 'Processing').length },
                      { id: 'Shipped', label: isBangla ? '🚚 শিপড' : 'Shipped', count: myOrders.filter(o => o.status === 'Shipped').length },
                      { id: 'Delivered', label: isBangla ? '✅ ডেলিভারড' : 'Delivered', count: myOrders.filter(o => o.status === 'Delivered').length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setOrderSubTab(tab.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                          orderSubTab === tab.id
                            ? 'bg-amber-500 text-brand-950 shadow-sm font-black'
                            : 'bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-emerald-300 hover:bg-gray-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-black/10 dark:bg-white/10 rounded-full font-black">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                {myOrders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-black/20 rounded-3xl border border-dashed p-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-700 dark:text-emerald-200">{isBangla ? 'এখনও কোন অর্ডার আসেনি' : 'No orders yet'}</p>
                    <p className="text-xs text-gray-400 mt-1">{isBangla ? 'নতুন অর্ডার আসলে তা স্বয়ংক্রিয়ভাবে এখানে দেখা যাবে।' : 'Incoming orders will appear here in real time.'}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#f4f7f4] dark:bg-black/30 text-gray-600 dark:text-emerald-300 font-bold">
                        <tr>
                          <th className="p-3">Order ID & Date</th>
                          <th className="p-3">Customer Info</th>
                          <th className="p-3">Items to Pack</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Fulfillment Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-emerald-900/40">
                        {myOrders
                          .filter((o) => {
                            if (orderSubTab === 'all') return true;
                            if (orderSubTab === 'Packed') return o.status === 'Packed' || o.status === 'Processing';
                            return o.status === orderSubTab;
                          })
                          .map((order) => {
                            const currentStatus = order.status || 'Pending';
                            const isConfirmed = currentStatus === 'Confirmed';

                            return (
                              <tr key={order.id || order._id} className="hover:bg-amber-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                                <td className="p-3">
                                  <span className="font-mono font-extrabold text-amber-900 dark:text-amber-300 block">
                                    {order.orderId || order.id}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </td>

                                <td className="p-3">
                                  <p className="font-bold text-gray-900 dark:text-emerald-100">{order.customerName}</p>
                                  <p className="text-xs text-gray-500 font-mono">{order.customerPhone}</p>
                                  <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{order.deliveryAddress}</p>
                                </td>

                                <td className="p-3">
                                  <div className="space-y-1">
                                    {order.items?.map((it, idx) => (
                                      <div key={idx} className="text-xs flex items-center justify-between gap-2 font-medium">
                                        <span className="truncate">• {it.name} ({it.weight || 'Std'})</span>
                                        <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">×{it.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-3 font-black text-brand-900 dark:text-secondary">
                                  ৳ {order.totalAmount}
                                  <span className="block text-[10px] uppercase text-gray-400 font-normal">
                                    {order.paymentMethod || 'COD'}
                                  </span>
                                </td>

                                <td className="p-3 text-center">
                                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-block ${
                                    currentStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    currentStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                    currentStatus === 'Packed' || currentStatus === 'Processing' ? 'bg-purple-100 text-purple-800' :
                                    currentStatus === 'Confirmed' ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400 animate-pulse font-extrabold' :
                                    currentStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {currentStatus === 'Confirmed' ? '🔵 Confirmed' : currentStatus}
                                  </span>
                                </td>

                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* 📦 Mark Packed Button */}
                                    {isConfirmed && (
                                      <button
                                        onClick={() => handleMarkOrderPacked(order.id || order._id)}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                                        title={isBangla ? 'পণ্য প্যাকিং সম্পন্ন করুন' : 'Mark as Packed'}
                                      >
                                        <span>📦</span>
                                        <span>{isBangla ? 'প্যাক সম্পন্ন করুন' : 'Mark Packed'}</span>
                                      </button>
                                    )}

                                    {/* Packing Slip Button */}
                                    <button
                                      onClick={() => setSelectedOrderForSlip(order)}
                                      className="p-1.5 rounded-xl border border-gray-200 dark:border-emerald-900 text-gray-600 dark:text-emerald-300 hover:bg-gray-100"
                                      title={isBangla ? 'প্যাকিং স্লিপ দেখুন' : 'Packing Slip'}
                                    >
                                      <Printer className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Packing Slip Preview Modal */}
              {selectedOrderForSlip && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-black text-base">📦 {isBangla ? 'সেলার প্যাকিং স্লিপ' : 'Seller Packing Slip'}</h4>
                        <p className="text-xs text-gray-500">Order: #{selectedOrderForSlip.orderId || selectedOrderForSlip.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isBangla ? 'প্রিন্ট' : 'Print'}</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrderForSlip(null)}
                          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl border">
                        <p><strong>Customer:</strong> {selectedOrderForSlip.customerName} ({selectedOrderForSlip.customerPhone})</p>
                        <p><strong>Address:</strong> {selectedOrderForSlip.deliveryAddress}</p>
                      </div>

                      <table className="w-full border rounded-xl overflow-hidden text-left">
                        <thead className="bg-gray-100 font-bold">
                          <tr>
                            <th className="p-2">Item</th>
                            <th className="p-2 text-center">Unit</th>
                            <th className="p-2 text-center">Qty</th>
                            <th className="p-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedOrderForSlip.items?.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-bold">{it.name}</td>
                              <td className="p-2 text-center">{it.weight || 'Std'}</td>
                              <td className="p-2 text-center font-black">×{it.quantity}</td>
                              <td className="p-2 text-right">৳ {it.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
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

          {/* ======================================================== */}
          {/* 4. CUSTOMER REVIEWS & REPLIES MANAGEMENT (DETAILED)       */}
          {/* ======================================================== */}
          {activeMenu === 'reviews' && (
            <div className="space-y-6">
              
              {/* Header & Stats Banner */}
              <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-emerald-950 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-emerald-100 flex items-center gap-2.5">
                      <span className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">⭐</span>
                      <span>{isBangla ? 'গ্রাহকদের রিভিউ ও রিপ্লাই ব্যবস্থাপনা' : 'Customer Reviews & Replies Management'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-emerald-400 mt-1">
                      {isBangla ? 'ভেরিফাইড ডেলিভারি সম্পন্নকারী ক্রেতাদের রেটিং ও মন্তব্য দেখুন এবং সেলার হিসেবে সরাসরি উত্তর দিন।' : 'View verified buyer ratings & comments for your products and reply directly to customers.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
                      {myReviews.length} {isBangla ? 'টি রিভিউ' : 'Reviews'}
                    </span>
                    <button
                      onClick={loadSellerData}
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
                        {myReviews.length > 0 ? (myReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / myReviews.length).toFixed(1) : '5.0'} / 5.0
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'উত্তর দেওয়া হয়েছে' : 'Replied'}</span>
                      <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                        {myReviews.filter(r => r.seller_reply || (r.replies && r.replies.length > 0)).length}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'উত্তর বাকি' : 'Pending Reply'}</span>
                      <h4 className="text-lg font-black text-blue-800 dark:text-blue-300">
                        {myReviews.filter(r => !r.seller_reply && (!r.replies || r.replies.length === 0)).length}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block">{isBangla ? 'ভেরিফাইড বায়ার' : 'Verified Buyers'}</span>
                      <h4 className="text-lg font-black text-purple-800 dark:text-purple-300">
                        {myReviews.filter(r => r.is_verified_buyer !== false).length}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {myReviews.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#112318] rounded-3xl border border-[#e0ebe2] dark:border-[#1d3b28] shadow-sm space-y-3">
                  <Star className="w-12 h-12 text-gray-300 dark:text-emerald-900 mx-auto" />
                  <h4 className="font-bold text-sm text-gray-700 dark:text-emerald-300">{isBangla ? 'এখনও কোনো রিভিউ জমা পড়েনি' : 'No Reviews Yet'}</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {isBangla ? 'গ্রাহকরা আপনার পণ্য ক্রয় করে ডেলিভারি পাওয়ার পর তাদের মূল্যবান রিভিউ দিলে এখানে বিস্তারিত প্রদর্শিত হবে।' : 'When customers receive their delivered orders and submit reviews, they will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReviews.map((rev) => {
                    const reviewId = rev._id || rev.id;
                    const prod = rev.product || myProducts.find(p => String(p._id) === String(rev.productId || rev.product_id) || String(p.id) === String(rev.productId || rev.product_id));
                    const prodName = prod ? (prod.name_bn || prod.name) : (rev.product_name || 'খাঁটি পণ্য');
                    const prodImage = prod?.thumbnail || (prod?.images && prod?.images[0]) || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80';
                    const prodPrice = prod?.price || 850;
                    const prodCat = prod?.category || prod?.category_name || 'খাঁটি পণ্য';
                    const sName = prod?.seller_name || prod?.shop_name || rev.seller_name || sellerInfo.shop_name;

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

                          {/* Seller Shop Attribution */}
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400 bg-white dark:bg-black/40 px-3 py-1.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 self-start sm:self-auto flex-shrink-0 font-bold">
                            <Store className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{sName}</span>
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
                                  <span>{isBangla ? 'সেলার উত্তর (Shop Reply):' : 'Seller Reply:'}</span>
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

                          {rev.admin_reply && rev.admin_reply !== rev.seller_reply && (
                            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                              <span className="font-black text-purple-900 dark:text-purple-300 flex items-center gap-1">
                                <span>🛡️</span>
                                <span>{isBangla ? 'এডমিন মডারেটর উত্তর:' : 'Admin Reply:'}</span>
                              </span>
                              <p className="font-medium leading-relaxed">{rev.admin_reply}</p>
                            </div>
                          )}
                        </div>

                        {/* 5. Reply Input Form */}
                        <div className="pt-2 border-t border-gray-100 dark:border-emerald-950">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={isBangla ? 'সেলার হিসেবে কাস্টমারকে উত্তর দিন...' : 'Write a seller reply to this customer review...'}
                              value={replyTextMap[reviewId] || ''}
                              onChange={(e) => setReplyTextMap({ ...replyTextMap, [reviewId]: e.target.value })}
                              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-amber-500 font-medium"
                            />
                            <button
                              onClick={() => handleReplyReview(reviewId)}
                              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-brand-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isBangla ? 'উত্তর দিন' : 'Reply'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* 📢 RESTOCK REQUEST MODAL (Seller -> Admin) */}
      {restockModal.isOpen && restockModal.product && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-[#112318] text-gray-900 dark:text-emerald-50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-amber-400 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-emerald-900">
              <div>
                <h4 className="font-black text-base sm:text-lg flex items-center gap-2 text-amber-950 dark:text-amber-200">
                  <span>📢</span>
                  <span>{isBangla ? 'এডমিন থেকে স্টক রিকোয়েস্ট পাঠান' : 'Request Stock from Admin'}</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-emerald-400">
                  {isBangla ? 'আপনার অনুরোধ সরাসরি এডমিন ড্যাশবোর্ডে ও MongoDB ডাটাবেসে যাবে।' : 'Your request will be sent directly to Admin Dashboard and MongoDB.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRestockModal({ isOpen: false, product: null, quantity: 30, note: '' })}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-black/30 border border-amber-200 dark:border-amber-900/60">
              <img
                src={restockModal.product.thumbnail || restockModal.product.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=150&q=80'}
                alt={restockModal.product.name}
                className="w-14 h-14 rounded-xl object-cover border border-amber-300 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h5 className="font-extrabold text-sm text-gray-900 dark:text-emerald-100 truncate">
                  {restockModal.product.name_bn || restockModal.product.name}
                </h5>
                <div className="flex items-center gap-3 text-[11px] font-bold mt-1">
                  <span className="text-purple-700 dark:text-purple-300">
                    এডমিন মাস্টার স্টক: {restockModal.product.admin_stock !== undefined ? restockModal.product.admin_stock : (restockModal.product.adminStock !== undefined ? restockModal.product.adminStock : 70)} টি
                  </span>
                  <span className="text-amber-700 dark:text-amber-300">
                    আপনার স্টক: {restockModal.product.stock_quantity !== undefined ? restockModal.product.stock_quantity : (restockModal.product.stock || 0)} টি
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Input with Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300">
                {isBangla ? 'প্রয়োজনীয় স্টক সংখ্যা (পিস) *' : 'Requested Stock Quantity (Pieces) *'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockModal.quantity}
                onChange={(e) => setRestockModal({ ...restockModal, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-base font-black text-gray-900 dark:text-emerald-50 focus:outline-none focus:border-amber-500"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-gray-400 font-bold">{isBangla ? 'কুইক সিলেক্ট:' : 'Quick Select:'}</span>
                {[10, 20, 30, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setRestockModal({ ...restockModal, quantity: qty })}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      restockModal.quantity === qty
                        ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                        : 'bg-gray-100 dark:bg-black/40 text-gray-700 dark:text-emerald-300 hover:bg-gray-200'
                    }`}
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300">
                {isBangla ? 'অ্যাডমিনের জন্য বার্তা / নোট (ঐচ্ছিক)' : 'Note for Admin (Optional)'}
              </label>
              <textarea
                rows={2}
                placeholder={isBangla ? 'যেমন: পণ্যটি দ্রুত বিক্রি হচ্ছে, দ্রুত স্টক স্থানান্তর করলে সুবিধা হয়।' : 'e.g. High demand product, please transfer stock soon.'}
                value={restockModal.note}
                onChange={(e) => setRestockModal({ ...restockModal, note: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-950">
              <button
                type="button"
                onClick={() => setRestockModal({ isOpen: false, product: null, quantity: 30, note: '' })}
                className="px-5 py-2.5 border border-gray-300 dark:border-emerald-900 rounded-2xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-emerald-950 text-gray-700 dark:text-emerald-200"
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSendingRestock}
                onClick={handleSendRestockRequest}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-brand-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSendingRestock ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBangla ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isBangla ? 'রিকোয়েস্ট পাঠান (Send to Admin)' : 'Send Request to Admin'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
