import PDFDocument from 'pdfkit';

export const streamContractPDF = (reservation, vehicle, customer, res) => {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=contract_${reservation.contractNumber}.pdf`);
  
  doc.pipe(res);

  doc.fontSize(20).text('CAR RENTAL CONTRACT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Contract Number: ${reservation.contractNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  
  doc.fontSize(14).text('Customer Information:', { underline: true });
  doc.fontSize(11).text(`Name: ${customer.firstName} ${customer.lastName}`);
  doc.text(`Email: ${customer.email}`);
  doc.text(`Phone: ${customer.phone}`);
  doc.text(`License: ${customer.licenseNumber}`);
  doc.moveDown();
  
  doc.fontSize(14).text('Vehicle Information:', { underline: true });
  doc.fontSize(11).text(`Vehicle: ${vehicle.brand} ${vehicle.model}`);
  doc.text(`License Plate: ${vehicle.licensePlate}`);
  doc.text(`Category: ${vehicle.category}`);
  doc.moveDown();
  
  doc.fontSize(14).text('Rental Details:', { underline: true });
  doc.fontSize(11).text(`Start Date: ${new Date(reservation.startDate).toLocaleDateString()}`);
  doc.text(`End Date: ${new Date(reservation.endDate).toLocaleDateString()}`);
  doc.text(`Daily Rate: $${vehicle.dailyPrice}`);
  doc.text(`Total Price: $${reservation.totalPrice}`);
  doc.text(`Deposit: $${reservation.depositPaid}`);
  doc.moveDown();
  
  doc.fontSize(10).text('Terms and Conditions:', { underline: true });
  doc.fontSize(9).text('1. The renter must return the vehicle in the same condition.');
  doc.text('2. Any damage will be charged to the renter.');
  doc.text('3. The deposit will be refunded upon satisfactory return.');
  doc.moveDown(2);
  
  doc.fontSize(10).text('Customer Signature: _____________________');
  doc.text('Date: _____________________');

  doc.end();
};
