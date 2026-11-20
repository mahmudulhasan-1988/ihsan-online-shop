import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/e-commerce-web-data';
const dbName = process.env.DB_NAME || 'e-commerce-web-data';

let client;
let db;
try {
  client = new MongoClient(uri);
  db = client.db(dbName);
} catch (e) {
  console.error('MongoDB Auth connection error:', e);
}

const getServerBaseUrl = () => {
  // If running in production or on Vercel
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes('localhost')) {
      return process.env.BETTER_AUTH_URL;
    }
    if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return 'https://ihsan-online-shop.vercel.app';
  }

  // Local development fallback
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'secret-ecommerce-bazar-key-2026-auth',
  baseURL: getServerBaseUrl(),
  trustedOrigins: [
    'https://ihsan-online-shop.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
  ].filter(Boolean),
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer', // 'customer' | 'seller' | 'admin'
      },
      phone: {
        type: 'string',
        required: false,
      },
      avatar: {
        type: 'string',
        required: false,
      },
      address: {
        type: 'string',
        required: false,
      },
      isBlocked: {
        type: 'boolean',
        defaultValue: false,
      },
      isPremium: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },
});
