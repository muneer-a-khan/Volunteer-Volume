import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Specify Node.js runtime for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validFileTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }

    // Get file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueId = uuidv4();
    const extension = file.name.split('.').pop();
    const fileName = `${uniqueId}.${extension}`;

    // Save file to public directory
    const publicDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Generate URL for the saved image
    const imageUrl = `/uploads/${fileName}`;

    // Update user record in database with image URL
    await prisma.users.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    return NextResponse.json({ 
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
} 