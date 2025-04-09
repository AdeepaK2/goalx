import { NextRequest, NextResponse } from 'next/server';
import Donation from '@/model/donationSchema';
import { ensureConnection } from '@/utils/connectionManager';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const limit = 12; // Usually 12 months in a year
    
    // Get monthly donation totals
    const monthlyDonations = await Donation.aggregate([
      // Match only completed monetary donations for the specified year
      { 
        $match: { 
          status: 'completed',
          donationType: 'MONETARY',
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        } 
      },
      // Group by month
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          amount: { $sum: '$monetaryDetails.amount' },
          count: { $count: {} }
        }
      },
      // Sort by month
      { $sort: { '_id.month': 1 } },
      // Limit results
      { $limit: limit },
      // Format output
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthNames: [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
              },
              in: { $arrayElemAt: ['$$monthNames', { $subtract: ['$_id.month', 1] }] }
            }
          },
          amount: 1,
          count: 1
        }
      }
    ]);
    
    // Fill in missing months with zero values
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const filledMonthlyData = months.map(month => {
      const found = monthlyDonations.find(item => item.month === month);
      return found || { month, amount: 0, count: 0 };
    });
    
    return new NextResponse(JSON.stringify({ 
      monthlyDonations: filledMonthlyData,
      year
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching monthly donations:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch monthly donations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}