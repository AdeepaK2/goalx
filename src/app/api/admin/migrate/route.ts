import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import EquipmentRequest from '@/model/equipmentRequestSchema';
import GovernBody from '@/model/governBodySchema';
import { ensureConnection } from '@/utils/connectionManager';

// Add GET handler that performs the same functionality as POST
export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dryRun') === 'true';
    
    // Find all requests with processedBy field
    const allRequests = await EquipmentRequest.find({
      processedBy: { $exists: true, $ne: null }
    });
    
    // Filter for string processedBy in JavaScript
    const requests = allRequests.filter(req => typeof req.processedBy === 'string');
    
    const results = {
      total: requests.length,
      processed: 0,
      errors: 0,
      details: [] as Array<{
        requestId: string;
        oldValue?: string;
        newValue?: any;
        status: string;
        reason?: string;
      }>
    };
    
    for (const request of requests) {
      try {
        const governBodyName = request.processedBy as string;
        
        // Find the govern body by name
        const governBody = await GovernBody.findOne({ 
          name: governBodyName 
        });
        
        if (governBody) {
          // Update to new format
          if (!dryRun) {
            request.processedBy = {
              entity: governBody._id,
              entityType: 'GovernBody'
            };
            await request.save();
          }
          
          results.processed++;
          results.details.push({
            requestId: request.requestId,
            oldValue: governBodyName,
            newValue: {
              entity: governBody._id.toString(),
              entityType: 'GovernBody'
            },
            status: 'success'
          });
        } else {
          results.errors++;
          results.details.push({
            requestId: request.requestId,
            oldValue: governBodyName,
            status: 'error',
            reason: 'Governing body not found'
          });
        }
      } catch (error: any) {
        results.errors++;
        results.details.push({
          requestId: request.requestId || 'Unknown ID',
          oldValue: typeof request.processedBy === 'string' ? request.processedBy : 'Unknown',
          status: 'error',
          reason: error.message || 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      message: dryRun ? 'Dry run completed' : 'Migration completed',
      results
    });
  } catch (error: any) {
    console.error('Error in migration:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      message: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}

// Keep the POST handler as well
export async function POST(request: NextRequest) {
  // Reuse the same implementation as GET
  return GET(request);
}