import { NextRequest, NextResponse } from 'next/server';
import Achievement from '@/model/achievementSchema';
import mongoose from 'mongoose';
import { ensureConnection } from '@/utils/connectionManager';

// GET endpoint - fetch achievements
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const playId = searchParams.get('play');
    const level = searchParams.get('level');
    const year = searchParams.get('year');
    const title = searchParams.get('title');

    // If ID is provided, fetch specific achievement
    if (id) {
      const achievement = await Achievement.findOne({ 
        $or: [{ _id: id }, { achievementId: id }] 
      }).populate({
        path: 'play',
        populate: [
          { path: 'school', select: 'name schoolId' },
          { path: 'sport', select: 'sportName sportId' }
        ]
      });
      
      if (!achievement) {
        return new NextResponse(JSON.stringify({ error: 'Achievement not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(achievement), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (playId) query.play = playId;
    if (level) query.level = level;
    if (year) query.year = parseInt(year);
    if (title) query.title = { $regex: title, $options: 'i' };

    // Fetch achievements with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const achievements = await Achievement.find(query)
      .populate({
        path: 'play',
        populate: [
          { path: 'school', select: 'name schoolId' },
          { path: 'sport', select: 'sportName sportId' }
        ]
      })
      .skip(skip)
      .limit(limit)
      .sort({ year: -1, createdAt: -1 });
    
    const total = await Achievement.countDocuments(query);

    return new NextResponse(JSON.stringify({
      achievements,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch achievements' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new achievement
export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const body = await request.json();
    
    // Validate required fields
    if (!body.play || !body.title || !body.year || !body.level) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['play', 'title', 'year', 'level'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (body.year < 1800 || body.year > currentYear) {
      return new NextResponse(JSON.stringify({ 
        error: `Year must be between 1800 and ${currentYear}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate level
    const validLevels = [ 'Zonal', 'District', 'Provincial', 'National', 'International'];
    if (!validLevels.includes(body.level)) {
      return new NextResponse(JSON.stringify({ 
        error: `Level must be one of: ${validLevels.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const achievement = new Achievement(body);
    await achievement.save();
    
    // Populate references for response
    await achievement.populate({
      path: 'play',
      populate: [
        { path: 'school', select: 'name schoolId' },
        { path: 'sport', select: 'sportName sportId' }
      ]
    });
    
    return new NextResponse(JSON.stringify(achievement), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating achievement:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create achievement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update an achievement
export async function PATCH(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Achievement ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Validate year if provided
    if (body.year) {
      const currentYear = new Date().getFullYear();
      if (body.year < 1800 || body.year > currentYear) {
        return new NextResponse(JSON.stringify({ 
          error: `Year must be between 1800 and ${currentYear}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Validate level if provided
    if (body.level) {
      const validLevels = ['School', 'Zonal', 'District', 'Provincial', 'National', 'International'];
      if (!validLevels.includes(body.level)) {
        return new NextResponse(JSON.stringify({ 
          error: `Level must be one of: ${validLevels.join(', ')}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Find by _id or achievementId
    const achievement = await Achievement.findOneAndUpdate(
      { $or: [{ _id: id }, { achievementId: id }] },
      { 
        $set: body,
        updatedAt: new Date() // Ensure updatedAt is refreshed
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'play',
      populate: [
        { path: 'school', select: 'name schoolId' },
        { path: 'sport', select: 'sportName sportId' }
      ]
    });
    
    if (!achievement) {
      return new NextResponse(JSON.stringify({ error: 'Achievement not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify(achievement), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating achievement:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update achievement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete an achievement
export async function DELETE(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Achievement ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find by _id or achievementId
    const deletedAchievement = await Achievement.findOneAndDelete(
      { $or: [{ _id: id }, { achievementId: id }] }
    );
    
    if (!deletedAchievement) {
      return new NextResponse(JSON.stringify({ error: 'Achievement not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ 
      message: 'Achievement deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete achievement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}