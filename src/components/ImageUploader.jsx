'use client';

import React, { useState, useRef } from 'react';
import { uploadToImgBB } from '@/lib/imgbb';
import { Upload, Image as ImageIcon, CheckCircle, X, Loader2, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useThemeLanguage } from '@/context/ThemeLanguageContext';

/**
 * Modern ImgBB Image Uploader Component
 * @param {Object} props
 * @param {string} [props.value] - Existing image URL
 * @param {function(string): void} props.onChange - Callback when upload completes with direct URL
 * @param {string} [props.label] - Custom label
 * @param {string} [props.placeholder] - Custom placeholder text
 * @param {string} [props.aspectRatio] - 'square' | 'video' | 'banner' | 'auto'
 */
export default function ImageUploader({
  value = '',
  onChange,
  label,
  placeholder,
  aspectRatio = 'auto',
  className = '',
}) {
  const { isBangla } = useThemeLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError(isBangla ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল আপলোড করুন।' : 'Please upload a valid image file.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(isBangla ? 'ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারবে।' : 'Image size cannot exceed 10MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const res = await uploadToImgBB(file);
      if (res.success && res.url) {
        if (onChange) {
          onChange(res.url);
        }
      } else {
        setError(res.message || (isBangla ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Upload failed'));
      }
    } catch (err) {
      setError(isBangla ? 'নেটওয়ার্ক ত্রুটি, আবার চেষ্টা করুন।' : 'Network error, please retry.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-emerald-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-brand-900 dark:text-emerald-400" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-secondary" /> ImgBB CDN
          </span>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
          dragActive
            ? 'border-brand-900 bg-emerald-50/50 dark:border-emerald-400 dark:bg-emerald-950/30'
            : 'border-gray-300 dark:border-emerald-900/50 hover:border-brand-900 dark:hover:border-emerald-500 bg-gray-50/60 dark:bg-black/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {uploading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-brand-900 dark:text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold animate-pulse">
              {isBangla ? 'ImgBB-তে ছবি আপলোড হচ্ছে...' : 'Uploading image to ImgBB...'}
            </p>
          </div>
        ) : value ? (
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden max-h-48 flex items-center justify-center bg-black/5 dark:bg-black/40">
              <img
                src={value}
                alt="Uploaded Preview"
                className="w-full h-auto max-h-48 object-contain rounded-xl"
              />
            </div>
            
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-100 shadow-md flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                {isBangla ? 'পরিবর্তন' : 'Change'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                title={isBangla ? 'মুছে ফেলুন' : 'Remove'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[200px]">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{value}</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(value);
                  alert(isBangla ? 'ছবির লিংক কপি করা হয়েছে!' : 'Image link copied!');
                }}
                className="text-xs text-brand-900 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold shrink-0"
              >
                <LinkIcon className="w-3 h-3" /> {isBangla ? 'কপি' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-900 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-emerald-200">
                {placeholder || (isBangla ? 'ছবি সিলেক্ট করতে ক্লিক করুন অথবা টেনে আনুন' : 'Click or drag & drop image here')}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-emerald-600">
                PNG, JPG, WEBP, GIF (Max: 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium px-1">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
