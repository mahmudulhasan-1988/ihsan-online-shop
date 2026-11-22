import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const DEFAULT_SETTINGS = {
  siteName: 'ইহসান অনলাইন শপ',
  siteTagline: '১০০% খাঁটি ও প্রাকৃতিক পণ্য',
  contactPhone: '09613-827282',
  contactEmail: 'support@ihsan.com',
  maintenanceMode: false,
  allowSellerRegistration: true,
  autoApproveProducts: false,
  allowSellerCoupons: true,
  allowSellerDeleteProducts: true,
  allowSellerOrderStatusUpdate: true,
  defaultCommissionRate: 10,
  minWithdrawalAmount: 500,
  maxProductsPerSeller: 100,
  allowCustomerRegistration: true,
  allowCustomerReviews: true,
  allowGuestCheckout: true,
  allowCashOnDelivery: true,
  allowOnlinePayment: true,
  allowCustomerCancelOrder: true,
  allowWishlist: true,
  insideDhakaShipping: 70,
  outsideDhakaShipping: 130,
  freeDeliveryThreshold: 2000,
  taxRate: 0,
  currency: 'BDT (৳)',
};

export async function GET() {
  try {
    const db = await getDb();
    if (db) {
      const settingDoc = await db.collection('settings').findOne({ key: 'site_settings' });
      const data = settingDoc ? { ...DEFAULT_SETTINGS, ...settingDoc } : DEFAULT_SETTINGS;
      delete data._id;
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('Next.js GET /api/settings error:', error);
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
  }
}

export async function PUT(request) {
  try {
    const db = await getDb();
    const body = await request.json().catch(() => ({}));
    const updated = { ...body, updatedAt: new Date() };
    delete updated._id;

    if (db) {
      await db.collection('settings').updateOne(
        { key: 'site_settings' },
        { $set: { key: 'site_settings', ...updated } },
        { upsert: true }
      );
      return NextResponse.json({
        success: true,
        message: 'Settings saved successfully',
        data: { ...DEFAULT_SETTINGS, ...updated }
      });
    }
    return NextResponse.json({ success: true, message: 'Settings saved', data: { ...DEFAULT_SETTINGS, ...updated } });
  } catch (error) {
    console.error('Next.js PUT /api/settings error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
