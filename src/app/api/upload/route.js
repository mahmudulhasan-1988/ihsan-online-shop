import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Create public/uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') || formData.get('image');
      const customName = formData.get('name') || 'product';

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'No image file found in form data' },
          { status: 400 }
        );
      }

      if (typeof file === 'string') {
        // Base64 or string URL
        if (file.startsWith('http://') || file.startsWith('https://')) {
          return NextResponse.json({ success: true, url: file, display_url: file });
        }

        const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const extension = matches[1].split('/')[1] || 'jpg';
          const buffer = Buffer.from(matches[2], 'base64');
          const fileName = `${customName}-${Date.now()}.${extension}`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, buffer);
          const fileUrl = `/uploads/${fileName}`;
          return NextResponse.json({ success: true, url: fileUrl, display_url: fileUrl });
        }
      }

      // File Blob object
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const originalExt = (file.name && path.extname(file.name)) ? path.extname(file.name) : '.jpg';
      const cleanCustom = String(customName).replace(/[^a-zA-Z0-9_-]/g, '') || 'product';
      const fileName = `${cleanCustom}-${Date.now()}${originalExt}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);
      const fileUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        display_url: fileUrl,
        thumb: fileUrl,
        fileName
      });
    } else {
      // JSON payload
      const body = await request.json();
      const { image, name = 'upload' } = body;

      if (!image) {
        return NextResponse.json(
          { success: false, message: 'Missing image field' },
          { status: 400 }
        );
      }

      if (image.startsWith('http://') || image.startsWith('https://')) {
        return NextResponse.json({ success: true, url: image, display_url: image });
      }

      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const extension = matches[1].split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `${name}-${Date.now()}.${extension}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/uploads/${fileName}`;
        return NextResponse.json({ success: true, url: fileUrl, display_url: fileUrl });
      }

      return NextResponse.json({ success: true, url: image, display_url: image });
    }
  } catch (error) {
    console.error('API /api/upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
