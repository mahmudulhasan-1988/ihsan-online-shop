'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { sendHeartbeat, sendUserOffline } from '@/lib/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fastOrderData, setFastOrderData] = useState({ isOpen: false, product: null, variant: null });
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Load cart and user from localStorage on initial render
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
    } catch (e) {
      console.error('Error loading cart from storage', e);
    }
  }, []);

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
    const stock = product.stock_quantity !== undefined ? Number(product.stock_quantity) : (product.stock !== undefined ? Number(product.stock) : 50);

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
  const openFastOrder = (product, variant = null) => {
    const stock = product.stock_quantity !== undefined ? Number(product.stock_quantity) : (product.stock !== undefined ? Number(product.stock) : 50);
    if (stock <= 0) {
      showToast(`দুঃখিত, "${product.name}" বর্তমানে স্টক আউট (Out Of Stock)!`, 'error');
      return;
    }
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
    setFastOrderData({
      isOpen: true,
      product,
      variant: selectedVariant,
    });
  };

  const closeFastOrder = () => {
    setFastOrderData({ isOpen: false, product: null, variant: null });
  };

  // User Auth
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('gb_user', JSON.stringify(userData));
    if (token) localStorage.setItem('gb_token', token);
    showToast(`স্বাগতম, ${userData.name}!`);
  };

  const logout = () => {
    if (user) {
      sendUserOffline({
        userId: user.id || user._id,
        email: user.email,
        phone: user.phone,
      });
    }
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
