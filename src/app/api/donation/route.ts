import { NextRequest, NextResponse } from 'next/server';
import { ensureConnection } from '@/utils/connectionManager';
import mongoose from 'mongoose';
import Donation from '@/model/donationSchema';
import School from '@/model/schoolSchema';
import Donor from '@/model/donorSchema';
import { sendDonationConfirmationEmail, sendEmail } from '@/utils/emailService';

// New function to send notification email to school
async function sendSchoolDonationNotification(
  schoolId: string,
  donationId: string,
  donorName: string,
  donationType: string,
  details: string,
) {
  try {
    // Get school information
    const school = await School.findById(schoolId);
    if (!school || !school.contact?.email) {
      console.error('School not found or no email available');
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1e0fbf; margin-top: 0;">New Donation Received!</h2>
        <p style="line-height: 1.6; color: #333333;">Hello ${school.name} Administrator,</p>
        <p style="line-height: 1.6; color: #333333;">We're pleased to inform you that your school has received a new donation.</p>

        <div style="margin: 20px 0; padding: 20px; border-left: 4px solid #1e0fbf; background-color: #f9f9f9; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #6e11b0;">Donation Details</h3>
          <p style="line-height: 1.6; color: #333333;"><strong>From:</strong> ${donorName}</p>
          <p style="line-height: 1.6; color: #333333;"><strong>Type:</strong> ${donationType}</p>
          <p style="line-height: 1.6; color: #333333;"><strong>Details:</strong> ${details}</p>
          <p style="line-height: 1.6; color: #333333;"><strong>Donation ID:</strong> ${donationId}</p>
        </div>

        <p style="line-height: 1.6; color: #333333;">You can view all your donations in your school dashboard.</p>
        <p style="line-height: 1.6; color: #333333;">Don't forget to thank your donor for their contribution!</p>

        <p style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
      </div>
    `;

    await sendEmail(
      school.contact.email,
      'New Donation Received for Your School',
      htmlContent
    );
    
    console.log(`Donation notification email sent to school: ${school.name}`);
  } catch (error) {
    console.error('Error sending school donation notification:', error);
  }
}

// GET endpoint - fetch donations
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

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
    
    // Check for skip populate header (our fallback mechanism)
    const skipPopulate = request.headers.get('x-skip-populate') === 'true';

    // If ID is provided, fetch specific donation
    if (id) {
      let donation;
      
      if (skipPopulate) {
        donation = await Donation.findOne({ 
          $or: [{ _id: id }, { donationId: id }] 
        });
      } else {
        try {
          donation = await Donation.findOne({ 
            $or: [{ _id: id }, { donationId: id }] 
          })
          .populate('donor', 'displayName donorId donorType')
          .populate('recipient', 'name schoolId');
        } catch (err) {
          // Fallback if populate fails
          donation = await Donation.findOne({ 
            $or: [{ _id: id }, { donationId: id }] 
          });
        }
      }
      
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

    let donations;
    let total;
    
    // Skip population if the header is set or try/catch to handle populating error
    try {
      donations = await Donation.find(query)
        .populate('donor', 'displayName donorId donorType')
        .populate('recipient', 'name schoolId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } catch (populationError) {
      console.error('Population error:', populationError);
      // Fallback to non-populated results
      donations = await Donation.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }
    
    total = await Donation.countDocuments(query);

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
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    // Get the donation data from the request
    const donationData = await request.json();
    
    // Create a new donation 
    const donation = new Donation(donationData);
    await donation.save();
    
    // Send email notifications
    try {
      // Get donor information
      const donor = await Donor.findById(donationData.donor);
      if (donor?.email) {
        // For monetary donations
        if (donationData.donationType === 'MONETARY' && donationData.monetaryDetails) {
          await sendDonationConfirmationEmail(
            donor.email,
            donor.displayName,
            donationData.monetaryDetails.amount,
            'School Support',
            donation.donationId || donation._id.toString(),
            new Date()
          );
        } else {
          // For non-monetary donations, adapt the notification format
          const donationDetails = donationData.itemDetails && donationData.itemDetails.length > 0 
            ? `${donationData.itemDetails[0].itemName} (${donationData.itemDetails[0].quantity || 1} units)` 
            : 'General donation';
            
          // We can use the same email function but with adapted parameters
          await sendDonationConfirmationEmail(
            donor.email,
            donor.displayName,
            0, // No monetary amount
            donationDetails,
            donation.donationId || donation._id.toString(),
            new Date()
          );
        }
      }
      
      // Send notification to school
      let donationDetails = '';
      if (donationData.donationType === 'MONETARY' && donationData.monetaryDetails) {
        donationDetails = `${donationData.monetaryDetails.amount} ${donationData.monetaryDetails.currency || 'LKR'}`;
      } else if (donationData.itemDetails && donationData.itemDetails.length > 0) {
        donationDetails = donationData.itemDetails.map((item: any) => 
          `${item.itemName} (${item.quantity || 1} units)`
        ).join(', ');
      }
      
      await sendSchoolDonationNotification(
        donationData.recipient,
        donation.donationId || donation._id.toString(),
        donor?.displayName || 'Anonymous Donor',
        donationData.donationType,
        donationDetails
      );
    } catch (emailError) {
      console.error('Error sending donation emails:', emailError);
      // Continue even if emails fail, as the donation was saved
    }
    
    return NextResponse.json({
      success: true,
      message: 'Donation created successfully',
      donation: {
        id: donation._id,
        donationId: donation.donationId
      }
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH endpoint - update a donation
export async function PATCH(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

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
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

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