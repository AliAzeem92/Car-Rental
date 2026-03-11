import PDFDocument from 'pdfkit';
import prisma from '../config/prisma.js';

export const generateInvoicePDF = async (reservationId) => {
  // Fetch all required data
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      vehicle: true,
      user: true,
      checkin: true,
      checkout: true
    }
  });

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  // Fetch invoice settings
  let invoiceSettings = await prisma.invoicesettings.findFirst();
  
  // Create default settings if none exist
  if (!invoiceSettings) {
    invoiceSettings = await prisma.invoicesettings.create({
      data: {
        companyName: 'Car Rental Company',
        companyEmail: 'info@carrental.com',
        companyPhone: '+1 (555) 123-4567',
        companyAddress: '123 Business Street, City, State 12345'
      }
    });
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#2563eb';
      const secondaryColor = '#64748b';
      const accentColor = '#d9b15c';

      // Header with company logo/name
      doc.fontSize(24)
         .fillColor(primaryColor)
         .text(invoiceSettings.companyName, 50, 50, { align: 'left' });

      doc.fontSize(10)
         .fillColor(secondaryColor)
         .text(invoiceSettings.companyAddress || '', 50, 80)
         .text(`Phone: ${invoiceSettings.companyPhone || 'N/A'}`, 50, 95)
         .text(`Email: ${invoiceSettings.companyEmail || 'N/A'}`, 50, 110);

      // Invoice title and details
      doc.fontSize(28)
         .fillColor(primaryColor)
         .text('RENTAL INVOICE', 350, 50, { align: 'right' });

      doc.fontSize(10)
         .fillColor(secondaryColor)
         .text(`Invoice #: INV-${reservation.id.toString().padStart(6, '0')}`, 350, 80, { align: 'right' })
         .text(`Contract #: ${reservation.contractNumber}`, 350, 95, { align: 'right' })
         .text(`Date: ${new Date().toLocaleDateString()}`, 350, 110, { align: 'right' });

      // Horizontal line
      doc.moveTo(50, 140)
         .lineTo(545, 140)
         .strokeColor(accentColor)
         .lineWidth(2)
         .stroke();

      // Customer Information
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('CUSTOMER INFORMATION', 50, 160);

      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Name: ${reservation.user.firstName} ${reservation.user.lastName}`, 50, 185)
         .text(`Email: ${reservation.user.email}`, 50, 200)
         .text(`Phone: ${reservation.user.phone || 'N/A'}`, 50, 215)
         .text(`License: ${reservation.user.licenseNumber || 'N/A'}`, 50, 230);

      // Vehicle Information
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('VEHICLE INFORMATION', 320, 160);

      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Vehicle: ${reservation.vehicle.brand} ${reservation.vehicle.model}`, 320, 185)
         .text(`Year: ${reservation.vehicle.year || 'N/A'}`, 320, 200)
         .text(`License Plate: ${reservation.vehicle.licensePlate}`, 320, 215)
         .text(`Category: ${reservation.vehicle.category}`, 320, 230);

      // Rental Details
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('RENTAL DETAILS', 50, 270);

      const startDate = new Date(reservation.startDate).toLocaleDateString();
      const endDate = new Date(reservation.endDate).toLocaleDateString();
      const days = Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24));

      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Pickup Date: ${startDate}`, 50, 295)
         .text(`Return Date: ${endDate}`, 50, 310)
         .text(`Duration: ${days} day${days !== 1 ? 's' : ''}`, 50, 325)
         .text(`Destination: ${reservation.destination || 'N/A'}`, 50, 340);

      if (reservation.checkout) {
        doc.text(`Mileage Out: ${reservation.checkout.mileageOut.toLocaleString()} km`, 320, 295);
      }
      if (reservation.checkin) {
        doc.text(`Mileage In: ${reservation.checkin.mileageIn.toLocaleString()} km`, 320, 310);
        const mileageDriven = reservation.checkin.mileageIn - reservation.checkout.mileageOut;
        doc.text(`Distance Driven: ${mileageDriven.toLocaleString()} km`, 320, 325);
      }

      // Payment Breakdown Table
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('PAYMENT BREAKDOWN', 50, 380);

      // Table header
      const tableTop = 410;
      doc.rect(50, tableTop, 495, 25)
         .fillAndStroke(primaryColor, primaryColor);

      doc.fontSize(10)
         .fillColor('#ffffff')
         .text('Description', 60, tableTop + 8)
         .text('Amount', 450, tableTop + 8);

      // Table rows
      let yPosition = tableTop + 35;
      const extraCharges = reservation.checkin?.extraCharges || 0;
      const finalTotal = reservation.totalPrice + extraCharges;

      // Rental Price
      doc.fillColor('#000000')
         .text('Rental Price', 60, yPosition)
         .text(`€${reservation.totalPrice.toFixed(2)}`, 450, yPosition);
      yPosition += 20;

      // Deposit
      doc.text('Deposit Paid', 60, yPosition)
         .text(`€${reservation.depositPaid.toFixed(2)}`, 450, yPosition);
      yPosition += 20;

      // Extra Charges
      if (extraCharges > 0) {
        doc.text('Extra Charges', 60, yPosition)
           .text(`€${extraCharges.toFixed(2)}`, 450, yPosition);
        yPosition += 20;
      }

      // Damage Report
      if (reservation.checkin?.damageReport) {
        doc.text('Damage Report:', 60, yPosition)
           .fontSize(9)
           .fillColor(secondaryColor)
           .text(reservation.checkin.damageReport, 60, yPosition + 15, { width: 485 });
        yPosition += 40;
      }

      // Total line
      yPosition += 10;
      doc.moveTo(50, yPosition)
         .lineTo(545, yPosition)
         .strokeColor(accentColor)
         .lineWidth(1)
         .stroke();

      yPosition += 15;
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text('TOTAL AMOUNT', 60, yPosition)
         .fontSize(14)
         .text(`€${finalTotal.toFixed(2)}`, 450, yPosition);

      // Payment Status
      yPosition += 30;
      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Payment Status: ${reservation.paymentStatus}`, 60, yPosition)
         .text(`Reservation Status: ${reservation.status}`, 320, yPosition);

      // Signatures
      yPosition += 60;
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text('SIGNATURES', 50, yPosition);

      yPosition += 30;

      // Customer Signature
      if (reservation.user.signatureUrl) {
        try {
          // Note: In production, you'd fetch and embed the actual image
          doc.fontSize(10)
             .fillColor('#000000')
             .text('Customer Signature:', 60, yPosition);
          doc.text('_____________________', 60, yPosition + 20);
          doc.fontSize(8)
             .fillColor(secondaryColor)
             .text(`${reservation.user.firstName} ${reservation.user.lastName}`, 60, yPosition + 40);
        } catch (error) {
          console.error('Error adding customer signature:', error);
        }
      } else {
        doc.fontSize(10)
           .fillColor('#000000')
           .text('Customer Signature:', 60, yPosition);
        doc.text('_____________________', 60, yPosition + 20);
      }

      // Admin Signature
      if (invoiceSettings.adminSignatureUrl) {
        try {
          doc.fontSize(10)
             .fillColor('#000000')
             .text('Authorized Signature:', 320, yPosition);
          doc.text('_____________________', 320, yPosition + 20);
          doc.fontSize(8)
             .fillColor(secondaryColor)
             .text(invoiceSettings.ownerName || 'Management', 320, yPosition + 40);
        } catch (error) {
          console.error('Error adding admin signature:', error);
        }
      } else {
        doc.fontSize(10)
           .fillColor('#000000')
           .text('Authorized Signature:', 320, yPosition);
        doc.text('_____________________', 320, yPosition + 20);
      }

      // Terms & Conditions
      if (invoiceSettings.termsConditions) {
        yPosition += 80;
        doc.fontSize(10)
           .fillColor(primaryColor)
           .text('TERMS & CONDITIONS', 50, yPosition);
        
        doc.fontSize(8)
           .fillColor(secondaryColor)
           .text(invoiceSettings.termsConditions, 50, yPosition + 20, { width: 495, align: 'justify' });
      }

      // Footer
      const footerY = 750;
      doc.fontSize(8)
         .fillColor(secondaryColor)
         .text(
           invoiceSettings.footerMessage || 'Thank you for choosing our service!',
           50,
           footerY,
           { align: 'center', width: 495 }
         );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
