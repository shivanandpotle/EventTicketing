const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// Create a robust transporter with explicit SMTP config for Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,           // Use STARTTLS, not SSL
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // Use App Password if 2FA is active
    },
    connectionTimeout: 20000,  // 20 seconds
    greetingTimeout: 10000,
    logger: true,
    debug: true,
});

async function createTicketPDF(booking) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();

        const fontPath = path.join(__dirname, 'public/fonts/Poppins-Regular.ttf');
        const boldFontPath = path.join(__dirname, 'public/fonts/Poppins-Bold.ttf');

        const fontBytes = await fs.readFile(fontPath).catch(() => null);
        const boldFontBytes = await fs.readFile(boldFontPath).catch(() => null);

        const regularFont = fontBytes ? await pdfDoc.embedFont(fontBytes) : await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = boldFontBytes ? await pdfDoc.embedFont(boldFontBytes) : await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const qrCodeDataURL = await QRCode.toDataURL(booking.id);
        const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        page.drawText('Event Ticket', { x: 50, y: height - 70, font: boldFont, size: 36, color: rgb(0.1, 0.1, 0.1) });
        page.drawText('Sambhav Club', { x: 50, y: height - 100, font: regularFont, size: 18, color: rgb(0.3, 0.3, 0.3) });
        page.drawImage(qrImage, { x: width - 200, y: height - 220, width: 150, height: 150 });

        let yPos = height - 180;
        page.drawText('EVENT:', { x: 50, y: yPos, font: boldFont, size: 12 });
        page.drawText(booking.event, { x: 50, y: yPos - 20, font: regularFont, size: 16 });

        yPos -= 60;
        page.drawText('ATTENDEES:', { x: 50, y: yPos, font: boldFont, size: 12 });

        yPos -= 20;
        page.drawText(`1. ${booking.primary_name}`, { x: 50, y: yPos, font: regularFont, size: 14 });

        const additionalMembers = JSON.parse(booking.additional_members || '[]');
        additionalMembers.forEach((name, index) => {
            yPos -= 20;
            page.drawText(`${index + 2}. ${name}`, { x: 50, y: yPos, font: regularFont, size: 14 });
        });

        yPos -= 40;
        page.drawText('QUANTITY:', { x: 50, y: yPos, font: boldFont, size: 12 });
        page.drawText(String(booking.quantity), { x: 50, y: yPos - 20, font: regularFont, size: 16 });

        yPos -= 60;
        page.drawText('TICKET ID:', { x: 50, y: yPos, font: boldFont, size: 12 });
        page.drawText(booking.id, { x: 50, y: yPos - 20, font: regularFont, size: 10 });

        return await pdfDoc.save();
    } catch (error) {
        console.error('Error generating ticket PDF:', error);
        throw new Error('Unable to create ticket PDF.');
    }
}

async function sendTicketEmail(booking) {
    try {
        const pdfBuffer = await createTicketPDF(booking);

        const mailOptions = {
            from: `"Sambhav Club" <${process.env.EMAIL_USER}>`,
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
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.info(`Ticket email sent successfully to ${booking.email}`);
    } catch (error) {
        console.error(`Failed to send ticket email to ${booking.email}:`, error);
        throw new Error('Failed to send ticket email.');
    }
}

module.exports = { sendTicketEmail };
