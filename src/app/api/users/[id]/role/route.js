import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { role } = body;

    if (!role) {
      return NextResponse.json({ success: false, message: 'Role is required' }, { status: 400 });
    }

    const cleanRole = role.toLowerCase().trim();
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: String(id) };
    await db.collection('users').updateOne(filter, { $set: { role: cleanRole, updatedAt: new Date() } });

    const user = await db.collection('users').findOne(filter);
    if (user?.email) {
      await db.collection('user').updateOne(
        { email: user.email.toLowerCase().trim() },
        { $set: { role: cleanRole, updatedAt: new Date() } }
      );
    }

    if (cleanRole === 'seller' && user) {
      await db.collection('sellers').updateOne(
        { $or: [{ user_id: id }, { email: user.email }] },
        {
          $setOnInsert: {
            user_id: id,
            seller_id: id,
            seller_name: user.name,
            shop_name: `${user.name} Store`,
            phone: user.phone || '',
            email: user.email,
            status: 'approved',
            balance: 0,
            rating: 5.0,
            created_at: new Date()
          }
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'ইউজার রোল পরিবর্তন হয়েছে' });
  } catch (error) {
    console.error('PATCH /api/users/[id]/role error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update user role' }, { status: 500 });
  }
}
