import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

// Helper to hash password using Node.js crypto
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Calculate online/offline status
function calculateOnlineStatus(user) {
  const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;
  const isOnline = lastActive && (Date.now() - lastActive.getTime() < 3 * 60 * 1000);
  return {
    ...user,
    id: user._id ? user._id.toString() : user.id,
    _id: user._id ? user._id.toString() : user.id,
    is_online: Boolean(isOnline),
  };
}

// GET /api/users - Fetch users from MongoDB
export async function GET(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const online = searchParams.get('online');

    const query = {};
    if (role && role !== 'all') query.role = role.toLowerCase().trim();
    if (status && status !== 'all') query.status = status.toLowerCase().trim();
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } }
      ];
    }

    const users = await db.collection('users')
      .find(query)
      .sort({ last_active_at: -1, createdAt: -1 })
      .toArray();

    let formatted = users.map(calculateOnlineStatus);

    if (online === 'true') {
      formatted = formatted.filter(u => u.is_online);
    } else if (online === 'false') {
      formatted = formatted.filter(u => !u.is_online);
    }

    return NextResponse.json({
      success: true,
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Next.js GET /api/users error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch users from MongoDB' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user in MongoDB
export async function POST(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, phone, password, role, avatar, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'ইউজারের পূর্ণ নাম প্রদান করুন (Full name is required)' }, { status: 200 });
    }

    const cleanName = name.trim();
    const fallbackEmail = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@ihsan.com`;
    const userEmail = (email && email.trim()) ? email.trim().toLowerCase() : fallbackEmail;
    const userPhone = (phone && phone.trim()) ? phone.trim() : '';
    const userPassword = (password && password.trim()) ? password.trim() : '123456';
    const hashedPassword = hashPassword(userPassword);
    const userRole = (role && role.trim()) ? role.trim().toLowerCase() : 'customer';
    const defaultAvatar = (avatar && avatar.trim()) ? avatar.trim() : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    // Duplicate check for email or phone (only check if genuine user email or phone provided)
    const orCond = [];
    if (email && email.trim() && !userEmail.endsWith('@ihsan.com')) {
      orCond.push({ email: userEmail });
    }
    if (userPhone && userPhone.length > 5) {
      orCond.push({ phone: userPhone });
    }

    if (orCond.length > 0) {
      const existing = await db.collection('users').findOne({ $or: orCond });
      if (existing) {
        const isEmailMatch = existing.email && existing.email.toLowerCase() === userEmail.toLowerCase();
        const msg = isEmailMatch 
          ? `"${userEmail}" ইমেইল অ্যাড্রেসে ইতিপূর্বে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অন্য ইমেইল ব্যবহার করুন।`
          : `"${userPhone}" ফোন নম্বরে ইতিপূর্বে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অন্য ফোন নম্বর ব্যবহার করুন।`;
        return NextResponse.json({ success: false, message: msg }, { status: 200 });
      }
    }

    const newUserDoc = {
      name: cleanName,
      email: userEmail,
      phone: userPhone,
      password: hashedPassword,
      passwordText: userPassword,
      role: userRole,
      avatar: defaultAvatar,
      image: defaultAvatar,
      status: status || 'active',
      orders_count: 0,
      total_spent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 1. Insert into MongoDB 'users' collection
    const result = await db.collection('users').insertOne(newUserDoc);
    const createdUserId = result.insertedId.toString();

    // 2. Also sync to Better Auth 'user' collection
    try {
      await db.collection('user').updateOne(
        { email: userEmail },
        {
          $set: {
            name: cleanName,
            email: userEmail,
            emailVerified: true,
            image: defaultAvatar,
            avatar: defaultAvatar,
            role: userRole,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (authSyncErr) {
      console.warn('Sync to Better Auth user collection notice:', authSyncErr.message);
    }

    // 3. If role is seller, insert/update in 'sellers' collection
    if (userRole === 'seller') {
      try {
        const newSellerDoc = {
          user_id: createdUserId,
          seller_id: createdUserId,
          seller_name: cleanName,
          seller_name_bn: cleanName,
          seller_name_en: cleanName,
          shop_name: `${cleanName} Store`,
          shop_name_bn: `${cleanName} স্টোর`,
          shop_name_en: `${cleanName} Store`,
          phone: userPhone,
          email: userEmail,
          shop_logo: defaultAvatar,
          status: 'approved',
          balance: 0,
          commission_rate: 10,
          trade_license: 'TL-' + Math.floor(100000 + Math.random() * 900000),
          shop_description: `${cleanName} এর নিজস্ব অনুমোদিত শপ`,
          rating: 5.0,
          sales_count: 0,
          products_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
        await db.collection('sellers').insertOne(newSellerDoc);
      } catch (sellerErr) {
        console.warn('Seller creation notice:', sellerErr.message);
      }
    }

    const createdUser = {
      _id: createdUserId,
      id: createdUserId,
      ...newUserDoc
    };

    return NextResponse.json({
      success: true,
      message: 'নতুন ইউজার সফলভাবে তৈরি হয়েছে এবং MongoDB তে সংরক্ষিত হয়েছে!',
      data: createdUser
    }, { status: 201 });
  } catch (error) {
    console.error('Next.js POST /api/users error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'ইউজার তৈরি করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
