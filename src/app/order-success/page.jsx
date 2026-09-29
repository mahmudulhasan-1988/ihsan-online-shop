'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { trackOrder } from '@/lib/api';
import { CheckCircle2, Truck, Home, PhoneCall, Printer, Copy, Check } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await trackOrder(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Error fetching order invoice', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-xl space-y-6 text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase">
            অর্ডার সফল হয়েছে!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
            আমাদের কাস্টমার প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।
          </p>
        </div>

        {/* Order ID Box */}
        {orderId && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 inline-flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-semibold text-gray-600">অর্ডার ট্র্যাকিং আইডি:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-brand-900 bg-white px-3 py-1 rounded-xl border border-emerald-300">
                {orderId}
              </span>
              <button
                onClick={copyOrderId}
                className="p-1.5 bg-white hover:bg-gray-100 rounded-lg border text-gray-600 hover:text-brand-900 transition-colors"
                title="কপি করুন"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Order Details Invoice */}
        {order && (
          <div className="text-left bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">অর্ডার ইনভয়েস</h4>
              <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('bn-BD')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                <p>ফোন: {order.customerPhone}</p>
                <p className="text-gray-500">ঠিকানা: {order.deliveryAddress}</p>
              </div>
              <div>
                <p>পেমেন্ট পদ্ধতি: <strong>{order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ / নগদ'}</strong></p>
                <p>ডেলিভারি এলাকা: <strong>{order.deliveryZone === 'inside_dhaka' ? 'ঢাকার ভেতরে (৳৭০)' : 'ঢাকার বাইরে (৳১২০)'}</strong></p>
                <p>বর্তমান স্ট্যাটাস: <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-xs">{order.status}</span></p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <p className="font-bold text-gray-900">অর্ডারকৃত পণ্যসমূহ:</p>
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span>{item.name} ({item.weight}) × {item.quantity}</span>
                  <span className="font-bold text-gray-900">৳ {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm sm:text-base font-black text-brand-900">
              <span>সর্বমোট প্রদেয়:</span>
              <span>৳ {order.totalAmount}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/track-order"
            className="bg-brand-900 hover:bg-brand-800 text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>অর্ডার ট্র্যাক করুন</span>
          </Link>

          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </Link>

          <button
            onClick={handlePrint}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-5 py-3 rounded-full text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>ইনভয়েস প্রিন্ট</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">ইনভয়েস লোড হচ্ছে...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
