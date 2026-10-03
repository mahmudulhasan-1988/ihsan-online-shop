'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  getProducts, 
  getProductById, 
  getReviews, 
  submitReview,
  checkReviewEligibility 
} from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import ProductCard from '@/components/ProductCard';
import { 
  Star, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  PhoneCall,
  Send,
  Store,
  AlertCircle,
  Lock,
  BadgeCheck
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user, addToCart, openFastOrder, showToast } = useCart();
  const { isBangla } = useThemeLanguage();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Verified Review System states
  const [reviewEligibility, setReviewEligibility] = useState({
    isVerifiedBuyer: false,
    checked: false,
    orderId: null,
    message: ''
  });
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setReviewerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success && res.data) {
          const prod = res.data;
          setProduct(prod);
          setSelectedImage(prod.images?.[0] || prod.thumbnail || '');
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          // Fetch related products & reviews
          const [relRes, revRes] = await Promise.all([
            getProducts({ category: prod.categorySlug, limit: 4 }),
            getReviews(prod.id || prod._id),
          ]);
          setRelatedProducts((relRes?.data || []).filter((p) => (p.id || p._id) !== (prod.id || prod._id)));
          setReviews(revRes?.data || []);

          // Check Verified Review Eligibility
          if (user) {
            const eligRes = await checkReviewEligibility(prod.id || prod._id, {
              userId: user.id || user._id,
              phone: user.phone,
              email: user.email,
              name: user.name
            });
            setReviewEligibility({
              isVerifiedBuyer: !!eligRes.isVerifiedBuyer,
              checked: true,
              orderId: eligRes.orderId,
              message: eligRes.message || ''
            });
          } else {
            setReviewEligibility({
              isVerifiedBuyer: false,
              checked: true,
              orderId: null,
              message: isBangla ? 'রিভিউ দিতে লগইন করুন ও ডেলিভারি স্ট্যাটাস চেক করুন' : 'Login to check verified buyer status'
            });
          }
        }
      } catch (err) {
        console.error('Error loading product details', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-emerald-100">
          {isBangla ? 'পণ্যটি খুঁজে পাওয়া যায়নি!' : 'Product not found!'}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isBangla ? 'দয়া করে অন্য কোনো পণ্য দেখুন।' : 'Please browse our other products.'}
        </p>
      </div>
    );
  }

  const stockCount = product.stock_quantity !== undefined 
    ? Number(product.stock_quantity) 
    : (product.stock !== undefined ? Number(product.stock) : 50);
  const isOutOfStock = stockCount <= 0;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentRegularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
  const discountPercent = currentRegularPrice > currentPrice
    ? Math.round(((currentRegularPrice - currentPrice) / currentRegularPrice) * 100)
    : product.discountPercentage || 0;

  const sellerName = isBangla 
    ? (product.seller_name_bn || product.seller_name || product.shop_name || product.seller?.shop_name || 'সুন্দরবন অর্গানিক ফার্মস')
    : (product.seller_name_en || product.sellerName || product.shop_name_en || product.seller_name || 'Sundarban Organic Farms');

  const handleIncreaseQty = () => {
    if (quantity + 1 > stockCount) {
      showToast(isBangla ? `দুঃখিত, এই পণ্যের সর্বোচ্চ ${stockCount} টি স্টক অবশিষ্ট আছে!` : `Sorry, only ${stockCount} pcs available in stock!`, 'error');
      return;
    }
    setQuantity(q => q + 1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast(isBangla ? 'রিভিউ দিতে অনুগ্রহ করে প্রথমে লগইন করুন!' : 'Please login first to submit a review!', 'error');
      return;
    }

    if (!reviewEligibility.isVerifiedBuyer) {
      showToast(isBangla ? 'শুধুমাত্র পণ্যটি ডেলিভারি (Delivered) পাওয়া ভেরিফাইড ক্রেতারা রিভিউ দিতে পারবেন!' : 'Only customers who have received this product can leave a verified review!', 'error');
      return;
    }

    if (!reviewerName.trim() || !reviewerComment.trim()) {
      showToast(isBangla ? 'দয়া করে আপনার নাম ও রিভিউ লিখুন' : 'Please provide your name and review comment', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await submitReview({
        productId: product.id || product._id,
        userId: user.id || user._id,
        customerName: reviewerName.trim(),
        customerPhone: user.phone,
        customerEmail: user.email,
        rating: reviewerRating,
        comment: reviewerComment.trim(),
      });

      if (res.success) {
        showToast(isBangla ? '🎉 আপনার ভেরিফাইড রিভিউ সফলভাবে যুক্ত হয়েছে!' : 'Verified review submitted successfully!');
        setReviews([res.data, ...reviews]);
        setReviewerComment('');
      } else {
        showToast(res.message || (isBangla ? 'রিভিউ যোগ করতে সমস্যা হয়েছে' : 'Failed to submit review'), 'error');
      }
    } catch (err) {
      showToast(isBangla ? 'রিভিউ যোগ করতে সমস্যা হয়েছে' : 'Error submitting review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-12">
      
      {/* Product Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#112318] rounded-3xl border border-gray-100 dark:border-[#1d3b28] p-4 shadow-sm overflow-hidden aspect-square flex items-center justify-center relative">
            <img
              src={selectedImage || product.images?.[0] || product.thumbnail}
              alt={product.name}
              className={`w-full h-full object-cover rounded-2xl ${isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''}`}
            />
            {isOutOfStock ? (
              <span className="absolute top-6 left-6 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{isBangla ? 'স্টক আউট (Out Of Stock)' : 'Out Of Stock'}</span>
              </span>
            ) : discountPercent > 0 && (
              <span className="absolute top-6 left-6 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
                -{discountPercent}% {isBangla ? 'ছাড়' : 'OFF'}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-brand-900 dark:border-emerald-500 shadow-md scale-105' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-brand-900 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                {product.category}
              </span>
              {isOutOfStock ? (
                <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'স্টক শেষ' : 'Out of Stock'}</span>
                </span>
              ) : (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBangla ? `স্টকে আছে (${stockCount} টি)` : `In Stock (${stockCount} pcs)`}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-emerald-50 leading-tight">
              {isBangla ? product.name : (product.nameEn || product.name)}
            </h1>
            {product.nameEn && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.nameEn}</p>
            )}

            {/* Seller Information Box */}
            <div className="mt-3 p-3 bg-amber-50/90 dark:bg-black/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                <Store className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{isBangla ? 'সেলার / বিক্রেতা:' : 'Seller / Store:'} <strong>{sellerName}</strong></span>
              </div>
              <Link 
                href="/products" 
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{isBangla ? 'স্টোরের পণ্যসমূহ' : 'View Store'}</span>
                <span>➔</span>
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3 text-amber-500 text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200">{product.rating || 5.0}</span>
              <span className="text-gray-400 text-xs">
                ({reviews.length} {isBangla ? 'টি ভেরিফাইড রিভিউ' : 'Verified Reviews'})
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 flex items-baseline gap-3">
            {isOutOfStock ? (
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 block">
                  ⚠️ {isBangla ? 'পণ্যটি স্টক আউট (Out Of Stock)' : 'Out Of Stock'}
                </span>
                <p className="text-xs text-gray-500">
                  {isBangla ? 'খুব শীঘ্রই নতুন স্টক যুক্ত করা হবে।' : 'New stock will arrive soon.'}
                </p>
              </div>
            ) : (
              <>
                <span className="text-3xl font-black text-brand-900 dark:text-emerald-300">
                  ৳ {currentPrice}
                </span>
                {currentRegularPrice > currentPrice && (
                  <span className="text-base text-gray-400 line-through">
                    ৳ {currentRegularPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                    ৳ {currentRegularPrice - currentPrice} {isBangla ? 'সাশ্রয়' : 'OFF'}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                {isBangla ? 'পরিমাণ সিলেক্ট করুন:' : 'Select Variant:'}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      selectedVariant?.weight === v.weight
                        ? 'bg-brand-900 dark:bg-emerald-600 text-white border-brand-900 dark:border-emerald-600 shadow-md scale-105'
                        : 'bg-white dark:bg-black/40 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-brand-700'
                    }`}
                  >
                    {v.weight} - ৳ {v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{isBangla ? 'সংখ্যা:' : 'Qty:'}</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/50 rounded-xl overflow-hidden shadow-inner">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {isBangla ? 'মোট:' : 'Total:'} <strong>৳ {currentPrice * quantity}</strong>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {isOutOfStock ? (
              <button
                disabled
                className="sm:col-span-2 bg-gray-200 dark:bg-gray-800 text-gray-500 font-black py-4 px-6 rounded-2xl text-center cursor-not-allowed border border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>{isBangla ? 'পণ্যটি স্টক আউট (Out Of Stock)' : 'Out Of Stock'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => openFastOrder(product, selectedVariant)}
                  className="bg-secondary hover:bg-gold-600 text-brand-950 font-extrabold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-brand-950" />
                  <span>{isBangla ? '১-ক্লিকে সরাসরি অর্ডার' : 'Instant Order'}</span>
                </button>

                <button
                  onClick={() => addToCart(product, selectedVariant, quantity, true)}
                  className="bg-brand-900 hover:bg-brand-800 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 dark:bg-emerald-600"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{isBangla ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </button>
              </>
            )}
          </div>

          {/* Hotline Quick Link */}
          <a
            href="tel:01317539641"
            className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-black/30 hover:bg-emerald-50 text-brand-900 dark:text-emerald-300 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors text-xs font-bold"
          >
            <PhoneCall className="w-4 h-4 text-secondary animate-bounce" />
            <span>{isBangla ? 'ফোনে অর্ডার করতে কল করুন: 01317539641' : 'Order via Phone: 01317539641'}</span>
          </a>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-gray-600 dark:text-gray-400">
            <div className="p-2.5 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mb-1" />
              <span className="font-bold">{isBangla ? '১০০% বিশুদ্ধ' : '100% Pure'}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
              <Truck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mb-1" />
              <span className="font-bold">{isBangla ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mb-1" />
              <span className="font-bold">{isBangla ? 'সহজ রিটার্ন' : 'Easy Return'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Description & Health Benefits */}
      <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-[#1d3b28] shadow-sm space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-emerald-100 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            {isBangla ? 'পণ্যের বিবরণ ও বৈশিষ্ট্য' : 'Product Details & Description'}
          </h3>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Benefits list */}
        {product.benefits && product.benefits.length > 0 && (
          <div className="pt-2">
            <h4 className="text-base font-bold text-gray-900 dark:text-emerald-200 mb-3">
              {isBangla ? 'স্বাস্থ্য উপকারিতা ও বিশেষত্ব:' : 'Key Benefits & Highlights:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs sm:text-sm font-semibold text-brand-950 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🌟 STRICT VERIFIED REVIEWS & RATINGS SYSTEM */}
      <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-[#1d3b28] shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-emerald-100 flex items-center gap-2">
              <span>{isBangla ? 'ভেরিফাইড কাস্টমার রিভিউ ও রেটিং' : 'Verified Customer Reviews & Ratings'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {reviews.length} {isBangla ? 'টি রিভিউ' : 'Reviews'}
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isBangla 
                ? 'শুধুমাত্র সফল ডেলিভারি (Delivered) সম্পন্নকারী গ্রাহকদের সত্যনিষ্ঠ মতামত' 
                : '100% genuine reviews strictly from verified delivered customers'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <BadgeCheck className="w-4 h-4" />
            <span>100% Verified Purchases</span>
          </div>
        </div>

        {/* Verified Review Eligibility & Form Box */}
        {reviewEligibility.isVerifiedBuyer ? (
          <form onSubmit={handleReviewSubmit} className="bg-emerald-50/70 dark:bg-emerald-950/30 p-5 sm:p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900 pb-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                  {isBangla ? 'আপনি এই পণ্যের একজন ভেরিফাইড ক্রেতা! 🌿' : 'You are a Verified Buyer for this product! 🌿'}
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400">Order: #{reviewEligibility.orderId}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{isBangla ? 'আপনার নাম *' : 'Your Name *'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hasan"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-brand-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{isBangla ? 'রেটিং প্রদান করুন *' : 'Rating *'}</label>
                <select
                  value={reviewerRating}
                  onChange={(e) => setReviewerRating(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-brand-900"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫ তারকা - অসাধারণ)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪ তারকা - খুব ভালো)</option>
                  <option value={3}>⭐⭐⭐ (৩ তারকা - ভালো)</option>
                  <option value={2}>⭐⭐ (২ তারকা - মোটামুটি)</option>
                  <option value={1}>⭐ (১ তারকা - সন্তুষ্ট নই)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{isBangla ? 'আপনার অভিজ্ঞতা ও মন্তব্য *' : 'Your Review Comment *'}</label>
              <textarea
                required
                rows={3}
                placeholder={isBangla ? 'পণ্যটির স্বাদ, ঘ্রাণ ও গুণমান কেমন লেগেছে বিস্তারিত জানান...' : 'Share your genuine experience with this product...'}
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-gray-300 dark:border-emerald-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-brand-900 hover:bg-brand-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md"
            >
              {isSubmittingReview ? (
                <span>{isBangla ? 'যাচাই ও সংরক্ষণ হচ্ছে...' : 'Submitting...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBangla ? 'ভেরিফাইড রিভিউ সাবমিট করুন' : 'Submit Verified Review'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-amber-50/80 dark:bg-black/30 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-2xl flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
                  {isBangla ? '🔒 ভেরিফাইড রিভিউ নীতি (Verified Review Policy)' : '🔒 Verified Review Policy'}
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                  {isBangla
                    ? 'শুধুমাত্র যেসকল গ্রাহক পণ্যটি ক্রয় করেছেন এবং সফল ডেলিভারি (Delivered) সম্পন্ন হয়েছে, তারাই এখানে রেটিং ও মন্তব্য প্রদান করতে পারেন।'
                    : 'Only customers with a completed "Delivered" order for this product can leave a rating and review.'}
                </p>
              </div>
            </div>

            {!user ? (
              <Link
                href="/auth"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-brand-950 font-black text-xs rounded-xl shadow transition-all whitespace-nowrap self-start sm:self-auto"
              >
                {isBangla ? 'লগইন করুন' : 'Login to Review'}
              </Link>
            ) : (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-black/40 px-3 py-1.5 rounded-xl border">
                {isBangla ? 'ডেলিভারির পর রিভিউ দিন' : 'Review unlocks on delivery'}
              </span>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="p-4 sm:p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-emerald-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-emerald-100">
                      {rev.customerName || rev.userName || 'Verified Customer'}
                    </span>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-emerald-200 dark:border-emerald-800">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      <span>{isBangla ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}</span>
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 dark:text-emerald-200/90 italic">
                  "{rev.comment}"
                </p>

                {/* Admin / Seller Replies */}
                {(rev.seller_reply || rev.admin_reply) && (
                  <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-1">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>{rev.replied_by || (isBangla ? 'সেলার / এডমিন রিপ্লাই' : 'Seller / Admin Reply')}:</span>
                    </p>
                    <p className="text-gray-700 dark:text-emerald-200 pl-5">{rev.seller_reply || rev.admin_reply}</p>
                  </div>
                )}

                {rev.replies && Array.isArray(rev.replies) && rev.replies.map((rep, rIdx) => (
                  <div key={rIdx} className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs space-y-1">
                    <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>{rep.replierName || 'Support Reply'}:</span>
                    </p>
                    <p className="text-gray-700 dark:text-blue-100 pl-5">{rep.reply}</p>
                  </div>
                ))}

                <span className="text-[10px] text-gray-400 block">{rev.date || 'সম্প্রতি'}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs space-y-1">
              <p className="text-2xl">💬</p>
              <p>{isBangla ? 'এখনো কোনো রিভিউ দেওয়া হয়নি। পণ্যটি ডেলিভারি পেয়ে প্রথম ভেরিফাইড রিভিউটি দিন!' : 'No reviews yet. Be the first verified buyer to review!'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-emerald-100">
            {isBangla ? 'সম্পর্কিত অন্যান্য পণ্যসমূহ' : 'Related Products'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
