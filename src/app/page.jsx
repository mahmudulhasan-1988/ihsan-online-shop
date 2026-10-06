import React from 'react';
import HeroSlider from '@/components/HeroSlider';
import TrustBadges from '@/components/TrustBadges';
import ProductSection from '@/components/ProductSection';
import HomePromoBanner from '@/components/HomePromoBanner';
import HomeReviews from '@/components/HomeReviews';
import { getProducts, getCategories, getBanners, getReviews } from '@/lib/api';

export const revalidate = 0; // Always fresh MongoDB dynamic data

// Category Cover Images & Thematic Metadata (Matched to each category's products)
const CATEGORY_METADATA = {
  'pure-honey': {
    coverImage: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    icon: '🍯',
    badge: '১০০% পিউর হানি',
    badgeEn: '100% PURE HONEY',
    subtitle: 'সুন্দরবন ও কালোজিরা ক্ষেতের খাঁটি কাঁচা মধুর প্রিমিয়াম কালেকশন',
    subtitleEn: 'Raw unfiltered natural honey directly collected from Sundarban and wild flowers'
  },
  'mustard-oil': {
    coverImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80',
    icon: '🛢️',
    badge: 'ঘানি ভাঙা খাঁটি তেল',
    badgeEn: 'COLD PRESSED OIL',
    subtitle: 'কাঠের ঘানি ভাঙা প্রথম চাপের খাঁটি সরিষার তেল ও পুষ্টিকর ভোজ্য তেল',
    subtitleEn: '100% pure cold-pressed organic mustard oil rich in natural aroma and vitamins'
  },
  'pure-ghee': {
    coverImage: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1200&q=80',
    icon: '🧈',
    badge: 'খাঁটি গাওয়া ঘি',
    badgeEn: 'PURE COW GHEE',
    subtitle: 'গ্রামের খামারের খাঁটি মাখন থেকে তৈরি সুগন্ধি ও দানাদার গাওয়া ঘি',
    subtitleEn: 'Rich aromatic traditional cow ghee prepared from pure milk butter'
  },
  'dates-nuts': {
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    icon: '🥜',
    badge: 'সুপারফুড ও ড্রাই ফ্রুটস',
    badgeEn: 'SUPERFOODS & NUTS',
    subtitle: 'মদিনার প্রিমিয়াম আজওয়া খেজুর, খাঁটি চিয়া সিড ও পুষ্টিকর মিক্সড নাটস',
    subtitleEn: 'Imported Grade-1 soft Madinah dates, organic chia seeds, and raw mixed nuts'
  },
  'fashion': {
    coverImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    icon: '👗',
    badge: 'ফ্যাশন ও লাইফস্টাইল',
    badgeEn: 'FASHION & LIFESTYLE',
    subtitle: 'আকর্ষণীয় সিল্ক বুটিক ড্রেস ও ট্রেন্ডি ফ্যাশন পোশাক কালেকশন',
    subtitleEn: 'Exclusive silk boutique dresses and modern fashion wear crafted for elegance'
  },
  'bakery-cake': {
    coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    icon: '🎂',
    badge: 'বেকরি ও কেক আইটেম',
    badgeEn: 'FRESH BAKERY & CAKE',
    subtitle: 'তাজা ও উন্নত উপাদানে প্রস্তুত সুস্বাদু কেক, পেস্ট্রি ও বেকরি খাবার',
    subtitleEn: 'Delicious freshly baked artisan cakes and delightful confectionery'
  },
  'computer-accessories': {
    coverImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
    icon: '💻',
    badge: 'কম্পিউটার ও গেমিং',
    badgeEn: 'TECH & GAMING',
    subtitle: 'হাই-পারফর্মেন্স ওয়্যারলেস গেমিং কন্ট্রোলার, কিবোর্ড ও কম্পিউটার গ্যাজেটস',
    subtitleEn: 'High-performance wireless controllers, keyboards, and computer peripherals'
  },
  'mobile-accessories': {
    coverImage: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1200&q=80',
    icon: '📱',
    badge: 'মোবাইল এক্সেসরিজ',
    badgeEn: 'MOBILE ACCESSORIES',
    subtitle: 'স্টাইলিশ থ্রি-ডি প্রিন্টেড ফোন কেস, কভার ও স্মার্টফোন এক্সেসরিজ',
    subtitleEn: 'Stylish 3D printed phone cases and premium mobile phone accessories'
  },
  'electronic-accessories': {
    coverImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80',
    icon: '🔌',
    badge: 'স্মার্ট ইলেকট্রনিক্স',
    badgeEn: 'SMART ELECTRONICS',
    subtitle: 'স্মার্ট গ্যাজেটস, পাওয়ার এক্সেসরিজ ও দৈনন্দিন ইলেকট্রনিক পণ্য',
    subtitleEn: 'Smart electronic gadgets, charging cables and essential gear'
  },
  'organic-spices': {
    coverImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
    icon: '🌶️',
    badge: 'খাঁটি মসলা',
    badgeEn: 'ORGANIC SPICES',
    subtitle: 'রান্নায় খাঁটি স্বাদ ও নির্ভেজাল সুগন্ধির জন্য অর্গানিক মসলা',
    subtitleEn: 'Pure and authentic organic spices for authentic culinary aroma'
  },
  'rice-grains': {
    coverImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
    icon: '🌾',
    badge: 'চাল ও ডাল',
    badgeEn: 'ORGANIC GRAINS',
    subtitle: 'রাসায়নিকমুক্ত পুষ্টিকর অর্গানিক চাল, ডাল ও প্রাকৃতিক খাদ্যশস্য',
    subtitleEn: 'Chemical-free healthy organic rice, lentils, and wholesome grains'
  }
};

export default async function HomePage() {
  const [productsRes, categoriesRes, bannersRes, reviewsRes] = await Promise.all([
    getProducts({ limit: 100 }),
    getCategories(),
    getBanners(),
    getReviews('all')
  ]);

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const banners = bannersRes?.data || [];
  const reviews = reviewsRes?.data || [];

  // =========================================================================
  // 🔒 STRICT CATEGORY ISOLATION
  // Each product belongs strictly to ONE category section with no cross-mixing
  // =========================================================================
  const categorySections = [];
  const assignedProductIds = new Set();

  categories.forEach((cat) => {
    const cSlug = (cat.slug || '').toLowerCase().trim();
    const cNameBn = (cat.name_bn || cat.name || '').toLowerCase().trim();
    const cNameEn = (cat.name_en || '').toLowerCase().trim();
    const cId = String(cat.id || cat._id || '');

    const matchedProducts = products.filter((p) => {
      const pId = p.id || p._id;
      if (assignedProductIds.has(pId)) return false;

      const pSlug = (p.categorySlug || p.category_slug || '').toLowerCase().trim();
      const pCatName = (p.category || '').toLowerCase().trim();
      const pCatId = String(p.category_id || '');

      // Strict match priority: slug > category name > category_id
      if (pSlug && pSlug === cSlug) return true;
      if (
        pCatName &&
        (pCatName === cSlug ||
          pCatName === cNameBn ||
          pCatName === cNameEn ||
          (cNameBn && pCatName.includes(cNameBn)) ||
          (cNameEn && pCatName.includes(cNameEn)) ||
          (cSlug && pCatName.includes(cSlug)))
      ) {
        return true;
      }
      if (pCatId && pCatId === cId) return true;

      return false;
    });

    if (matchedProducts.length > 0) {
      matchedProducts.forEach((p) => assignedProductIds.add(p.id || p._id));
      const meta = CATEGORY_METADATA[cSlug] || {};

      categorySections.push({
        slug: cSlug,
        title: cat.name_bn || cat.name,
        titleEn: cat.name_en || cat.name,
        subtitle: meta.subtitle || 'আমাদের বিশ্বস্ত সেলারদের সংগৃহীত ১০০% প্রিমিয়াম ও খাঁটি পণ্য',
        subtitleEn: meta.subtitleEn || '100% authentic items curated directly from our trusted sellers',
        badge: meta.badge || cat.name_bn || cat.name,
        badgeEn: meta.badgeEn || cat.name_en || cat.slug,
        icon: meta.icon || cat.icon || '🌿',
        coverImage: cat.cover_image || meta.coverImage || cat.image,
        viewAllLink: `/products?category=${cSlug}`,
        products: matchedProducts
      });
    }
  });

  // Any remaining products not matched in above categories
  const unassignedProducts = products.filter((p) => !assignedProductIds.has(p.id || p._id));

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      
      {/* 1. Hero Slider Banner */}
      <HeroSlider banners={banners} />

      {/* 2. Trust Badges & Guarantee */}
      <TrustBadges />

      {/* 3. Dynamic Category-Wise Product Sections (With Dedicated Cover Images) */}
      {categorySections.map((section) => (
        <ProductSection
          key={section.slug}
          title={section.title}
          titleEn={section.titleEn}
          subtitle={section.subtitle}
          subtitleEn={section.subtitleEn}
          badge={section.badge}
          badgeEn={section.badgeEn}
          icon={section.icon}
          coverImage={section.coverImage}
          products={section.products}
          viewAllLink={section.viewAllLink}
        />
      ))}

      {/* 4. Unassigned / Special Featured Collection (If any exist) */}
      {unassignedProducts.length > 0 && (
        <ProductSection
          title="অন্যান্য স্পেশাল পণ্যসমূহ"
          titleEn="Other Special Products"
          subtitle="আমাদের স্টোরের অন্যান্য বিশেষ আকর্ষণীয় পণ্য"
          subtitleEn="Explore our other featured authentic products"
          badge="স্পেশাল কালেকশন"
          badgeEn="SPECIAL COLLECTION"
          icon="✨"
          coverImage="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
          products={unassignedProducts}
          viewAllLink="/products"
        />
      )}

      {/* 5. Promo Banner / Palestine & Humanitarian Support Notice */}
      <HomePromoBanner />

      {/* 6. Customer Reviews & Social Proof */}
      <HomeReviews reviews={reviews} />
    </div>
  );
}

