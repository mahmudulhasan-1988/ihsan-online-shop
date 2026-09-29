'use client';

import React, { useState } from 'react';
import { trackOrder } from '@/lib/api';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  MapPin, 
  Phone 
} from 'lucide-react';

export default function TrackOrderPage() {
  const [identifier, setIdentifier] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('দয়া করে অর্ডার আইডি অথবা আপনার মোবাইল নম্বর লিখুন');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await trackOrder(identifier.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'কোনো অর্ডার খুঁজে পাওয়া যায়নি। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setError('সার্ভারে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Status index mapping for stepper
  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 1;
      case 'processing':
      case 'confirmed': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.status) : 1;

  const steps = [
    { step: 1, title: 'অর্ডার গৃহীত', desc: 'অর্ডার সিস্টেমে গ্রহণ করা হয়েছে' },
    { step: 2, title: 'প্রসেসিং ও প্যাকিং', desc: 'খাঁটি পণ্য নির্বাচন ও প্যাকিং চলছে' },
    { step: 3, title: 'ডেলিভারিতে রওয়ানা', desc: 'কুরিয়ার রাইডারের কাছে হস্তান্তর করা হয়েছে' },
    { step: 4, title: 'সফল ডেলিভারি', desc: 'গ্রাহকের হাতে পণ্য হস্তান্তর সম্পন্ন' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-24 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-brand-800 bg-emerald-100 px-3 py-1 rounded-full uppercase">
          লাইভ ট্র্যাকিং
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          আপনার অর্ডার ট্র্যাক করুন
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          আপনার অর্ডার আইডি (যেমন: GB-2024-1001) অথবা অর্ডারে ব্যবহৃত মোবাইল নম্বর লিখুন
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-md border border-gray-200 flex items-center gap-2">
        <input
          type="text"
          required
          placeholder="অর্ডার আইডি বা মোবাইল নম্বর দিন..."
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-900 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>ট্র্যাক করুন</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-xl mx-auto bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Timeline & Details */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <span className="text-xs text-gray-500">অর্ডার নম্বর:</span>
              <h3 className="text-lg sm:text-xl font-black text-brand-900">{order.orderId}</h3>
            </div>
            <div>
              <span className="text-xs text-gray-500">বর্তমান অবস্থা:</span>
              <span className="block text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-center mt-0.5">
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {steps.map((s) => {
              const isCompleted = currentStep >= s.step;
              const isCurrent = currentStep === s.step;

              return (
                <div
                  key={s.step}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 border-brand-900 shadow-md ring-2 ring-brand-900/20'
                      : isCompleted
                      ? 'bg-white border-emerald-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-brand-900 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : s.step}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{s.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs sm:text-sm">
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-900" />
                <span>গ্রাহকের বিবরণ:</span>
              </h4>
              <p className="text-gray-700">নাম: <strong>{order.customerName}</strong></p>
              <p className="text-gray-700">মোবাইল: <strong>{order.customerPhone}</strong></p>
              <p className="text-gray-700">ঠিকানা: {order.deliveryAddress}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-900" />
                <span>পেমেন্ট ও ডেলিভারি:</span>
              </h4>
              <p className="text-gray-700">পেমেন্ট মেথড: <strong>{order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ/নগদ'}</strong></p>
              <p className="text-gray-700">ডেলিভারি এলাকা: {order.deliveryZone === 'inside_dhaka' ? 'ঢাকার ভেতরে (৳৭০)' : 'ঢাকার বাইরে (৳১২০)'}</p>
              <p className="text-gray-900 font-extrabold">মোট প্রদেয় টাকা: ৳ {order.totalAmount}</p>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">অর্ডারকৃত পণ্য তালিকা:</h4>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-[11px] text-gray-500">পরিমাণ: {item.weight} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-900">৳ {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
