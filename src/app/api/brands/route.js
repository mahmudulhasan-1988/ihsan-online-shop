import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const INITIAL_BRANDS = [
  { id: 1, name: 'ইহসান অর্গানিক', name_bn: 'ইহসান অর্গানিক', name_en: 'Ihsan Organic', slug: 'ihsan-organic', logo: '🌿', status: 'active' },
  { id: 2, name: 'সুন্দরবন হানি কোং', name_bn: 'সুন্দরবন হানি কোং', name_en: 'Sundarban Honey Co.', slug: 'sundarban-honey', logo: '🍯', status: 'active' },
  { id: 3, name: 'গাওয়া পিউর ডেইরি', name_bn: 'গাওয়া পিউর ডেইরি', name_en: 'Gawa Pure Dairy', slug: 'gawa-pure-dairy', logo: '🧈', status: 'active' },
  { id: 4, name: 'মদিনা ডেইটস', name_bn: 'মদিনা ডেইটস', name_en: 'Madinah Dates', slug: 'madinah-dates', logo: '🌴', status: 'active' },
  { id: 5, name: 'খাস ফুড', name_bn: 'খাস ফুড', name_en: 'Khaas Food', slug: 'khaas-food', logo: '🌾', status: 'active' }
];

export async function GET() {
  try {
    const db = await getDb();
    if (db) {
      let brands = await db.collection('brands').find({}).toArray();
      if (brands.length === 0) {
        await db.collection('brands').insertMany(INITIAL_BRANDS);
        brands = INITIAL_BRANDS;
      }
      return NextResponse.json({
        success: true,
        total: brands.length,
        data: brands.map(b => ({ ...b, id: b._id ? b._id.toString() : b.id, _id: b._id ? b._id.toString() : b.id }))
      });
    }
    return NextResponse.json({ success: true, total: INITIAL_BRANDS.length, data: INITIAL_BRANDS });
  } catch (error) {
    console.error('Next.js GET /api/brands error:', error);
    return NextResponse.json({ success: true, total: INITIAL_BRANDS.length, data: INITIAL_BRANDS });
  }
}

export async function POST(request) {
  try {
    const db = await getDb();
    const body = await request.json().catch(() => ({}));
    const newBrand = {
      name: body.name || 'New Brand',
      name_bn: body.name_bn || body.name || 'নতুন ব্র্যান্ড',
      name_en: body.name_en || body.name || 'New Brand',
      slug: body.slug || String(body.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-') || `brand-${Date.now()}`,
      logo: body.logo || '🏷️',
      status: body.status || 'active',
      createdAt: new Date()
    };
    if (db) {
      const result = await db.collection('brands').insertOne(newBrand);
      return NextResponse.json({
        success: true,
        message: 'Brand created successfully',
        data: { id: result.insertedId.toString(), _id: result.insertedId.toString(), ...newBrand }
      }, { status: 201 });
    }
    return NextResponse.json({ success: true, message: 'Brand created', data: newBrand }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
