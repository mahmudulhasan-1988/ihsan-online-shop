import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import TrustBadges from '@/components/TrustBadges';
import ProductSection from '@/components/ProductSection';
import HomePromoBanner from '@/components/HomePromoBanner';
import HomeReviews from '@/components/HomeReviews';
import { getProducts, getCategories, getBanners, getReviews } from '@/lib/api';

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  const [productsRes, categoriesRes, bannersRes, reviewsRes] = await Promise.all([
    getProducts({ limit: 50 }),
    getCategories(),
    getBanners(),
    getReviews('all')
  ]);

  const products = productsRes?.data || [];
  const banners = bannersRes?.data || [];
  const reviews = reviewsRes?.data || [];

  const honeyProducts = products.filter(
    (p) => p.category_id === 1 || p.categorySlug?.includes('honey') || p.category?.includes('মধু') || p.name?.includes('মধু')
  );
  const oilAndGheeProducts = products.filter(
    (p) => p.category_id === 2 || p.category_id === 3 || p.categorySlug?.includes('oil') || p.categorySlug?.includes('ghee') || p.category?.includes('তেল') || p.category?.includes('ঘি') || p.name?.includes('তেল') || p.name?.includes('ঘি')
  );
  const nutsAndDates = products.filter(
    (p) => p.category_id === 4 || p.category_id === 5 || p.categorySlug?.includes('dates') || p.categorySlug?.includes('nuts') || p.categorySlug?.includes('spices') || p.category?.includes('খেজুর') || p.category?.includes('বাদাম') || p.name?.includes('খেজুর') || p.name?.includes('বাদাম') || p.name?.includes('চিয়া')
  );

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      
      {/* Hero Slider */}
      <HeroSlider banners={banners} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* 🌟 POPULAR & ALL BEST SELLING PRODUCTS (Clean View + "Go to All Products Page" button) */}
      <ProductSection
        title="জনপ্রিয় ও সেরা বিক্রিত পণ্যসমূহ"
        titleEn="Popular & Best Selling Products"
        subtitle="আমাদের গ্রাহকদের সবচেয়ে পছন্দের ১০০% খাঁটি ও স্বাস্থ্যকর অর্গানিক খাদ্যপণ্য"
        subtitleEn="Our customer-favorite 100% pure & organic essentials"
        badge="বেস্ট সেলার্স"
        badgeEn="BEST SELLERS"
        products={products}
        viewAllLink="/products"
      />

      {/* Honey Collection */}
      {honeyProducts.length > 0 && (
        <ProductSection
          title="খাঁটি প্রাকৃতিক মধু"
          titleEn="Pure Natural Honey Collection"
          subtitle="সুন্দরবন ও কালোজিরা ক্ষেতের খাঁটি কাঁচা মধুর প্রিমিয়াম কালেকশন"
          subtitleEn="Raw unfiltered honey from Sundarban and Black Cumin flowers"
          badge="১০০% পিউর হানি"
          badgeEn="100% PURE HONEY"
          products={honeyProducts}
          viewAllLink="/products?category=pure-honey"
        />
      )}

      {/* Oil & Ghee Collection */}
      {oilAndGheeProducts.length > 0 && (
        <ProductSection
          title="গাওয়া ঘি ও ঘানি ভাঙা তেল"
          titleEn="Pure Cow Ghee & Cold Pressed Oils"
          subtitle="রান্নায় খাঁটি স্বাদ ও পুষ্টি নিশ্চিত করতে দেশি গাওয়া ঘি এবং সরিষার তেল"
          subtitleEn="Traditional flavor and maximum nutritional benefits for daily cooking"
          badge="খাঁটি স্বাদ"
          badgeEn="PURE TASTE"
          products={oilAndGheeProducts}
          viewAllLink="/products?category=mustard-oil"
        />
      )}

      {/* Nuts & Dates Collection */}
      {nutsAndDates.length > 0 && (
        <ProductSection
          title="প্রিমিয়াম খেজুর, বাদাম ও চিয়া সিড"
          titleEn="Premium Dates, Nuts & Superfoods"
          subtitle="আমদানিকৃত প্রিমিয়াম গ্রেড-১ মানের ড্রাই ফ্রুটস ও পুষ্টিকর সুপারফুড"
          subtitleEn="Imported Grade-A soft dates, mixed nuts, and organic seeds"
          badge="সুপারফুড"
          badgeEn="SUPERFOODS"
          products={nutsAndDates}
          viewAllLink="/products?category=dates-nuts"
        />
      )}

      {/* Promo Banner / Brand Highlight (Right above Customer Feedback) */}
      <HomePromoBanner />

      {/* Customer Reviews & Social Proof */}
      <HomeReviews reviews={reviews} />
    </div>
  );
}
