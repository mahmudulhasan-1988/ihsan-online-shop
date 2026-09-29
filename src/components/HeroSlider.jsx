'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  Truck, 
  Zap,
  ShoppingBag,
  Award
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

export default function HeroSlider({ banners = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const { openFastOrder } = useCart();
  const { isBangla, t, isDark } = useThemeLanguage();

  const slides = useMemo(() => {
    return [
      {
        id: 1,
        title: isBangla ? '১০০% খাঁটি সুন্দরবনের খলিসা ও কালোজিরা মধু' : '100% Pure Sundarban Wild Raw Honey',
        subtitle: isBangla 
          ? 'প্রকৃতির আসল নির্যাস, সরাসরি সুন্দরবনের চাক ও মৌয়ালদের থেকে সংগৃহীত শতভাগ খাঁটি ও অপ্রক্রিয়াজাত কাঁচা মধু।' 
          : 'Nature’s supreme organic gift, raw unfiltered honey harvested sustainably from the pristine Sundarbans.',
        badge: isBangla ? '🌿 প্রাকৃতিক ও ল্যাব টেস্টেড ১০০% পিউর' : '🌿 100% Natural & Lab Certified Pure',
        price: isBangla ? '৯৫০৳' : '৳ 950',
        regularPrice: isBangla ? '১১০০৳' : '৳ 1100',
        discount: isBangla ? '১৪% ছাড়' : '14% OFF',
        buttonText: isBangla ? 'অর্ডার করুন এখনই' : 'Order Now',
        link: '/products?category=honey',
        categoryTab: isBangla ? '🍯 খাঁটি মধু' : '🍯 Pure Honey',
        bgGradient: 'from-amber-950/80 via-emerald-950/60 to-black/80',
        glowColor: 'bg-amber-500/20',
        // Full Width & Full Height Background Image (Pure Raw Honey & Honeycomb)
        bgImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1920&q=85',
        // Showcase Card Image
        image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
        points: isBangla 
          ? ['কোনো চিনি বা কৃত্রিম মিষ্টি নেই', 'ল্যাব টেস্টেড প্রিমিয়াম কোয়ালিটি', 'রোগ প্রতিরোধ ক্ষমতা বাড়ায়'] 
          : ['Zero added sugars or chemicals', 'Certified lab tested purity', 'Boosts natural immunity & health'],
        rating: isBangla ? '৪.৯' : '4.9',
        reviewsCount: isBangla ? '১,৪৫০+ রিভিউ' : '1,450+ Reviews',
        productData: {
          name: isBangla ? 'সুন্দরবন খলিসা ফুলের খাঁটি মধু' : 'Sundarban Kholisa Flower Honey',
          price: 950,
          regularPrice: 1100,
          images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'],
          unit: isBangla ? '১ কেজি' : '1 kg'
        }
      },
      {
        id: 2,
        title: isBangla ? 'ঐতিহ্যবাহী খাঁটি গাওয়া ঘি ও ঘানি ভাঙা সরিষার তেল' : 'Pure Grass-fed Cow Ghee & Cold Pressed Mustard Oil',
        subtitle: isBangla 
          ? 'গ্রামের খাঁটি গরুর দুধের ননী থেকে প্রস্তুত গাওয়া ঘি এবং কাঠের ঘানিতে ভাঙানো ঝাঁজালো খাঁটি সরিষার তেল।' 
          : 'Traditional rich aroma from pure cow milk and cold-pressed mustard oil with authentic taste.',
        badge: isBangla ? '🔥 হট ডিল - খাঁটি স্বাদের নিশ্চয়তা' : '🔥 Best Seller - Authentic Pure Taste',
        price: isBangla ? '১৩৫০৳' : '৳ 1350',
        regularPrice: isBangla ? '১৫০০৳' : '৳ 1500',
        discount: isBangla ? '১০% ছাড়' : '10% OFF',
        buttonText: isBangla ? 'কালেকশন দেখুন' : 'Explore Items',
        link: '/products?category=oil',
        categoryTab: isBangla ? '🧈 ঘি ও সরিষার তেল' : '🧈 Ghee & Mustard Oil',
        bgGradient: 'from-[#38220b]/85 via-[#1a261a]/60 to-black/80',
        glowColor: 'bg-amber-500/20',
        // Full Width & Full Height Background Image (Cold Pressed Oil & Ghee Environment)
        bgImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1920&q=85',
        // Showcase Card Image
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
        points: isBangla 
          ? ['কোনো রাসায়নিক বা প্রিজারভেটিভ নেই', 'রান্নায় অপূর্ব সুবাস ও স্বাদ', 'শতভাগ স্বাস্থ্যসম্মত'] 
          : ['No artificial additives or preservatives', 'Rich authentic culinary aroma', '100% Healthy and nutrient-dense'],
        rating: isBangla ? '৫.০' : '5.0',
        reviewsCount: isBangla ? '৯৮০+ রিভিউ' : '980+ Reviews',
        productData: {
          name: isBangla ? 'খাঁটি গাওয়া ঘি (প্রিমিয়াম কোয়ালিটি)' : 'Premium Pure Cow Ghee',
          price: 1350,
          regularPrice: 1500,
          images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'],
          unit: isBangla ? '১ কেজি' : '1 kg'
        }
      },
      {
        id: 3,
        title: isBangla ? 'মদিনার ফ্রেশ আজওয়া খেজুর ও স্পেশাল ড্রাই ফ্রুটস' : 'Fresh Madinah Ajwa Dates & Special Nut Mix',
        subtitle: isBangla 
          ? 'পবিত্র মদিনা মনোয়ারা থেকে সরাসরি আমদানিকৃত প্রিমিয়াম গ্রেড-১ সফট আজওয়া খেজুর এবং ৯ উপাদানের বাদাম মিক্স।' 
          : 'Hand-sorted soft Grade-1 Ajwa dates imported from Madinah paired with 9-nut energy mix.',
        badge: isBangla ? '⭐ স্পেশাল ইম্পোর্টেড গ্রেড-১' : '⭐ Premium Imported Grade-1',
        price: isBangla ? '৮৫০৳' : '৳ 850',
        regularPrice: isBangla ? '১০৫০৳' : '৳ 1050',
        discount: isBangla ? '১৯% ছাড়' : '19% OFF',
        buttonText: isBangla ? 'এখনই কিনুন' : 'Shop Dates',
        link: '/products?category=nuts-seeds',
        categoryTab: isBangla ? '🌴 খেজুর ও ড্রাই ফ্রুটস' : '🌴 Dates & Nuts',
        bgGradient: 'from-[#2b170c]/85 via-[#15291d]/60 to-black/80',
        glowColor: 'bg-amber-600/20',
        // Full Width & Full Height Background Image (Premium Dry Fruits, Nuts & Dates)
        bgImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=85',
        // Showcase Card Image
        image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1000&q=80',
        points: isBangla 
          ? ['তাজা, নরম ও অত্যন্ত সুস্বাদু', 'প্রচুর ভিটামিন ও আয়রন সমৃদ্ধ', 'তাত্ক্ষণিক শক্তি ও পুষ্টি যোগায়'] 
          : ['Fresh, soft & deliciously sweet', 'High in iron, fiber & antioxidants', 'Instant natural energy booster'],
        rating: isBangla ? '৪.৯' : '4.9',
        reviewsCount: isBangla ? '৮৭০+ রিভিউ' : '870+ Reviews',
        productData: {
          name: isBangla ? 'স্পেশাল মিক্সড ড্রাই ফ্রুটস ও নাটস' : 'Special Mixed Dry Fruits & Nuts',
          price: 850,
          regularPrice: 1050,
          images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'],
          unit: isBangla ? '৫০০ গ্রাম' : '500 gm'
        }
      },
      {
        id: 4,
        title: isBangla ? 'প্রাকৃতিক অর্গানিক চিয়া সিড ও স্বাস্থ্যকর সুপারফুড' : 'Natural Organic Chia Seeds & Vital Superfoods',
        subtitle: isBangla 
          ? 'ওজন নিয়ন্ত্রণ ও ফিটনেস বজায় রাখার জন্য উচ্চমানের ওমেগা-৩ ও ফাইবার সমৃদ্ধ প্রিমিয়াম অর্গানিক চিয়া সিড।' 
          : 'High-purity organic chia seeds packed with Omega-3 and dietary fiber for supreme health.',
        badge: isBangla ? '💪 ডায়েট ও ফিটনেসের সেরা সঙ্গী' : '💪 Best for Diet & Healthy Fitness',
        price: isBangla ? '৪৫০৳' : '৳ 450',
        regularPrice: isBangla ? '৫৫০৳' : '৳ 550',
        discount: isBangla ? '১৮% ছাড়' : '18% OFF',
        buttonText: isBangla ? 'অর্ডার করুন' : 'Order Now',
        link: '/products?category=nuts-seeds',
        categoryTab: isBangla ? '🌱 চিয়া সিড ও সুপারফুড' : '🌱 Chia Seeds',
        bgGradient: 'from-[#0d261a]/90 via-[#0a1e15]/65 to-black/80',
        glowColor: 'bg-emerald-500/20',
        // Full Width & Full Height Background Image (Organic Chia Seeds & Healthy Bowl)
        bgImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1920&q=85',
        // Showcase Card Image
        image: 'https://images.unsplash.com/photo-1505253758473-96b46deae2cd?auto=format&fit=crop&w=1000&q=80',
        points: isBangla 
          ? ['ওজন কমাতে ও হজমে অত্যন্ত কার্যকর', 'প্রচুর ওমেগা-৩ ও ডায়েটরি ফাইবার', '১০০% অরজিনাল ও প্রাকৃতিক'] 
          : ['Promotes weight loss & digestion', 'Loaded with Omega-3 & vital minerals', '100% Certified pure organic'],
        rating: isBangla ? '৪.৮' : '4.8',
        reviewsCount: isBangla ? '৬২০+ রিভিউ' : '620+ Reviews',
        productData: {
          name: isBangla ? 'প্রাকৃতিক অর্গানিক সিয়া সিড (Chia Seeds)' : 'Organic Chia Seeds',
          price: 450,
          regularPrice: 550,
          images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
          unit: isBangla ? '৫০০ গ্রাম' : '500 gm'
        }
      }
    ];
  }, [isBangla]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      className="relative mx-2 sm:mx-4 my-3 sm:my-6 max-w-[1920px] lg:mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Banner Container - FULL WIDTH & FULL HEIGHT COVER */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 dark:border-[#21432f] bg-slate-950">
        
        {/* Slides Track */}
        <div 
          className="flex transition-transform duration-700 ease-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="w-full flex-shrink-0 min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] text-white relative flex items-center overflow-hidden py-10 sm:py-16"
            >
              {/* 🌟 FULL WIDTH & FULL HEIGHT BACKGROUND IMAGE */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img
                  src={slide.bgImage || slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
                />
                {/* Multi-layered cinematic gradient overlays for pristine readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/60 dark:from-[#040e08]/95 dark:via-[#07190f]/85 dark:to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                <div className={`absolute inset-0 opacity-40 mix-blend-overlay bg-gradient-to-br ${slide.bgGradient}`} />
              </div>

              {/* Organic Ambient Glowing Lights */}
              <div className={`absolute -right-20 -top-20 w-[550px] h-[550px] rounded-full blur-3xl pointer-events-none ${slide.glowColor}`} />
              <div className="absolute -left-20 -bottom-20 w-[450px] h-[450px] bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
              
              {/* Subtle Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:28px_28px] pointer-events-none" />

              {/* Slide Content Grid */}
              <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                
                {/* Left: Text & Actions (7 Columns) */}
                <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
                  
                  {/* Top Badge & Discount Pill */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    {slide.badge && (
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>{slide.badge}</span>
                      </div>
                    )}
                    {slide.discount && (
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-brand-950 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full shadow-md">
                        <Zap className="w-4 h-4 fill-current" />
                        {slide.discount}
                      </span>
                    )}
                  </div>

                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.18] text-white drop-shadow-xl">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-emerald-100/90 text-sm sm:text-lg lg:text-xl max-w-2xl font-normal leading-relaxed drop-shadow">
                    {slide.subtitle}
                  </p>

                  {/* Benefit Points */}
                  {slide.points && slide.points.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center lg:justify-start pt-1">
                      {slide.points.map((pt, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-2 text-xs sm:text-sm text-emerald-100 bg-black/40 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl font-medium shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>{pt}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    
                    {/* Price Block */}
                    {slide.price && (
                      <div className="flex items-baseline gap-2.5 bg-black/60 backdrop-blur-md border border-white/25 px-5 py-2.5 rounded-2xl shadow-xl">
                        <span className="text-2xl sm:text-4xl font-black text-amber-400">
                          {slide.price}
                        </span>
                        {slide.regularPrice && (
                          <span className="text-sm sm:text-lg text-gray-400 line-through">
                            {slide.regularPrice}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA 1: Fast Order */}
                    {slide.productData ? (
                      <button
                        onClick={() => openFastOrder(slide.productData)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-secondary to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-brand-950 font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
                      >
                        <Zap className="w-5 h-5 fill-brand-950" />
                        <span>{isBangla ? '১-ক্লিক ফাস্ট অর্ডার' : '1-Click Fast Order'}</span>
                      </button>
                    ) : null}

                    {/* CTA 2: Explore Button */}
                    <Link
                      href={slide.link || '/products'}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-7 py-4 rounded-2xl border border-white/25 transition-all text-sm sm:text-base shadow-lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>{slide.buttonText || (isBangla ? 'পণ্য দেখুন' : 'Explore')}</span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                  </div>

                </div>

                {/* Right: Big Showcase Card (5 Columns) */}
                <div className="lg:col-span-5 flex justify-center items-center relative">
                  <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] lg:w-[440px] lg:h-[440px] group">
                    
                    {/* Glowing Aura Ring */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400/30 via-emerald-400/20 to-teal-400/30 blur-3xl group-hover:blur-3xl transition-all duration-500" />

                    {/* Showcase Image */}
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl bg-black/50 backdrop-blur-sm">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>

                    {/* Floating Trust Card 1: Top Right (Reviews / Rating) */}
                    <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-white/95 dark:bg-[#112419]/95 backdrop-blur-md text-gray-900 dark:text-gray-100 px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-[#22442f] flex items-center gap-3 transform group-hover:-translate-y-1 transition-transform">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-500">
                        <Star className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-black text-sm sm:text-base">
                          <span>{slide.rating}</span>
                          <span className="text-xs text-gray-400 font-normal">/ ৫.০</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">{slide.reviewsCount}</p>
                      </div>
                    </div>

                    {/* Floating Trust Card 2: Bottom Left (100% Pure Guarantee) */}
                    <div className="absolute -bottom-3 sm:-bottom-4 -left-3 sm:-left-4 bg-brand-900/95 dark:bg-[#0d2218]/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center gap-3 transform group-hover:translate-y-1 transition-transform">
                      <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                          {isBangla ? '১০০% খাঁটি ও নির্ভেজাল' : '100% Pure & Organic'}
                        </h4>
                        <p className="text-xs text-emerald-200 leading-none mt-0.5">
                          {isBangla ? 'ল্যাব টেস্টেড গ্যারান্টি' : 'Lab Tested Guarantee'}
                        </p>
                      </div>
                    </div>

                    {/* Floating Trust Card 3: Free Delivery Pill */}
                    <div className="hidden sm:flex absolute top-1/2 -left-6 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg border border-white/20 items-center gap-2 text-xs font-semibold">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>{t('freeDelivery')}</span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrow Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3.5 sm:p-4 bg-black/50 hover:bg-black/80 text-white rounded-2xl backdrop-blur-md border border-white/25 transition-all transform hover:scale-110 active:scale-95 z-20 shadow-xl"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3.5 sm:p-4 bg-black/50 hover:bg-black/80 text-white rounded-2xl backdrop-blur-md border border-white/25 transition-all transform hover:scale-110 active:scale-95 z-20 shadow-xl"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Dynamic Progress Bar (Timer Indicator) */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/15 z-20 overflow-hidden">
          <div 
            key={currentSlide}
            className={`h-full bg-gradient-to-r from-amber-400 via-secondary to-yellow-400 ${!isPaused ? 'animate-[heroProgress_6.5s_linear_infinite]' : ''}`}
            style={{ width: '100%' }}
          />
        </div>

      </div>

      {/* Quick Category Navigation Tabs below Slider */}
      <div className="mt-4 flex justify-center items-center">
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all text-left shadow-sm ${
                currentSlide === idx
                  ? 'bg-emerald-100/95 dark:bg-[#153424] border-brand-700 dark:border-emerald-500 shadow-md text-brand-950 dark:text-emerald-300 font-bold scale-[1.03]'
                  : 'bg-white dark:bg-[#112318] border-[#e2ece3] dark:border-[#1d3d29] hover:border-emerald-300 dark:hover:border-emerald-600 text-gray-700 dark:text-gray-300 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-lg sm:text-xl">{s.categoryTab?.split(' ')[0]}</span>
                <span className="text-xs sm:text-sm truncate">{s.categoryTab?.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${currentSlide === idx ? 'bg-brand-700 dark:bg-emerald-400 scale-125' : 'bg-gray-300 dark:bg-gray-700'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Tailwind Keyframe Animation for Progress Bar */}
      <style jsx global>{`
        @keyframes heroProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
