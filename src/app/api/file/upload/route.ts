import { NextResponse } from "next/server";
import { uploadFileToR2 } from "@/utils/objectStore";
import path from "path";
import crypto from "crypto";
import { ensureConnection } from '@/utils/connectionManager';

// Configure max upload size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Valid mime types (expand as needed)
const VALID_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'video/mp4', 'audio/mpeg'
];

export async function POST(req: Request) {
  try {
    // Ensure database connection (if needed for file metadata storage)
    const connectionError = await ensureConnection();
    if (connectionError) return connectionError;

    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customPath = formData.get("path") as string || "";
    const preserveFilename = formData.get("preserveFilename") === "true";

    // Validate file existence
    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Validate mime type
    const mimeType = file.type || "application/octet-stream";
    if (!VALID_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ 
        message: "Invalid file type. Supported types: images, PDFs, documents, etc." 
      }, { status: 400 });
    }

    // Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Generate safe filename
    const originalName = file.name;
    const sanitizedName = sanitizeFilename(originalName);
    
    // Create a unique filename if needed
    let finalFileName;
    if (preserveFilename) {
      finalFileName = sanitizedName;
    } else {
      const uniquePrefix = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(sanitizedName);
      const baseName = path.basename(sanitizedName, ext);
      finalFileName = `${baseName}-${uniquePrefix}${ext}`;
    }
    
    // Add path if provided
    const fullPath = customPath ? 
      `${sanitizePath(customPath)}/${finalFileName}` : 
      finalFileName;

    console.log("Uploading file:", fullPath, "Type:", mimeType);

    // Upload to Cloudflare R2
    const uploadResponse = await uploadFileToR2(fileBuffer, fullPath, mimeType);

    if (uploadResponse.success) {
      return NextResponse.json({
        message: "File uploaded",
        url: uploadResponse.url,
        fileName: finalFileName,
        originalName: originalName,
        mimeType: mimeType,
        size: file.size
      });
    } else {
      console.error("R2 upload failed:", uploadResponse.error);
      return NextResponse.json({ 
        message: "Upload failed", 
        error: uploadResponse.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      message: "Server error", 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

/**
 * Sanitize filename to prevent path traversal and other issues
 */
function sanitizeFilename(filename: string): string {
  // Remove path components and potentially dangerous characters
  return filename
    .replace(/^.*[\\\/]/, '') // Remove path components
    .replace(/[^\w\s.\-]/g, '_') // Replace non-alphanumeric chars except dots, spaces, hyphens
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

/**
 * Sanitize path to prevent path traversal
 */
function sanitizePath(dirPath: string): string {
  // Remove leading/trailing slashes, backlashes, and sanitize path segments
  return dirPath
    .replace(/^[\/\\]+|[\/\\]+$/g, '') // Remove leading/trailing slashes
    .split(/[\/\\]+/) // Split by slashes or backslashes
    .map(segment => segment.replace(/[^\w\-]/g, '_')) // Sanitize each segment
    .join('/'); // Join with forward slashes
}