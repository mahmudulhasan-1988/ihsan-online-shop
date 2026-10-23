import { saveIncompleteOrder } from './api';

// Get or initialize persistent session ID for guest tracking
export const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sId = localStorage.getItem('gb_session_id');
  if (!sId) {
    sId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    try {
      localStorage.setItem('gb_session_id', sId);
    } catch (e) {
      // Ignore quota errors
    }
  }
  return sId;
};

// Debounce timer for customer input changes
let debounceTimer = null;

/**
 * Track or update an Incomplete Order in MongoDB
 */
export const trackIncompleteOrder = ({
  items = [],
  subtotal = 0,
  deliveryZone = 'inside_dhaka',
  deliveryCharge = 70,
  totalAmount = 0,
  customerName = '',
  customerPhone = '',
  customerEmail = '',
  deliveryAddress = '',
  source = 'Instant Order',
  user = null,
  debounceMs = 0
}) => {
  if (typeof window === 'undefined') return;
  if (!items || items.length === 0) return;

  const runTrack = async () => {
    try {
      const sessionId = getSessionId();

      // Retrieve cached guest details from localStorage if not provided
      const cachedName = localStorage.getItem('gb_guest_name') || '';
      const cachedPhone = localStorage.getItem('gb_guest_phone') || '';
      const cachedAddress = localStorage.getItem('gb_guest_address') || '';

      const finalName = (customerName || user?.name || cachedName || '').trim();
      const finalPhone = (customerPhone || user?.phone || cachedPhone || '').trim();
      const finalEmail = (customerEmail || user?.email || '').trim();
      const finalAddress = (deliveryAddress || cachedAddress || '').trim();

      // Update cached guest info if valid values provided
      if (finalName && finalName !== 'অজ্ঞাত ক্রেতা (Guest)') {
        localStorage.setItem('gb_guest_name', finalName);
      }
      if (finalPhone && finalPhone.length >= 11) {
        localStorage.setItem('gb_guest_phone', finalPhone);
      }
      if (finalAddress) {
        localStorage.setItem('gb_guest_address', finalAddress);
      }

      const calculatedSubtotal = Number(subtotal) || items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
      const calculatedDelivery = Number(deliveryCharge) || (deliveryZone === 'inside_dhaka' ? 70 : 120);
      const calculatedTotal = Number(totalAmount) || (calculatedSubtotal + calculatedDelivery);

      const payload = {
        session_id: sessionId,
        userId: user?.id || user?._id || user?.userId || null,
        customerName: finalName || 'অজ্ঞাত ক্রেতা (Guest)',
        customerPhone: finalPhone || 'নম্বর দেয়নি / অপেক্ষমান',
        customerEmail: finalEmail,
        customerAvatar: user?.avatar || '',
        deliveryAddress: finalAddress,
        deliveryZone: deliveryZone || 'inside_dhaka',
        deliveryCharge: calculatedDelivery,
        subtotal: calculatedSubtotal,
        totalAmount: calculatedTotal,
        items: items.map(it => ({
          productId: it.productId || it.id || it._id || '',
          name: it.name || it.name_bn || it.name_en || it.title || 'পণ্য',
          weight: it.weight || it.unit || 'Standard',
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image: it.image || it.thumbnail || (Array.isArray(it.images) ? it.images[0] : '') || ''
        })),
        source: source || 'Instant Order'
      };

      await saveIncompleteOrder(payload);
    } catch (err) {
      console.warn('Track incomplete order error:', err?.message || err);
    }
  };

  if (debounceMs > 0) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runTrack, debounceMs);
  } else {
    runTrack();
  }
};
