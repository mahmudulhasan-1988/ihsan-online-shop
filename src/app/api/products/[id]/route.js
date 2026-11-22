import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper to format document
function formatDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id ? doc._id.toString() : doc.id,
    _id: doc._id ? doc._id.toString() : doc.id,
  };
}

// GET /api/products/[id] - Get Single Product
export async function GET(request, { params }) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { id } = params;
    const filterConditions = [{ id }, { _id: id }, { slug: id }];
    if (ObjectId.isValid(id)) {
      filterConditions.unshift({ _id: new ObjectId(id) });
    }
    if (!isNaN(Number(id))) {
      filterConditions.push({ id: Number(id) });
    }

    const product = await db.collection('products').findOne({ $or: filterConditions });
    if (!product) {
      return NextResponse.json({ success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: formatDoc(product) });
  } catch (error) {
    console.error('Next.js GET /api/products/[id] error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/products/[id] & PATCH /api/products/[id] - Update Product in MongoDB
export async function PUT(request, { params }) {
  return handleUpdate(request, params);
}

export async function PATCH(request, { params }) {
  return handleUpdate(request, params);
}

async function handleUpdate(request, params) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { id } = params;
    const raw = await request.json().catch(() => ({}));

    let images = raw.images;
    let thumbnail = raw.thumbnail;

    if (thumbnail && (!images || !Array.isArray(images) || images.length === 0)) {
      images = [thumbnail];
    } else if (images && Array.isArray(images) && images.length > 0 && !thumbnail) {
      thumbnail = images[0];
    }

    const updateFields = {
      updatedAt: new Date(),
    };

    if (raw.name !== undefined) {
      updateFields.name = raw.name;
      updateFields.name_bn = raw.name_bn || raw.name;
    }
    if (raw.name_bn !== undefined) updateFields.name_bn = raw.name_bn;
    if (raw.name_en !== undefined) {
      updateFields.name_en = raw.name_en;
      updateFields.nameEn = raw.name_en;
    }
    if (raw.slug !== undefined) updateFields.slug = raw.slug;
    if (raw.category !== undefined) {
      updateFields.category = raw.category;
      updateFields.category_name = raw.category;
      updateFields.category_bn = raw.category_bn || raw.category;
    }
    if (raw.category_bn !== undefined) updateFields.category_bn = raw.category_bn;
    if (raw.category_en !== undefined) updateFields.category_en = raw.category_en;
    if (raw.categorySlug !== undefined) {
      updateFields.categorySlug = raw.categorySlug;
      updateFields.category_slug = raw.categorySlug;
    }
    if (raw.category_id !== undefined) {
      updateFields.category_id = (!isNaN(Number(raw.category_id)) && raw.category_id !== '') ? Number(raw.category_id) : raw.category_id;
      updateFields.categoryId = updateFields.category_id;
    }
    if (raw.price !== undefined) updateFields.price = Number(raw.price);
    if (raw.regularPrice !== undefined) updateFields.regularPrice = Number(raw.regularPrice);
    if (raw.stock !== undefined) {
      updateFields.stock = Number(raw.stock);
      updateFields.stock_quantity = Number(raw.stock);
    }
    if (raw.stock_quantity !== undefined) {
      updateFields.stock_quantity = Number(raw.stock_quantity);
      if (updateFields.stock === undefined) updateFields.stock = Number(raw.stock_quantity);
    }
    if (raw.sku !== undefined) updateFields.sku = raw.sku;
    if (raw.status !== undefined) updateFields.status = raw.status;
    if (raw.is_active !== undefined) updateFields.is_active = Boolean(raw.is_active);
    if (thumbnail !== undefined) updateFields.thumbnail = thumbnail;
    if (images !== undefined) updateFields.images = Array.isArray(images) ? images : [images];
    if (raw.description !== undefined) updateFields.description = raw.description;
    if (raw.unit !== undefined) updateFields.unit = raw.unit;
    if (raw.seller_id !== undefined) updateFields.seller_id = raw.seller_id;
    if (raw.sellerId !== undefined) updateFields.sellerId = raw.sellerId;
    if (raw.seller_name !== undefined) {
      updateFields.seller_name = raw.seller_name;
      updateFields.seller_name_bn = raw.seller_name;
    }
    if (raw.seller_name_bn !== undefined) updateFields.seller_name_bn = raw.seller_name_bn;
    if (raw.seller_name_en !== undefined) {
      updateFields.seller_name_en = raw.seller_name_en;
      updateFields.sellerName = raw.seller_name_en;
    }
    if (raw.shop_name !== undefined) updateFields.shop_name = raw.shop_name;
    if (raw.seller_email !== undefined) updateFields.seller_email = raw.seller_email;
    if (raw.seller_phone !== undefined) updateFields.seller_phone = raw.seller_phone;
    if (raw.isFeatured !== undefined) updateFields.isFeatured = Boolean(raw.isFeatured);
    if (raw.is_featured !== undefined) updateFields.is_featured = Boolean(raw.is_featured);
    if (raw.isBestSeller !== undefined) updateFields.isBestSeller = Boolean(raw.isBestSeller);
    if (raw.is_bestseller !== undefined) updateFields.is_bestseller = Boolean(raw.is_bestseller);

    if (updateFields.price !== undefined || updateFields.regularPrice !== undefined) {
      const p = updateFields.price !== undefined ? updateFields.price : raw.price;
      const rp = updateFields.regularPrice !== undefined ? updateFields.regularPrice : raw.regularPrice;
      if (rp && p && rp > p) {
        updateFields.discountPercentage = Math.round(((rp - p) / rp) * 100);
      } else {
        updateFields.discountPercentage = 0;
      }
    }

    // Safety: prevent modifying immutable _id in MongoDB
    delete updateFields._id;

    const filterConditions = [{ id }, { _id: id }, { slug: id }];
    if (ObjectId.isValid(id)) {
      filterConditions.unshift({ _id: new ObjectId(id) });
    }
    if (!isNaN(Number(id))) {
      filterConditions.push({ id: Number(id) });
    }
    if (raw.id && raw.id !== id) filterConditions.push({ id: raw.id });
    if (raw.slug && raw.slug !== id) filterConditions.push({ slug: raw.slug });

    let filter = { $or: filterConditions };
    let updateResult = await db.collection('products').updateOne(filter, { $set: updateFields });

    if (updateResult.matchedCount === 0 && raw.name) {
      const altFilter = { $or: [{ name: raw.name }, { name_bn: raw.name }, { name_en: raw.name }] };
      const altRes = await db.collection('products').updateOne(altFilter, { $set: updateFields });
      if (altRes.matchedCount > 0) {
        filter = altFilter;
      }
    }

    const refreshed = await db.collection('products').findOne(filter);
    if (!refreshed) {
      return NextResponse.json({ success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'পণ্য সফলভাবে ডাটাবেসে আপডেট হয়েছে',
      data: formatDoc(refreshed)
    });
  } catch (error) {
    console.error('Next.js update product error:', error);
    return NextResponse.json(
      { success: false, message: 'পণ্য আপডেট করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete Product
export async function DELETE(request, { params }) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const { id } = params;
    const filterConditions = [{ id }, { _id: id }, { slug: id }];
    if (ObjectId.isValid(id)) {
      filterConditions.unshift({ _id: new ObjectId(id) });
    }
    if (!isNaN(Number(id))) {
      filterConditions.push({ id: Number(id) });
    }

    await db.collection('products').deleteOne({ $or: filterConditions });
    return NextResponse.json({ success: true, message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Next.js delete product error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
