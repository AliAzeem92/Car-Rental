import prisma from '../config/prisma.js';
import { generateInvoicePDF } from '../services/invoiceService.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const generateInvoice = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const pdfBuffer = await generateInvoicePDF(parseInt(reservationId));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${reservationId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getInvoiceSettings = async (req, res) => {
  try {
    let settings = await prisma.invoicesettings.findFirst();
    
    if (!settings) {
      settings = await prisma.invoicesettings.create({
        data: {
          companyName: 'Car Rental Company',
          companyEmail: 'info@carrental.com',
          companyPhone: '+1 (555) 123-4567',
          companyAddress: '123 Business Street, City, State 12345'
        }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoiceSettings = async (req, res) => {
  try {
    const {
      companyName,
      ownerName,
      companyAddress,
      companyPhone,
      companyEmail,
      termsConditions,
      footerMessage
    } = req.body;

    let settings = await prisma.invoicesettings.findFirst();

    const updateData = {};
    if (companyName) updateData.companyName = companyName;
    if (ownerName !== undefined) updateData.ownerName = ownerName;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (companyPhone !== undefined) updateData.companyPhone = companyPhone;
    if (companyEmail !== undefined) updateData.companyEmail = companyEmail;
    if (termsConditions !== undefined) updateData.termsConditions = termsConditions;
    if (footerMessage !== undefined) updateData.footerMessage = footerMessage;

    // Handle logo upload
    if (req.files?.logo) {
      const logoUrl = await uploadToCloudinary(req.files.logo[0].buffer, 'company');
      updateData.companyLogoUrl = logoUrl;
    }

    // Handle admin signature upload
    if (req.files?.adminSignature) {
      const signatureUrl = await uploadToCloudinary(req.files.adminSignature[0].buffer, 'signatures');
      updateData.adminSignatureUrl = signatureUrl;
    }

    if (settings) {
      settings = await prisma.invoicesettings.update({
        where: { id: settings.id },
        data: updateData
      });
    } else {
      settings = await prisma.invoicesettings.create({
        data: updateData
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Update invoice settings error:', error);
    res.status(500).json({ error: error.message });
  }
};
