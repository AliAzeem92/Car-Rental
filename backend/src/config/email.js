import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify API key on startup
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is not set. Emails will not be sent.');
} else {
  console.log('✅ Resend email service initialized');
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Car Rental <onboarding@resend.dev>';

const sendEmail = async (to, subject, html) => {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
};

export const sendResetCode = async (email, code) => {
  await sendEmail(email, 'Password Reset Code - Car Rental', `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Password Reset Request</h2>
      <p>You requested to reset your password. Use the code below:</p>
      <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #1F2937; letter-spacing: 8px; margin: 0;">${code}</h1>
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `);
};

export const sendBookingConfirmation = async (email, customerName, vehicleName, startDate, endDate, contractNumber) => {
  try {
    await sendEmail(email, '🚗 Booking Created - Car Rental', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">🚗 Booking Created Successfully!</h2>
        <p>Dear ${customerName},</p>
        <p>Your car rental booking has been created successfully.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Pickup Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> Pending Confirmation</p>
        </div>
        <p>We will review your booking and send you a confirmation shortly.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">Thank you for choosing our service!</p>
      </div>
    `);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error.message);
  }
};

export const sendReservationConfirmed = async (email, customerName, vehicleName, startDate, endDate, contractNumber) => {
  try {
    await sendEmail(email, '✅ Reservation Confirmed - Car Rental', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10B981;">✅ Reservation Confirmed!</h2>
        <p>Dear ${customerName},</p>
        <p>Great news! Your car rental reservation has been confirmed.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Pickup Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> Confirmed</p>
        </div>
        <p>Please arrive on time for vehicle pickup. Don't forget to bring your driver's license and ID.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">We look forward to serving you!</p>
      </div>
    `);
  } catch (error) {
    console.error('Failed to send reservation confirmed email:', error.message);
  }
};

export const sendCarReturned = async (email, customerName, vehicleName, contractNumber, extraCharges) => {
  try {
    await sendEmail(email, '🎉 Car Returned - Car Rental', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">🎉 Car Returned Successfully!</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for returning the vehicle. Your rental has been completed.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Status:</strong> Completed</p>
          ${extraCharges > 0 ? `<p><strong>Extra Charges:</strong> €${extraCharges.toFixed(2)}</p>` : ''}
        </div>
        <p>We hope you enjoyed your experience with us. We look forward to serving you again!</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">Thank you for choosing our service!</p>
      </div>
    `);
  } catch (error) {
    console.error('Failed to send car returned email:', error.message);
  }
};

export const sendPaymentReceived = async (email, customerName, vehicleName, contractNumber, paymentStatus) => {
  try {
    await sendEmail(email, '💳 Payment Update - Car Rental', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10B981;">💳 Payment Status Updated</h2>
        <p>Dear ${customerName},</p>
        <p>Your payment status has been updated.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>
        <p>Thank you for your payment!</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">If you have any questions, please contact us.</p>
      </div>
    `);
  } catch (error) {
    console.error('Failed to send payment received email:', error.message);
  }
};

export const sendReservationCancelled = async (email, customerName, vehicleName, startDate, endDate, contractNumber) => {
  try {
    await sendEmail(email, '❌ Reservation Cancelled - Car Rental', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #EF4444;">❌ Reservation Cancelled</h2>
        <p>Dear ${customerName},</p>
        <p>Your car rental reservation has been cancelled.</p>
        <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <p><strong>Contract Number:</strong> ${contractNumber}</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Pickup Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        <p>If you did not request this cancellation or have any questions, please contact us immediately.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">We hope to serve you in the future!</p>
      </div>
    `);
  } catch (error) {
    console.error('Failed to send reservation cancelled email:', error.message);
  }
};

export default resend;
