'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CategoryNav from '@/components/CategoryNav';
import { getProducts, getCategories } from '@/lib/api';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          getProducts({
            category: categoryParam !== 'all' ? categoryParam : undefined,
            search: searchParam || undefined,
            sort: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : undefined,
          }),
          getCategories(),
        ]);

        setProducts(pRes?.data || []);
        setCategories(cRes?.data || []);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [categoryParam, searchParam, sortBy]);

  return (
    <div className="pb-16">
      {/* Category Pills Bar */}
      <CategoryNav categories={categories} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Page Title & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {searchParam
                ? `খোঁজের ফলাফল: "${searchParam}"`
                : categoryParam !== 'all'
                ? `ক্যাটাগরি: ${categoryParam}`
                : 'সকল প্রিমিয়াম পণ্যসমূহ'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              মোট {products.length} টি পণ্য পাওয়া গেছে
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-900" />
              সাজান:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-900"
            >
              <option value="newest">সর্বশেষ যুক্ত</option>
              <option value="price_asc">মূল্য: কম থেকে বেশি</option>
              <option value="price_desc">মূল্য: বেশি থেকে কম</option>
              <option value="rating">সেরা রেটিং</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3">
                <div className="bg-gray-200 aspect-square rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm border border-gray-100 space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-gray-900">কোনো পণ্য পাওয়া যায়নি!</h3>
            <p className="text-xs text-gray-500">
              আপনার কাঙ্ক্ষিত পণ্যটি অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজে দেখুন অথবা সব পণ্য দেখুন।
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">পণ্যসমূহ লোড হচ্ছে...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
