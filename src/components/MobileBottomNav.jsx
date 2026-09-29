'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Truck, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openCartDrawer, user } = useCart();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  const navItems = [
    { label: 'হোম', icon: <Home className="w-5 h-5" />, href: '/' },
    { label: 'পণ্যসমূহ', icon: <Grid className="w-5 h-5" />, href: '/products' },
    { 
      label: 'কার্ট', 
      icon: (
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      ), 
      isAction: true,
      action: openCartDrawer 
    },
    { label: 'ট্র্যাকিং', icon: <Truck className="w-5 h-5" />, href: '/track-order' },
    { label: user ? 'প্রোফাইল' : 'লগইন', icon: <User className="w-5 h-5" />, href: user ? '/admin' : '/auth' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl py-2 px-3">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const isActive = item.href && pathname === item.href;

          if (item.isAction) {
            return (
              <button
                key={idx}
                onClick={item.action}
                className="flex flex-col items-center justify-center text-gray-600 hover:text-brand-900 transition-colors p-1"
              >
                {item.icon}
                <span className="text-[10px] font-semibold mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 transition-colors ${
                isActive ? 'text-brand-900 font-bold scale-105' : 'text-gray-600 hover:text-brand-900'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
