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
const getBaseUrl = async (): Promise<string> => {
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

// Generate a 4-digit verification code - MAKE THIS ASYNC
export const generateVerificationToken = async (): Promise<string> => {
  // Generate a random number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send verification email with 4-digit code
export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
  displayName: string
): Promise<void> => {
  const baseUrl = await getBaseUrl();
  const verificationUrl = `${baseUrl}/verify`;
  
  const htmlContent = `
    <style>
        /* Basic styles for better email client compatibility */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1e0fbf; /* Primary color */
            margin-top: 0;
        }
        p {
            line-height: 1.6;
            color: #333333;
        }
        .verification-code-container {
            text-align: center;
            margin: 30px 0;
        }
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            padding: 15px;
            background-color: #f0f0f0;
            border-radius: 4px;
            display: inline-block; /* Center the block */
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #555555;
        }
        a {
            color: #1e0fbf; /* Link color */
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div class="container" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1e0fbf; margin-top: 0;">Welcome to GoalX!</h2>
        <p style="line-height: 1.6; color: #333333;">Hello ${displayName},</p>
        <p style="line-height: 1.6; color: #333333;">Thank you for registering as a donor with GoalX. Your verification code is:</p>

        <div class="verification-code-container" style="text-align: center; margin: 30px 0;">
            <div class="verification-code" style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; background-color: #f0f0f0; border-radius: 4px; display: inline-block;">
                ${verificationCode}
            </div>
        </div>

        <p style="line-height: 1.6; color: #333333;">Please enter this code on the verification page to complete your registration.</p>
        <p style="line-height: 1.6; color: #333333;">Alternatively, you can visit <a href="${verificationUrl}" style="color: #1e0fbf; text-decoration: none;">this link</a> and enter the code there.</p>

        <p style="line-height: 1.6; color: #333333;">This verification code will expire in 24 hours.</p>

        <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
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
  const baseUrl = await getBaseUrl();
  const verificationUrl = `${baseUrl}/verify?type=school&email=${encodeURIComponent(email)}`;
  
  const htmlContent = `
    <html>
<head>  <!-- Added head tag -->
    
</head> <!-- Added closing head tag -->
<body>
    <style>
        /* Basic styles for better email client compatibility */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1e0fbf; /* Primary color */
            margin-top: 0;
        }
        .verification-code-box {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f9f9f9; /* Light background for the code */
            border-left: 4px solid #1e0fbf; /* Primary color border */
            border-radius: 4px;
        }
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #333333; /* Darker text for code */
        }
        p {
            line-height: 1.6;
            color: #333333;
        }
        a {
            color: #1e0fbf; /* Link color */
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #555555;
        }
    </style>
    <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1e0fbf; margin-top: 0;">Welcome to GoalX!</h2>
        <p style="line-height: 1.6; color: #333333;">Thank you for registering ${schoolName} with GoalX. Your verification code is:</p>

        <div class="verification-code-box" style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #1e0fbf; border-radius: 4px;">
          <div class="verification-code" style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333333;">
            ${verificationCode}
          </div>
        </div>

        <p style="line-height: 1.6; color: #333333;">Please enter this code on the verification page to complete your school's registration.</p>
        <p style="line-height: 1.6; color: #333333;">Alternatively, you can visit <a href="${verificationUrl}" style="color: #1e0fbf; text-decoration: none;">${verificationUrl}</a> and enter the code there.</p>

        <p style="line-height: 1.6; color: #333333;">This verification code will expire in 24 hours.</p>

        <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
    </div>
</body>
</html>
  `;

  await sendEmail(email, 'Verify your GoalX school account', htmlContent);
};

// Send verification email to governing body
export const sendGovernBodyVerificationEmail = async (
  email: string,
  verificationCode: string,
  organizationName: string
): Promise<void> => {
  const baseUrl = await getBaseUrl();
  const verificationUrl = `${baseUrl}/verify?type=govern&email=${encodeURIComponent(email)}`;
  
  const htmlContent = `
    <style>
        /* Basic styles for better email client compatibility */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1e0fbf; /* Primary color */
            margin-top: 0;
        }
        p {
            line-height: 1.6;
            color: #333333;
        }
        .verification-box {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #1e0fbf;
            border-radius: 4px;
        }
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #333333;
            margin: 10px 0;
        }
        a {
            color: #1e0fbf;
            text-decoration: none;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #555555;
            line-height: 1.6;
        }
        /* Note: Inline styles are generally preferred for maximum email client compatibility. */
    </style>
    <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1e0fbf; margin-top: 0;">Welcome to GoalX!</h2>
      <p style="line-height: 1.6; color: #333333;">Thank you for registering ${organizationName} with GoalX. Your verification code is:</p>

      <div class="verification-box" style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #1e0fbf; border-radius: 4px;">
      <p style="line-height: 1.6; color: #333333; margin-bottom: 10px;">Please enter this code on the verification page:</p>
      <div class="verification-code" style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333333; margin: 10px 0;">
        ${verificationCode}
      </div>
      </div>

      <p style="line-height: 1.6; color: #333333;">Alternatively, you can visit <a href="${verificationUrl}" style="color: #1e0fbf; text-decoration: none;">${verificationUrl}</a> and enter the code there.</p>

      <p style="line-height: 1.6; color: #333333;">This verification code will expire in 24 hours.</p>

      <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Verify your GoalX Governing Body account', htmlContent);
};

// Send welcome email after verification
export const sendWelcomeEmail = async (
  email: string,
  displayName: string
): Promise<void> => {
  const baseUrl = await getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard`;
  
  const htmlContent = `
    <style>
                /* Basic styles for better email client compatibility */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                h2 {
                    color: #1e0fbf; /* Primary color */
                    margin-top: 0;
                }
                p {
                    line-height: 1.6;
                    color: #333333;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #555555;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .button {
                    background-color: #1e0fbf;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    display: inline-block; /* Ensures padding and margin work correctly */
                }
            </style>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div class="container" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #1e0fbf; margin-top: 0;">Welcome to GoalX!</h2>
                <p style="line-height: 1.6; color: #333333;">Hello ${displayName},</p>
                <p style="line-height: 1.6; color: #333333;">Your email has been successfully verified. Thank you for joining GoalX as a donor!</p>

                <div class="button-container" style="text-align: center; margin: 30px 0;">
                  <a href="${dashboardUrl}" class="button" style="background-color: #1e0fbf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                    Go to Dashboard
                  </a>
                </div>

                <p style="line-height: 1.6; color: #333333;">With your support, we can help more schools and students achieve their goals.</p>

                <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
              </div>
  `;

  await sendEmail(email, 'Welcome to GoalX!', htmlContent);
};

// // Send password reset email
// export const sendPasswordResetEmail = async (
//   email: string,
//   resetToken: string,
//   displayName: string
// ): Promise<void> => {
//   const baseUrl = await getBaseUrl();
//   const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2>Reset Your Password</h2>
//       <p>Hello ${displayName},</p>
//       <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      
//       <div style="text-align: center; margin: 30px 0;">
//         <a href="${resetUrl}" style="background-color: #1e0fbf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
//           Reset Password
//         </a>
//       </div>
      
//       <p>This link will expire in 1 hour for security reasons.</p>
      
//       <p>Best regards,<br>The GoalX Team</p>
//     </div>
//   `;

//   await sendEmail(email, 'Reset Your GoalX Password', htmlContent);
// };

// Send donation confirmation email
export const sendDonationConfirmationEmail = async (
  email: string,
  displayName: string,
  amount: number,
  projectName: string,
  donationId: string,
  donationDate: Date
): Promise<void> => {
  const baseUrl = await getBaseUrl();
  const donationsUrl = `${baseUrl}/donations`;
  const formattedDate = donationDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const htmlContent = `
   <style>
            /* Basic styles for better email client compatibility */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            h2 {
                color: #1e0fbf; /* Primary color */
                margin-top: 0;
            }
            h3 {
                color: #6e11b0; /* Secondary color */
                margin-top: 0;
            }
            .highlight-box {
                margin: 20px 0;
                padding: 20px;
                border-left: 4px solid #1e0fbf; /* Primary color border */
                background-color: #f9f9f9;
                border-radius: 4px;
            }
            p {
                line-height: 1.6;
                color: #333333;
            }
            .footer {
                margin-top: 20px;
                font-size: 0.9em;
                color: #555555;
                line-height: 1.6;
            }
            a {
                color: #1e0fbf; /* Primary color for links */
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
      <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1e0fbf; margin-top: 0;">Thank You for Your Donation!</h2>
        <p style="line-height: 1.6; color: #333333;">Hello ${displayName},</p>
        <p style="line-height: 1.6; color: #333333;">Thank you for your generous donation to GoalX. Your contribution will make a real difference!</p>

        <div class="highlight-box" style="margin: 20px 0; padding: 20px; border-left: 4px solid #1e0fbf; background-color: #f9f9f9; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #6e11b0;">Donation Details</h3>
          <p style="line-height: 1.6; color: #333333;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p style="line-height: 1.6; color: #333333;"><strong>Project:</strong> ${projectName}</p>
          <p style="line-height: 1.6; color: #333333;"><strong>Donation ID:</strong> ${donationId}</p>
          <p style="line-height: 1.6; color: #333333;"><strong>Date:</strong> ${formattedDate}</p>
        </div>

        <p style="line-height: 1.6; color: #333333;">You can view all your donations in your <a href="${donationsUrl}" style="color: #1e0fbf; text-decoration: none;">donation history</a>.</p>

        <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
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
  const baseUrl = await getBaseUrl();
  
  const htmlContent = `
    <style>
        /* Basic styles for better email client compatibility */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1e0fbf; /* Primary color */
            margin-top: 0;
        }
        h3 {
            color: #6e11b0; /* Secondary color */
        }
        .highlight-box {
            margin: 20px 0;
            padding: 20px;
            border-left: 4px solid #1e0fbf; /* Primary color border */
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        p {
            line-height: 1.6;
            color: #333333;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #555555;
        }
    </style>
    <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1e0fbf; margin-top: 0;">Thank You for Registering with GoalX!</h2>
        <p style="line-height: 1.6; color: #333333;">Dear ${schoolName} Administrator,</p>
        <p style="line-height: 1.6; color: #333333;">Your school email has been successfully verified. Thank you for joining GoalX!</p>

        <div class="highlight-box" style="margin: 20px 0; padding: 20px; border-left: 4px solid #1e0fbf; background-color: #f9f9f9; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #6e11b0;">Next Steps</h3>
            <p style="line-height: 1.6; color: #333333;">Our admin team will review your school details and contact you shortly to complete the verification process. This additional verification helps ensure the security and integrity of our platform.</p>
            <p style="line-height: 1.6; color: #333333;">Once approved, you'll receive a confirmation email with instructions for accessing your school account.</p>
        </div>

        <p style="line-height: 1.6; color: #333333;">If you have any questions, please don't hesitate to contact our support team.</p>

        <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Your School Registration - Next Steps', htmlContent);
};

// Send notification to governing body about pending approval
export const sendGovernBodyRegistrationNotificationEmail = async (
  email: string,
  organizationName: string
): Promise<void> => {
  const baseUrl = await getBaseUrl();
  
  const htmlContent = `
    <style>
        /* Basic styles for better email client compatibility */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h2 {
            color: #1e0fbf; /* Primary color */
            margin-top: 0;
        }
        h3 {
            color: #6e11b0; /* Secondary color */
        }
        .highlight-box {
            margin: 20px 0;
            padding: 20px;
            border-left: 4px solid #1e0fbf; /* Primary color border */
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        p {
            line-height: 1.6;
            color: #333333;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #555555;
        }
    </style>
    <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1e0fbf; margin-top: 0;">Thank You for Registering with GoalX!</h2>
        <p style="line-height: 1.6; color: #333333;">Dear ${organizationName} Administrator,</p>
        <p style="line-height: 1.6; color: #333333;">Your email has been successfully verified. Thank you for joining GoalX!</p>

        <div class="highlight-box" style="margin: 20px 0; padding: 20px; border-left: 4px solid #1e0fbf; background-color: #f9f9f9; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #6e11b0;">Next Steps</h3>
            <p style="line-height: 1.6; color: #333333;">Our admin team will review your organization details and contact you shortly to complete the verification process. This additional verification helps ensure the security and integrity of our platform.</p>
            <p style="line-height: 1.6; color: #333333;">Once approved, you'll receive a confirmation email with instructions for accessing your account.</p>
        </div>

        <p style="line-height: 1.6; color: #333333;">If you have any questions, please don't hesitate to contact our support team.</p>

        <p class="footer" style="margin-top: 20px; font-size: 0.9em; color: #555555; line-height: 1.6;">Best regards,<br>The GoalX Team</p>
    </div>
  `;

  await sendEmail(email, 'Your Governing Body Registration - Next Steps', htmlContent);
};



export const sendPasswordResetEmail = async (
  email: string,
  otpCode: string,
  displayName: string
): Promise<void> => {
  const baseUrl = await getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password`;
  
  const htmlContent = `
    <div>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .header {
                background: linear-gradient(90deg, #1e0fbf, #6e11b0);
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .header h2 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .otp-box {
                margin: 25px 0;
                padding: 25px;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                background-color: #f9f9f9;
                text-align: center;
            }
            .otp-box h3 {
                margin-top: 0;
                color: #1e0fbf;
                font-size: 18px;
            }
            .otp-code {
                font-family: 'Courier New', Courier, monospace;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                color: #6e11b0;
                margin: 15px 0;
            }
            .otp-validity {
                font-size: 14px;
                color: #555555;
            }
            .footer {
                padding: 20px 30px;
                font-size: 14px;
                color: #777777;
                border-top: 1px solid #e0e0e0;
            }
            .footer p {
                margin: 5px 0;
            }
        </style>
        <div class="header">
            <h2>Password Reset Request - GoalX</h2>
        </div>
        <div class="content">
            <p>Dear ${displayName},</p>
            <p>We received a request to reset your password. Use the code below to complete your password reset:</p>

            <div class="otp-box">
              <h3>Your One-Time Password</h3>
              <p class="otp-code">${otpCode}</p>
              <p class="otp-validity">This code is valid for 10 minutes.</p>
            </div>

            <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The GoalX Team</p>
        </div>
      </div>
  `;

  await sendEmail(email, 'Reset Your GoalX Password', htmlContent);
}