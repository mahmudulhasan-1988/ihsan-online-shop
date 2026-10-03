'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { placeOrder } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, updateQuantity, removeFromCart, showToast, user } = useCart();
  const { isBangla } = useThemeLanguage();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka'); // inside_dhaka | outside_dhaka
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
    }
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-brand-900 dark:text-emerald-300">
          <ShoppingBag className="w-10 h-10 text-brand-700 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-emerald-100">
          {isBangla ? 'আপনার কার্টে কোনো পণ্য নেই!' : 'Your Cart is Empty!'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-emerald-400">
          {isBangla 
            ? 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে আগে আপনার পছন্দের পণ্য কার্টে যোগ করুন।' 
            : 'Please add your favorite items to cart before proceeding to checkout.'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-full text-sm shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBangla ? 'পণ্যসমূহ দেখুন' : 'Browse Products'}</span>
        </Link>
      </div>
    );
  }

  const deliveryCharge = deliveryZone === 'inside_dhaka' ? 70 : 120;
  const totalAmount = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

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
      const orderData = {
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
        notes: notes.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          weight: item.weight,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        totalAmount,
      };

      const res = await placeOrder(orderData);

      if (res.success) {
        clearCart();
        showToast(isBangla ? 'আপনার অর্ডারটি সফল হয়েছে!' : 'Your order was placed successfully!');
        router.push(`/order-success?orderId=${res.orderId || res.data?.orderId}`);
      } else {
        showToast(res.message || (isBangla ? 'অর্ডার গ্রহণ করা সম্ভব হয়নি' : 'Failed to place order'), 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast(isBangla ? 'সার্ভারে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।' : 'Server error, please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      
      {/* Title */}
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-900 dark:text-emerald-400 hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isBangla ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-emerald-50">
          {isBangla ? 'চেকআউট ও অর্ডার কনফার্মেশন' : 'Checkout & Order Confirmation'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-emerald-400">
          {isBangla ? 'আপনার ঠিকানা প্রদান করে অর্ডারটি সম্পন্ন করুন' : 'Provide your delivery details to complete your order'}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Customer Information Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-gray-100 dark:border-[#1d3b28] shadow-sm space-y-4 transition-colors">
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-emerald-100 border-b dark:border-emerald-900/60 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-900 dark:text-emerald-400" />
              <span>{isBangla ? 'ডেলিভারি তথ্য' : 'Delivery Information'}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'আপনার সম্পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={isBangla ? 'যেমন: মো: আরিফুল ইসলাম' : 'e.g. Md. Ariful Islam'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
              </label>
              <input
                type="tel"
                required
                placeholder="017XXXXXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'সম্পূর্ণ ঠিকানা (বাসা/হোল্ডিং নং, রোড, থানা, জেলা) *' : 'Full Delivery Address (House, Road, Area, City) *'}
              </label>
              <textarea
                required
                rows={3}
                placeholder={isBangla ? 'যেমন: ফ্ল্যাট #৪এ, বাড়ি #১২, রোড #০৪, ধানমন্ডি, ঢাকা' : 'e.g. Flat #4A, House #12, Road #04, Dhanmondi, Dhaka'}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'ডেলিভারি এলাকা নির্বাচন করুন *' : 'Select Delivery Area *'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryZone === 'inside_dhaka'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-brand-900 dark:border-emerald-500 text-brand-950 dark:text-emerald-100 font-bold ring-2 ring-brand-900/20'
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{isBangla ? 'ঢাকার ভেতরে' : 'Inside Dhaka'}</span>
                  <span className="text-xs font-black text-brand-900 dark:text-secondary">৳ ৭০</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryZone === 'outside_dhaka'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-brand-900 dark:border-emerald-500 text-brand-950 dark:text-emerald-100 font-bold ring-2 ring-brand-900/20'
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{isBangla ? 'ঢাকার বাইরে (সারাদেশ)' : 'Outside Dhaka (Nationwide)'}</span>
                  <span className="text-xs font-black text-brand-900 dark:text-secondary">৳ ১২০</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'বিশেষ কোনো নোট বা নির্দেশনা (ঐচ্ছিক)' : 'Special Delivery Notes (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isBangla ? 'যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়' : 'e.g. Please deliver in the afternoon'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/30"
              />
            </div>

          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-gray-100 dark:border-[#1d3b28] shadow-sm space-y-3 transition-colors">
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-emerald-100 border-b dark:border-emerald-900/60 pb-3">
              {isBangla ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
            </h3>

            <div className="space-y-2">
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-brand-900 dark:border-emerald-500 text-brand-900 dark:text-emerald-200 font-bold'
                    : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-brand-900 focus:ring-brand-900"
                  />
                  <span className="text-xs sm:text-sm">
                    {isBangla ? '💵 ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ)' : '💵 Cash on Delivery (Pay when you receive)'}
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-600 dark:border-pink-500 text-pink-900 dark:text-pink-300 font-bold'
                    : 'bg-white dark:bg-black/20 border-gray-200 dark:border-emerald-900/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="text-pink-600 focus:ring-pink-600"
                  />
                  <span className="text-xs sm:text-sm">
                    {isBangla ? '📱 বিকাশ / নগদ / রকেট' : '📱 bKash / Nagad / Rocket'}
                  </span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 border border-gray-100 dark:border-[#1d3b28] shadow-sm space-y-4 sticky top-24 transition-colors">
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-emerald-100 border-b dark:border-emerald-900/60 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-900 dark:text-emerald-400" />
              <span>
                {isBangla ? `অর্ডার সারসংক্ষেপ (${cart.length} টি পণ্য)` : `Order Summary (${cart.length} Items)`}
              </span>
            </h3>

            {/* Items list */}
            <div className="divide-y divide-gray-100 dark:divide-emerald-900/40 max-h-64 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.cartItemId} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-emerald-900/60"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-gray-900 dark:text-emerald-100 truncate">{item.name}</h5>
                    <p className="text-[10px] text-gray-500 dark:text-emerald-400">
                      {isBangla ? `পরিমাণ: ${item.weight} × ${item.quantity}` : `Qty: ${item.weight} × ${item.quantity}`}
                    </p>
                    <span className="text-xs font-bold text-brand-900 dark:text-emerald-300">৳ {item.price * item.quantity}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-gray-400 dark:text-emerald-600 hover:text-red-600 dark:hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div className="bg-gray-50 dark:bg-black/30 p-4 rounded-2xl border border-gray-200 dark:border-emerald-900/60 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600 dark:text-emerald-300">
                <span>{isBangla ? 'পণ্যের মোট মূল্য:' : 'Item Subtotal:'}</span>
                <span className="font-bold text-gray-900 dark:text-emerald-100">৳ {subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-emerald-300">
                <span>{isBangla ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                <span className="font-bold text-gray-900 dark:text-emerald-100">৳ {deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-base font-black text-brand-900 dark:text-secondary pt-2 border-t border-gray-200 dark:border-emerald-900/60">
                <span>{isBangla ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                <span>৳ {totalAmount}</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-gold-600 text-brand-950 hover:text-white font-extrabold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-md"></span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {isBangla ? `অর্ডার প্লেস করুন (৳ ${totalAmount})` : `Place Order Now (৳ ${totalAmount})`}
                  </span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-gray-500 dark:text-emerald-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isBangla ? '১০০% নিরাপদ ও ক্যাশ অন ডেলিভারি সুবিধা' : '100% Secure & Cash on Delivery Available'}
              </span>
            </p>
          </div>
        </div>

      </form>

    </div>
  );
}
