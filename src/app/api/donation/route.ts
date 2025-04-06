import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/utils/database';
import Donation from '@/model/donationSchema';
import mongoose from 'mongoose';

// GET endpoint - fetch donations
export async function GET(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const donorId = searchParams.get('donor');
    const recipientId = searchParams.get('recipient');
    const donationType = searchParams.get('type');
    const status = searchParams.get('status');
    const campaign = searchParams.get('campaign');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // If ID is provided, fetch specific donation
    if (id) {
      const donation = await Donation.findOne({ 
        $or: [{ _id: id }, { donationId: id }] 
      })
      .populate('donor', 'displayName donorId donorType')
      .populate('recipient', 'name schoolId');
      
      if (!donation) {
        return new NextResponse(JSON.stringify({ error: 'Donation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new NextResponse(JSON.stringify(donation), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build query based on parameters
    const query: any = {};
    if (donorId) query.donor = donorId;
    if (recipientId) query.recipient = recipientId;
    if (donationType && ['MONETARY', 'EQUIPMENT', 'OTHER'].includes(donationType.toUpperCase())) {
      query.donationType = donationType.toUpperCase();
    }
    if (status) query.status = status;
    if (campaign) query.campaign = campaign;

    // Handle monetary amount range filter
    if (minAmount || maxAmount) {
      query['monetaryDetails.amount'] = {};
      if (minAmount) query['monetaryDetails.amount'].$gte = parseFloat(minAmount);
      if (maxAmount) query['monetaryDetails.amount'].$lte = parseFloat(maxAmount);
    }

    // Handle date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch donations with optional pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const donations = await Donation.find(query)
      .populate('donor', 'displayName donorId donorType')
      .populate('recipient', 'name schoolId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Donation.countDocuments(query);

    return new NextResponse(JSON.stringify({
      donations,
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
    console.error('Error fetching donations:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch donations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST endpoint - create a new donation
export async function POST(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.donor || !body.recipient || !body.donationType) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['donor', 'recipient', 'donationType'] 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate donation type
    if (!['MONETARY', 'EQUIPMENT', 'OTHER'].includes(body.donationType)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid donation type. Must be one of: MONETARY, EQUIPMENT, OTHER'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate donation type specific fields
    if (body.donationType === 'MONETARY') {
      if (!body.monetaryDetails || !body.monetaryDetails.amount) {
        return new NextResponse(JSON.stringify({ 
          error: 'Monetary donations require amount details'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else if (['EQUIPMENT', 'OTHER'].includes(body.donationType)) {
      if (!body.itemDetails || body.itemDetails.length === 0) {
        return new NextResponse(JSON.stringify({ 
          error: 'Equipment/Other donations require item details'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Initialize statusHistory if not provided
    if (!body.statusHistory) {
      body.statusHistory = [{
        status: body.status || 'pending',
        date: new Date()
      }];
    }
    
    const donation = new Donation(body);
    await donation.save();
    
    // Populate references for response
    await donation.populate('donor', 'displayName donorId donorType');
    await donation.populate('recipient', 'name schoolId');
    
    return new NextResponse(JSON.stringify(donation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating donation:', error);
    
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
    
    return new NextResponse(JSON.stringify({ error: 'Failed to create donation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH endpoint - update a donation
export async function PATCH(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Donation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    // Find donation by _id or donationId
    const existingDonation = await Donation.findOne({
      $or: [{ _id: id }, { donationId: id }]
    });
    
    if (!existingDonation) {
      return new NextResponse(JSON.stringify({ error: 'Donation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Don't allow changing donation type
    if (body.donationType && body.donationType !== existingDonation.donationType) {
      return new NextResponse(JSON.stringify({ 
        error: 'Donation type cannot be changed after creation'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle status changes
    if (body.status && body.status !== existingDonation.status) {
      // Add status change to history
      if (!body.statusHistory) {
        body.statusHistory = existingDonation.statusHistory || [];
      }
      
      body.statusHistory.push({
        status: body.status,
        date: new Date(),
        notes: body.statusChangeNote || undefined // Capture any notes about the status change
      });
      
      // If status is completed, set completedAt date
      if (body.status === 'completed' && !body.completedAt) {
        body.completedAt = new Date();
      }
    }
    
    // Update donation
    const updatedDonation = await Donation.findOneAndUpdate(
      { $or: [{ _id: id }, { donationId: id }] },
      { $set: body },
      { new: true, runValidators: true }
    )
    .populate('donor', 'displayName donorId donorType')
    .populate('recipient', 'name schoolId');
    
    return new NextResponse(JSON.stringify(updatedDonation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating donation:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Validation error', 
        details: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Failed to update donation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE endpoint - delete a donation
export async function DELETE(request: NextRequest) {
  const error = await connect();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Donation ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Only allow deletion of pending or failed donations
    const donation = await Donation.findOne({
      $or: [{ _id: id }, { donationId: id }]
    });
    
    if (!donation) {
      return new NextResponse(JSON.stringify({ error: 'Donation not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if donation can be deleted
    if (!['pending', 'failed', 'canceled'].includes(donation.status)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Only pending, failed, or canceled donations can be deleted'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete the donation
    const deletedDonation = await Donation.findOneAndDelete({
      $or: [{ _id: id }, { donationId: id }]
    });
    
    return new NextResponse(JSON.stringify({ 
      message: 'Donation deleted successfully',
      deletedId: id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting donation:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete donation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}