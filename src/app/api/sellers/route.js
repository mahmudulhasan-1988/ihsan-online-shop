import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper to format MongoDB document for client response
function formatDoc(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id ? _id.toString() : doc.id,
    _id: _id ? _id.toString() : doc._id,
    ...rest
  };
}

// Helper to strip any legacy Unsplash demo placeholder URLs
function sanitizePhotoUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.includes('unsplash.com/photo-1542838132') ||
    trimmed.includes('unsplash.com/photo-1535713875002') ||
    trimmed.includes('placeholder')
  ) {
    return '';
  }
  return trimmed;
}

// GET /api/sellers - Fetch all sellers with genuine registration/Google email photos from MongoDB
export async function GET(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 1. Fetch all seller users from users & user collections
    const sellerUsers = await db.collection('users').find({ role: 'seller' }).toArray().catch(() => []);
    const betterAuthSellers = await db.collection('user').find({ role: 'seller' }).toArray().catch(() => []);
    const allUsers = await db.collection('users').find({}).toArray().catch(() => []);

    // 2. Ensure every seller user in users collection has a corresponding entry in sellers collection
    const combinedSellerUsers = [...sellerUsers, ...betterAuthSellers];
    for (const u of combinedSellerUsers) {
      const uId = u._id ? u._id.toString() : (u.id ? String(u.id) : null);
      const cleanPhoto = sanitizePhotoUrl(u.avatar || u.image || u.photoURL || '');

      const exists = await db.collection('sellers').findOne({
        $or: [
          ...(uId ? [{ user_id: uId }] : []),
          ...(u.email ? [{ email: u.email.trim().toLowerCase() }] : []),
          ...(u.phone ? [{ phone: u.phone.trim() }] : [])
        ]
      }).catch(() => null);

      if (!exists) {
        await db.collection('sellers').insertOne({
          user_id: uId,
          seller_name: u.name || 'Seller',
          shop_name: u.shop_name || (u.name ? `${u.name} Store` : 'Ihsan Vendor Shop'),
          phone: u.phone || '',
          email: u.email ? u.email.trim().toLowerCase() : '',
          shop_logo: cleanPhoto,
          avatar: cleanPhoto,
          status: 'approved',
          balance: u.balance || 0,
          commission_rate: 10,
          trade_license: 'TL-' + Math.floor(100000 + Math.random() * 900000),
          shop_description: `${u.name || 'সেলার'} এর নিজস্ব অনুমোদিত শপ`,
          rating: 5.0,
          sales_count: 0,
          products_count: 0,
          created_at: u.createdAt || new Date(),
          updated_at: new Date()
        }).catch(() => null);
      }
    }

    // 3. Retrieve sellers from MongoDB
    const query = (status && status !== 'all') ? { status } : {};
    let sellers = await db.collection('sellers').find(query).sort({ created_at: -1, _id: -1 }).toArray();

    // 4. Map user lookup tables for real registration/Google profile picture enrichment
    const userMapById = {};
    const userMapByEmail = {};
    const userMapByPhone = {};

    [...allUsers, ...betterAuthSellers].forEach(u => {
      const uId = u._id ? u._id.toString() : (u.id ? String(u.id) : null);
      if (uId) userMapById[uId] = u;
      if (u.email) userMapByEmail[u.email.trim().toLowerCase()] = u;
      if (u.phone) userMapByPhone[u.phone.trim()] = u;
    });

    // 5. Enrich sellers with genuine photos (Google OAuth / ImgBB upload / Email profile photo)
    const enrichedSellers = sellers.map(seller => {
      const uDoc =
        (seller.user_id && userMapById[seller.user_id.toString()]) ||
        (seller.email && userMapByEmail[seller.email.trim().toLowerCase()]) ||
        (seller.phone && userMapByPhone[seller.phone.trim()]) ||
        (seller.seller_name && allUsers.find(u => u.name && u.name.trim().toLowerCase() === seller.seller_name.trim().toLowerCase()));

      const rawUserPhoto = uDoc ? sanitizePhotoUrl(uDoc.avatar || uDoc.image || uDoc.photoURL) : '';
      const rawSellerLogo = sanitizePhotoUrl(seller.shop_logo);
      const rawSellerAvatar = sanitizePhotoUrl(seller.avatar);

      // Priority: user's registered photo / Google profile photo > seller shop_logo
      const genuinePhoto = rawUserPhoto || rawSellerLogo || rawSellerAvatar || '';

      return formatDoc({
        ...seller,
        shop_logo: genuinePhoto,
        avatar: genuinePhoto,
        image: genuinePhoto,
        email: seller.email || (uDoc ? uDoc.email : '') || '',
        phone: seller.phone || (uDoc ? uDoc.phone : '') || '',
        seller_name: seller.seller_name || (uDoc ? uDoc.name : '') || seller.name || 'Seller'
      });
    });

    return NextResponse.json({
      success: true,
      total: enrichedSellers.length,
      data: enrichedSellers
    });
  } catch (error) {
    console.error('Next.js GET /api/sellers error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch sellers' }, { status: 500 });
  }
}

// PATCH /api/sellers - Update seller status
export async function PATCH(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status } = body || {};

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Seller ID and status are required' }, { status: 400 });
    }

    const filter = ObjectId.isValid(id) && id.length === 24 ? { _id: new ObjectId(id) } : { $or: [{ id: Number(id) || id }, { user_id: id }] };
    await db.collection('sellers').updateOne(filter, {
      $set: { status, updated_at: new Date() }
    });

    return NextResponse.json({ success: true, message: 'Seller status updated successfully' });
  } catch (error) {
    console.error('Next.js PATCH /api/sellers error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update seller status' }, { status: 500 });
  }
}
