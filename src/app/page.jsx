import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import CategoryNav from '@/components/CategoryNav';
import TrustBadges from '@/components/TrustBadges';
import ProductSection from '@/components/ProductSection';
import HomePromoBanner from '@/components/HomePromoBanner';
import HomeReviews from '@/components/HomeReviews';
import { getProducts, getCategories, getBanners, getReviews } from '@/lib/api';

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  const [productsRes, categoriesRes, bannersRes, reviewsRes] = await Promise.all([
    getProducts({ limit: 30 }),
    getCategories(),
    getBanners(),
    getReviews('all')
  ]);

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const banners = bannersRes?.data || [];
  const reviews = reviewsRes?.data || [];

  const featuredProducts = products.filter((p) => p.isFeatured);
  const honeyProducts = products.filter((p) => p.categorySlug === 'honey');
  const oilAndGheeProducts = products.filter((p) => p.categorySlug === 'oil' || p.categorySlug === 'ghee');
  const nutsAndDates = products.filter((p) => p.categorySlug === 'dates' || p.categorySlug === 'nuts-seeds');

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Category Horizontal Nav */}
      <CategoryNav categories={categories} />

      {/* Hero Slider */}
      <HeroSlider banners={banners} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Featured / Best Sellers */}
      <ProductSection
        title="জনপ্রিয় ও সেরা বিক্রিত পণ্যসমূহ"
        titleEn="Popular & Best Selling Products"
        subtitle="আমাদের গ্রাহকদের সবচেয়ে পছন্দের ১০০% খাঁটি ও নির্ভেজাল পণ্য"
        subtitleEn="Our customer-favorite 100% pure & organic essentials"
        badge="বেস্ট সেলার্স"
        badgeEn="BEST SELLERS"
        products={featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)}
        viewAllLink="/products"
      />

      {/* Promo Banner / Brand Highlight */}
      <HomePromoBanner />

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
          viewAllLink="/products?category=honey"
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
          viewAllLink="/products?category=oil"
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
          viewAllLink="/products?category=nuts-seeds"
        />
      )}

      {/* Customer Reviews & Social Proof */}
      <HomeReviews reviews={reviews} />
    </div>
  );
}

