import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/e-commerce-web-data';
const dbName = process.env.DB_NAME || 'e-commerce-web-data';

const client = new MongoClient(uri);
const db = client.db(dbName);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'secret-ecommerce-bazar-key-2026',
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
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
