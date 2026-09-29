import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not connect to MongoDB database. Please verify MONGODB_URI in .env.local',
        },
        { status: 500 }
      );
    }

    // Ping the database
    const pingResult = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    return NextResponse.json({
      success: true,
      status: 'Connected to MongoDB Atlas successfully! 🍃',
      database: db.databaseName,
      ping: pingResult,
      totalCollections: collections.length,
      collections: collectionNames,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('MongoDB Diagnostic Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Database connection error',
      },
      { status: 500 }
    );
  }
}
