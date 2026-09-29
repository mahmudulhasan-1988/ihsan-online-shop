# E-commerce Website — Sidebar Menu Structure & Database Design (ERD)

---

# 📌 PART 1: Sidebar Menu Structure

## 🔴 Admin Dashboard Sidebar

```
📊 Dashboard (Overview/Analytics)
👥 User Management
   ├── All Users
   ├── Blocked Users
   └── User Details/Order History

🏪 Seller Management
   ├── All Sellers
   ├── Pending Approval
   ├── Verified Sellers
   ├── Suspended Sellers
   └── Commission Settings

📦 Product Management
   ├── All Products
   ├── Pending Approval
   ├── Categories
   ├── Sub-Categories
   ├── Brands
   └── Attributes (Size, Color, etc.)

🛒 Order Management
   ├── All Orders
   ├── Pending Orders
   ├── Processing Orders
   ├── Shipped Orders
   ├── Delivered Orders
   ├── Cancelled Orders
   └── Return/Refund Requests

💰 Payment Management
   ├── Payment Gateways
   ├── Seller Payouts/Withdraw Requests
   ├── Transaction History
   └── Refund Management

🎯 Marketing
   ├── Banners/Sliders
   ├── Coupons/Discounts
   ├── Flash Sale
   └── Notifications (Email/SMS/Push)

📝 Content Management (CMS)
   ├── Homepage Sections
   ├── Blog Posts
   ├── Pages (About, Privacy Policy, Terms)
   └── FAQ

📈 Reports
   ├── Sales Report
   ├── Product Report
   ├── Seller Report
   └── Export (PDF/Excel)

💬 Support/Tickets
   ├── Customer Tickets
   └── Seller Tickets

⚙️ Settings
   ├── Site Settings
   ├── Shipping Settings
   ├── Tax Settings
   ├── SEO Settings
   ├── Admin Roles & Permissions
   └── Language/Currency
```

---

## 🟢 Seller Dashboard Sidebar

```
📊 Dashboard (Sales Overview)

📦 Product Management
   ├── All Products
   ├── Add New Product
   ├── Inventory/Stock
   └── Bulk Upload (CSV/Excel)

🛒 Order Management
   ├── New Orders
   ├── Processing
   ├── Shipped
   ├── Delivered
   ├── Cancelled
   └── Return/Refund Requests

💰 Earnings & Payments
   ├── Earnings Overview
   ├── Withdraw Request
   └── Transaction History

🏬 Store Settings
   ├── Shop Profile
   ├── Shop Logo/Banner
   └── Shop Policy

⭐ Reviews & Ratings
   └── Customer Reviews (Reply)

🎯 Promotions
   └── Discount/Coupon (Product-wise)

💬 Support
   ├── Customer Chat
   └── Support Ticket (to Admin)

👤 Profile Settings
   ├── Personal Info
   └── Change Password
```

---

## 🔵 User (Customer) Dashboard Sidebar

```
📊 Dashboard (Overview)

👤 My Profile
   ├── Edit Profile
   └── Change Password

🛒 My Orders
   ├── Order History
   ├── Track Order
   ├── Cancel/Return Request
   └── Invoice Download

📍 Address Book
   └── Manage Shipping Addresses

❤️ Wishlist

🛍️ My Cart

⭐ My Reviews

💳 Payment Methods
   └── Saved Cards/Wallet

🔔 Notifications

💬 Support/Help
   └── Live Chat / Ticket
```

---

# 📌 PART 2: Database Design (ERD)

## Core Tables Overview

### 1. `users`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| name | VARCHAR | |
| email | VARCHAR (unique) | |
| phone | VARCHAR | |
| password | VARCHAR | hashed |
| role | ENUM | admin / seller / customer |
| avatar | VARCHAR | |
| status | ENUM | active / blocked |
| email_verified_at | TIMESTAMP | |
| created_at / updated_at | TIMESTAMP | |

### 2. `sellers`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| shop_name | VARCHAR | |
| shop_logo | VARCHAR | |
| shop_banner | VARCHAR | |
| shop_description | TEXT | |
| nid_number | VARCHAR | |
| trade_license | VARCHAR | |
| status | ENUM | pending / approved / rejected / suspended |
| commission_rate | DECIMAL | % |
| created_at / updated_at | TIMESTAMP | |

### 3. `categories`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| parent_id | BIGINT (FK → categories.id, nullable) | for sub-category |
| name | VARCHAR | |
| slug | VARCHAR | |
| image | VARCHAR | |
| status | ENUM | active / inactive |

### 4. `brands`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| name | VARCHAR | |
| logo | VARCHAR | |

### 5. `products`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| seller_id | BIGINT (FK → sellers.id) | |
| category_id | BIGINT (FK → categories.id) | |
| brand_id | BIGINT (FK → brands.id, nullable) | |
| name | VARCHAR | |
| slug | VARCHAR | |
| description | TEXT | |
| price | DECIMAL | |
| discount_price | DECIMAL | nullable |
| stock_quantity | INT | |
| sku | VARCHAR | |
| thumbnail | VARCHAR | |
| status | ENUM | pending / approved / rejected |
| is_active | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |

### 6. `product_images`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| product_id | BIGINT (FK → products.id) | |
| image_path | VARCHAR | |

### 7. `product_variants`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| product_id | BIGINT (FK → products.id) | |
| attribute_name | VARCHAR | Size / Color |
| attribute_value | VARCHAR | XL / Red |
| extra_price | DECIMAL | |
| stock | INT | |

### 8. `carts`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| product_id | BIGINT (FK → products.id) | |
| variant_id | BIGINT (FK, nullable) | |
| quantity | INT | |

### 9. `wishlists`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| product_id | BIGINT (FK → products.id) | |

### 10. `orders`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| order_number | VARCHAR | |
| total_amount | DECIMAL | |
| discount_amount | DECIMAL | |
| shipping_charge | DECIMAL | |
| payment_status | ENUM | paid / unpaid |
| order_status | ENUM | pending / processing / shipped / delivered / cancelled / returned |
| shipping_address_id | BIGINT (FK → addresses.id) | |
| created_at / updated_at | TIMESTAMP | |

### 11. `order_items`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| order_id | BIGINT (FK → orders.id) | |
| product_id | BIGINT (FK → products.id) | |
| seller_id | BIGINT (FK → sellers.id) | |
| variant_id | BIGINT (FK, nullable) | |
| quantity | INT | |
| price | DECIMAL | |
| subtotal | DECIMAL | |
| status | ENUM | per-item status (seller-wise fulfillment) |

### 12. `addresses`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| full_name | VARCHAR | |
| phone | VARCHAR | |
| address_line | TEXT | |
| city | VARCHAR | |
| district | VARCHAR | |
| postal_code | VARCHAR | |
| is_default | BOOLEAN | |

### 13. `payments`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| order_id | BIGINT (FK → orders.id) | |
| method | ENUM | bkash / nagad / sslcommerz / cod |
| transaction_id | VARCHAR | |
| amount | DECIMAL | |
| status | ENUM | pending / success / failed |
| created_at | TIMESTAMP | |

### 14. `seller_withdrawals`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| seller_id | BIGINT (FK → sellers.id) | |
| amount | DECIMAL | |
| status | ENUM | pending / approved / rejected |
| requested_at | TIMESTAMP | |

### 15. `reviews`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| product_id | BIGINT (FK → products.id) | |
| rating | TINYINT | 1–5 |
| comment | TEXT | |
| seller_reply | TEXT | nullable |
| created_at | TIMESTAMP | |

### 16. `coupons`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| seller_id | BIGINT (FK, nullable) | null = admin-wide coupon |
| code | VARCHAR | |
| discount_type | ENUM | percentage / fixed |
| discount_value | DECIMAL | |
| min_purchase | DECIMAL | |
| expiry_date | DATE | |
| status | ENUM | active / expired |

### 17. `banners`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| title | VARCHAR | |
| image | VARCHAR | |
| link | VARCHAR | |
| position | ENUM | homepage / category |
| status | ENUM | active / inactive |

### 18. `notifications`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id, nullable) | null = broadcast |
| title | VARCHAR | |
| message | TEXT | |
| type | ENUM | order / promo / system |
| is_read | BOOLEAN | |
| created_at | TIMESTAMP | |

### 19. `support_tickets`
| Field | Type | Note |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK → users.id) | |
| subject | VARCHAR | |
| message | TEXT | |
| status | ENUM | open / in_progress / closed |
| created_at | TIMESTAMP | |

---

## 🔗 Relationships Summary

```
users (1) ────< sellers (1)
users (1) ────< addresses (many)
users (1) ────< orders (many)
users (1) ────< carts (many)
users (1) ────< wishlists (many)
users (1) ────< reviews (many)
users (1) ────< notifications (many)
users (1) ────< support_tickets (many)

sellers (1) ────< products (many)
sellers (1) ────< seller_withdrawals (many)
sellers (1) ────< coupons (many, optional)

categories (1) ────< categories (self, parent-child)
categories (1) ────< products (many)
brands (1) ────< products (many)

products (1) ────< product_images (many)
products (1) ────< product_variants (many)
products (1) ────< reviews (many)
products (1) ────< order_items (many)

orders (1) ────< order_items (many)
orders (1) ────< payments (many)
order_items (many) >──── sellers (1)
```

---

### 💡 Next Step Suggestion
এখান থেকে চাইলে আমি বানিয়ে দিতে পারি:
1. **Laravel Migration Files** (এই টেবিলগুলোর জন্য সরাসরি কোড)
2. **Visual ERD Diagram** (ছবি আকারে সম্পর্কগুলো দেখানো)
3. **API Route List** (Admin/Seller/User-এর জন্য RESTful endpoints)

কোনটা লাগবে বলুন।
