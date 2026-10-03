/**
 * ImgBB Image Upload Utility for E-Commerce Website
 * Uploads images to ImgBB CDN with multiple API key fallback,
 * and automatic graceful fallback to local /api/upload storage if ImgBB CDN is unavailable.
 */

const IMGBB_API_KEYS = [
  process.env.NEXT_PUBLIC_IMGBB_API_KEY,
  process.env.IMGBB_API_KEY,
  'ac2fdba7196b92e44bf24607df23386f',
  '290b3438ea2d708ca6bc4cb8138ca601',
  '4a20b7936a2e46c761b65e903bc37311',
  'd0d1b32d56a297924ef995b05779ec3e'
].filter(Boolean);

/**
 * Upload an image file or base64 to ImgBB (or local /api/upload fallback)
 * @param {File | Blob | string} fileOrBase64 - File object, Blob, or base64 string
 * @param {string} [name] - Optional custom name for the image
 * @returns {Promise<{success: boolean, url: string, display_url: string, thumb: string, message?: string, toString: () => string}>}
 */
export async function uploadToImgBB(fileOrBase64, name = '') {
  if (!fileOrBase64) {
    return { success: false, message: 'No image provided for upload.', url: '', toString: () => '' };
  }

  // If already a valid http/https URL, return it directly
  if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://') || fileOrBase64.startsWith('/uploads/'))) {
    return {
      success: true,
      url: fileOrBase64,
      display_url: fileOrBase64,
      thumb: fileOrBase64,
      toString: () => fileOrBase64
    };
  }

  // 1. Try ImgBB API keys
  for (const apiKey of IMGBB_API_KEYS) {
    try {
      const formData = new FormData();
      if (typeof fileOrBase64 === 'string') {
        const cleanBase64 = fileOrBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        formData.append('image', cleanBase64);
      } else {
        formData.append('image', fileOrBase64);
      }

      if (name) formData.append('name', name);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data && data.success && data.data?.url) {
        const directUrl = data.data.url;
        return {
          success: true,
          url: directUrl,
          display_url: data.data.display_url || directUrl,
          thumb: data.data.thumb?.url || directUrl,
          medium: data.data.medium?.url || directUrl,
          delete_url: data.data.delete_url,
          title: data.data.title || name,
          toString: () => directUrl
        };
      }
    } catch (e) {
      // Continue to next key or fallback
    }
  }

  // 2. Automatic Local /api/upload Fallback (Saves to public/uploads or converts to storage URL)
  try {
    const localFormData = new FormData();
    if (typeof fileOrBase64 === 'string') {
      localFormData.append('image', fileOrBase64);
    } else {
      localFormData.append('file', fileOrBase64);
    }
    if (name) localFormData.append('name', name);

    const localRes = await fetch('/api/upload', {
      method: 'POST',
      body: localFormData
    });

    if (localRes.ok) {
      const localData = await localRes.json();
      if (localData?.success && localData?.url) {
        const localUrl = localData.url;
        return {
          success: true,
          url: localUrl,
          display_url: localUrl,
          thumb: localUrl,
          title: name,
          toString: () => localUrl
        };
      }
    }
  } catch (err) {
    console.warn('Local upload fallback note:', err.message);
  }

  // 3. Last fallback: Convert File to local Data URL
  if (typeof window !== 'undefined' && fileOrBase64 instanceof Blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        resolve({
          success: true,
          url: base64Url,
          display_url: base64Url,
          thumb: base64Url,
          title: name || 'Uploaded Image',
          toString: () => base64Url
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          url: '',
          message: 'Failed to process image',
          toString: () => ''
        });
      };
      reader.readAsDataURL(fileOrBase64);
    });
  }

  return {
    success: false,
    url: '',
    message: 'Image upload failed. Please enter an image URL directly.',
    toString: () => ''
  };
}

/**
 * Upload multiple files
 * @param {File[]} files 
 * @returns {Promise<Array<{success: boolean, url: string, message?: string}>>}
 */
export async function uploadMultipleToImgBB(files) {
  const uploadPromises = Array.from(files).map((file) => uploadToImgBB(file));
  return Promise.all(uploadPromises);
}
