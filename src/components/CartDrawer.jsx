'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isCartOpen, closeCartDrawer, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { isBangla } = useThemeLanguage();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 2500;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleGoToCheckout = () => {
    closeCartDrawer();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-Over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#112318] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-emerald-100 dark:border-[#1d3b28] transition-colors">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-900 to-emerald-900 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-secondary" />
              <h3 className="font-bold text-base sm:text-lg">
                {isBangla ? `আপনার শপিং কার্ট (${totalItems})` : `Your Shopping Cart (${totalItems})`}
              </h3>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 px-4 py-3 border-b border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-900 dark:text-emerald-200 mb-1.5">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-secondary" />
                {remainingForFree > 0 ? (
                  <span>
                    {isBangla 
                      ? <>আর ৳ {remainingForFree} টাকার অর্ডার করলেই <strong>ফ্রি ডেলিভারি!</strong></> 
                      : <>Add ৳ {remainingForFree} more for <strong>FREE Delivery!</strong></>}
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    {isBangla ? '🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!' : '🎉 Congratulations! You unlocked FREE Delivery!'}
                  </span>
                )}
              </div>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-900 dark:bg-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100 dark:divide-emerald-900/40 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-brand-900 dark:text-emerald-300">
                  <ShoppingBag className="w-8 h-8 text-brand-700 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-emerald-100 text-base">
                  {isBangla ? 'আপনার কার্টটি একদম খালি!' : 'Your cart is completely empty!'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-emerald-400 max-w-xs">
                  {isBangla 
                    ? 'আপনার পছন্দের স্বাস্থ্যকর খাবারগুলো কার্টে যোগ করে অর্ডার সম্পন্ন করুন।' 
                    : 'Add your favorite healthy & organic foods to cart and proceed to checkout.'}
                </p>
                <button
                  onClick={closeCartDrawer}
                  className="mt-2 bg-brand-900 hover:bg-brand-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all"
                >
                  {isBangla ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.cartItemId} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-emerald-900/60 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-emerald-100 truncate">{item.name}</h5>
                    <p className="text-[11px] text-gray-500 dark:text-emerald-400 font-medium">
                      {isBangla ? `পরিমাণ: ${item.weight}` : `Variant: ${item.weight}`}
                    </p>
                    
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-brand-900 dark:text-emerald-300">
                        ৳ {item.price * item.quantity}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 dark:border-emerald-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-black/30">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-700 dark:text-emerald-200 hover:bg-gray-200 dark:hover:bg-emerald-900/60 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-900 dark:text-emerald-100">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-700 dark:text-emerald-200 hover:bg-gray-200 dark:hover:bg-emerald-900/60 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-1.5 text-gray-400 dark:text-emerald-600 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title={isBangla ? 'মুছে ফেলুন' : 'Remove'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-black/30 border-t border-gray-200 dark:border-emerald-900/60 space-y-3">
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600 dark:text-emerald-300">
                  <span>{isBangla ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                  <span className="font-bold text-gray-900 dark:text-emerald-100">৳ {subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-emerald-300">
                  <span>{isBangla ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {isBangla ? 'চেকআউট পেজে যুক্ত হবে' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-brand-900 dark:text-secondary pt-2 border-t border-gray-200 dark:border-emerald-900/60">
                  <span>{isBangla ? 'সর্বমোট:' : 'Total:'}</span>
                  <span>৳ {subtotal}</span>
                </div>
              </div>

              <button
                onClick={handleGoToCheckout}
                className="w-full bg-secondary hover:bg-gold-600 text-brand-950 hover:text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
              >
                <span>{isBangla ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-gray-500 dark:text-emerald-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isBangla ? 'ক্যাশ অন ডেলিভারিতে নিরাপদ কেনাকাটা' : 'Safe shopping with Cash on Delivery'}
                </span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
