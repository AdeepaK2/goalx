import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure R2 client
export const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const PUBLIC_URL_PREFIX = process.env.R2_PUBLIC_URL || '';

/**
 * Uploads a file to Cloudflare R2
 */
export async function uploadFileToR2(
  fileBuffer: Buffer, 
  fileName: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate credentials and bucket
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !BUCKET_NAME) {
      throw new Error('R2 configuration is missing');
    }

    // Upload file to R2
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    }));

    // Construct the public URL
    const url = `${PUBLIC_URL_PREFIX}/${fileName}`;
    
    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
