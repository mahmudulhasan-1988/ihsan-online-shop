import { createAuthClient } from "better-auth/react";

const getClientBaseUrl = () => {
  // In the browser, always use the current window origin so it seamlessly works on localhost, Vercel, or custom domains without CORS issues
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL && !process.env.NEXT_PUBLIC_BETTER_AUTH_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://ihsan-online-shop.vercel.app";
};

export const authClient = createAuthClient({
  baseURL: getClientBaseUrl(),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;