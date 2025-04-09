import { NextRequest, NextResponse } from 'next/server';
import Donation from '@/model/donationSchema';
import { ensureConnection } from '@/utils/connectionManager';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get('groupBy') || 'donor';
    const limit = parseInt(searchParams.get('limit') || '5');
    const sortField = searchParams.get('sort') || 'totalAmount';
    const sortDirection = searchParams.get('sortDirection') === 'asc' ? 1 : -1;
    
    // Currently only supporting grouping by donor
    if (groupBy !== 'donor') {
      return NextResponse.json({ 
        error: 'Invalid groupBy parameter. Currently only "donor" is supported.'
      }, { status: 400 });
    }
    
    // Aggregate donation data by donor
    const donorStats = await Donation.aggregate([
      // Match only completed monetary donations
      { 
        $match: { 
          status: 'completed',
          donationType: 'MONETARY'
        } 
      },
      // Group by donor
      {
        $group: {
          _id: '$donor',
          totalAmount: { $sum: '$monetaryDetails.amount' },
          donationCount: { $sum: 1 },
          lastDonationDate: { $max: '$createdAt' },
          lastDonationAmount: { 
            $last: {
              $cond: [
                { $eq: ['$createdAt', { $max: '$createdAt' }] },
                '$monetaryDetails.amount',
                null
              ]
            }
          }
        }
      },
      // Sort by specified field
      { $sort: { [sortField]: sortDirection } },
      // Limit results
      { $limit: limit },
      // Lookup donor details
      {
        $lookup: {
          from: 'donors',
          localField: '_id',
          foreignField: '_id',
          as: 'donorInfo'
        }
      },
      // Flatten donor info
      {
        $unwind: '$donorInfo'
      },
      // Project final result
      {
        $project: {
          _id: 0,
          donorId: '$donorInfo.donorId',
          displayName: '$donorInfo.displayName',
          totalAmount: 1,
          donationCount: 1,
          lastDonation: {
            date: '$lastDonationDate',
            amount: '$lastDonationAmount'
          }
        }
      }
    ]);
    
    return NextResponse.json({ donorStats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching donation statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch donation statistics' }, { status: 500 });
  }
}