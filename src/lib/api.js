import axios from 'axios';

// Determine Base API URL dynamically (prioritizes env, then live Vercel backend in production, else localhost)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://ihsan-online-shop-server.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Dynamically update baseURL if needed on runtime
apiClient.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    config.baseURL = getBaseUrl();
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ==========================================
// 1. Users API (MongoDB Connected)
// ==========================================
export const getUsers = async (params = {}) => {
  try {
    const res = await apiClient.get('/users', { params });
    return res.data;
  } catch (error) {
    console.error('getUsers error:', error.message);
    return { success: false, data: [], total: 0, message: error.response?.data?.message || 'Failed to fetch users from server' };
  }
};

export const createUser = async (data) => {
  try {
    const res = await apiClient.post('/users', data);
    return res.data;
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to create user in MongoDB' };
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/users/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('updateUserStatus error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update user status' };
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const res = await apiClient.patch(`/users/${id}/role`, { role });
    return res.data;
  } catch (error) {
    console.error('updateUserRole error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update user role' };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const res = await apiClient.put('/users/profile', profileData);
    return res.data;
  } catch (error) {
    console.error('updateUserProfile error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update profile' 
    };
  }
};

// Online / Offline tracking
export const sendHeartbeat = async (userData) => {
  try {
    const res = await apiClient.post('/users/heartbeat', userData);
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

export const sendUserOffline = async (userData) => {
  try {
    const res = await apiClient.post('/users/offline', userData);
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

// ==========================================
// 2. Sellers API (MongoDB Connected)
// ==========================================
export const getSellers = async (params = {}) => {
  try {
    const res = await apiClient.get('/sellers', { params });
    return res.data;
  } catch (error) {
    console.error('getSellers error:', error.message);
    return { success: false, data: [], total: 0, message: error.response?.data?.message || 'Failed to fetch sellers' };
  }
};

export const updateSellerStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/sellers/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('updateSellerStatus error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update seller status' };
  }
};

export const getSellerProfile = async (identifier) => {
  try {
    const res = await apiClient.get(`/sellers/profile/${encodeURIComponent(identifier)}`);
    return res.data;
  } catch (error) {
    console.error('getSellerProfile error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch seller profile' };
  }
};

export const updateSellerProfile = async (profileData) => {
  try {
    const res = await apiClient.put('/sellers/profile', profileData);
    return res.data;
  } catch (error) {
    console.error('updateSellerProfile error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update seller profile' };
  }
};

export const updateSellerCommission = async (id, commission_rate) => {
  try {
    const res = await apiClient.patch(`/sellers/${id}/commission`, { commission_rate });
    return res.data;
  } catch (error) {
    console.error('updateSellerCommission error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update commission' };
  }
};

// ==========================================
// 3. Products API (MongoDB Connected)
// ==========================================
export const getProducts = async (params = {}) => {
  try {
    const res = await apiClient.get('/products', { params });
    return res.data;
  } catch (error) {
    console.error('getProducts error:', error.message);
    return { success: false, data: [], total: 0, message: error.response?.data?.message || 'Failed to fetch products from MongoDB' };
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error('getProductById error:', error.message);
    return { success: false, data: null, message: error.response?.data?.message || 'Product not found in MongoDB' };
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await apiClient.post('/products', productData);
    return res.data;
  } catch (error) {
    console.error('createProduct error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to save product in MongoDB' };
  }
};

export const updateProduct = async (id, updateData) => {
  try {
    const res = await apiClient.put(`/products/${id}`, updateData);
    return res.data;
  } catch (error) {
    console.error('updateProduct error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update product in MongoDB' };
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error('deleteProduct error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete product from MongoDB' };
  }
};

// ==========================================
// Multi-Tier Stock Transfer & Inventory Management
// (Admin Master Stock <-> Seller Stock Transfer System)
// ==========================================
export const transferProductStock = async ({ productId, transferQuantity, sellerId, sellerName, adminNote = '' }) => {
  try {
    const prodRes = await getProductById(productId);
    const prod = prodRes?.data || prodRes;
    if (!prod) {
      return { success: false, message: 'পণ্য খুঁজে পাওয়া যায়নি।' };
    }

    const currentAdminStock = Number(prod.admin_stock !== undefined ? prod.admin_stock : (prod.adminStock !== undefined ? prod.adminStock : 100));
    const currentSellerStock = Number(prod.stock_quantity !== undefined ? prod.stock_quantity : (prod.stock !== undefined ? prod.stock : 0));
    const qty = Number(transferQuantity);

    if (isNaN(qty) || qty <= 0) {
      return { success: false, message: 'স্থানান্তর পরিমাণ অবশ্যই ১ বা তার বেশি হতে হবে।' };
    }

    if (qty > currentAdminStock) {
      return { 
        success: false, 
        message: `অ্যাডমিন মাস্টার স্টকে মাত্র ${currentAdminStock} টি পণ্য অবশিষ্ট আছে, ${qty} টি স্থানান্তর সম্ভব নয়!` 
      };
    }

    const updatedAdminStock = currentAdminStock - qty;
    const updatedSellerStock = currentSellerStock + qty;

    const sName = sellerName || prod.seller_name || prod.sellerName || prod.shop_name || 'সুন্দরবন অর্গানিক ফার্মস';
    const sId = sellerId || prod.seller_id || prod.sellerId || null;

    const transferRecord = {
      id: `TR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      transferredQuantity: qty,
      previousAdminStock: currentAdminStock,
      newAdminStock: updatedAdminStock,
      previousSellerStock: currentSellerStock,
      newSellerStock: updatedSellerStock,
      sellerId: sId,
      sellerName: sName,
      note: adminNote || 'অ্যাডমিন থেকে সেলারকে স্টক স্থানান্তর করা হয়েছে',
    };

    const existingTransfers = Array.isArray(prod.stock_transfers) ? prod.stock_transfers : [];

    const updatePayload = {
      admin_stock: updatedAdminStock,
      adminStock: updatedAdminStock,
      stock_quantity: updatedSellerStock,
      stock: updatedSellerStock,
      stock_transfers: [transferRecord, ...existingTransfers],
    };

    const updateRes = await updateProduct(productId, updatePayload);

    // Create Notification Record for System/Admin
    try {
      await createNotification({
        title: '📦 স্টক স্থানান্তর সম্পন্ন',
        message: `"${prod.name_bn || prod.name}" পণ্য থেকে ${qty} পিস সেলার (${sName})-কে দেওয়া হয়েছে। অ্যাডমিন স্টক: ${updatedAdminStock} টি, সেলার স্টক: ${updatedSellerStock} টি।`,
        type: 'stock_transfer',
        recipient: 'all',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not post transfer notification', e);
    }

    return {
      success: true,
      data: {
        admin_stock: updatedAdminStock,
        stock_quantity: updatedSellerStock,
        transfers: [transferRecord, ...existingTransfers],
        product: updateRes?.data || updatePayload,
      },
      message: `সফলভাবে ${qty} টি স্টক সেলার (${sName})-কে স্থানান্তর করা হয়েছে।`,
    };
  } catch (error) {
    console.error('transferProductStock error:', error);
    return { success: false, message: error.message || 'স্টক স্থানান্তর করতে ব্যর্থ হয়েছে।' };
  }
};

export const getStockRequests = async (params = {}) => {
  const aggregatedMap = new Map();

  // 1. Try dedicated backend endpoint
  try {
    const res = await apiClient.get('/stock-requests', { params });
    const serverData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    serverData.forEach(r => {
      const key = r.id || r._id || `${r.productId}-${r.createdAt}`;
      aggregatedMap.set(key, r);
    });
  } catch (error) {
    // Expected if route not declared
  }

  // 2. Fetch all products to match products & stock_requests
  let allProds = [];
  try {
    const prodRes = await getProducts({ limit: 300 });
    allProds = prodRes?.data || (Array.isArray(prodRes) ? prodRes : []);
    allProds.forEach(p => {
      if (Array.isArray(p.stock_requests)) {
        p.stock_requests.forEach(r => {
          const key = r.id || r._id || `${r.productId || p.id || p._id}-${r.createdAt}`;
          if (!aggregatedMap.has(key)) {
            aggregatedMap.set(key, {
              ...r,
              productId: r.productId || p.id || p._id,
              productName: r.productName || p.name_bn || p.name,
              productImage: r.productImage || p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
              category: r.category || p.category || p.category_name,
              adminStockAtRequest: r.adminStockAtRequest ?? p.admin_stock ?? p.adminStock ?? 70,
              sellerStockAtRequest: r.sellerStockAtRequest ?? p.stock_quantity ?? p.stock ?? 0,
              status: r.status || 'pending',
              createdAt: r.createdAt || r.created_at || new Date().toISOString(),
            });
          }
        });
      }
    });
  } catch (e) {}

  // 3. Aggregate from MongoDB Notifications collection (where type is 'stock_request' or 'stock_out_alert')
  try {
    const notifRes = await getNotifications();
    const notifs = notifRes?.data || (Array.isArray(notifRes) ? notifRes : []);
    
    notifs
      .filter(n => n.type === 'stock_request' || n.type === 'stock_out_alert')
      .forEach(n => {
        const key = n.requestId || n._id || n.id || `${n.productId}-${n.created_at || n.createdAt}`;
        
        // Extract clean product name from title
        const rawTitle = n.title || '';
        const cleanName = rawTitle
          .replace('📢 সেলার স্টক রিকোয়েস্ট:', '')
          .replace('⚠️ স্টক শেষ অ্যালার্ট:', '')
          .replace('⚠️ স্টক শেষ:', '')
          .trim();
        
        // Find matching product from MongoDB products list
        const matchedProd = allProds.find(p => {
          const pId = String(p.id || p._id || '');
          const nPId = String(n.productId || n.product_id || '');
          if (nPId && pId === nPId) return true;
          if (cleanName && p.name_bn && (p.name_bn.trim() === cleanName || p.name_bn.includes(cleanName) || cleanName.includes(p.name_bn))) return true;
          if (cleanName && p.name && (p.name.trim() === cleanName || p.name.includes(cleanName) || cleanName.includes(p.name))) return true;
          if (cleanName && p.name_en && (p.name_en.trim() === cleanName || p.name_en.includes(cleanName) || cleanName.includes(p.name_en))) return true;
          return false;
        }) || (allProds.length > 0 ? allProds[0] : null);

        // Extract seller name from message
        let sName = n.sellerName || n.seller_name || '';
        if (!sName && n.message) {
          const match = n.message.match(/সেলার ["'“]([^"'”]+)["'”]/);
          if (match) sName = match[1];
        }
        if (!sName) {
          sName = matchedProd?.seller_name_bn || matchedProd?.seller_name || matchedProd?.shop_name || 'খালিদ অর্গানিক শপ';
        }

        // Extract requested quantity
        let reqQty = Number(n.requestedQty || n.requested_qty || 0);
        if (!reqQty && n.message) {
          const qMatch = n.message.match(/(\d+)\s*টি\s*স্টক/);
          if (qMatch) reqQty = parseInt(qMatch[1]);
        }
        if (!reqQty) reqQty = 30;

        if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
            id: n.requestId || n._id || n.id,
            _id: n.requestId || n._id || n.id,
            productId: matchedProd?.id || matchedProd?._id || n.productId || 'p1',
            productName: cleanName || matchedProd?.name_bn || matchedProd?.name || 'গেমিং কিবোর্ড ও মাউস কম্বো প্যাক',
            productImage: matchedProd?.thumbnail || matchedProd?.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
            sellerName: sName,
            sellerId: n.seller_id || n.sellerId || matchedProd?.seller_id || 'seller-1',
            requestedQty: reqQty,
            adminStockAtRequest: matchedProd ? Number(matchedProd.admin_stock ?? matchedProd.adminStock ?? 70) : 70,
            sellerStockAtRequest: matchedProd ? Number(matchedProd.stock_quantity ?? matchedProd.stock ?? 0) : 0,
            note: n.message || 'সেলার শপ থেকে স্টক শেষ হওয়ায় অ্যাডমিন থেকে স্টক স্থানান্তরের অনুরোধ',
            status: n.status || (n.isApproved ? 'approved' : (n.isRejected ? 'rejected' : 'pending')),
            createdAt: n.created_at || n.createdAt || new Date().toISOString(),
          });
        }
      });
  } catch (e) {}

  // 4. Aggregate from local storage sync
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ihsan_stock_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(r => {
            const key = r.id || r._id || `${r.productId}-${r.createdAt}`;
            if (!aggregatedMap.has(key)) {
              aggregatedMap.set(key, r);
            }
          });
        }
      }
    }
  } catch (e) {}

  const allRequests = Array.from(aggregatedMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  
  if (params?.sellerId) {
    return { success: true, data: allRequests.filter(r => String(r.sellerId) === String(params.sellerId)) };
  }
  return { success: true, data: allRequests };
};

export const requestProductRestock = async ({ productId, sellerId, sellerName, requestedQty = 30, note = '' }) => {
  try {
    const prodRes = await getProductById(productId);
    const prod = prodRes?.data || prodRes;
    const prodName = prod?.name_bn || prod?.name || 'পণ্য';
    const sName = sellerName || prod?.seller_name || prod?.sellerName || prod?.shop_name || 'সেলার';
    const adminStock = Number(prod?.admin_stock !== undefined ? prod.admin_stock : (prod?.adminStock !== undefined ? prod.adminStock : 70));
    const sellerStock = Number(prod?.stock_quantity !== undefined ? prod.stock_quantity : (prod?.stock !== undefined ? prod.stock : 0));

    const newRequest = {
      id: `SR-${Date.now()}`,
      _id: `SR-${Date.now()}`,
      productId: productId,
      productName: prodName,
      productNameEn: prod?.name_en || prod?.name || '',
      productImage: prod?.thumbnail || prod?.images?.[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      category: prod?.category || prod?.category_name || '',
      sku: prod?.sku || '',
      price: prod?.price || 0,
      sellerId: sellerId || prod?.seller_id || prod?.sellerId || 'seller-1',
      sellerName: sName,
      requestedQty: Number(requestedQty) || 30,
      adminStockAtRequest: adminStock,
      sellerStockAtRequest: sellerStock,
      note: note || 'সেলার শপ থেকে স্টক শেষ হওয়ায় অ্যাডমিন থেকে স্টক স্থানান্তরের অনুরোধ',
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save directly inside MongoDB Product document
    try {
      const existingReqs = Array.isArray(prod.stock_requests) ? prod.stock_requests : [];
      await updateProduct(productId, {
        stock_requests: [newRequest, ...existingReqs]
      });
    } catch (e) {
      console.warn('Could not save stock_requests to product doc', e);
    }

    // 2. Post to backend endpoint if exists
    try {
      await apiClient.post('/stock-requests', newRequest);
    } catch (e) {}

    // 3. Save to synced local storage for instant multi-tab reactivity
    if (typeof window !== 'undefined') {
      try {
        const existingStr = localStorage.getItem('ihsan_stock_requests');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [newRequest, ...existing.filter(r => r.id !== newRequest.id && r._id !== newRequest._id)];
        localStorage.setItem('ihsan_stock_requests', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('ihsan_stock_request_updated', { detail: newRequest }));
      } catch (e) {}
    }

    // 4. Dispatch Notification to Admin in MongoDB
    try {
      await createNotification({
        title: `📢 সেলার স্টক রিকোয়েস্ট: ${prodName}`,
        message: `সেলার "${sName}" "${prodName}" পণ্যের জন্য ${requestedQty} টি স্টক চেয়ে অনুরোধ পাঠিয়েছেন।${note ? ` নোট: ${note}` : ''}`,
        type: 'stock_request',
        recipient: 'admin',
        role: 'admin',
        isRead: false,
        requestId: newRequest.id,
        productId: productId,
        sellerId: sellerId || prod?.seller_id || prod?.sellerId,
        sellerName: sName,
        requestedQty: Number(requestedQty) || 30,
        createdAt: new Date().toISOString(),
      });
    } catch (notifErr) {
      console.warn('Could not dispatch stock request notification', notifErr);
    }

    return { 
      success: true, 
      data: newRequest, 
      message: 'অ্যাডমিনের কাছে স্টক স্থানান্তরের অনুরোধ সফলভাবে পাঠানো হয়েছে।' 
    };
  } catch (error) {
    console.error('requestProductRestock error:', error);
    return { success: false, message: 'অনুরোধ পাঠাতে ব্যর্থ হয়েছে।' };
  }
};

export const approveStockRequest = async ({ requestId, productId, transferQuantity, adminNote = '', sellerId, sellerName }) => {
  try {
    // 1. Execute actual stock transfer in MongoDB (deducts admin_stock, adds to stock_quantity)
    const transferRes = await transferProductStock({
      productId,
      transferQuantity,
      sellerId,
      sellerName,
      adminNote: adminNote || `সেলার স্টক রিকোয়েস্ট (#${requestId}) অনুমোদন ও স্থানান্তর সম্পন্ন`
    });

    if (!transferRes?.success) {
      return transferRes;
    }

    // 2. Mark request as approved in backend & storage
    try {
      await apiClient.patch(`/stock-requests/${requestId}/approve`, {
        status: 'approved',
        transferredQty: transferQuantity,
        adminNote,
        approvedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Backend patch /stock-requests/:id fallback', e.message);
    }

    // Update inside product document stock_requests array in MongoDB
    try {
      const pRes = await getProductById(productId);
      const pDoc = pRes?.data || pRes;
      if (pDoc && Array.isArray(pDoc.stock_requests)) {
        const updatedReqs = pDoc.stock_requests.map(r => {
          if (r.id === requestId || r._id === requestId) {
            return { ...r, status: 'approved', transferredQty: transferQuantity, adminNote, approvedAt: new Date().toISOString() };
          }
          return r;
        });
        await updateProduct(productId, { stock_requests: updatedReqs });
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      try {
        const existingStr = localStorage.getItem('ihsan_stock_requests');
        if (existingStr) {
          const existing = JSON.parse(existingStr);
          const updated = existing.map(r => {
            if (r.id === requestId || r._id === requestId) {
              return {
                ...r,
                status: 'approved',
                transferredQty: transferQuantity,
                adminNote,
                approvedAt: new Date().toISOString()
              };
            }
            return r;
          });
          localStorage.setItem('ihsan_stock_requests', JSON.stringify(updated));
        }
        window.dispatchEvent(new CustomEvent('ihsan_stock_request_updated'));
      } catch (e) {}
    }

    // Also delete or mark notification as processed in MongoDB notifications collection
    try {
      if (requestId) {
        await deleteNotification(requestId);
      }
    } catch (e) {}

    // 3. Send Confirmation Notification to Seller
    try {
      const prodRes = await getProductById(productId);
      const prod = prodRes?.data || prodRes;
      const prodName = prod?.name_bn || prod?.name || 'পণ্য';
      await createNotification({
        title: `🎉 স্টক রিকোয়েস্ট অনুমোদিত: ${prodName}`,
        message: `অ্যাডমিন আপনার "${prodName}" পণ্যের ${transferQuantity} পিস স্টক রিকোয়েস্ট অনুমোদন করেছেন এবং স্টক স্থানান্তর সম্পন্ন হয়েছে। আপনার বর্তমান স্টক: ${transferRes.data?.stock_quantity} টি।`,
        type: 'stock_request_approved',
        recipient: sellerId || 'seller',
        role: 'seller',
        productId,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not post seller approval notification', e);
    }

    return {
      success: true,
      message: `সফলভাবে স্টক রিকোয়েস্ট অনুমোদন করা হয়েছে এবং ${transferQuantity} পিস স্টক সেলারের কাছে স্থানান্তর সম্পন্ন হয়েছে!`,
      data: transferRes.data
    };
  } catch (error) {
    console.error('approveStockRequest error:', error);
    return { success: false, message: error.message || 'স্টক রিকোয়েস্ট অনুমোদন করতে ব্যর্থ হয়েছে।' };
  }
};

export const rejectStockRequest = async ({ requestId, rejectReason = '', sellerId, productId }) => {
  try {
    try {
      await apiClient.patch(`/stock-requests/${requestId}/reject`, {
        status: 'rejected',
        rejectReason,
        rejectedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Backend patch /stock-requests/:id fallback', e.message);
    }

    // 1. Delete notification record directly from MongoDB notifications collection
    try {
      if (requestId) {
        await deleteNotification(requestId);
      }
    } catch (e) {}

    // 2. Remove from product document stock_requests array in MongoDB
    try {
      if (productId) {
        const pRes = await getProductById(productId);
        const pDoc = pRes?.data || pRes;
        if (pDoc && Array.isArray(pDoc.stock_requests)) {
          const updatedReqs = pDoc.stock_requests.filter(r => r.id !== requestId && r._id !== requestId);
          await updateProduct(productId, { stock_requests: updatedReqs });
        }
      }
    } catch (e) {}

    // 3. Remove from synced localStorage
    if (typeof window !== 'undefined') {
      try {
        const existingStr = localStorage.getItem('ihsan_stock_requests');
        if (existingStr) {
          const existing = JSON.parse(existingStr);
          const updated = existing.filter(r => r.id !== requestId && r._id !== requestId);
          localStorage.setItem('ihsan_stock_requests', JSON.stringify(updated));
        }
        window.dispatchEvent(new CustomEvent('ihsan_stock_request_updated'));
      } catch (e) {}
    }

    // 4. Send Rejection Notification to Seller in MongoDB
    try {
      await createNotification({
        title: `❌ স্টক রিকোয়েস্ট প্রত্যাখ্যাত`,
        message: `আপনার স্টক রিকোয়েস্টটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে।${rejectReason ? ` কারণ: ${rejectReason}` : ''}`,
        type: 'stock_request_rejected',
        recipient: sellerId || 'seller',
        role: 'seller',
        productId,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not post seller rejection notification', e);
    }

    return { success: true, message: 'স্টক রিকোয়েস্ট সফলভাবে বাতিল ও তালিকা থেকে মুছে ফেলা হয়েছে।' };
  } catch (error) {
    console.error('rejectStockRequest error:', error);
    return { success: false, message: error.message || 'স্টক রিকোয়েস্ট বাতিল করতে ব্যর্থ হয়েছে।' };
  }
};

export const deleteStockRequest = async ({ requestId, productId }) => {
  return rejectStockRequest({ requestId, rejectReason: 'অ্যাডমিন কর্তৃক ডিলিট করা হয়েছে', productId });
};

// ==========================================
// 4. Categories & Brands API (MongoDB Connected)
// ==========================================
export const getCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    return res.data;
  } catch (error) {
    console.error('getCategories error:', error.message);
    return { success: false, data: [] };
  }
};

export const getBrands = async () => {
  try {
    const res = await apiClient.get('/brands');
    return res.data;
  } catch (error) {
    console.error('getBrands error:', error.message);
    return { success: false, data: [] };
  }
};

// ==========================================
// 5. Orders API (MongoDB Connected)
// ==========================================
export const placeOrder = async (orderData) => {
  try {
    const res = await apiClient.post('/orders', orderData);
    
    // Automatically manage seller inventory deduction & out-of-stock notification
    if ((res?.data?.success || res?.status === 200 || res?.status === 201 || res?.data) && Array.isArray(orderData?.items)) {
      for (const item of orderData.items) {
        const prodId = item.productId || item.id || item._id;
        const orderedQty = Number(item.quantity) || 1;
        if (prodId) {
          try {
            const pRes = await getProductById(prodId);
            const currentProd = pRes?.data || pRes;
            if (currentProd && (currentProd._id || currentProd.id)) {
              const currentSellerStock = Number(currentProd.stock_quantity !== undefined ? currentProd.stock_quantity : (currentProd.stock !== undefined ? currentProd.stock : 50));
              const newSellerStock = Math.max(0, currentSellerStock - orderedQty);
              
              // Note: Admin Master Stock (admin_stock) stays untouched as requested!
              await updateProduct(prodId, {
                stock_quantity: newSellerStock,
                stock: newSellerStock
              });

              // If Seller stock reaches 0, trigger out-of-stock notification to Admin
              if (newSellerStock === 0) {
                const sName = currentProd.seller_name || currentProd.sellerName || currentProd.shop_name || 'সেলার';
                const pName = currentProd.name_bn || currentProd.name;
                const adminAvailableStock = currentProd.admin_stock !== undefined ? currentProd.admin_stock : (currentProd.adminStock !== undefined ? currentProd.adminStock : 70);

                await createNotification({
                  title: `⚠️ স্টক শেষ: ${pName}`,
                  message: `গ্রাহকের অর্ডারের পর "${sName}" এর দোকানে "${pName}" পণ্যটির স্টক শেষ (০ পিস) হয়ে গেছে! অ্যাডমিন মাস্টার স্টকে বর্তমানে ${adminAvailableStock} টি পণ্য রয়েছে। অনুগ্রহ করে সেলারকে স্টক স্থানান্তর (Transfer) করুন।`,
                  type: 'stock_out_alert',
                  recipient: 'admin',
                  role: 'admin',
                  productId: prodId,
                  createdAt: new Date().toISOString()
                });
              }
            }
          } catch (stockErr) {
            console.warn('Stock auto-sync error:', stockErr);
          }
        }
      }
    }

    return res.data;
  } catch (error) {
    console.error('placeOrder error:', error);
    return { success: false, message: error.response?.data?.message || 'অর্ডার প্লেস করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।' };
  }
};

export const getOrders = async (params = {}) => {
  try {
    const res = await apiClient.get('/orders', { params });
    return res.data;
  } catch (error) {
    console.error('getOrders error:', error.message);
    return { success: false, data: [], total: 0, message: error.response?.data?.message || 'Failed to fetch orders' };
  }
};

export const updateOrderStatus = async (id, statusOrData) => {
  try {
    const payload = typeof statusOrData === 'string' ? { status: statusOrData } : statusOrData;
    const res = await apiClient.patch(`/orders/${id}/status`, payload);
    return res.data;
  } catch (error) {
    console.error('Update order status error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update order status in MongoDB' };
  }
};

export const deleteOrder = async (id) => {
  try {
    const res = await apiClient.delete(`/orders/${id}`);
    return res.data;
  } catch (error) {
    console.error('deleteOrder error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete order from MongoDB' };
  }
};

export const trackOrder = async (identifier) => {
  try {
    const res = await apiClient.get(`/orders/track/${encodeURIComponent(identifier)}`);
    return res.data;
  } catch (error) {
    console.error('trackOrder error:', error.message);
    return { success: false, message: error.response?.data?.message || 'অর্ডার খুঁজে পাওয়া যায়নি' };
  }
};

// ==========================================
// 6. Payments & Withdrawals (MongoDB Connected)
// ==========================================
export const getPayments = async () => {
  try {
    const res = await apiClient.get('/payments');
    return res.data;
  } catch (error) {
    console.error('getPayments error:', error.message);
    return { success: false, data: [] };
  }
};

export const getSellerWithdrawals = async () => {
  try {
    const res = await apiClient.get('/withdrawals');
    return res.data;
  } catch (error) {
    console.error('getSellerWithdrawals error:', error.message);
    return { success: false, data: [] };
  }
};

export const updateWithdrawalStatus = async (id, status) => {
  try {
    const res = await apiClient.put(`/withdrawals/${id}`, { status });
    return res.data;
  } catch (error) {
    console.error('updateWithdrawalStatus error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update withdrawal status' };
  }
};

export const requestSellerWithdrawal = async (withdrawData) => {
  try {
    const res = await apiClient.post('/withdrawals', withdrawData);
    return res.data;
  } catch (error) {
    console.error('requestSellerWithdrawal error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to submit withdrawal request' };
  }
};

// ==========================================
// 7. Coupons & Banners API (MongoDB Connected)
// ==========================================
export const getCoupons = async () => {
  try {
    const res = await apiClient.get('/coupons');
    return res.data;
  } catch (error) {
    console.error('getCoupons error:', error.message);
    return { success: false, data: [] };
  }
};

export const createCoupon = async (couponData) => {
  try {
    const res = await apiClient.post('/coupons', couponData);
    return res.data;
  } catch (error) {
    console.error('createCoupon error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to create coupon' };
  }
};

export const getBanners = async () => {
  try {
    const res = await apiClient.get('/banners');
    return res.data;
  } catch (error) {
    console.error('getBanners error:', error.message);
    return { success: false, data: [] };
  }
};

export const createBanner = async (bannerData) => {
  try {
    const res = await apiClient.post('/banners', bannerData);
    return res.data;
  } catch (error) {
    console.error('createBanner error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to create banner in MongoDB' };
  }
};

export const updateBanner = async (id, bannerData) => {
  try {
    const res = await apiClient.put(`/banners/${id}`, bannerData);
    return res.data;
  } catch (error) {
    console.error('updateBanner error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update banner in MongoDB' };
  }
};

export const deleteBanner = async (id) => {
  try {
    const res = await apiClient.delete(`/banners/${id}`);
    return res.data;
  } catch (error) {
    console.error('deleteBanner error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete banner from MongoDB' };
  }
};

export const getPages = async () => {
  try {
    const res = await apiClient.get('/pages');
    return res.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const updatePageContent = async (slug, pageData) => {
  try {
    const res = await apiClient.put(`/pages/${slug}`, pageData);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to update page' };
  }
};

// ==========================================
// 8. Notifications & Support Tickets API
// ==========================================
export const getNotifications = async (params = {}) => {
  try {
    const queryParams = typeof params === 'object' ? params : { userId: params };
    const res = await apiClient.get('/notifications', { params: queryParams });
    return res.data;
  } catch (error) {
    console.error('getNotifications error:', error.message);
    return { success: false, data: [], unreadCount: 0 };
  }
};

export const createNotification = async (notificationData) => {
  try {
    const res = await apiClient.post('/notifications', notificationData);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to create notification' };
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

export const markAllNotificationsAsRead = async (filter = {}) => {
  try {
    const res = await apiClient.patch('/notifications/read-all', filter);
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

export const clearAllNotifications = async (filter = {}) => {
  try {
    const res = await apiClient.delete('/notifications/clear-all', { data: filter });
    return res.data;
  } catch (error) {
    return { success: false };
  }
};

export const getSupportTickets = async (params = {}) => {
  try {
    const res = await apiClient.get('/support-tickets', { params });
    return res.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const createSupportTicket = async (ticketData) => {
  try {
    const res = await apiClient.post('/support-tickets', ticketData);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to submit ticket' };
  }
};

// ==========================================
// 9. Reviews API (MongoDB Connected)
// ==========================================
export const checkReviewEligibility = async (productId, params = {}) => {
  try {
    const res = await apiClient.get(`/reviews/eligibility/${productId}`, { params });
    return res.data;
  } catch (error) {
    return {
      success: false,
      isVerifiedBuyer: false,
      message: error.response?.data?.message || 'ভেরিফিকেশন চেক করতে সমস্যা হয়েছে'
    };
  }
};

export const getReviews = async (productId = 'all') => {
  try {
    const res = await apiClient.get(`/reviews/${productId}`);
    return res.data;
  } catch (error) {
    console.error('getReviews error:', error.message);
    return { success: false, data: [] };
  }
};

export const submitReview = async (reviewData) => {
  try {
    const res = await apiClient.post('/reviews', reviewData);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'শুধুমাত্র পণ্যটি ক্রয় এবং সফল ডেলিভারি (Delivered) সম্পন্নকারী গ্রাহকরাই ভেরিফাইড রিভিউ দিতে পারবেন।'
    };
  }
};

export const replyReview = async (reviewId, replyData) => {
  try {
    const payload = typeof replyData === 'string' ? { replyText: replyData } : replyData;
    const res = await apiClient.post(`/reviews/${reviewId}/reply`, payload);
    return res.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to post reply' };
  }
};

// ==========================================
// 10. Addresses API (MongoDB Connected)
// ==========================================
export const getAddresses = async (userId) => {
  try {
    const res = await apiClient.get(`/users/${userId}/addresses`);
    return res.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const saveAddress = async (addressData) => {
  try {
    const res = await apiClient.post('/addresses', addressData);
    return res.data;
  } catch (error) {
    return { success: false, message: 'Failed to save address' };
  }
};

// ==========================================
// 11. Site Settings & Stats API (MongoDB Connected)
// ==========================================
export const getSiteSettings = async () => {
  try {
    const res = await apiClient.get('/settings');
    return res.data;
  } catch (error) {
    return { success: false, data: {} };
  }
};

export const updateSiteSettings = async (settingsData) => {
  try {
    const res = await apiClient.put('/settings', settingsData);
    return res.data;
  } catch (error) {
    return { success: false, message: 'Settings could not be saved' };
  }
};

// ==========================================
// 12. Popup Notice API (MongoDB Connected)
// ==========================================
export const getPopupMessage = async () => {
  try {
    const res = await apiClient.get('/popup');
    return res.data;
  } catch (error) {
    return {
      success: true,
      data: {
        isActive: true,
        title: 'ইহসান অনলাইন শপ',
        titleEn: 'Ihsan Online Shop',
        badge: '🇵🇸 ফিলিস্তিন ও মানবতার কল্যাণে অনুদান',
        badgeEn: '🇵🇸 Palestine & Humanity Relief Support',
        message: '‘ইহসান অনলাইন শপ’ এর ব্যবসায়িক লাভের কিছু অংশ ফিলিস্তিনের মাজলুম পরিবারের জন্য এবং অসহায় দুস্থদের সহায়তার জন্য ব্যয় করা হয়। তাই ‘ইহসান অনলাইন শপ’ এই ফ্যামিলির সাথে যুক্ত হয়ে অসহায় দুস্থদের সহায়তার জন্য পাশে থাকুন।',
        messageEn: 'A portion of the profits from "Ihsan Online Shop" is dedicated to supporting the oppressed families of Palestine and helping underprivileged people. Join the Ihsan Online Shop family and stand with humanity!',
        buttonText: 'কেনাকাটা শুরু করুন',
        buttonTextEn: 'Start Shopping',
        buttonLink: '/products',
        image: '',
        showImage: false,
      },
    };
  }
};

export const updatePopupMessage = async (popupData) => {
  try {
    const res = await apiClient.put('/popup', popupData);
    return res.data;
  } catch (error) {
    console.error('Error updating popup:', error);
    return { success: false, message: 'Failed to update popup settings' };
  }
};

export const getStats = async () => {
  try {
    const res = await apiClient.get('/stats');
    return res.data;
  } catch (error) {
    return {
      success: false,
      data: {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalSellers: 0,
      },
    };
  }
};

// ==========================================
// 13. Auth API (MongoDB Connected)
// ==========================================
export const registerUser = async (data) => {
  try {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  } catch (error) {
    console.error('Register API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।'
    };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  } catch (error) {
    console.error('Login API error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'ভুল ফোন/ইমেইল অথবা পাসওয়ার্ড দেওয়া হয়েছে।'
    };
  }
};

export default apiClient;


