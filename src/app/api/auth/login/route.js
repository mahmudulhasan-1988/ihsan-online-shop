import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

function verifyPassword(password, stored) {
  if (!stored || !password) return false;
  if (stored === password) return true;
  if (stored.includes(':')) {
    const [salt, key] = stored.split(':');
    if (salt && key) {
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      return key === hash;
    }
  }
  return false;
}

// POST /api/auth/login - Direct user login with MongoDB
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
    const { identifier, email, phone, password } = body;
    const loginIdentifier = (identifier || email || phone || '').trim();
    const cleanPassword = (password || '').trim();

    if (!loginIdentifier || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'ইমেইল অথবা মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন' },
        { status: 200 }
      );
    }

    // Demo Admin Bypass
    if ((loginIdentifier === '01700000000' || loginIdentifier.toLowerCase() === 'admin@ihsan.com') && cleanPassword === 'admin123') {
      const adminUser = {
        id: 'admin_1',
        _id: 'admin_1',
        name: 'Admin Moderator',
        email: 'admin@ihsan.com',
        phone: '01700000000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'admin',
        status: 'active'
      };
      const token = 'ihsan_adm_' + crypto.randomBytes(24).toString('hex');
      return NextResponse.json({
        success: true,
        message: 'অ্যাডমিন লগইন সফল হয়েছে!',
        token,
        user: adminUser
      }, { status: 200 });
    }

    const escaped = loginIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await db.collection('users').findOne({
      $or: [
        { email: { $regex: '^' + escaped + '$', $options: 'i' } },
        { phone: loginIdentifier }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'ভুল ইমেইল/মোবাইল বা পাসওয়ার্ড প্রদান করেছেন' },
        { status: 200 }
      );
    }

    if (user.status === 'blocked') {
      return NextResponse.json(
        { success: false, message: 'আপনার অ্যাকাউন্টটি স্থগিত (Blocked) করা হয়েছে' },
        { status: 200 }
      );
    }

    let isValid = verifyPassword(cleanPassword, user.password);
    if (!isValid && user.passwordText) {
      isValid = (user.passwordText === cleanPassword);
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'ভুল ইমেইল/মোবাইল বা পাসওয়ার্ড প্রদান করেছেন' },
        { status: 200 }
      );
    }

    // Update active status
    try {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { is_online: true, last_active_at: new Date() } }
      );
    } catch (e) {
      // non-blocking
    }

    const userPayload = {
      id: user._id ? user._id.toString() : (user.id || ''),
      _id: user._id ? user._id.toString() : (user.id || ''),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || user.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      image: user.avatar || user.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: user.role || 'customer',
      status: user.status || 'active'
    };

    const token = 'ihsan_tok_' + crypto.randomBytes(24).toString('hex');
    return NextResponse.json({
      success: true,
      message: 'লগইন সফল হয়েছে! স্বাগতম, ' + user.name,
      token,
      user: userPayload
    }, { status: 200 });

  } catch (error) {
    console.error('Next.js POST /api/auth/login error:', error);
    return NextResponse.json(
      { success: false, message: 'লগইন প্রক্রিয়ায় সার্ভার ত্রুটি হয়েছে: ' + (error.message || 'Server error') },
      { status: 200 }
    );
  }
}
