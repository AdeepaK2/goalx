import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/utils/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, displayName, subject, message, actionUrl, actionText } = body;
    
    if (!to || !displayName || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await sendNotificationEmail(
      to,
      displayName,
      subject,
      message,
      actionUrl,
      actionText
    );
    
    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}