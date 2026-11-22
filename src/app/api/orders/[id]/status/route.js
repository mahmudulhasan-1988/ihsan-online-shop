import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PATCH /api/orders/[id]/status - Update Order Status
export async function PATCH(request, { params }) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { status, changed_by, role, note } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    let filter = { orderId: id };
    if (ObjectId.isValid(id)) {
      filter = { $or: [{ _id: new ObjectId(id) }, { orderId: id }] };
    }

    const existingOrder = await db.collection('orders').findOne(filter);
    if (!existingOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const now = new Date();
    const newLog = {
      status,
      changed_by: changed_by || 'Seller',
      role: role || 'seller',
      timestamp: now.toISOString(),
      note: note || `Order status updated to ${status}`
    };

    const updateDoc = {
      $set: {
        status,
        updatedAt: now.toISOString()
      },
      $push: {
        order_status_logs: newLog
      }
    };

    await db.collection('orders').updateOne(filter, updateDoc);

    return NextResponse.json({
      success: true,
      message: `অর্ডারের স্ট্যাটাস সফলভাবে "${status}" এ আপডেট হয়েছে`,
      orderId: existingOrder.orderId || id,
      status
    });
  } catch (error) {
    console.error('Next.js PATCH /api/orders/[id]/status error:', error);
    return NextResponse.json(
      { success: false, message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
