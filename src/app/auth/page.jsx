'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { loginUser, registerUser } from '@/lib/api';
import { User, Phone, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, showToast } = useCart();
  const { isBangla, theme } = useThemeLanguage();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ phone: phone.trim(), password });
        if (res.success) {
          login(res.user, res.token);
          if (res.user?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
          showToast(isBangla ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!');
        } else {
          showToast(res.message || (isBangla ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'), 'error');
        }
      } else {
        const res = await registerUser({ name: name.trim(), phone: phone.trim(), password });
        if (res.success) {
          login(res.user, res.token);
          router.push('/');
          showToast(isBangla ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
        } else {
          showToast(res.message || (isBangla ? 'নিবন্ধন ব্যর্থ হয়েছে' : 'Registration failed'), 'error');
        }
      }
    } catch (err) {
      showToast(isBangla ? 'সিস্টেমে ত্রুটি হয়েছে, আবার চেষ্টা করুন।' : 'System error, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setPhone('01700000000');
    setPassword('admin123');
    setIsLogin(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 pb-24">
      <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-[#1d3b28] shadow-xl space-y-6 transition-colors">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-900 to-emerald-700 text-white flex items-center justify-center mx-auto text-2xl shadow-lg mb-3">
            🌿
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-emerald-50">
            {isLogin 
              ? (isBangla ? 'আপনার একাউন্টে লগইন করুন' : 'Login to Your Account') 
              : (isBangla ? 'নতুন একাউন্ট তৈরি করুন' : 'Create a New Account')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-emerald-400">
            {isBangla ? 'ইহসান অনলাইন শপ - ১০০% নিরাপদ ও অর্গানিক ফুড স্টোর' : 'Ihsan Online Shop - 100% Safe & Organic Food Store'}
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="grid grid-cols-2 bg-gray-100 dark:bg-black/30 p-1.5 rounded-2xl border border-gray-200 dark:border-emerald-900/40">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              isLogin 
                ? 'bg-white dark:bg-emerald-900 text-brand-950 dark:text-emerald-100 shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-emerald-200'
            }`}
          >
            {isBangla ? 'লগইন' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              !isLogin 
                ? 'bg-white dark:bg-emerald-900 text-brand-950 dark:text-emerald-100 shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-emerald-200'
            }`}
          >
            {isBangla ? 'নতুন একাউন্ট' : 'Register'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
                {isBangla ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder={isBangla ? 'মো: আরিফুল ইসলাম' : 'Md. Ariful Islam'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500"
                />
                <User className="w-4 h-4 text-gray-400 dark:text-emerald-600 absolute left-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
              {isBangla ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
            </label>
            <div className="relative flex items-center">
              <input
                type="tel"
                required
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500"
              />
              <Phone className="w-4 h-4 text-gray-400 dark:text-emerald-600 absolute left-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-300 mb-1">
              {isBangla ? 'পাসওয়ার্ড *' : 'Password *'}
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                placeholder={isBangla ? 'কমপক্ষে ৬ ডিজিট' : 'Minimum 6 digits'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-emerald-900/60 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-emerald-100 placeholder-gray-400 dark:placeholder-emerald-700 focus:outline-none focus:border-brand-900 dark:focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-gray-400 dark:text-emerald-600 absolute left-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-900 hover:bg-brand-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <span>
                  {isLogin 
                    ? (isBangla ? 'লগইন করুন' : 'Login') 
                    : (isBangla ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Admin Quick Login Helper */}
        <div className="pt-3 border-t border-gray-100 dark:border-emerald-900/40 text-center">
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>
              {isBangla ? '🔑 ডেমো এডমিন দিয়ে প্রবেশ করুন (01700000000)' : '🔑 Quick Demo Admin Login (01700000000)'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
