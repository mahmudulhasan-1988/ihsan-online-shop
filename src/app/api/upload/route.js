import { NextResponse } from 'next/server';
import { uploadToImgBB } from '@/lib/imgbb';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') || formData.get('file');
      const name = formData.get('name') || 'upload';

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'No image file found in form data' },
          { status: 400 }
        );
      }

      const result = await uploadToImgBB(file, name);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    } else {
      // JSON payload with base64 or image URL
      const body = await request.json();
      const { image, name } = body;

      if (!image) {
        return NextResponse.json(
          { success: false, message: 'Missing "image" field in request body' },
          { status: 400 }
        );
      }

      const result = await uploadToImgBB(image, name);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('API /api/upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
