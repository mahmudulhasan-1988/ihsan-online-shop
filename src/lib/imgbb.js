/**
 * ImgBB Image Upload Utility for E-Commerce Website
 * Uploads images directly to ImgBB CDN using API Key from .env.local
 */

const IMGBB_API_KEY =
  process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
  process.env.IMGBB_API_KEY ||
  'ac2fdba7196b92e44bf24607df23386f';

/**
 * Upload an image file or base64 to ImgBB
 * @param {File | Blob | string} fileOrBase64 - File object, Blob, or base64 string
 * @param {string} [name] - Optional custom name for the image
 * @returns {Promise<{success: boolean, url?: string, display_url?: string, thumb?: string, delete_url?: string, message?: string}>}
 */
export async function uploadToImgBB(fileOrBase64, name = '') {
  if (!fileOrBase64) {
    return { success: false, message: 'No image provided for upload.' };
  }

  try {
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      // If base64 string, clean data URL prefix
      const cleanBase64 = fileOrBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      formData.append('image', cleanBase64);
    } else {
      // File or Blob
      formData.append('image', fileOrBase64);
    }

    if (name) {
      formData.append('name', name);
    }

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        url: data.data.url, // Direct CDN link (https://i.ibb.co/xxxx/image.jpg)
        display_url: data.data.display_url,
        thumb: data.data.thumb?.url || data.data.url,
        medium: data.data.medium?.url || data.data.url,
        delete_url: data.data.delete_url,
        width: data.data.width,
        height: data.data.height,
        title: data.data.title,
      };
    } else {
      console.error('ImgBB Upload API Error:', data);
      return {
        success: false,
        message: data.error?.message || 'ImgBB upload failed',
      };
    }
  } catch (error) {
    console.error('ImgBB Upload Network Error:', error);
    return {
      success: false,
      message: error.message || 'Network error occurred while uploading image.',
    };
  }
}

/**
 * Upload multiple files to ImgBB
 * @param {File[]} files 
 * @returns {Promise<Array<{success: boolean, url?: string, message?: string}>>}
 */
export async function uploadMultipleToImgBB(files) {
  const uploadPromises = Array.from(files).map((file) => uploadToImgBB(file));
  return Promise.all(uploadPromises);
}
