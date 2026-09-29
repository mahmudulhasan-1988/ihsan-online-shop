'use client';

import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ToastNotification() {
  const { toast } = useCart();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200 max-w-sm">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-white text-xs sm:text-sm font-semibold border ${
          isError
            ? 'bg-red-600 border-red-500'
            : isInfo
            ? 'bg-blue-600 border-blue-500'
            : 'bg-brand-900 border-emerald-700'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
        ) : isInfo ? (
          <Info className="w-5 h-5 text-white flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
