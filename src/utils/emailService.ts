import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure the email transporter using the credentials in .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL || 'kularathnaggas@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'sojejdixxemtvddw',
  },
});

// Base URL for all links in emails
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

// Generic email sending function
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  from: string = `"GoalX" <${process.env.EMAIL || 'kularathnaggas@gmail.com'}>`
): Promise<void> => {
  const mailOptions = {
    from,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Generate a 4-digit verification code
export const generateVerificationToken = (): string => {
  // Generate a random number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send verification email with 4-digit code
export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
  displayName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to GoalX!</h2>
      <p>Hello ${displayName},</p>
      <p>Thank you for registering as a donor with GoalX. Your verification code is:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f0f0; border-radius: 4px;">
          ${verificationCode}
        </div>
      </div>
      
      <p>Please enter this code on the verification page to complete your registration.</p>
      <p>Alternatively, you can visit <a href="${verificationUrl}">${verificationUrl}</a> and enter the code there.</p>
      
      <p>This verification code will expire in 24 hours.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Verify your GoalX account', htmlContent);
};

// Send verification email to school
export const sendSchoolVerificationEmail = async (
  email: string,
  verificationCode: string,
  schoolName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify?type=school&email=${encodeURIComponent(email)}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to GoalX!</h2>
      <p>Thank you for registering ${schoolName} with GoalX. Your verification code is:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f0f0; border-radius: 4px;">
          ${verificationCode}
        </div>
      </div>
      
      <p>Please enter this code on the verification page to complete your school's registration.</p>
      <p>Alternatively, you can visit <a href="${verificationUrl}">${verificationUrl}</a> and enter the code there.</p>
      
      <p>This verification code will expire in 24 hours.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Verify your GoalX school account', htmlContent);
};

// Send verification email to governing body
export const sendGovernBodyVerificationEmail = async (
  email: string,
  verificationCode: string,
  organizationName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify?type=govern&email=${encodeURIComponent(email)}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to GoalX!</h2>
      <p>Thank you for registering ${organizationName} with GoalX. Your verification code is:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f0f0; border-radius: 4px;">
          ${verificationCode}
        </div>
      </div>
      
      <p>Please enter this code on the verification page to complete your registration.</p>
      <p>Alternatively, you can visit <a href="${verificationUrl}">${verificationUrl}</a> and enter the code there.</p>
      
      <p>This verification code will expire in 24 hours.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Verify your GoalX Governing Body account', htmlContent);
};

// Send welcome email after verification
export const sendWelcomeEmail = async (
  email: string,
  displayName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to GoalX!</h2>
      <p>Hello ${displayName},</p>
      <p>Your email has been successfully verified. Thank you for joining GoalX as a donor!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #1e0fbf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
      
      <p>With your support, we can help more schools and students achieve their goals.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Welcome to GoalX!', htmlContent);
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  displayName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${displayName},</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1e0fbf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Reset Your GoalX Password', htmlContent);
};

// Send donation confirmation email
export const sendDonationConfirmationEmail = async (
  email: string,
  displayName: string,
  amount: number,
  projectName: string,
  donationId: string,
  donationDate: Date
): Promise<void> => {
  const baseUrl = getBaseUrl();
  const donationsUrl = `${baseUrl}/donations`;
  const formattedDate = donationDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Your Donation!</h2>
      <p>Hello ${displayName},</p>
      <p>Thank you for your generous donation to GoalX. Your contribution will make a real difference!</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #e5e5e5; border-radius: 4px; background-color: #f9f9f9;">
        <h3 style="margin-top: 0;">Donation Details</h3>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Project:</strong> ${projectName}</p>
        <p><strong>Donation ID:</strong> ${donationId}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
      </div>
      
      <p>You can view all your donations in your <a href="${donationsUrl}">donation history</a>.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Thank You for Your Donation', htmlContent);
};

// Send notification email
export const sendNotificationEmail = async (
  email: string,
  displayName: string,
  subject: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<void> => {
  let actionButton = '';
  
  if (actionUrl && actionText) {
    actionButton = `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #1e0fbf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          ${actionText}
        </a>
      </div>
    `;
  }
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>Hello ${displayName},</p>
      <p>${message}</p>
      
      ${actionButton}
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, subject, htmlContent);
};

// Send school registration notification email
export const sendSchoolRegistrationNotificationEmail = async (
  email: string,
  schoolName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Registering with GoalX!</h2>
      <p>Dear ${schoolName} Administrator,</p>
      <p>Your school email has been successfully verified. Thank you for joining GoalX!</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #e5e5e5; border-radius: 4px; background-color: #f9f9f9;">
        <h3 style="margin-top: 0;">Next Steps</h3>
        <p>Our admin team will review your school details and contact you shortly to complete the verification process. This additional verification helps ensure the security and integrity of our platform.</p>
        <p>Once approved, you'll receive a confirmation email with instructions for accessing your school account.</p>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Your School Registration - Next Steps', htmlContent);
};

// Send notification to governing body about pending approval
export const sendGovernBodyRegistrationNotificationEmail = async (
  email: string,
  organizationName: string
): Promise<void> => {
  const baseUrl = getBaseUrl();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Registering with GoalX!</h2>
      <p>Dear ${organizationName} Administrator,</p>
      <p>Your email has been successfully verified. Thank you for joining GoalX!</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #e5e5e5; border-radius: 4px; background-color: #f9f9f9;">
        <h3 style="margin-top: 0;">Next Steps</h3>
        <p>Our admin team will review your organization details and contact you shortly to complete the verification process. This additional verification helps ensure the security and integrity of our platform.</p>
        <p>Once approved, you'll receive a confirmation email with instructions for accessing your account.</p>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Your Governing Body Registration - Next Steps', htmlContent);
};