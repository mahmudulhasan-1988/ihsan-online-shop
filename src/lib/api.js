import axios from 'axios';
import {
  mockUsers,
  mockSellers,
  mockCategories,
  mockBrands,
  mockProducts,
  mockOrders,
  mockAddresses,
  mockPayments,
  mockSellerWithdrawals,
  mockReviews,
  mockCoupons,
  mockBanners,
  mockNotifications,
  mockSupportTickets,
  mockSiteSettings,
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach JWT token if available in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 1. Users API
export const getUsers = async (params = {}) => {
  try {
    const res = await apiClient.get('/users', { params });
    return res.data;
  } catch (error) {
    let filtered = [...mockUsers];
    if (params.role) filtered = filtered.filter((u) => u.role === params.role);
    if (params.status) filtered = filtered.filter((u) => u.status === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q));
    }
    return { success: true, data: filtered, total: filtered.length };
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/users/${id}/status`, { status });
    return res.data;
  } catch (error) {
    const user = mockUsers.find((u) => u.id === Number(id));
    if (user) user.status = status;
    return { success: true, message: `User status updated to ${status}` };
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const res = await apiClient.patch(`/users/${id}/role`, { role });
    return res.data;
  } catch (error) {
    const user = mockUsers.find((u) => u.id === Number(id));
    if (user) user.role = role;
    return { success: true, message: `User role updated to ${role}` };
  }
};

// 2. Sellers API
export const getSellers = async (params = {}) => {
  try {
    const res = await apiClient.get('/sellers', { params });
    return res.data;
  } catch (error) {
    let filtered = [...mockSellers];
    if (params.status) filtered = filtered.filter((s) => s.status === params.status);
    return { success: true, data: filtered, total: filtered.length };
  }
};

export const updateSellerStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/sellers/${id}/status`, { status });
    return res.data;
  } catch (error) {
    const seller = mockSellers.find((s) => s.id === Number(id));
    if (seller) seller.status = status;
    return { success: true, message: `Seller status updated to ${status}` };
  }
};

export const updateSellerCommission = async (id, commission_rate) => {
  try {
    const res = await apiClient.patch(`/sellers/${id}/commission`, { commission_rate });
    return res.data;
  } catch (error) {
    const seller = mockSellers.find((s) => s.id === Number(id));
    if (seller) seller.commission_rate = Number(commission_rate);
    return { success: true, message: 'Commission updated' };
  }
};

// 3. Products API
export const getProducts = async (params = {}) => {
  try {
    const res = await apiClient.get('/products', { params });
    return res.data;
  } catch (error) {
    let filtered = [...mockProducts];
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((p) => p.category_id === Number(params.category) || p.slug.includes(params.category));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.name_en && p.name_en.toLowerCase().includes(q)));
    }
    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    return { success: true, data: filtered, total: filtered.length };
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    const prod = mockProducts.find((p) => p.id === Number(id) || p.slug === id || p._id === id);
    return { success: !!prod, data: prod || mockProducts[0] };
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await apiClient.post('/products', productData);
    return res.data;
  } catch (error) {
    const newP = {
      id: mockProducts.length + 1,
      ...productData,
      rating: 5.0,
      ratingCount: 1,
      status: 'approved',
      created_at: new Date().toISOString(),
    };
    mockProducts.unshift(newP);
    return { success: true, data: newP, message: 'Product created successfully' };
  }
};

export const updateProduct = async (id, updateData) => {
  try {
    const res = await apiClient.put(`/products/${id}`, updateData);
    return res.data;
  } catch (error) {
    const idx = mockProducts.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      mockProducts[idx] = { ...mockProducts[idx], ...updateData };
    }
    return { success: true, message: 'Product updated successfully' };
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    const idx = mockProducts.findIndex((p) => p.id === Number(id));
    if (idx !== -1) mockProducts.splice(idx, 1);
    return { success: true, message: 'Product deleted' };
  }
};

// 4. Categories & Brands API
export const getCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    return res.data;
  } catch (error) {
    return { success: true, data: mockCategories };
  }
};

export const getBrands = async () => {
  try {
    const res = await apiClient.get('/brands');
    return res.data;
  } catch (error) {
    return { success: true, data: mockBrands };
  }
};

// 5. Orders API
export const placeOrder = async (orderData) => {
  try {
    const res = await apiClient.post('/orders', orderData);
    return res.data;
  } catch (error) {
    const orderId = `GB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: mockOrders.length + 1,
      orderId,
      ...orderData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    mockOrders.unshift(newOrder);
    return { success: true, orderId, data: newOrder, message: 'Order placed successfully' };
  }
};

export const getOrders = async (params = {}) => {
  try {
    const res = await apiClient.get('/orders', { params });
    return res.data;
  } catch (error) {
    let filtered = [...mockOrders];
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((o) => o.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((o) => o.orderId.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q));
    }
    if (params.userId) {
      filtered = filtered.filter((o) => o.user_id === Number(params.userId));
    }
    return { success: true, data: filtered, total: filtered.length };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/orders/${id}/status`, { status });
    return res.data;
  } catch (error) {
    const ord = mockOrders.find((o) => o.id === Number(id) || o.orderId === id || o._id === id);
    if (ord) ord.status = status;
    return { success: true, message: `Order status updated to ${status}` };
  }
};

export const deleteOrder = async (id) => {
  try {
    const res = await apiClient.delete(`/orders/${id}`);
    return res.data;
  } catch (error) {
    const idx = mockOrders.findIndex((o) => o.id === Number(id) || o.orderId === id || o._id === id);
    if (idx !== -1) {
      mockOrders.splice(idx, 1);
    }
    return { success: true, message: 'Order deleted successfully' };
  }
};

export const trackOrder = async (identifier) => {
  try {
    const res = await apiClient.get(`/orders/track/${encodeURIComponent(identifier)}`);
    return res.data;
  } catch (error) {
    const ord = mockOrders.find((o) => o.orderId.toLowerCase() === identifier.trim().toLowerCase() || o.customerPhone.includes(identifier.trim()));
    if (ord) {
      return { success: true, data: ord };
    }
    return { success: false, message: 'অর্ডার খুঁজে পাওয়া যায়নি' };
  }
};

// 6. Payments & Withdrawals
export const getPayments = async () => {
  try {
    const res = await apiClient.get('/payments');
    return res.data;
  } catch (error) {
    return { success: true, data: mockPayments };
  }
};

export const getSellerWithdrawals = async () => {
  try {
    const res = await apiClient.get('/withdrawals');
    return res.data;
  } catch (error) {
    return { success: true, data: mockSellerWithdrawals };
  }
};

export const updateWithdrawalStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/withdrawals/${id}`, { status });
    return res.data;
  } catch (error) {
    const item = mockSellerWithdrawals.find((w) => w.id === Number(id));
    if (item) {
      item.status = status;
      if (status === 'approved') item.processed_at = new Date().toISOString();
    }
    return { success: true, message: `Withdrawal request ${status}` };
  }
};

export const requestSellerWithdrawal = async (withdrawData) => {
  try {
    const res = await apiClient.post('/withdrawals', withdrawData);
    return res.data;
  } catch (error) {
    const newW = {
      id: mockSellerWithdrawals.length + 1,
      ...withdrawData,
      status: 'pending',
      requested_at: new Date().toISOString(),
      processed_at: null,
    };
    mockSellerWithdrawals.unshift(newW);
    return { success: true, data: newW, message: 'Withdrawal requested successfully' };
  }
};

// 7. Coupons & Banners API
export const getCoupons = async () => {
  try {
    const res = await apiClient.get('/coupons');
    return res.data;
  } catch (error) {
    return { success: true, data: mockCoupons };
  }
};

export const createCoupon = async (couponData) => {
  try {
    const res = await apiClient.post('/coupons', couponData);
    return res.data;
  } catch (error) {
    const newC = { id: mockCoupons.length + 1, ...couponData, usage_count: 0 };
    mockCoupons.unshift(newC);
    return { success: true, data: newC, message: 'Coupon created' };
  }
};

export const getBanners = async () => {
  try {
    const res = await apiClient.get('/banners');
    return res.data;
  } catch (error) {
    return { success: true, data: mockBanners };
  }
};

// 8. Notifications & Support Tickets API
export const getNotifications = async (userId = null) => {
  try {
    const res = await apiClient.get('/notifications', { params: { userId } });
    return res.data;
  } catch (error) {
    let filtered = [...mockNotifications];
    if (userId) filtered = filtered.filter((n) => n.user_id === Number(userId) || n.user_id === null);
    return { success: true, data: filtered };
  }
};

export const getSupportTickets = async (params = {}) => {
  try {
    const res = await apiClient.get('/support-tickets', { params });
    return res.data;
  } catch (error) {
    let filtered = [...mockSupportTickets];
    if (params.userRole) filtered = filtered.filter((t) => t.user_role === params.userRole);
    if (params.status) filtered = filtered.filter((t) => t.status === params.status);
    return { success: true, data: filtered };
  }
};

export const createSupportTicket = async (ticketData) => {
  try {
    const res = await apiClient.post('/support-tickets', ticketData);
    return res.data;
  } catch (error) {
    const newT = {
      id: mockSupportTickets.length + 1,
      ...ticketData,
      status: 'open',
      created_at: new Date().toISOString(),
    };
    mockSupportTickets.unshift(newT);
    return { success: true, data: newT, message: 'Ticket submitted successfully' };
  }
};

// 9. Reviews API
export const getReviews = async (productId = 'all') => {
  try {
    const res = await apiClient.get(`/reviews/${productId}`);
    return res.data;
  } catch (error) {
    let filtered = [...mockReviews];
    if (productId !== 'all') filtered = filtered.filter((r) => r.product_id === Number(productId));
    return { success: true, data: filtered };
  }
};

export const submitReview = async (reviewData) => {
  try {
    const res = await apiClient.post('/reviews', reviewData);
    return res.data;
  } catch (error) {
    const newR = {
      id: mockReviews.length + 1,
      ...reviewData,
      seller_reply: null,
      created_at: new Date().toISOString(),
    };
    mockReviews.unshift(newR);
    return { success: true, data: newR, message: 'Review submitted successfully' };
  }
};

export const replyReview = async (reviewId, replyText) => {
  try {
    const res = await apiClient.post(`/reviews/${reviewId}/reply`, { replyText });
    return res.data;
  } catch (error) {
    const r = mockReviews.find((rev) => rev.id === Number(reviewId));
    if (r) r.seller_reply = replyText;
    return { success: true, message: 'Reply posted' };
  }
};

// 10. Addresses API
export const getAddresses = async (userId = 2) => {
  try {
    const res = await apiClient.get(`/users/${userId}/addresses`);
    return res.data;
  } catch (error) {
    const filtered = mockAddresses.filter((a) => a.user_id === Number(userId));
    return { success: true, data: filtered };
  }
};

export const saveAddress = async (addressData) => {
  try {
    const res = await apiClient.post('/addresses', addressData);
    return res.data;
  } catch (error) {
    const newAddr = { id: mockAddresses.length + 1, ...addressData };
    mockAddresses.push(newAddr);
    return { success: true, data: newAddr, message: 'Address saved' };
  }
};

// 11. Site Settings & Stats API
export const getSiteSettings = async () => {
  try {
    const res = await apiClient.get('/settings');
    return res.data;
  } catch (error) {
    return { success: true, data: mockSiteSettings };
  }
};

export const updateSiteSettings = async (settingsData) => {
  try {
    const res = await apiClient.put('/settings', settingsData);
    return res.data;
  } catch (error) {
    Object.assign(mockSiteSettings, settingsData);
    return { success: true, message: 'Settings saved' };
  }
};

// 12. Popup Notice API
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
    const totalRev = mockOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return {
      success: true,
      data: {
        totalRevenue: totalRev,
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter((o) => o.status === 'Pending').length,
        deliveredOrders: mockOrders.filter((o) => o.status === 'Delivered').length,
        totalProducts: mockProducts.length,
        totalUsers: mockUsers.length,
        totalSellers: mockSellers.length,
      },
    };
  }
};

// Auth API
export const registerUser = async (data) => {
  try {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  } catch (error) {
    const user = {
      id: mockUsers.length + 1,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.phone}@user.com`,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    };
    mockUsers.push(user);
    return { success: true, token: 'mock-jwt-token-12345', user };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  } catch (error) {
    if (data.phone === '01700000000' && data.password === 'admin123') {
      return {
        success: true,
        token: 'mock-admin-token-7788',
        user: { id: 1, name: 'Admin Moderator', phone: '01700000000', role: 'admin' },
      };
    }
    const found = mockUsers.find((u) => u.phone === data.phone);
    if (found) {
      return { success: true, token: 'mock-user-token-9900', user: found };
    }
    return {
      success: true,
      token: 'mock-user-token-9900',
      user: { id: 2, name: 'Md. Ariful Islam', phone: data.phone, role: 'customer' },
    };
  }
};

export default apiClient;

