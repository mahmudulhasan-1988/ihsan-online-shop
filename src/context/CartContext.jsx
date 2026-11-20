'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { 
  sendHeartbeat, 
  sendUserOffline,
  getWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist
} from '@/lib/api';
import { trackIncompleteOrder } from '@/lib/incompleteTracker';
import { authClient } from '@/lib/auth-client';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fastOrderData, setFastOrderData] = useState({ isOpen: false, product: null, variant: null, source: '' });
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // 💖 Wishlist State
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // 🤖 AI Chat State
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  const openAiChat = (prompt = '') => {
    if (prompt) setAiInitialPrompt(prompt);
    setIsAiChatOpen(true);
  };
  const closeAiChat = () => {
    setIsAiChatOpen(false);
  };
  const toggleAiChat = () => {
    setIsAiChatOpen(prev => !prev);
  };

  // Load cart, user and wishlist from localStorage on client mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('gb_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedUser = localStorage.getItem('gb_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedWishlist = localStorage.getItem('gb_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error('Error loading cart/user/wishlist from storage', e);
    }
  }, []);

  // Synchronize Better Auth (e.g. Google OAuth) session with CartContext, Header & MongoDB
  useEffect(() => {
    let isMounted = true;
    const syncBetterAuthSession = async () => {
      try {
        if (!authClient || typeof authClient.getSession !== 'function') return;
        const sessionRes = await authClient.getSession();
        const sessionUser = sessionRes?.data?.user;

        if (isMounted && sessionUser) {
          const userAvatar = sessionUser.avatar || sessionUser.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
          const normalizedUser = {
            id: sessionUser.id || sessionUser._id,
            _id: sessionUser.id || sessionUser._id,
            name: sessionUser.name || 'Google User',
            email: sessionUser.email || '',
            phone: sessionUser.phone || '',
            avatar: userAvatar,
            image: userAvatar,
            role: sessionUser.role || 'customer',
            status: sessionUser.status || 'active',
          };

          setUser(prev => {
            const merged = {
              ...(prev || {}),
              ...normalizedUser,
              name: prev?.name || normalizedUser.name,
              avatar: normalizedUser.avatar || prev?.avatar,
              phone: prev?.phone || normalizedUser.phone,
            };
            try {
              localStorage.setItem('gb_user', JSON.stringify(merged));
              if (sessionRes?.data?.session?.token) {
                localStorage.setItem('gb_token', sessionRes.data.session.token);
              }
            } catch (storageErr) {}
            return merged;
          });
        }
      } catch (err) {
        // Ignored in offline or server environments
      }
    };

    syncBetterAuthSession();
    return () => { isMounted = false; };
  }, []);

  // Fetch & Sync user Wishlist from MongoDB on login
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const userId = user?.id || user?._id || user?.email;
      if (!userId) return;

      setIsWishlistLoading(true);
      try {
        const res = await getWishlist(userId);
        if (res && res.success && Array.isArray(res.data)) {
          const items = res.data.map(item => item.product || item);
          setWishlist(items);
          localStorage.setItem('gb_wishlist', JSON.stringify(items));
        }
      } catch (err) {
        console.error('Failed to load user wishlist from MongoDB', err);
      } finally {
        setIsWishlistLoading(false);
      }
    };

    fetchUserWishlist();
  }, [user]);

  // Real-time online heartbeat tracking
  useEffect(() => {
    if (!user) return;

    const payload = {
      userId: user.id || user._id,
      email: user.email,
      phone: user.phone,
    };

    // Immediate ping upon login / mounting
    sendHeartbeat(payload);

    // Periodic ping every 30 seconds
    const interval = setInterval(() => {
      sendHeartbeat(payload);
    }, 30000);

    // Handle tab close or page navigation
    const handleBeforeUnload = () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${apiUrl}/users/offline`, blob);
      } catch (e) {
        sendUserOffline(payload);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gb_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }, [cart]);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Add Item to Cart
  const addToCart = (product, variant = null, quantity = 1, openDrawer = true) => {
    const stock = product.stock_quantity != null ? Number(product.stock_quantity) : (product.stock != null ? Number(product.stock) : 0);

    // If Out of Stock
    if (stock <= 0) {
      showToast(`দুঃখিত, "${product.name}" বর্তমানে স্টক আউট (Out Of Stock)!`, 'error');
      return;
    }

    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
    const itemWeight = selectedVariant ? selectedVariant.weight : product.unit || 'Standard';
    const itemPrice = selectedVariant ? selectedVariant.price : product.price;
    const itemRegularPrice = selectedVariant ? selectedVariant.regularPrice : product.regularPrice;
    const itemImage = product.images && product.images.length > 0 ? product.images[0] : (product.thumbnail || '/placeholder.jpg');

    const cartItemId = `${product.id || product._id}-${itemWeight}`;

    const existingItem = cart.find((item) => item.cartItemId === cartItemId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalRequestedQty = currentQtyInCart + quantity;

    if (totalRequestedQty > stock) {
      showToast(`দুঃখিত, "${product.name}" এর সর্বোচ্চ ${stock} টি স্টক অবশিষ্ট আছে! (কার্টে ইতিমধ্যে ${currentQtyInCart} টি আছে)`, 'error');
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].stock = stock;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            productId: product.id || product._id,
            name: product.name,
            nameEn: product.nameEn,
            slug: product.slug,
            weight: itemWeight,
            price: itemPrice,
            regularPrice: itemRegularPrice,
            image: itemImage,
            stock,
            quantity: Math.max(1, quantity),
            sellerName: product.seller_name || product.sellerName || product.shop_name || 'সুন্দরবন অর্গানিক ফার্মস',
            sellerId: product.seller_id || product.sellerId || null
          },
        ];
      }
    });

    // 🛒 Track Incomplete Order on "Add to Cart" action
    try {
      const itemToTrack = {
        productId: product.id || product._id,
        name: product.name,
        weight: itemWeight,
        price: itemPrice,
        quantity: Math.max(1, quantity),
        image: itemImage,
      };
      const existingInCart = cart.filter(it => it.cartItemId !== cartItemId);
      trackIncompleteOrder({
        items: [itemToTrack],
        source: 'কার্টে যোগ করেছেন (Add to Cart)',
        user,
        debounceMs: 500
      });
    } catch (e) {
      console.warn('Track on Add to Cart error:', e);
    }

    showToast(`"${product.name}" কার্টে যোগ করা হয়েছে!`);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  // Update Item Quantity
  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const item = cart.find((i) => i.cartItemId === cartItemId);
    const maxStock = item?.stock !== undefined ? Number(item.stock) : 50;

    if (newQty > maxStock) {
      showToast(`দুঃখিত, এই পণ্যের সর্বোচ্চ ${maxStock} টি স্টক অবশিষ্ট আছে!`, 'error');
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Remove Item from Cart
  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
    showToast('পণ্যটি কার্ট থেকে সরানো হয়েছে', 'info');
  };

  // Clear Entire Cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gb_cart');
  };

  // Fast Order Trigger (1-Click Buy Modal)
  const openFastOrder = (product, variant = null, source = '১-ক্লিক সরাসরি অর্ডার') => {
    const stock = product.stock_quantity != null ? Number(product.stock_quantity) : (product.stock != null ? Number(product.stock) : 0);
    if (stock <= 0) {
      showToast(`দুঃখিত, "${product.name}" বর্তমানে স্টক আউট (Out Of Stock)!`, 'error');
      return;
    }
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
    setFastOrderData({
      isOpen: true,
      product,
      variant: selectedVariant,
      source: source || '১-ক্লিক সরাসরি অর্ডার'
    });
  };

  const closeFastOrder = () => {
    setFastOrderData({ isOpen: false, product: null, variant: null, source: '' });
  };

  // ==========================================
  // 💖 Wishlist Actions (Synced with MongoDB & LocalStorage)
  // ==========================================
  const isInWishlist = (productId) => {
    if (!productId) return false;
    const s = String(productId);
    return wishlist.some(p => String(p.id || p._id || p.productId || p.slug) === s);
  };

  const addToWishlist = async (product) => {
    if (!product) return;
    const prodId = String(product.id || product._id || product.slug);
    if (isInWishlist(prodId)) {
      showToast('পণ্যটি ইতিমধ্যে পছন্দের তালিকায় রয়েছে!', 'info');
      return;
    }

    const updated = [product, ...wishlist];
    setWishlist(updated);
    localStorage.setItem('gb_wishlist', JSON.stringify(updated));
    showToast('পছন্দের তালিকায় যুক্ত হয়েছে! ❤️');

    const userId = user?.id || user?._id || user?.email;
    if (userId) {
      try {
        await apiAddToWishlist(prodId, product, userId);
      } catch (e) {
        console.error('Wishlist server add error', e);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!productId) return;
    const s = String(productId);
    const updated = wishlist.filter(p => String(p.id || p._id || p.productId || p.slug) !== s);
    setWishlist(updated);
    localStorage.setItem('gb_wishlist', JSON.stringify(updated));
    showToast('পছন্দের তালিকা থেকে সরানো হয়েছে 💔', 'info');

    const userId = user?.id || user?._id || user?.email;
    if (userId) {
      try {
        await apiRemoveFromWishlist(s, userId);
      } catch (e) {
        console.error('Wishlist server delete error', e);
      }
    }
  };

  const toggleWishlist = async (product) => {
    if (!product) return;
    const prodId = String(product.id || product._id || product.slug);
    if (isInWishlist(prodId)) {
      await removeFromWishlist(prodId);
    } else {
      await addToWishlist(product);
    }
  };

  // User Auth
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('gb_user', JSON.stringify(userData));
    if (token) localStorage.setItem('gb_token', token);
    showToast(`স্বাগতম, ${userData.name}!`);
  };

  const logout = async () => {
    if (user) {
      sendUserOffline({
        userId: user.id || user._id,
        email: user.email,
        phone: user.phone,
      });
    }
    try {
      if (authClient && typeof authClient.signOut === 'function') {
        await authClient.signOut();
      }
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('gb_user');
    localStorage.removeItem('gb_token');
    showToast('লগআউট সম্পন্ন হয়েছে', 'info');
  };

  // Subtotal & Total Items calculation
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        openCartDrawer: () => setIsCartOpen(true),
        closeCartDrawer: () => setIsCartOpen(false),
        fastOrderData,
        openFastOrder,
        closeFastOrder,
        user,
        login,
        logout,
        toast,
        showToast,
        isAiChatOpen,
        openAiChat,
        closeAiChat,
        toggleAiChat,
        aiInitialPrompt,
        setAiInitialPrompt,
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistLoading,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
