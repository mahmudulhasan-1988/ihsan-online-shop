'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';
import { loginUser, registerUser } from '@/lib/api';
import { uploadToImgBB } from '@/lib/imgbb';
import { signIn } from '@/lib/auth-client';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UploadCloud, 
  Image as ImageIcon, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, showToast } = useCart();
  const { isBangla } = useThemeLanguage();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Handle Image File Upload to ImgBB
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);

    try {
      const result = await uploadToImgBB(file, `${name || 'user'}_avatar`);
      if (result.success && result.url) {
        setAvatarUrl(result.url);
        showToast(isBangla ? 'ছবি সফলভাবে ImgBB তে আপলোড হয়েছে!' : 'Photo uploaded to ImgBB successfully!');
      } else {
        showToast(result.message || (isBangla ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed'), 'error');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      showToast(isBangla ? 'ছবি আপলোডে সমস্যা হয়েছে' : 'Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow (Email or Phone + Password)
        const loginIdentifier = email.trim() || phone.trim();
        if (!loginIdentifier || !password) {
          showToast(isBangla ? 'অনুগ্রহ করে ইমেইল/মোবাইল এবং পাসওয়ার্ড প্রদান করুন' : 'Please provide Email/Phone and Password', 'error');
          setLoading(false);
          return;
        }

        const res = await loginUser({ identifier: loginIdentifier, email: email.trim(), phone: phone.trim(), password });
        if (res.success && res.user) {
          login(res.user, res.token);
          router.push('/');
          showToast(isBangla ? `স্বাগতম, ${res.user.name}!` : `Welcome back, ${res.user.name}!`);
        } else {
          showToast(res.message || (isBangla ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'), 'error');
        }
      } else {
        // Registration flow
        if (!name.trim()) {
          showToast(isBangla ? 'আপনার পূর্ণ নাম লিখুন' : 'Please enter your Full Name', 'error');
          setLoading(false);
          return;
        }
        if (!email.trim() && !phone.trim()) {
          showToast(isBangla ? 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন' : 'Please enter Email or Phone Number', 'error');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          showToast(isBangla ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters', 'error');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          showToast(isBangla ? 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!' : 'Password and Confirm Password do not match!', 'error');
          setLoading(false);
          return;
        }

        const finalAvatar = avatarUrl.trim() || imagePreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

        const res = await registerUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          avatar: finalAvatar,
          role: 'customer' // All registered users are customer by default
        });

        if (res.success && res.user) {
          login(res.user, res.token);
          router.push('/');
          showToast(isBangla ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম ইহসান শপে।' : 'Account created successfully! Welcome to Ihsan Shop.');
        } else {
          showToast(res.message || (isBangla ? 'নিবন্ধন ব্যর্থ হয়েছে' : 'Registration failed'), 'error');
        }
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      showToast(isBangla ? 'সার্ভারে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।' : 'Server error, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Google Social Login
  const handleGoogleSocialLogin = async () => {
    try {
      setLoading(true);
      // Attempt Better Auth Social Sign In
      if (signIn && typeof signIn.social === 'function') {
        await signIn.social({
          provider: 'google',
          callbackURL: window.location.origin + '/',
        });
      } else {
        // Fallback demo simulation
        const googleUser = {
          id: 'g_' + Date.now(),
          name: 'Google User',
          email: 'googleuser@gmail.com',
          phone: '01711223344',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: 'customer',
          status: 'active'
        };
        login(googleUser, 'mock-google-token');
        router.push('/');
        showToast(isBangla ? 'Google দিয়ে সফলভাবে লগইন হয়েছে!' : 'Logged in with Google successfully!');
      }
    } catch (err) {
      console.error('Google login error:', err);
      showToast(isBangla ? 'Google লগইন সম্পন্ন করা যায়নি' : 'Google login could not be completed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@ihsan.com');
    setPhone('01700000000');
    setPassword('admin123');
    setIsLogin(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 pb-28">
      <div className="bg-white dark:bg-[#112318] rounded-3xl p-6 sm:p-10 border border-emerald-100 dark:border-[#1d3b28] shadow-2xl space-y-6 transition-colors">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-900 via-emerald-800 to-teal-700 text-white flex items-center justify-center mx-auto text-3xl shadow-lg mb-2">
            🌿
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-emerald-50 tracking-tight">
            {isLogin 
              ? (isBangla ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Login to Your Account') 
              : (isBangla ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create a New Account')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-emerald-400 font-medium">
            {isBangla ? 'ইহসান অনলাইন শপ - ১০০% নিরাপদ ও খাঁটি অর্গানিক খাদ্য' : 'Ihsan Online Shop - 100% Safe & Organic Food Platform'}
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="grid grid-cols-2 bg-gray-100 dark:bg-black/40 p-1.5 rounded-2xl border border-gray-200 dark:border-emerald-900/50">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              isLogin 
                ? 'bg-white dark:bg-emerald-800 text-brand-950 dark:text-white shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-emerald-200'
            }`}
          >
            🔑 {isBangla ? 'লগইন' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              !isLogin 
                ? 'bg-white dark:bg-emerald-800 text-brand-950 dark:text-white shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-emerald-200'
            }`}
          >
            ✨ {isBangla ? 'নতুন অ্যাকাউন্ট' : 'Register'}
          </button>
        </div>

        {/* Social Login: Google OAuth Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSocialLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#152e20] hover:bg-gray-50 dark:hover:bg-[#1a3827] text-gray-700 dark:text-emerald-100 font-bold text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-emerald-900 shadow-sm hover:shadow transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-1.9.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>{isLogin ? (isBangla ? 'গুগল দিয়ে লগইন করুন' : 'Continue with Google') : (isBangla ? 'গুগল দিয়ে সাইন আপ করুন' : 'Sign up with Google')}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-gray-200 dark:border-[#21432e] w-full" />
            <span className="bg-white dark:bg-[#112318] px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {isBangla ? 'অথবা ইমেইল/পাসওয়ার্ড' : 'Or with credentials'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Full Name (Only on Register) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                {isBangla ? 'পূর্ণ নাম (Full Name) *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder={isBangla ? 'আপনার নাম লিখুন' : 'e.g. Md. Ariful Islam'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#f8faf8] dark:bg-[#14291d] border border-gray-200 dark:border-[#21432e] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>
          )}

          {/* 2. Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
              {isLogin ? (isBangla ? 'ইমেইল অথবা মোবাইল নম্বর *' : 'Email or Phone Number *') : (isBangla ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *')}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={isLogin ? "text" : "email"}
                required
                placeholder={isLogin ? (isBangla ? 'ইমেইল বা মোবাইল লিখুন' : 'name@example.com / 017XXXXXXXX') : 'name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#f8faf8] dark:bg-[#14291d] border border-gray-200 dark:border-[#21432e] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 shadow-inner"
              />
            </div>
          </div>

          {/* 3. Phone Number (Optional on Register) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                {isBangla ? 'মোবাইল নম্বর (Phone Number)' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#f8faf8] dark:bg-[#14291d] border border-gray-200 dark:border-[#21432e] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>
          )}

          {/* 4. Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
              {isBangla ? 'পাসওয়ার্ড (Password) *' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-[#f8faf8] dark:bg-[#14291d] border border-gray-200 dark:border-[#21432e] rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-700 dark:focus:border-emerald-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-emerald-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 5. Confirm Password (Only on Register) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-emerald-200">
                {isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন (Confirm Password) *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 bg-[#f8faf8] dark:bg-[#14291d] border rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none shadow-inner ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-200 dark:border-[#21432e] focus:border-brand-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-emerald-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {isBangla ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match'}
                </p>
              )}
            </div>
          )}

          {/* 6. Profile Photo (ImgBB Upload or URL on Register) */}
          {!isLogin && (
            <div className="space-y-2 p-4 rounded-2xl bg-[#f8faf8] dark:bg-[#14291d] border border-gray-200 dark:border-[#21432e]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800 dark:text-emerald-200">
                  {isBangla ? 'প্রোফাইল ছবি (Profile Photo / ImgBB Upload)' : 'Profile Photo (ImgBB Upload / URL)'}
                </label>
                <div className="flex items-center gap-1 bg-white dark:bg-black/30 p-1 rounded-xl border border-gray-200 dark:border-emerald-900 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPhotoMode('upload')}
                    className={`px-2 py-0.5 rounded-lg ${photoMode === 'upload' ? 'bg-brand-900 text-white' : 'text-gray-500'}`}
                  >
                    {isBangla ? 'আপলোড' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode('url')}
                    className={`px-2 py-0.5 rounded-lg ${photoMode === 'url' ? 'bg-brand-900 text-white' : 'text-gray-500'}`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {photoMode === 'upload' ? (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview || avatarUrl ? (
                      <img src={imagePreview || avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#112318] hover:bg-emerald-50 dark:hover:bg-[#193623] border border-dashed border-emerald-400 dark:border-emerald-700 rounded-xl cursor-pointer text-xs font-bold text-brand-900 dark:text-emerald-300 transition-colors">
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      <span>{uploadingImage ? (isBangla ? 'ImgBB তে আপলোড হচ্ছে...' : 'Uploading to ImgBB...') : (isBangla ? 'ছবি নির্বাচন করুন (ImgBB)' : 'Upload to ImgBB')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    {avatarUrl && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {isBangla ? 'ImgBB লিঙ্ক রেডি' : 'ImgBB URL Ready'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#112318] border border-gray-200 dark:border-[#21432e] rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-700"
                  />
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full py-3.5 bg-gradient-to-r from-brand-900 to-emerald-800 hover:from-brand-950 hover:to-emerald-900 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-lg">⏳</span>
                {isBangla ? 'প্রক্রিয়াধীন...' : 'Processing...'}
              </span>
            ) : (
              <>
                <span>{isLogin ? (isBangla ? 'লগইন করুন' : 'Sign In') : (isBangla ? 'নিবন্ধন সম্পন্ন করুন' : 'Create Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-gray-100 dark:border-[#1d3b28]">
          <div className="p-3 bg-emerald-50 dark:bg-[#14291d] rounded-2xl border border-emerald-200 dark:border-[#244530] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-800 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-brand-950 dark:text-emerald-200">
                  {isBangla ? 'ডেমো অ্যাডমিন অ্যাক্সেস' : 'Demo Admin Credentials'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">01700000000 / admin123</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="px-3 py-1.5 bg-brand-900 hover:bg-brand-950 text-white font-bold text-xs rounded-xl shadow transition-colors flex-shrink-0"
            >
              {isBangla ? 'অ্যাডমিন অটোফিল' : 'Autofill Admin'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
