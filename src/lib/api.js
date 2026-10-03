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
