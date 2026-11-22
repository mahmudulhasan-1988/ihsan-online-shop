import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: String(id) };
    await db.collection('users').updateOne(filter, { $set: { status, updatedAt: new Date() } });

    return NextResponse.json({ success: true, message: 'ইউজার স্ট্যাটাস পরিবর্তন হয়েছে' });
  } catch (error) {
    console.error('PATCH /api/users/[id]/status error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to update user status' }, { status: 500 });
  }
}
