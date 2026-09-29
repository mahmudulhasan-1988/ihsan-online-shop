'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  getProducts, 
  getProductById, 
  getReviews, 
  submitReview 
} from '@/lib/api';
import { useCart } from '@/context/CartContext';
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
  Send
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart, openFastOrder, showToast } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success && res.data) {
          const prod = res.data;
          setProduct(prod);
          setSelectedImage(prod.images?.[0] || '');
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
        }
      } catch (err) {
        console.error('Error loading product details', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">পণ্যটি খুঁজে পাওয়া যায়নি!</h2>
        <p className="text-sm text-gray-500 mt-2">দয়া করে অন্য কোনো পণ্য দেখুন।</p>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentRegularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
  const discountPercent = currentRegularPrice > currentPrice
    ? Math.round(((currentRegularPrice - currentPrice) / currentRegularPrice) * 100)
    : product.discountPercentage || 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      showToast('দয়া করে আপনার নাম ও রিভিউ লিখুন', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await submitReview({
        productId: product.id || product._id,
        customerName: reviewerName.trim(),
        rating: reviewerRating,
        comment: reviewerComment.trim(),
      });

      if (res.success) {
        showToast('আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!');
        setReviews([res.data, ...reviews]);
        setReviewerName('');
        setReviewerComment('');
      }
    } catch (err) {
      showToast('রিভিউ যোগ করতে সমস্যা হয়েছে', 'error');
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
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm overflow-hidden aspect-square flex items-center justify-center relative">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
            {discountPercent > 0 && (
              <span className="absolute top-6 left-6 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
                -{discountPercent}% ছাড়
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-brand-900 shadow-md scale-105' : 'border-gray-200 hover:border-gray-400'
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
              <span className="bg-emerald-100 text-brand-900 text-xs font-bold px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>স্টকে আছে ({product.stock || 50} টি)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
            {product.nameEn && (
              <p className="text-sm text-gray-500 mt-1">{product.nameEn}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2 text-amber-500 text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800">{product.rating || 5.0}</span>
              <span className="text-gray-400">({product.ratingCount || 12} টি কাস্টমার রিভিউ)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex items-baseline gap-3">
            <span className="text-3xl font-black text-brand-900">
              ৳ {currentPrice}
            </span>
            {currentRegularPrice > currentPrice && (
              <span className="text-base text-gray-400 line-through">
                ৳ {currentRegularPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                ৳ {currentRegularPrice - currentPrice} সাশ্রয়
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                পরিমাণ সিলেক্ট করুন:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      selectedVariant?.weight === v.weight
                        ? 'bg-brand-900 text-white border-brand-900 shadow-md scale-105'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-brand-700'
                    }`}
                  >
                    {v.weight} - ৳ {v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-700">সংখ্যা:</span>
            <div className="flex items-center border border-gray-300 bg-white rounded-xl overflow-hidden shadow-inner">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-500">
              মোট: <strong>৳ {currentPrice * quantity}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => openFastOrder(product, selectedVariant)}
              className="bg-secondary hover:bg-gold-600 text-brand-950 hover:text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
            >
              <Zap className="w-5 h-5 fill-brand-950 hover:fill-white" />
              <span>১-ক্লিকে সরাসরি অর্ডার</span>
            </button>

            <button
              onClick={() => addToCart(product, selectedVariant, quantity, true)}
              className="bg-brand-900 hover:bg-brand-800 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>কার্টে যোগ করুন</span>
            </button>
          </div>

          {/* Hotline Quick Link */}
          <a
            href="tel:09613827282"
            className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-emerald-50 text-brand-900 rounded-2xl border border-gray-200 transition-colors text-xs font-bold"
          >
            <PhoneCall className="w-4 h-4 text-secondary animate-bounce" />
            <span>ফোনে অর্ডার করতে কল করুন: 09613-827282</span>
          </a>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-gray-600">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700 mb-1" />
              <span className="font-bold">১০০% বিশুদ্ধ</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
              <Truck className="w-5 h-5 text-emerald-700 mb-1" />
              <span className="font-bold">ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-emerald-700 mb-1" />
              <span className="font-bold">সহজ রিটার্ন</span>
            </div>
          </div>

        </div>

      </div>

      {/* Description & Health Benefits Accordion / Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 border-b pb-3 mb-4">
            পণ্যের বিবরণ ও বৈশিষ্ট্য
          </h3>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Benefits list */}
        {product.benefits && product.benefits.length > 0 && (
          <div className="pt-2">
            <h4 className="text-base font-bold text-gray-900 mb-3">
              স্বাস্থ্য উপকারিতা ও বিশেষত্ব:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl text-xs sm:text-sm font-semibold text-brand-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-8">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
            গ্রাহক রিভিউ ও মতামত ({reviews.length})
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">এই পণ্যটি ব্যবহারকারী গ্রাহকদের অভিজ্ঞতা</p>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 space-y-4">
          <h4 className="text-sm font-bold text-gray-800">আপনার রিভিউ লিখুন:</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: তানভীর আহমেদ"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">রেটিং প্রদান করুন *</label>
              <select
                value={reviewerRating}
                onChange={(e) => setReviewerRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-900"
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার অভিজ্ঞতা ও মন্তব্য *</label>
            <textarea
              required
              rows={3}
              placeholder="পণ্যটির স্বাদ, ঘ্রাণ ও গুণমান কেমন লেগেছে জানান..."
              value={reviewerComment}
              onChange={(e) => setReviewerComment(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="bg-brand-900 hover:bg-brand-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
          >
            {isSubmittingReview ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>রিভিউ সাবমিট করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-gray-900">{rev.customerName}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      ভেরিফাইড ক্রেতা
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-gray-400 block">{rev.date || 'সম্প্রতি'}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-gray-900">সম্পর্কিত পণ্যসমূহ</h3>
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
