import { NextRequest, NextResponse } from 'next/server';
import Sport from '@/model/sportSchema';
import mongoose from 'mongoose';
import { ensureConnection } from '@/utils/connectionManager';

// GET endpoint - fetch sports
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const category = searchParams.get('category');

    // If ID is provided, fetch specific sport
    if (id) {
      const sport = await Sport.findOne({
        $or: [{ _id: id }, { sportId: id }],
      });

      if (!sport) {
        return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
      }

      return NextResponse.json(sport, { status: 200 });
    }

    // Build query based on parameters
    const query: any = {};
    if (name) query.sportName = { $regex: name, $options: 'i' };
    if (category) query.categories = { $in: [category] };

    // Fetch sports with optional pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const sports = await Sport.find(query).skip(skip).limit(limit);
    const total = await Sport.countDocuments(query);

    return NextResponse.json(
      {
        sports,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error message:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST endpoint - create a new sport
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const body = await request.json();

    // Validate required fields
    if (!body.sportName || !body.description) {
      return NextResponse.json(
        { error: 'sportName and description are required' },
        { status: 400 }
      );
    }

    const sport = new Sport(body);
    await sport.save();

    return NextResponse.json(sport, { status: 201 });
  } catch (error) {
    console.error('Error message:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH endpoint - update a sport
export async function PATCH(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Sport ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Find by _id or sportId
    const sport = await Sport.findOneAndUpdate(
      { $or: [{ _id: id }, { sportId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    return NextResponse.json(sport, { status: 200 });
  } catch (error) {
    console.error('Error message:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE endpoint - delete a sport
export async function DELETE(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Sport ID is required' },
        { status: 400 }
      );
    }

    // Find by _id or sportId
    const deletedSport = await Sport.findOneAndDelete({
      $or: [{ _id: id }, { sportId: id }],
    });

    if (!deletedSport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Sport deleted successfully', deletedId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error message:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}