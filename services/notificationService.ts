import { CustomerGroup, Transaction } from '../types';

// ===================================================================================
// EMAIL TEMPLATE HELPERS
// ===================================================================================

const generateEmailHeader = (subject: string): string => `
  <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb; text-align: center; background-color: #f8f9fa;">
    <h1 style="color: rgb(var(--color-primary-600)); font-size: 24px; margin: 0; font-weight: 700;">iCredit Union®</h1>
    <p style="font-size: 14px; color: #4b5563; margin-top: 5px;">${subject}</p>
  </div>
`;

const generateEmailFooter = (): string => `
  <div style="font-size: 12px; color: #6b7280; margin-top: 20px; padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f8f9fa;">
    <p>This is an automated transactional message. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} iCredit Union®, N.A. Member FDIC.</p>
    <p>123 Finance Street, New York, NY 10001</p>
    <p>
        <a href="#" style="color: rgb(var(--color-primary-500)); text-decoration: none;">Unsubscribe</a> | 
        <a href="#" style="color: rgb(var(--color-primary-500)); text-decoration: none;">Privacy Policy</a> | 
        <a href="#" style="color: rgb(var(--color-primary-500)); text-decoration: none;">Contact Support</a>
    </p>
  </div>
`;

const generateEmailWrapper = (subject: string, content: string): string => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f3f4f6; padding: 20px; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      ${generateEmailHeader(subject)}
      ${content}
      ${generateEmailFooter()}
    </div>
  </div>
`;

// ===================================================================================
// EMAIL GENERATORS
// ===================================================================================

export const generateTransactionReceiptEmail = (transaction: Transaction, userName: string): { subject: string; body: string } => {
  const { id, sendAmount, recipient, status, estimatedArrival } = transaction;
  const totalDebited = sendAmount + transaction.fee;
  const subject = `Your iCredit Union® Transfer Receipt: ${id.slice(-8)}`;
  const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>This is a confirmation of your transfer. Here are the details:</p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin-top: 20px; line-height: 1.8;">
            <p><strong>Amount Sent:</strong> ${sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <p><strong>Recipient:</strong> ${recipient.fullName}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Estimated Arrival:</strong> ${estimatedArrival.toLocaleDateString()}</p>
        </div>
    </div>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateNewRecipientEmail = (userName: string, recipientName: string): { subject: string; body: string } => {
    const subject = "New Recipient Added to Your iCredit Union® Account";
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>A new recipient, <strong>${recipientName}</strong>, was successfully added to your account.</p>
        <p>If you did not authorize this change, please contact our support team immediately.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateCardStatusEmail = (userName: string, lastFour: string, status: 'Frozen' | 'Unfrozen'): { subject: string; body: string } => {
    const subject = `Your iCredit Union® Card ending in ${lastFour} has been ${status}`;
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>This is a confirmation that your card ending in **** ${lastFour} has been ${status.toLowerCase()}.</p>
        <p>If you did not authorize this change, please contact our support team immediately.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateFundsArrivedEmail = (transaction: Transaction, userName: string): { subject: string; body: string } => {
    const { recipient, receiveAmount, receiveCurrency, sendAmount } = transaction;
    const subject = "Funds Have Arrived!";
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>Great news! Your transfer of ${sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been successfully delivered to ${recipient.fullName}.</p>
        <p>They have received <strong>${receiveAmount.toLocaleString('en-US', { style: 'currency', currency: receiveCurrency })}</strong>.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateLoginAlertEmail = (userName: string, timestamp: Date, location: string, device: string): { subject: string; body: string } => {
    const subject = "Security Alert: New Sign-In to Your iCredit Union® Account";
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>We detected a new sign-in to your account:</p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Time:</strong> ${timestamp.toLocaleString()}</p>
            <p><strong>Approximate Location:</strong> ${location}</p>
            <p><strong>Device:</strong> ${device}</p>
        </div>
        <p>If this was not you, please freeze your cards and contact support immediately.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateOtpEmail = (userName: string): { subject: string; body: string } => {
    const otp = "123456"; // For demo purposes
    const subject = "Your iCredit Union® Verification Code";
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>Your one-time verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">${otp}</p>
        <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generatePasswordResetEmail = (userName: string, userEmail: string): { subject: string; body: string } => {
    const subject = "Reset Your iCredit Union® Password";
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>We received a request to reset the password for the account associated with ${userEmail}.</p>
        <p>If you made this request, click the link below to set a new password. This link is valid for one hour.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: rgb(var(--color-primary-500)); color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateNewAccountOtpEmail = (userName:string): { subject: string; body: string } => {
    const otp = "123456"; // For demo purposes
    const subject = "Your iCredit Union® Verification Code";
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>Welcome! Your one-time verification code to activate your account is:</p>
        <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">${otp}</p>
        <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateDepositConfirmationEmail = (userName: string, amount: number, accountNickname: string): { subject: string; body: string } => {
    const subject = `Check Deposit Received: ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>We've received your mobile check deposit of <strong>${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong> into your "${accountNickname}" account.</p>
        <p>The funds are now being verified and will typically be available within 1-2 business days.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateTaskReminderEmail = (userName: string, task: { text: string }): { subject: string; body: string } => {
    const { text } = task;
    const subject = `Reminder: You have a task due soon`;
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>This is a friendly reminder for your upcoming task:</p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Task:</strong> ${text}</p>
        </div>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateFullWelcomeEmail = (userName: string): { subject: string; body: string } => {
    const content = `
    <div style="padding: 20px;">
        <h2>Welcome to the Future of Banking, ${userName}!</h2>
        <p>Your iCredit Union® account is now fully active. We're thrilled to have you with us.</p>
        
        <h3 style="margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">What's Next?</h3>
        <ul style="line-height: 1.8;">
            <li><strong>Explore your Dashboard:</strong> Get a complete overview of your finances.</li>
            <li><strong>Add Recipients:</strong> Set up contacts to send money to in just a few clicks.</li>
            <li><strong>Manage Cards:</strong> Instantly freeze your card or create virtual cards for online shopping.</li>
            <li><strong>Enable Security Features:</strong> Set up Biometrics and 2-Factor Authentication for maximum security.</li>
        </ul>

        <p>If you have any questions, our support team is ready to help. Welcome aboard!</p>
    </div>
    `;
    return { subject: "Welcome to iCredit Union® - Your Account is Ready!", body: generateEmailWrapper("Welcome Aboard!", content) };
};

export const generateWelcomeEmail = (userName: string): { subject: string, body: string } => {
    return {
        subject: "Welcome to iCredit Union®!",
        body: generateEmailWrapper("Welcome Aboard!", `<div style="padding: 20px;"><p>Hi ${userName}, welcome to iCredit Union®! We're glad to have you.</p></div>`)
    };
};

export const generateSupportTicketConfirmationEmail = (userName: string, topic: string): { subject: string, body: string } => {
    const subject = `Your Support Request about "${topic}" has been received`;
    const content = `
    <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>This is an automated confirmation that we have received your support request regarding "${topic}".</p>
        <p>A member of our team will review your message and get back to you as soon as possible. You can expect a response within 24 hours.</p>
        <p>Thank you for your patience.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateDonationConfirmationEmail = (userName: string, amount: number, causeTitle: string, frequency: 'one-time' | 'monthly'): { subject: string, body: string } => {
    const subject = `Thank you for your donation to ${causeTitle}!`;
    const content = `
    <div style="padding: 20px;">
        <p>Dear ${userName},</p>
        <p>Thank you for your generous ${frequency} donation of <strong>${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong> to support <strong>${causeTitle}</strong>.</p>
        <p>Your contribution makes a real difference and we are incredibly grateful for your support in our mission to create a positive global impact.</p>
    </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

// ===================================================================================
// SMS GENERATORS
// ===================================================================================

export const generateNewRecipientSms = (recipientName: string): string => {
  return `iCredit Union®: A new recipient, ${recipientName}, was added to your account. If this wasn't you, contact us immediately.`;
};

export const generateTransactionReceiptSms = (transaction: Transaction): string => {
    return `iCredit Union®: Your transfer of ${transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${transaction.recipient.fullName} has been submitted. Ref: ${transaction.id.slice(-8)}`;
};

export const generateFundsArrivedSms = (transaction: Transaction): string => {
    return `iCredit Union®: Good news! Your transfer to ${transaction.recipient.fullName} has been successfully delivered.`;
};

export const generateLoginAlertSms = (location: string): string => {
    return `iCredit Union® Alert: We detected a new sign-in to your account from ${location}. If this wasn't you, freeze your cards and contact support immediately.`;
};

export const generateOtpSms = (): string => {
    const otp = "123456"; // For demo purposes
    return `Your iCredit Union® verification code is: ${otp}. Do not share this code.`;
};

export const generatePasswordResetSms = (): string => {
    return `iCredit Union®: A password reset link has been sent to your registered email address. Please check your inbox.`;
};

export const generateNewAccountOtpSms = (): string => {
    const otp = "123456"; // For demo purposes
    return `Your iCredit Union® verification code is: ${otp}. Do not share this code.`;
};

export const generateDepositConfirmationSms = (amount: number): string => {
    return `iCredit Union®: We've received your mobile check deposit of ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. Funds will be available in 1-2 business days.`;
};

export const generateTaskReminderSms = (task: { text: string }): string => {
    return `iCredit Union® Reminder: Your task "${task.text}" is due soon.`;
};

export const generateFullWelcomeSms = (userName: string): string => {
    return `Welcome to iCredit Union®, ${userName}! Your new global account is ready. Explore features and start sending money worldwide. Reply HELP for help.`;
};

export const generateWelcomeSms = (userName: string): string => {
    return `Welcome to iCredit Union®, ${userName}! We're glad to have you.`;
};

export const generateSupportTicketConfirmationSms = (topic: string): string => {
    return `iCredit Union®: We've received your support request about "${topic}". Our team will respond via email within 24 hours.`;
};

export const generateDonationConfirmationSms = (amount: number, causeTitle: string): string => {
    return `iCredit Union®: Thank you for your donation of ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${causeTitle}. Your generosity is making a difference!`;
};

// ===================================================================================
// "BACKEND" SIMULATION
// ===================================================================================

export const sendTransactionalEmail = (to: string, subject: string, body: string) => {
    console.log(`
    ================================================
    📧 SIMULATING EMAIL 📧
    ------------------------------------------------
    To: ${to}
    Subject: ${subject}
    ------------------------------------------------
    Body:
    (HTML content not displayed in console)
    ================================================
    `);
    // In a real app, this would use an API like SendGrid, AWS SES, etc.
};

export const sendSmsNotification = (to: string, body: string) => {
    console.log(`
    ================================================
    📱 SIMULATING SMS 📱
    ------------------------------------------------
    To: ${to}
    Body: ${body}
    ================================================
    `);
     // In a real app, this would use an API like Twilio, Vonage, etc.
};

export const sendTargetedNotification = (customerGroup: CustomerGroup, title: string, message: string) => {
    console.log(`
    ================================================
    🎯 SIMULATING TARGETED PUSH NOTIFICATION 🎯
    ------------------------------------------------
    Target Group: ${customerGroup}
    Title: ${title}
    Message: ${message}
    ================================================
    `);
    // In a real app, this would use a service like Firebase Cloud Messaging, OneSignal, etc.
};