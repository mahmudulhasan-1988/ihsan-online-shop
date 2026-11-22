import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Helper to format document
function formatDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id ? doc._id.toString() : doc.id,
    _id: doc._id ? doc._id.toString() : doc.id,
  };
}

// GET /api/products - Get Products with filtering
export async function GET(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sellerId = searchParams.get('sellerId');
    const limit = Number(searchParams.get('limit')) || 200;

    let filter = {};

    if (category && category !== 'all') {
      filter.$or = [
        { categorySlug: category },
        { category_slug: category },
        { category: category },
        { category_name: category }
      ];
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { name_bn: { $regex: q, $options: 'i' } },
        { name_en: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    if (sellerId && sellerId !== 'all') {
      const sStr = String(sellerId);
      const sConds = [
        { seller_id: sellerId },
        { seller_id: sStr },
        { sellerId: sellerId },
        { sellerId: sStr },
        { seller_email: sellerId },
        { seller_phone: sellerId },
        { seller_name: sellerId },
        { shop_name: sellerId }
      ];
      if (!isNaN(Number(sellerId))) {
        sConds.push({ seller_id: Number(sellerId) });
        sConds.push({ sellerId: Number(sellerId) });
      }
      if (filter.$or) {
        filter = { $and: [{ $or: filter.$or }, { $or: sConds }] };
      } else {
        filter.$or = sConds;
      }
    }

    const products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: products.map(formatDoc),
      total: products.length
    });
  } catch (error) {
    console.error('Next.js GET /api/products error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/products - Create New Product
export async function POST(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, price } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ success: false, message: 'পণ্যের নাম ও বিক্রয়মূল্য প্রদান করুন' }, { status: 400 });
    }

    const newProd = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(newProd);
    newProd._id = result.insertedId;
    newProd.id = result.insertedId.toString();

    return NextResponse.json({
      success: true,
      message: 'পণ্য সফলভাবে যুক্ত হয়েছে',
      data: formatDoc(newProd)
    }, { status: 201 });
  } catch (error) {
    console.error('Next.js POST /api/products error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
