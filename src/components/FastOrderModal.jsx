'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Phone, 
  User, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star, 
  Check, 
  Info, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  PackageCheck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { placeOrder } from '@/lib/api';

export default function FastOrderModal() {
  const router = useRouter();
  const { fastOrderData, closeFastOrder, showToast, user } = useCart();
  const { isBangla } = useThemeLanguage();
  const { isOpen, product, variant } = fastOrderData;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka'); // inside_dhaka or outside_dhaka
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod or bkash
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(true);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedVariant(variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null));
      if (user) {
        if (!customerName) setCustomerName(user.name || '');
        if (!customerPhone) setCustomerPhone(user.phone || '');
      }
    }
  }, [product, variant, user]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const unitPrice = selectedVariant ? selectedVariant.price : product.price;
  const regularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
  const subtotal = unitPrice * quantity;
  const deliveryCharge = deliveryZone === 'inside_dhaka' ? 70 : 120;
  const totalAmount = subtotal + deliveryCharge;

  const discountPercent = regularPrice > unitPrice
    ? Math.round(((regularPrice - unitPrice) / regularPrice) * 100)
    : product.discountPercentage || 0;

  const stock = product ? (product.stock_quantity !== undefined ? Number(product.stock_quantity) : (product.stock !== undefined ? Number(product.stock) : 50)) : 50;

  const handleIncreaseQty = () => {
    if (quantity + 1 > stock) {
      showToast(isBangla ? `দুঃখিত, এই পণ্যের সর্বোচ্চ ${stock} টি স্টক অবশিষ্ট আছে!` : `Sorry, only ${stock} pcs left in stock!`, 'error');
      return;
    }
    setQuantity((q) => q + 1);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (quantity > stock) {
      showToast(isBangla ? `দুঃখিত, এই পণ্যের সর্বোচ্চ ${stock} টি স্টক অবশিষ্ট আছে!` : `Sorry, only ${stock} pcs left in stock!`, 'error');
      return;
    }

    if (!customerName.trim()) {
      showToast(isBangla ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your name', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 11) {
      showToast(isBangla ? 'দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Please provide a valid 11-digit mobile number', 'error');
      return;
    }
    if (!deliveryAddress.trim()) {
      showToast(isBangla ? 'দয়া করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা দিন' : 'Please enter your delivery address', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUserId = user?.id || user?._id || user?.userId || null;
      const orderPayload = {
        userId: currentUserId,
        user_id: currentUserId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (user?.email || '').trim().toLowerCase(),
        customerAvatar: user?.avatar || '',
        deliveryAddress: deliveryAddress.trim(),
        deliveryZone,
        deliveryCharge,
        paymentMethod,
        notes,
        subtotal,
        totalAmount,
        items: [
          {
            productId: product.id || product._id,
            name: isBangla ? (product.name_bn || product.name) : (product.name_en || product.name),
            weight: selectedVariant ? selectedVariant.weight : product.unit || 'Standard',
            price: unitPrice,
            quantity,
            image: product.images?.[0] || '',
          },
        ],
      };

      const res = await placeOrder(orderPayload);

      if (res.success) {
        showToast(isBangla ? 'আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!' : 'Your order has been placed successfully!');
        closeFastOrder();
        router.push(`/order-success?orderId=${res.orderId || res.data?.orderId}`);
      } else {
        showToast(res.message || (isBangla ? 'অর্ডার করতে সমস্যা হয়েছে' : 'Failed to place order'), 'error');
      }
    } catch (err) {
      console.error('Order error', err);
      showToast(isBangla ? 'সার্ভারে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।' : 'Server error, please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = isBangla ? (product.name_bn || product.name) : (product.name_en || product.name);
  const productDescription = isBangla 
    ? (product.description || product.shortDescription || '১০০% প্রাকৃতিক ও নির্ভেজাল স্বাস্থ্যকর খাদ্য উপাদান। সরাসরি নিজস্ব তত্ত্বাবধানে সংগৃহীত এবং কোনো প্রকার কেমিক্যাল বা প্রিজারভেটিভ মুক্ত।')
    : (product.descriptionEn || product.description || '100% natural, pure and organic food product. Collected directly from source with zero preservatives or artificial colors.');

  return (
    <div 
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 lenis-prevent"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFastOrder();
      }}
    >
      <div 
        data-lenis-prevent="true"
        className="bg-white dark:bg-[#112318] rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-emerald-200 dark:border-[#1d3b28] animate-in zoom-in-95 duration-200 transition-colors lenis-prevent"
      >
        
        {/* Sticky Modal Header */}
        <div className="bg-gradient-to-r from-brand-900 via-emerald-900 to-brand-950 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0 rounded-t-3xl shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary text-brand-950 flex items-center justify-center font-bold shadow-md flex-shrink-0">
              <Zap className="w-5 h-5 fill-brand-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {isBangla ? '১-ক্লিক দ্রুত অর্ডার' : '1-Click Fast Order'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isBangla ? 'ক্যাশ অন ডেলিভারিতে দ্রুত অর্ডার সম্পন্ন করুন' : 'Fast checkout with Cash on Delivery'}
              </p>
            </div>
          </div>
          <button
            onClick={closeFastOrder}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body & Form */}
        <form 
          onSubmit={handleSubmitOrder} 
          data-lenis-prevent="true"
          className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain flex-1 lenis-prevent custom-scrollbar"
        >
          
          {/* Selected Product Summary Card */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-3xl border border-emerald-200 dark:border-emerald-800/70 space-y-3.5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-sm"
                />
                {discountPercent > 0 && (
                  <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBangla ? '১০০% খাঁটি ও নির্ভেজাল' : '100% Organic'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-500 text-[11px] font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating || 5.0}</span>
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 dark:text-emerald-100 text-sm sm:text-base line-clamp-2 leading-snug">
                  {displayName}
                </h4>
                
                {/* Variant Selector inside Modal */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-600 dark:text-emerald-400">
                      {isBangla ? 'পরিমাণ:' : 'Size:'}
                    </span>
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold border transition-all ${
                          selectedVariant?.weight === v.weight
                            ? 'bg-brand-900 text-white border-brand-900 dark:bg-emerald-600 dark:border-emerald-500 shadow-sm scale-105'
                            : 'bg-white dark:bg-black/30 text-gray-700 dark:text-emerald-300 border-gray-300 dark:border-emerald-800 hover:border-brand-900'
                        }`}
                      >
                        {v.weight}
                      </button>
                    ))}
                  </div>
                )}

                {/* Price & Quantity Controls */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-xl font-black text-brand-900 dark:text-emerald-300">
                      ৳ {unitPrice}
                    </span>
                    {regularPrice > unitPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳ {regularPrice}
                      </span>
                    )}
                  </div>

                  {/* Quantity Switcher */}
                  <div className="flex items-center border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#0c1a11] rounded-xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 text-gray-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-black text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-extrabold text-gray-900 dark:text-emerald-100">{quantity}</span>
                    <button
                      type="button"
                      onClick={handleIncreaseQty}
                      className="px-3 py-1 text-gray-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-black text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details & Benefits Section (পণ্যের বিবরণী ও উপকারিতা) */}
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="w-full flex items-center justify-between text-xs font-bold text-brand-900 dark:text-emerald-300 hover:underline py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-secondary" />
                  <span>{isBangla ? 'পণ্যের বিবরণী ও বিশেষত্ব' : 'Product Description & Highlights'}</span>
                </span>
                {showFullDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFullDesc && (
                <div className="mt-2 space-y-2 text-xs text-gray-700 dark:text-emerald-200 bg-white/70 dark:bg-black/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                  <p className="leading-relaxed">
                    {productDescription}
                  </p>
                  
                  {/* Organic Key Feature Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 text-[11px] font-medium text-emerald-900 dark:text-emerald-300">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{isBangla ? '১০০% প্রাকৃতিক ও ফ্রেশ' : '100% Pure & Fresh'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{isBangla ? 'কোন ক্ষতিকর কেমিক্যাল নেই' : 'Chemical & Preservative Free'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{isBangla ? 'সরাসরি নিজস্ব উৎস থেকে প্রাপ্ত' : 'Direct from Pure Source'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{isBangla ? 'প্যাকেজিং ও সুরক্ষার নিশ্চয়তা' : 'Hygienic Secure Packaging'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Customer Inputs */}
          <div className="space-y-3.5 pt-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-emerald-400 border-b border-gray-100 dark:border-emerald-900/50 pb-1.5 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-brand-700 dark:text-emerald-400" />
              <span>{isBangla ? 'ডেলিভারি ঠিকানা ও তথ্য' : 'Delivery Details'}</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" />
                <span>{isBangla ? 'আপনার সম্পূর্ণ নাম *' : 'Full Name *'}</span>
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? 'যেমন: মো: আরিফুল ইসলাম' : 'e.g. Md. Ariful Islam'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" />
                <span>{isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</span>
              </label>
              <input
                type="tel"
                required
                placeholder="017XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" />
                <span>{isBangla ? 'ডেলিভারি ঠিকানা (বাড়ি নং, রোড, থানা, জেলা) *' : 'Delivery Address (House, Road, Area, City) *'}</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder={isBangla ? 'যেমন: বাড়ি #১২, রোড #০৪, ধানমন্ডি, ঢাকা' : 'e.g. House #12, Road #04, Dhanmondi, Dhaka'}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30 transition-all"
              />
            </div>

            {/* Delivery Area Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-700 dark:text-emerald-400" />
                <span>{isBangla ? 'ডেলিভারি এরিয়া সিলেক্ট করুন *' : 'Select Delivery Area *'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryZone === 'inside_dhaka'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-brand-900 dark:border-emerald-500 text-brand-950 dark:text-emerald-100 font-bold ring-2 ring-brand-900/20 shadow-sm'
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xs">{isBangla ? 'ঢাকার ভেতরে' : 'Inside Dhaka'}</span>
                  <span className="text-xs font-black text-brand-900 dark:text-secondary mt-0.5">৳ ৭০</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryZone === 'outside_dhaka'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-brand-900 dark:border-emerald-500 text-brand-950 dark:text-emerald-100 font-bold ring-2 ring-brand-900/20 shadow-sm'
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xs">{isBangla ? 'ঢাকার বাইরে (সারাদেশ)' : 'Outside Dhaka (Nationwide)'}</span>
                  <span className="text-xs font-black text-brand-900 dark:text-secondary mt-0.5">৳ ১২০</span>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-brand-900 dark:border-emerald-500 text-brand-900 dark:text-emerald-200 font-bold ring-1 ring-brand-900/20'
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-brand-900 focus:ring-brand-900"
                  />
                  <span className="text-xs">{isBangla ? '💵 ক্যাশ অন ডেলিভারি' : '💵 Cash on Delivery'}</span>
                </label>
                <label
                  className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-600 dark:border-pink-500 text-pink-900 dark:text-pink-300 font-bold ring-1 ring-pink-500/20'
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="text-pink-600 focus:ring-pink-600"
                  />
                  <span className="text-xs">{isBangla ? '📱 বিকাশ / নগদ' : '📱 bKash / Nagad'}</span>
                </label>
              </div>
            </div>

          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-gray-50 dark:bg-black/30 p-4 rounded-2xl border border-gray-200 dark:border-emerald-900/40 space-y-1.5 text-xs text-gray-600 dark:text-emerald-300">
            <div className="flex justify-between">
              <span>{isBangla ? 'পণ্যের দাম:' : 'Item Subtotal:'}</span>
              <span className="font-semibold text-gray-800 dark:text-emerald-100">৳ {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>{isBangla ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
              <span className="font-semibold text-gray-800 dark:text-emerald-100">৳ {deliveryCharge}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-emerald-900/60 text-sm font-black text-brand-900 dark:text-secondary">
              <span>{isBangla ? 'সর্বমোট প্রদেয় টাকা:' : 'Total Payable:'}</span>
              <span>৳ {totalAmount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 via-secondary to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-brand-950 font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{isBangla ? `অর্ডার কনফার্ম করুন (৳ ${totalAmount})` : `Confirm Order (৳ ${totalAmount})`}</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-500 dark:text-emerald-400 flex items-center justify-center gap-1.5 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isBangla ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করার সম্পূর্ণ নিশ্চয়তা' : '100% Cash on Delivery & Satisfaction Guarantee'}
            </span>
          </p>

        </form>

      </div>
    </div>
  );
}
