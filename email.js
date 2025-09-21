const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// Configuration for Port 465 - This part is correct.
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 465,
    secure: true, // Important: true for port 465
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
    },
});


/**
 * Creates a PDF ticket for a given booking.
 * @param {object} booking - The booking details object.
 * @returns {Promise<Uint8Array>} - A promise that resolves with the PDF bytes.
 */
async function createTicketPDF(booking) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Attempt to load custom fonts, fallback to standard fonts if they fail
    const fontBytes = await fs.readFile(path.join(__dirname, 'public/fonts/Poppins-Regular.ttf')).catch(() => null);
    const boldFontBytes = await fs.readFile(path.join(__dirname, 'public/fonts/Poppins-Bold.ttf')).catch(() => null);
    const poppinsFont = fontBytes ? await pdfDoc.embedFont(fontBytes) : await pdfDoc.embedFont(StandardFonts.Helvetica);
    const poppinsBoldFont = boldFontBytes ? await pdfDoc.embedFont(boldFontBytes) : await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Generate QR code and embed it
    const qrCodeDataURL = await QRCode.toDataURL(booking.id);
    const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    // Draw content on the PDF
    page.drawText('Event Ticket', { x: 50, y: height - 70, font: poppinsBoldFont, size: 36, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('Sambhav Club', { x: 50, y: height - 100, font: poppinsFont, size: 18, color: rgb(0.3, 0.3, 0.3) });
    page.drawImage(qrImage, { x: width - 200, y: height - 220, width: 150, height: 150 });

    const startY = height - 180;
    page.drawText('EVENT:', { x: 50, y: startY, font: poppinsBoldFont, size: 12 });
    page.drawText(booking.event, { x: 50, y: startY - 20, font: poppinsFont, size: 16 });
    
    page.drawText('ATTENDEES:', { x: 50, y: startY - 60, font: poppinsBoldFont, size: 12 });
    let currentY = startY - 80;
    page.drawText(`1. ${booking.primary_name}`, { x: 50, y: currentY, font: poppinsFont, size: 14 });
    const additionalMembers = JSON.parse(booking.additional_members || '[]');
    additionalMembers.forEach((name, index) => {
        currentY -= 20;
        page.drawText(`${index + 2}. ${name}`, { x: 50, y: currentY, font: poppinsFont, size: 14 });
    });
    
    currentY -= 40;
    page.drawText('QUANTITY:', { x: 50, y: currentY, font: poppinsBoldFont, size: 12 });
    page.drawText(String(booking.quantity), { x: 50, y: currentY - 20, font: poppinsFont, size: 16 });

    currentY -= 60;
    page.drawText('TICKET ID:', { x: 50, y: currentY, font: poppinsBoldFont, size: 12 });
    page.drawText(booking.id, { x: 50, y: currentY - 20, font: poppinsFont, size: 10 });
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

/**
 * Sends an email with the generated PDF ticket.
 * @param {object} booking - The booking details object.
 */
async function sendTicketEmail(booking) {
    try {
        const ticketPdfBytes = await createTicketPDF(booking);

        const mailOptions = {
            // --- THIS IS THE CORRECTED LINE ---
            from: `"Sambhav Club" <${process.env.SENDER_EMAIL}>`, // Use a real, verified sender email
            to: booking.email,
            subject: `Your Ticket for ${booking.event}`,
            html: `
                <p>Hi ${booking.primary_name},</p>
                <p>Thank you for registering! Your ticket for <strong>${booking.event}</strong> is attached to this email.</p>
                <p>Please have the QR code ready for scanning at the event entrance.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The Sambhav Club Team</strong></p>
            `,
            attachments: [
                {
                    filename: `ticket-${booking.id}.pdf`,
                    content: ticketPdfBytes,
                    contentType: 'application/pdf',
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${booking.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${booking.email}:`, error);
        throw new Error('Failed to send ticket email.');
    }
}

module.exports = { sendTicketEmail };
