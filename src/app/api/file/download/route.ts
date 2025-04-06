import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/objectStore";

export async function GET(req: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");
    const fileUrl = searchParams.get("fileUrl");
    
    // Determine the key (filename) to retrieve
    const key = extractFileKey(fileName, fileUrl);
    if (!key) {
      return NextResponse.json(
        { message: "Missing required parameter: file or fileUrl" },
        { status: 400 }
      );
    }
    
    console.log("Retrieving file with key:", key);

    // Use streaming response for better performance
    return await streamFileFromR2(key);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Extract file key from provided parameters
 */
function extractFileKey(fileName: string | null, fileUrl: string | null): string | null {
  if (fileName) {
    return sanitizeKey(fileName);
  } else if (fileUrl) {
    const urlParts = fileUrl.split('/');
    return sanitizeKey(urlParts[urlParts.length - 1]);
  }
  return null;
}

/**
 * Sanitize key to prevent directory traversal
 */
function sanitizeKey(key: string): string {
  // Remove path traversal characters and limit to filename
  return key.replace(/^.*[\\\/]/, '');
}

/**
 * Stream file from R2 storage with proper headers
 */
async function streamFileFromR2(key: string): Promise<NextResponse> {
  const bucketName = process.env.R2_BUCKET_NAME || "skillswaphub";
  
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      console.error("File not found in R2:", key);
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    // Get content type with fallback
    const contentType = response.ContentType || guessContentType(key) || "application/octet-stream";
    
    // Use ReadableStream for efficient streaming
    const stream = response.Body.transformToWebStream();
    
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(key)}"`,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        ...(response.ContentLength && { "Content-Length": response.ContentLength.toString() })
      },
    });
  } catch (error) {
    console.error("Error retrieving file from R2:", error);
    return NextResponse.json(
      { message: "Error retrieving file", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Guess content type from file extension
 */
function guessContentType(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'txt': 'text/plain',
    'html': 'text/html',
    'csv': 'text/csv',
    'json': 'application/json',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    // Add more as needed
  };
  
  return ext && ext in mimeTypes ? mimeTypes[ext] : null;
}