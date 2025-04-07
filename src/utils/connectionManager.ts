import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connect from './database';

// Connection lock to prevent multiple simultaneous connection attempts
let connectionPromise: Promise<void> | null = null;

/**
 * Ensures database connection is established before proceeding
 * @returns NextResponse with error message or null if successful
 */
export async function ensureConnection(): Promise<NextResponse | null> {
  // Check current connection state
  const connectionState = mongoose.connection.readyState;
  
  // If already connected, return immediately
  if (connectionState === 1) {
    return null;
  }
  
  // If currently connecting, wait for it to complete
  if (connectionState === 2) {
    // Wait for connection to finish establishing (max 5 seconds)
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (mongoose.connection.readyState === 1) {
        return null;
      }
    }
    return new NextResponse(JSON.stringify({ 
      error: 'Database connection timeout',
      details: 'Connection is still pending after waiting'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create a connection lock to prevent multiple connection attempts
  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await connect();
        
        // Wait for connection to be established
        for (let i = 0; i < 50; i++) {
          if (mongoose.connection.readyState === 1) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Connection error:', error);
      } finally {
        // Reset the connection promise
        connectionPromise = null;
      }
    })();
  }
  
  // Wait for the connection promise to resolve
  await connectionPromise;
  
  // Check if connection was successful
  if (mongoose.connection.readyState !== 1) {
    return new NextResponse(JSON.stringify({ 
      error: 'Database connection failed',
      details: 'Could not establish database connection'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return null;
}