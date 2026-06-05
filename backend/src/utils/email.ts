import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

// Initialize the Ethereal testing account
const initializeTransporter = async () => {
  if (transporter) return transporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('✉️  Ethereal Email Test Account Generated: %s', testAccount.user);

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize Ethereal Email:', error);
    throw error;
  }
};

export const sendBookingReceipt = async (booking: any, user: any, space: any) => {
  try {
    const mailTransporter = await initializeTransporter();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #0050cb; text-align: center;">Booking Confirmed!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for your reservation at <strong>TitikTemu</strong>. Your payment has been received and your booking is confirmed.</p>
        
        <div style="background-color: #f8f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #dbeafe;">
          <h3 style="margin-top: 0; color: #1e3a8a;">Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Workspace:</strong> ${space.name}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p style="margin: 5px 0;"><strong>Total Paid:</strong> $${booking.totalPrice.toFixed(2)}</p>
        </div>

        <p>If you have any questions or need to make changes, please contact our support team.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #727687; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} TitikTemu Co-Working. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const info = await mailTransporter.sendMail({
      from: '"TitikTemu" <noreply@theledger.com>',
      to: user.email,
      subject: `Booking Receipt - ${space.name}`,
      html: emailHtml,
    });

    console.log('✅ Booking receipt sent!');
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Error sending booking receipt email:', error);
  }
};
