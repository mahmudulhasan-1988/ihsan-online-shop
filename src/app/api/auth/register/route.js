import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

// Helper to hash password
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// POST /api/auth/register - Register new user directly in MongoDB
export async function POST(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'ডাটাবেজ কানেকশন ব্যর্থ হয়েছে, দয়া করে পুনরায় চেষ্টা করুন।' },
        { status: 200 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, phone, password, avatar } = body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim().replace(/[^0-9+]/g, '');
    const cleanPassword = (password || '').trim();

    if (!cleanName || (!cleanEmail && !cleanPhone) || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'অনুগ্রহ করে পূর্ণ নাম, ইমেইল অথবা মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।' },
        { status: 200 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' },
        { status: 200 }
      );
    }

    // Duplicate check for existing email or phone (only non-empty, genuine inputs)
    const orConditions = [];
    if (cleanEmail && cleanEmail.includes('@') && cleanEmail.length > 4) {
      orConditions.push({ email: cleanEmail });
    }
    if (cleanPhone && cleanPhone.length >= 8) {
      orConditions.push({ phone: cleanPhone });
    }

    if (orConditions.length > 0) {
      const existing = await db.collection('users').findOne({ $or: orConditions });
      if (existing) {
        const isEmailMatch = cleanEmail && existing.email && existing.email.toLowerCase() === cleanEmail;
        const msg = isEmailMatch
          ? `"${cleanEmail}" ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন অথবা অন্য ইমেইল ব্যবহার করুন।`
          : `"${cleanPhone}" মোবাইল নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন অথবা অন্য নম্বর ব্যবহার করুন।`;
        return NextResponse.json({ success: false, message: msg }, { status: 200 });
      }
    }

    const defaultAvatar = (avatar && avatar.trim()) || '';
    const hashedPassword = hashPassword(cleanPassword);

    const newUserDoc = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      passwordText: cleanPassword,
      avatar: defaultAvatar,
      image: defaultAvatar,
      role: 'customer',
      status: 'active',
      orders_count: 0,
      total_spent: 0,
      is_online: true,
      last_active_at: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 1. Insert into MongoDB 'users' collection
    const result = await db.collection('users').insertOne(newUserDoc);
    const insertedId = result.insertedId.toString();

    // 2. Sync to Better Auth 'user' collection
    try {
      if (cleanEmail) {
        await db.collection('user').updateOne(
          { email: cleanEmail },
          {
            $set: {
              name: cleanName,
              email: cleanEmail,
              image: defaultAvatar,
              avatar: defaultAvatar,
              role: 'customer',
              status: 'active',
              emailVerified: false,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              id: insertedId,
              phone: cleanPhone,
              createdAt: new Date()
            }
          },
          { upsert: true }
        );
      }
    } catch (syncErr) {
      console.warn('Sync to Better Auth user collection notice:', syncErr.message);
    }

    const userPayload = {
      id: insertedId,
      _id: insertedId,
      name: newUserDoc.name,
      email: newUserDoc.email,
      phone: newUserDoc.phone,
      avatar: newUserDoc.avatar,
      image: newUserDoc.avatar,
      role: 'customer',
      status: 'active'
    };

    // Generate secure token
    const token = 'ihsan_tok_' + crypto.randomBytes(24).toString('hex');

    return NextResponse.json({
      success: true,
      message: 'রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে! ইহসান অনলাইন শপে আপনাকে স্বাগতম।',
      token,
      user: userPayload
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js POST /api/auth/register error:', error);
    return NextResponse.json(
      { success: false, message: 'রেজিস্ট্রেশন প্রক্রিয়ায় সমস্যা হয়েছে: ' + (error.message || 'Server error') },
      { status: 200 }
    );
  }
}
