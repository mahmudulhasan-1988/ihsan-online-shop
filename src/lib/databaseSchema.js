/**
 * E-commerce Database Schema & ERD Entity Definitions
 * Based on ecommerce-sidebar-and-database-design.md
 */

export const DATABASE_ENTITIES = {
  USERS: 'users',
  SELLERS: 'sellers',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  PRODUCTS: 'products',
  PRODUCT_IMAGES: 'product_images',
  PRODUCT_VARIANTS: 'product_variants',
  CARTS: 'carts',
  WISHLISTS: 'wishlists',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  ADDRESSES: 'addresses',
  PAYMENTS: 'payments',
  SELLER_WITHDRAWALS: 'seller_withdrawals',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  BANNERS: 'banners',
  NOTIFICATIONS: 'notifications',
  SUPPORT_TICKETS: 'support_tickets',
};

export const SCHEMAS = {
  // 1. Users
  users: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'name', type: 'VARCHAR', required: true },
      { name: 'email', type: 'VARCHAR', unique: true, required: true },
      { name: 'phone', type: 'VARCHAR', required: true },
      { name: 'password', type: 'VARCHAR', hashed: true, required: true },
      { name: 'role', type: 'ENUM', values: ['admin', 'seller', 'customer'], default: 'customer' },
      { name: 'avatar', type: 'VARCHAR', nullable: true },
      { name: 'status', type: 'ENUM', values: ['active', 'blocked'], default: 'active' },
      { name: 'email_verified_at', type: 'TIMESTAMP', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
    ],
  },

  // 2. Sellers
  sellers: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', required: true },
      { name: 'shop_name', type: 'VARCHAR', required: true },
      { name: 'shop_logo', type: 'VARCHAR', nullable: true },
      { name: 'shop_banner', type: 'VARCHAR', nullable: true },
      { name: 'shop_description', type: 'TEXT', nullable: true },
      { name: 'nid_number', type: 'VARCHAR', nullable: true },
      { name: 'trade_license', type: 'VARCHAR', nullable: true },
      { name: 'status', type: 'ENUM', values: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
      { name: 'commission_rate', type: 'DECIMAL', default: 10.0 }, // percentage %
      { name: 'balance', type: 'DECIMAL', default: 0.0 },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
    ],
  },

  // 3. Categories
  categories: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'parent_id', type: 'BIGINT', foreignKey: 'categories.id', nullable: true },
      { name: 'name', type: 'VARCHAR', required: true },
      { name: 'name_bn', type: 'VARCHAR', nullable: true },
      { name: 'slug', type: 'VARCHAR', unique: true, required: true },
      { name: 'image', type: 'VARCHAR', nullable: true },
      { name: 'status', type: 'ENUM', values: ['active', 'inactive'], default: 'active' },
    ],
  },

  // 4. Brands
  brands: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'name', type: 'VARCHAR', required: true },
      { name: 'logo', type: 'VARCHAR', nullable: true },
      { name: 'status', type: 'ENUM', values: ['active', 'inactive'], default: 'active' },
    ],
  },

  // 5. Products
  products: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'seller_id', type: 'BIGINT', foreignKey: 'sellers.id', nullable: true },
      { name: 'category_id', type: 'BIGINT', foreignKey: 'categories.id', required: true },
      { name: 'brand_id', type: 'BIGINT', foreignKey: 'brands.id', nullable: true },
      { name: 'name', type: 'VARCHAR', required: true },
      { name: 'name_bn', type: 'VARCHAR', nullable: true },
      { name: 'slug', type: 'VARCHAR', unique: true, required: true },
      { name: 'description', type: 'TEXT' },
      { name: 'price', type: 'DECIMAL', required: true },
      { name: 'discount_price', type: 'DECIMAL', nullable: true },
      { name: 'stock_quantity', type: 'INT', default: 0 },
      { name: 'sku', type: 'VARCHAR', unique: true },
      { name: 'thumbnail', type: 'VARCHAR' },
      { name: 'status', type: 'ENUM', values: ['pending', 'approved', 'rejected'], default: 'approved' },
      { name: 'is_active', type: 'BOOLEAN', default: true },
      { name: 'is_featured', type: 'BOOLEAN', default: false },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
    ],
  },

  // 6. Product Images
  product_images: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'product_id', type: 'BIGINT', foreignKey: 'products.id', required: true },
      { name: 'image_path', type: 'VARCHAR', required: true },
    ],
  },

  // 7. Product Variants
  product_variants: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'product_id', type: 'BIGINT', foreignKey: 'products.id', required: true },
      { name: 'attribute_name', type: 'VARCHAR', required: true }, // Weight / Size / Color
      { name: 'attribute_value', type: 'VARCHAR', required: true }, // 500gm / 1kg / XL
      { name: 'price', type: 'DECIMAL', required: true },
      { name: 'regular_price', type: 'DECIMAL', nullable: true },
      { name: 'stock', type: 'INT', default: 0 },
    ],
  },

  // 8. Carts
  carts: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', required: true },
      { name: 'product_id', type: 'BIGINT', foreignKey: 'products.id', required: true },
      { name: 'variant_id', type: 'BIGINT', foreignKey: 'product_variants.id', nullable: true },
      { name: 'quantity', type: 'INT', default: 1 },
    ],
  },

  // 9. Wishlists
  wishlists: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', required: true },
      { name: 'product_id', type: 'BIGINT', foreignKey: 'products.id', required: true },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },

  // 10. Orders
  orders: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', nullable: true },
      { name: 'order_number', type: 'VARCHAR', unique: true, required: true },
      { name: 'customer_name', type: 'VARCHAR', required: true },
      { name: 'customer_phone', type: 'VARCHAR', required: true },
      { name: 'delivery_address', type: 'TEXT', required: true },
      { name: 'delivery_zone', type: 'VARCHAR', default: 'inside_dhaka' },
      { name: 'total_amount', type: 'DECIMAL', required: true },
      { name: 'subtotal', type: 'DECIMAL', required: true },
      { name: 'discount_amount', type: 'DECIMAL', default: 0.0 },
      { name: 'shipping_charge', type: 'DECIMAL', default: 70.0 },
      { name: 'payment_method', type: 'VARCHAR', default: 'cod' },
      { name: 'payment_status', type: 'ENUM', values: ['paid', 'unpaid'], default: 'unpaid' },
      { name: 'order_status', type: 'ENUM', values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'pending' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
    ],
  },

  // 11. Order Items
  order_items: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'order_id', type: 'BIGINT', foreignKey: 'orders.id', required: true },
      { name: 'product_id', type: 'BIGINT', foreignKey: 'products.id', required: true },
      { name: 'seller_id', type: 'BIGINT', foreignKey: 'sellers.id', nullable: true },
      { name: 'variant_id', type: 'BIGINT', foreignKey: 'product_variants.id', nullable: true },
      { name: 'name', type: 'VARCHAR', required: true },
      { name: 'weight', type: 'VARCHAR', nullable: true },
      { name: 'quantity', type: 'INT', required: true },
      { name: 'price', type: 'DECIMAL', required: true },
      { name: 'subtotal', type: 'DECIMAL', required: true },
      { name: 'status', type: 'ENUM', values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    ],
  },

  // 12. Addresses
  addresses: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', required: true },
      { name: 'title', type: 'VARCHAR', default: 'Home' }, // Home, Office
      { name: 'full_name', type: 'VARCHAR', required: true },
      { name: 'phone', type: 'VARCHAR', required: true },
      { name: 'address_line', type: 'TEXT', required: true },
      { name: 'city', type: 'VARCHAR', default: 'Dhaka' },
      { name: 'district', type: 'VARCHAR', default: 'Dhaka' },
      { name: 'postal_code', type: 'VARCHAR', nullable: true },
      { name: 'is_default', type: 'BOOLEAN', default: false },
    ],
  },

  // 13. Payments
  payments: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'order_id', type: 'BIGINT', foreignKey: 'orders.id', required: true },
      { name: 'method', type: 'ENUM', values: ['bkash', 'nagad', 'sslcommerz', 'cod'], required: true },
      { name: 'transaction_id', type: 'VARCHAR', nullable: true },
      { name: 'amount', type: 'DECIMAL', required: true },
      { name: 'status', type: 'ENUM', values: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },

  // 14. Seller Withdrawals
  seller_withdrawals: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'seller_id', type: 'BIGINT', foreignKey: 'sellers.id', required: true },
      { name: 'amount', type: 'DECIMAL', required: true },
      { name: 'method', type: 'VARCHAR', default: 'bKash Merchant' },
      { name: 'account_details', type: 'VARCHAR', required: true },
      { name: 'status', type: 'ENUM', values: ['pending', 'approved', 'rejected'], default: 'pending' },
      { name: 'requested_at', type: 'TIMESTAMP' },
      { name: 'processed_at', type: 'TIMESTAMP', nullable: true },
    ],
  },

  // 15. Reviews
  reviews: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', nullable: true },
      { name: 'user_name', type: 'VARCHAR', required: true },
      { name: 'product_id', type: 'BIGINT', foreignKey: 'products.id', required: true },
      { name: 'rating', type: 'TINYINT', min: 1, max: 5, default: 5 },
      { name: 'comment', type: 'TEXT', required: true },
      { name: 'seller_reply', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },

  // 16. Coupons
  coupons: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'seller_id', type: 'BIGINT', foreignKey: 'sellers.id', nullable: true }, // null = admin-wide
      { name: 'code', type: 'VARCHAR', unique: true, required: true },
      { name: 'discount_type', type: 'ENUM', values: ['percentage', 'fixed'], default: 'percentage' },
      { name: 'discount_value', type: 'DECIMAL', required: true },
      { name: 'min_purchase', type: 'DECIMAL', default: 500.0 },
      { name: 'expiry_date', type: 'DATE', required: true },
      { name: 'status', type: 'ENUM', values: ['active', 'expired'], default: 'active' },
    ],
  },

  // 17. Banners
  banners: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'title', type: 'VARCHAR', required: true },
      { name: 'subtitle', type: 'VARCHAR', nullable: true },
      { name: 'image', type: 'VARCHAR', required: true },
      { name: 'link', type: 'VARCHAR', default: '/products' },
      { name: 'position', type: 'ENUM', values: ['homepage_hero', 'category', 'popup', 'promo'], default: 'homepage_hero' },
      { name: 'status', type: 'ENUM', values: ['active', 'inactive'], default: 'active' },
    ],
  },

  // 18. Notifications
  notifications: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', nullable: true }, // null = broadcast
      { name: 'title', type: 'VARCHAR', required: true },
      { name: 'message', type: 'TEXT', required: true },
      { name: 'type', type: 'ENUM', values: ['order', 'promo', 'system'], default: 'order' },
      { name: 'is_read', type: 'BOOLEAN', default: false },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },

  // 19. Support Tickets
  support_tickets: {
    fields: [
      { name: 'id', type: 'BIGINT', primaryKey: true },
      { name: 'user_id', type: 'BIGINT', foreignKey: 'users.id', nullable: true },
      { name: 'user_name', type: 'VARCHAR', required: true },
      { name: 'user_role', type: 'ENUM', values: ['customer', 'seller'], default: 'customer' },
      { name: 'subject', type: 'VARCHAR', required: true },
      { name: 'message', type: 'TEXT', required: true },
      { name: 'priority', type: 'ENUM', values: ['low', 'medium', 'high'], default: 'medium' },
      { name: 'status', type: 'ENUM', values: ['open', 'in_progress', 'closed'], default: 'open' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
  },
};
