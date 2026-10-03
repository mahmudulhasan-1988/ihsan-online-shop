import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeLanguageProvider } from '@/context/ThemeLanguageContext';
import SmoothScroll from '@/components/SmoothScroll';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import FastOrderModal from '@/components/FastOrderModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import ToastNotification from '@/components/ToastNotification';
import PopupMessage from '@/components/PopupMessage';
import FloatingCartButton from '@/components/FloatingCartButton';

export const metadata = {
  title: 'ইহসান অনলাইন শপ (Ihsan Online Shop) - ১০০% খাঁটি ও নিরাপদ অর্গানিক খাদ্য',
  description: 'ইহসান অনলাইন শপ - বাংলাদেশের বিশ্বস্ত অর্গানিক ই-কমার্স শপ। সুন্দরবনের খাঁটি মধু, গাওয়া ঘি, ঘানি ভাঙা সরিষার তেল, প্রিমিয়াম খেজুর ও পুষ্টিকর খাবার ক্যাশ অন ডেলিভারিতে কিনুন।',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" data-theme="ihsan" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#fafbf7] dark:bg-[#0b1710] text-[#1c2920] dark:text-[#e4eee7] antialiased selection:bg-brand-800 selection:text-white transition-colors duration-300">
        <ThemeLanguageProvider>
          <CartProvider>
            <SmoothScroll>
              <ToastNotification />
              <PopupMessage />
              <FloatingCartButton />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <FastOrderModal />
              <MobileBottomNav />
            </SmoothScroll>
          </CartProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}


