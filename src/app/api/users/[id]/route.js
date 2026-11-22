import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE /api/users/[id] - Permanently delete user from MongoDB
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: String(id) };
    const user = await db.collection('users').findOne(filter);

    // Delete from 'users'
    await db.collection('users').deleteOne(filter);

    // If user has email, also delete from Better Auth 'user' collection
    if (user?.email) {
      await db.collection('user').deleteOne({ email: user.email.toLowerCase().trim() });
    }

    // If user was a seller, delete from 'sellers'
    await db.collection('sellers').deleteMany({
      $or: [
        { user_id: id },
        { user_id: ObjectId.isValid(id) ? new ObjectId(id) : null },
        { email: user?.email || '' }
      ].filter(Boolean)
    });

    return NextResponse.json({
      success: true,
      message: 'ইউজার MongoDB থেকে সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Next.js DELETE /api/users/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update status or role in MongoDB
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { status, role } = body;

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: String(id) };
    const updateFields = { updatedAt: new Date() };

    if (status !== undefined) updateFields.status = status;
    if (role !== undefined) updateFields.role = role.toLowerCase().trim();

    const res = await db.collection('users').updateOne(filter, { $set: updateFields });

    // Also sync to Better Auth 'user' collection if role or status changes
    const user = await db.collection('users').findOne(filter);
    if (user?.email) {
      const authUpdates = { updatedAt: new Date() };
      if (role !== undefined) authUpdates.role = role.toLowerCase().trim();
      await db.collection('user').updateOne(
        { email: user.email.toLowerCase().trim() },
        { $set: authUpdates }
      );
    }

    // If role changed to seller, ensure a seller record exists
    if (role === 'seller' && user) {
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

    return NextResponse.json({
      success: true,
      message: 'ইউজার তথ্য সফলভাবে আপডেট হয়েছে',
      modifiedCount: res.modifiedCount
    });
  } catch (error) {
    console.error('Next.js PATCH /api/users/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
