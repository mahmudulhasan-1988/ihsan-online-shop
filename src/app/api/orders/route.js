import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/orders - Fetch orders with multi-vendor seller isolation
export async function GET(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const customerPhone = searchParams.get('customerPhone');
    const customerEmail = searchParams.get('customerEmail');
    const sellerId = searchParams.get('sellerId');

    let filter = {};

    if (status && status !== 'all') {
      if (status === 'Packed') {
        filter.status = { $in: ['Packed', 'Processing'] };
      } else {
        filter.status = status;
      }
    }

    const customerFilters = [];
    if (userId && userId !== 'undefined' && userId !== 'null') {
      const uStr = String(userId);
      customerFilters.push({ user_id: uStr });
      customerFilters.push({ customer_id: uStr });
      customerFilters.push({ 'user._id': uStr });
      if (ObjectId.isValid(uStr)) {
        customerFilters.push({ user_id: new ObjectId(uStr) });
        customerFilters.push({ customer_id: new ObjectId(uStr) });
      }
      if (!isNaN(Number(uStr))) {
        customerFilters.push({ user_id: Number(uStr) });
        customerFilters.push({ customer_id: Number(uStr) });
      }
    }
    if (customerPhone && customerPhone !== 'undefined') {
      customerFilters.push({ customerPhone: customerPhone.trim() });
    }
    if (customerEmail && customerEmail !== 'undefined' && customerEmail.trim()) {
      customerFilters.push({ customerEmail: customerEmail.trim().toLowerCase() });
    }

    if (customerFilters.length > 0) {
      filter.$or = customerFilters;
    }

    if (search) {
      const q = search.trim();
      const searchCond = {
        $or: [
          { orderId: { $regex: q, $options: 'i' } },
          { customerName: { $regex: q, $options: 'i' } },
          { customerPhone: { $regex: q, $options: 'i' } },
          { customerEmail: { $regex: q, $options: 'i' } }
        ]
      };
      if (filter.$or) {
        filter = { $and: [{ $or: filter.$or }, searchCond] };
      } else {
        filter = { ...filter, ...searchCond };
      }
    }

    // --- 🛡️ Multi-Vendor Seller Order & Item Isolation Setup ---
    let sellerDoc = null;
    let sellerUserDoc = null;
    const sellerProdIds = new Set();
    const isSellerFiltered = Boolean(sellerId && sellerId !== 'all' && sellerId !== 'undefined' && sellerId !== 'null');

    let sIdStr = '';
    let sShop = '';
    let sName = '';
    let sEmail = '';
    let sPhone = '';

    if (isSellerFiltered) {
      sIdStr = String(sellerId).trim();
      const sOr = [
        { id: sIdStr },
        { _id: sIdStr },
        { seller_id: sIdStr },
        { email: sIdStr.toLowerCase() },
        { phone: sIdStr },
        { shop_name: sIdStr }
      ];
      if (!isNaN(Number(sIdStr))) {
        sOr.push({ id: Number(sIdStr) });
        sOr.push({ seller_id: Number(sIdStr) });
      }
      if (ObjectId.isValid(sIdStr)) {
        sOr.push({ _id: new ObjectId(sIdStr) });
      }

      sellerDoc = await db.collection('sellers').findOne({ $or: sOr }).catch(() => null);
      sellerUserDoc = await db.collection('users').findOne({ $or: sOr }).catch(() => null);

      sShop = (sellerDoc?.shop_name || sellerUserDoc?.shop_name || '').toLowerCase().trim();
      sName = (sellerDoc?.seller_name || sellerUserDoc?.name || '').toLowerCase().trim();
      sEmail = (sellerDoc?.email || sellerUserDoc?.email || (sIdStr.includes('@') ? sIdStr : '')).toLowerCase().trim();
      sPhone = (sellerDoc?.phone || sellerUserDoc?.phone || (/^[0-9+]{8,}$/.test(sIdStr) ? sIdStr : '')).trim();

      const prodFindConds = [
        { seller_id: sIdStr },
        { sellerId: sIdStr }
      ];
      if (!isNaN(Number(sIdStr))) {
        prodFindConds.push({ seller_id: Number(sIdStr) });
        prodFindConds.push({ sellerId: Number(sIdStr) });
      }
      if (sellerDoc?.id) {
        prodFindConds.push({ seller_id: sellerDoc.id });
        prodFindConds.push({ sellerId: sellerDoc.id });
      }
      if (sEmail) prodFindConds.push({ seller_email: sEmail });
      if (sPhone) prodFindConds.push({ seller_phone: sPhone });
      if (sShop) {
        prodFindConds.push({ shop_name: sellerDoc?.shop_name || sShop });
        prodFindConds.push({ seller_name: sellerDoc?.shop_name || sShop });
      }

      const ownedProds = await db.collection('products')
        .find({ $or: prodFindConds })
        .project({ _id: 1, id: 1 })
        .toArray()
        .catch(() => []);

      ownedProds.forEach(p => {
        if (p._id) sellerProdIds.add(p._id.toString());
        if (p.id) sellerProdIds.add(String(p.id));
      });

      const sellerOrderOr = [
        { sellerIds: sIdStr },
        { 'items.sellerId': sIdStr },
        { 'items.seller_id': sIdStr }
      ];
      if (!isNaN(Number(sIdStr))) {
        sellerOrderOr.push({ sellerIds: Number(sIdStr) });
        sellerOrderOr.push({ 'items.sellerId': Number(sIdStr) });
        sellerOrderOr.push({ 'items.seller_id': Number(sIdStr) });
      }
      if (sellerDoc?.id) {
        sellerOrderOr.push({ sellerIds: sellerDoc.id });
        sellerOrderOr.push({ 'items.sellerId': sellerDoc.id });
        sellerOrderOr.push({ 'items.seller_id': sellerDoc.id });
      }
      if (sEmail) sellerOrderOr.push({ 'items.seller_email': sEmail });
      if (sPhone) sellerOrderOr.push({ 'items.seller_phone': sPhone });
      if (sShop) {
        sellerOrderOr.push({ 'items.shop_name': sellerDoc?.shop_name || sShop });
        sellerOrderOr.push({ 'items.sellerName': sellerDoc?.shop_name || sShop });
      }
      if (sellerProdIds.size > 0) {
        sellerOrderOr.push({ 'items.productId': { $in: Array.from(sellerProdIds) } });
      }

      if (filter.$and) {
        filter.$and.push({ $or: sellerOrderOr });
      } else if (filter.$or) {
        filter = { $and: [{ $or: filter.$or }, { $or: sellerOrderOr }] };
      } else {
        filter = { ...filter, $or: sellerOrderOr };
      }
    }

    const isItemBelongsToSeller = (it) => {
      if (!it) return false;
      const pId = String(it.productId || it.id || it._id || '').trim();
      if (pId && sellerProdIds.has(pId)) return true;

      const itSellerId = String(it.sellerId || it.seller_id || '').trim();
      if (sIdStr && itSellerId && (itSellerId === sIdStr || (sellerDoc?.id && itSellerId === String(sellerDoc.id)))) return true;

      const itEmail = (it.seller_email || '').toLowerCase().trim();
      if (sEmail && itEmail && itEmail === sEmail) return true;

      const itPhone = (it.seller_phone || '').trim();
      if (sPhone && itPhone && itPhone === sPhone) return true;

      const itShop = (it.shop_name || it.sellerName || it.seller_name || '').toLowerCase().trim();
      if (sShop && itShop && (itShop === sShop || sShop.includes(itShop) || itShop.includes(sShop))) return true;
      if (sName && itShop && (itShop === sName || sName.includes(itShop) || itShop.includes(sName))) return true;

      return false;
    };

    let orders = await db.collection('orders').find(filter).sort({ createdAt: -1, _id: -1 }).toArray();

    // Enrich customer profile
    const usersCol = db.collection('users');
    const allUsers = await usersCol.find({}).toArray().catch(() => []);
    const betterAuthUsers = await db.collection('user').find({}).toArray().catch(() => []);
    const combinedUsers = [...allUsers, ...betterAuthUsers];

    const userMapById = {};
    const userMapByPhone = {};
    const userMapByEmail = {};
    combinedUsers.forEach(u => {
      const uId = u._id ? u._id.toString() : (u.id ? String(u.id) : null);
      if (uId) userMapById[uId] = u;
      if (u.phone) userMapByPhone[u.phone.trim()] = u;
      if (u.email) userMapByEmail[u.email.trim().toLowerCase()] = u;
    });

    orders = orders.map(o => {
      const uDoc = (o.user_id && userMapById[o.user_id.toString()]) ||
                  (o.customerPhone && userMapByPhone[o.customerPhone?.trim()]) ||
                  (o.customerEmail && userMapByEmail[o.customerEmail?.trim().toLowerCase()]) ||
                  (o.customerName && combinedUsers.find(u => u.name && (u.name.trim().toLowerCase() === o.customerName.trim().toLowerCase() || u.name.toLowerCase().includes(o.customerName.toLowerCase()) || o.customerName.toLowerCase().includes(u.name.toLowerCase()))));

      let userPhoto = uDoc ? (uDoc.avatar || uDoc.image || uDoc.photoURL || '') : '';
      if (typeof userPhoto === 'string' && userPhoto.includes('unsplash.com/photo-1535713875002')) {
        userPhoto = '';
      }

      let orderPhoto = o.customerAvatar || o.customerImage || '';
      if (typeof orderPhoto === 'string' && orderPhoto.includes('unsplash.com/photo-1535713875002')) {
        orderPhoto = '';
      }

      const resolvedAvatar = orderPhoto || userPhoto || '';

      return {
        ...o,
        id: o._id ? o._id.toString() : o.id,
        customerAvatar: resolvedAvatar,
        customerImage: resolvedAvatar,
        customerEmail: o.customerEmail || (uDoc ? uDoc.email : '') || '',
        customerName: o.customerName || (uDoc ? uDoc.name : '') || 'Customer',
        userRole: uDoc ? (uDoc.role || 'customer') : 'customer'
      };
    });

    // Item-level isolation for seller
    if (isSellerFiltered) {
      orders = orders
        .map(o => {
          const rawItems = Array.isArray(o.items) ? o.items : [];
          const sellerOnlyItems = rawItems.filter(isItemBelongsToSeller);

          if (sellerOnlyItems.length === 0) return null;

          const sellerTotal = sellerOnlyItems.reduce((sum, it) => sum + (Number(it.price || 0) * (Number(it.quantity) || 1)), 0);
          return {
            ...o,
            items: sellerOnlyItems,
            sellerTotal,
            sellerItemCount: sellerOnlyItems.reduce((cnt, it) => cnt + (Number(it.quantity) || 1), 0),
            originalTotal: o.totalAmount
          };
        })
        .filter(Boolean);
    }

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Next.js GET /api/orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Place New Order
export async function POST(request) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      user_id,
      userId,
      customerName,
      customerPhone,
      customerEmail,
      customerAvatar,
      shippingAddress,
      deliveryAddress,
      items,
      subtotal,
      deliveryZone,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderNotes,
      notes
    } = body;

    const address = (shippingAddress || deliveryAddress || '').trim();
    const phone = (customerPhone || '').trim();
    const name = (customerName || '').trim();

    if (!name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'নাম, মোবাইল নম্বর, সম্পূর্ণ ডেলিভারি ঠিকানা এবং কমপক্ষে ১টি পণ্য প্রদান করুন।'
      }, { status: 400 });
    }

    const prodCol = db.collection('products');
    const formattedItems = [];
    const orderSellerIds = new Set();

    for (const item of items) {
      const pId = item.productId || item.id || item._id;
      let prodDoc = null;
      if (pId) {
        let pFilter = { _id: pId };
        if (ObjectId.isValid(pId)) pFilter = { $or: [{ _id: new ObjectId(pId) }, { _id: pId }] };
        else if (!isNaN(Number(pId))) pFilter = { $or: [{ id: Number(pId) }, { id: String(pId) }, { _id: pId }] };
        prodDoc = await prodCol.findOne(pFilter).catch(() => null);
      }

      const finalSellerId = item.sellerId || item.seller_id || prodDoc?.seller_id || prodDoc?.sellerId || null;
      const finalSellerName = item.sellerName || item.seller_name || prodDoc?.shop_name || prodDoc?.seller_name || prodDoc?.seller_name_bn || 'সুন্দরবন অর্গানিক ফার্মস';
      const finalShopName = item.shop_name || prodDoc?.shop_name || finalSellerName;
      const finalSellerEmail = item.seller_email || prodDoc?.seller_email || '';
      const finalSellerPhone = item.seller_phone || prodDoc?.seller_phone || '';

      if (finalSellerId) {
        orderSellerIds.add(String(finalSellerId));
      }

      formattedItems.push({
        productId: pId,
        name: item.name || prodDoc?.name_bn || prodDoc?.name || 'Product',
        price: Number(item.price) || Number(prodDoc?.price) || 0,
        regularPrice: Number(item.regularPrice || item.price || prodDoc?.regularPrice || prodDoc?.price) || 0,
        quantity: Number(item.quantity) || 1,
        weight: item.weight || item.unit || prodDoc?.unit || 'Standard',
        image: item.image || item.thumbnail || (prodDoc?.images && prodDoc.images[0]) || prodDoc?.thumbnail || '/placeholder.jpg',
        sellerId: finalSellerId,
        seller_id: finalSellerId,
        sellerName: finalSellerName,
        seller_name: finalSellerName,
        shop_name: finalShopName,
        seller_email: finalSellerEmail,
        seller_phone: finalSellerPhone
      });
    }

    const calculatedSubtotal = Number(subtotal) || formattedItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const calculatedDelivery = Number(deliveryCharge) || 70;
    const calculatedTotal = Number(totalAmount) || (calculatedSubtotal + calculatedDelivery);
    const orderId = 'GB-ORD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();

    const initialLog = {
      status: 'Pending',
      changed_by: name,
      role: 'customer',
      timestamp: now.toISOString(),
      note: 'কাস্টমার নতুন অর্ডার প্লেস করেছেন। স্ট্যাটাস: Pending'
    };

    let finalAvatar = (customerAvatar && !customerAvatar.includes('unsplash.com/photo-1535713875002')) ? customerAvatar : '';
    if (!finalAvatar && (phone || customerEmail || user_id || userId)) {
      const uQueries = [];
      const uidVal = user_id || userId;
      if (uidVal) {
        const uidStr = String(uidVal);
        uQueries.push({ _id: uidStr });
        if (ObjectId.isValid(uidStr)) uQueries.push({ _id: new ObjectId(uidStr) });
        uQueries.push({ id: uidStr });
      }
      if (phone) uQueries.push({ phone });
      if (customerEmail) uQueries.push({ email: customerEmail.trim().toLowerCase() });
      const matchedU = (await db.collection('users').findOne({ $or: uQueries }).catch(() => null)) ||
                       (await db.collection('user').findOne({ $or: uQueries }).catch(() => null));
      if (matchedU) {
        const mPhoto = matchedU.avatar || matchedU.image || matchedU.photoURL || '';
        if (mPhoto && !mPhoto.includes('unsplash.com/photo-1535713875002')) {
          finalAvatar = mPhoto;
        }
      }
    }

    const newOrder = {
      orderId,
      user_id: user_id || userId || null,
      customer_id: user_id || userId || null,
      customerName: name,
      customerPhone: phone,
      customerEmail: (customerEmail || '').trim().toLowerCase(),
      customerAvatar: finalAvatar,
      customerImage: finalAvatar,
      deliveryAddress: address,
      shippingAddress: address,
      deliveryZone: deliveryZone || 'inside_dhaka',
      deliveryCharge: calculatedDelivery,
      subtotal: calculatedSubtotal,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || (paymentMethod === 'bKash' ? 'Pending Verification' : 'Pending'),
      status: 'Pending',
      notes: orderNotes || notes || '',
      items: formattedItems,
      sellerIds: Array.from(orderSellerIds),
      order_status_logs: [initialLog],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const result = await db.collection('orders').insertOne(newOrder);
    newOrder._id = result.insertedId;
    newOrder.id = result.insertedId.toString();

    return NextResponse.json({
      success: true,
      message: 'অর্ডার সফলভাবে তৈরি হয়েছে!',
      orderId,
      data: newOrder
    }, { status: 201 });
  } catch (error) {
    console.error('Next.js POST /api/orders error:', error);
    return NextResponse.json({ success: false, message: 'অর্ডার তৈরিতে সমস্যা হয়েছে: ' + error.message }, { status: 500 });
  }
}
