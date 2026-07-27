/**
 * PDF Generation Utility with Settings Support
 * Use this utility in your form components to generate PDFs with dynamic settings
 */

import { jsPDF } from 'jspdf';
import pdfSettingsService from '../services/pdfSettingsService';

export const generateLoanPDF = async (loanData, options = {}) => {
  try {
    // Get current PDF settings
    const settings = await pdfSettingsService.getSettings();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // ===== COMPANY HEADER =====
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(settings.companyName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    doc.setFontSize(10);
    doc.text(settings.address1, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text(settings.address2, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text(settings.phone, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    // Dividing line
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // ===== CUSTOMER INFO & TRANSACTION =====
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('[ORIGINAL]', margin, yPosition);

    doc.setFontSize(8);
    const transactionNumber = loanData.transaction_number || loanData.transactionNumber || 'N/A';
    doc.text(`Transaction: ${transactionNumber}`, pageWidth - margin - 40, yPosition);
    yPosition += 5;

    // Customer name
    const firstName = loanData.first_name || loanData.firstName || '';
    const lastName = loanData.last_name || loanData.lastName || '';
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`${firstName} ${lastName}`, margin, yPosition);
    yPosition += 4;

    // Loan details
    doc.setFontSize(8);
    const loanId = loanData.id || loanData.loanId || 'N/A';
    const loanAmount = loanData.loan_amount || loanData.loanAmount || '0.00';
    const dueDate = loanData.due_date || loanData.dueDate || 'N/A';

    doc.text(`Loan Amount: $${parseFloat(loanAmount).toFixed(2)}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Due Date: ${dueDate}`, margin, yPosition);
    yPosition += 6;

    // ===== TABLE HEADER =====
    const tableTop = yPosition;
    const colWidths = {
      item: 25,
      category: 35,
      description: 70,
      amount: 30
    };

    // Header background
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, tableTop, contentWidth, 7, 'F');

    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('ITEM', margin + 2, tableTop + 5);
    doc.text('CATEGORY', margin + colWidths.item + 2, tableTop + 5);
    doc.text('DESCRIPTION', margin + colWidths.item + colWidths.category + 2, tableTop + 5);
    doc.text('AMOUNT', margin + colWidths.item + colWidths.category + colWidths.description + 2, tableTop + 5);

    // Table border
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, tableTop, contentWidth, 7);
    doc.line(margin + colWidths.item, tableTop, margin + colWidths.item, tableTop + 7);
    doc.line(margin + colWidths.item + colWidths.category, tableTop, margin + colWidths.item + colWidths.category, tableTop + 7);
    doc.line(margin + colWidths.item + colWidths.category + colWidths.description, tableTop, margin + colWidths.item + colWidths.category + colWidths.description, tableTop + 7);

    yPosition = tableTop + 8;

    // ===== TABLE CONTENT =====
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('LN-' + loanId, margin + 2, yPosition);
    
    // Use actual collateral/item data from loan
    const itemCategory = loanData.item_category || loanData.itemCategory || settings.categoryDefaultText;
    const itemDescription = loanData.collateral_description || loanData.collateralDescription || loanData.item_description || loanData.itemDescription || settings.itemDescriptionTemplate;
    
    doc.text(itemCategory, margin + colWidths.item + 2, yPosition);
    doc.text(itemDescription, margin + colWidths.item + colWidths.category + 2, yPosition);

    const totalPayable = loanData.total_payable_amount || loanData.totalPayableAmount || loanAmount;
    doc.text(`$${parseFloat(totalPayable).toFixed(2)}`, margin + colWidths.item + colWidths.category + colWidths.description + 2, yPosition);

    yPosition += 8;

    // ===== CHARGES DUE =====
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('CHARGES ON THIS ACCOUNT ARE DUE ON OR BEFORE', margin + colWidths.item + colWidths.category + 5, yPosition);
    doc.text(dueDate, pageWidth - margin - 40, yPosition);
    yPosition += 6;

    // ===== TOTAL =====
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL', margin + colWidths.item + colWidths.category + 5, yPosition);
    doc.text(`$${parseFloat(totalPayable).toFixed(2)}`, pageWidth - margin - 40, yPosition);
    yPosition += 8;

    // ===== LEGAL TERMS =====
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);

    // First legal term
    const legalText1 = doc.splitTextToSize(settings.legalTerm1, contentWidth - 4);
    doc.text(legalText1, margin + 2, yPosition);
    yPosition += legalText1.length * 3 + 3;

    // Second legal term
    if (settings.legalTerm2) {
      const legalText2 = doc.splitTextToSize(settings.legalTerm2, contentWidth - 4);
      doc.text(legalText2, margin + 2, yPosition);
      yPosition += legalText2.length * 3 + 5;
    }

    // ===== MINIMUM PAYMENT =====
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    const minPayment = (parseFloat(totalPayable) * settings.minPaymentPercentage / 100).toFixed(2);
    doc.text('MINIMUM 30 DAY PAYMENT DUE', margin + 2, yPosition);
    doc.text('$' + minPayment, pageWidth / 2 - 20, yPosition);
    yPosition += 5;

    doc.text('ALL FEES DUE', margin + 2, yPosition);
    doc.text('$' + parseFloat(totalPayable).toFixed(2), pageWidth / 2 - 20, yPosition);

    // ===== FOOTER =====
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.setFontSize(7);
    doc.text(settings.documentCode, pageWidth - margin - 30, pageHeight - 5);

    // ===== SAVE PDF =====
    const filename = options.filename || `loan-${transactionNumber}.pdf`;
    doc.save(filename);

    return {
      success: true,
      message: 'PDF generated successfully',
      filename
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate PDF',
      error
    };
  }
};

/**
 * Generate PDF without waiting for settings (uses cached or defaults)
 * Useful for quick generation in forms
 */
export const generateLoanPDFSync = (loanData, options = {}) => {
  const settings = pdfSettingsService.getSettingsSync();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // ===== COMPANY HEADER =====
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(settings.companyName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  doc.setFontSize(10);
  doc.text(settings.address1, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text(settings.address2, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text(settings.phone, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  // Dividing line
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // ===== CUSTOMER INFO & TRANSACTION =====
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('[ORIGINAL]', margin, yPosition);

  doc.setFontSize(8);
  const transactionNumber = loanData.transaction_number || loanData.transactionNumber || 'N/A';
  doc.text(`Transaction: ${transactionNumber}`, pageWidth - margin - 40, yPosition);
  yPosition += 5;

  const firstName = loanData.first_name || loanData.firstName || '';
  const lastName = loanData.last_name || loanData.lastName || '';
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`${firstName} ${lastName}`, margin, yPosition);
  yPosition += 4;

  doc.setFontSize(8);
  const loanId = loanData.id || loanData.loanId || 'N/A';
  const loanAmount = loanData.loan_amount || loanData.loanAmount || '0.00';
  const dueDate = loanData.due_date || loanData.dueDate || 'N/A';

  doc.text(`Loan Amount: $${parseFloat(loanAmount).toFixed(2)}`, margin, yPosition);
  yPosition += 4;
  doc.text(`Due Date: ${dueDate}`, margin, yPosition);
  yPosition += 6;

  // ===== TABLE HEADER =====
  const tableTop = yPosition;
  const colWidths = {
    item: 25,
    category: 35,
    description: 70,
    amount: 30
  };

  doc.setFillColor(200, 200, 200);
  doc.rect(margin, tableTop, contentWidth, 7, 'F');

  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.text('ITEM', margin + 2, tableTop + 5);
  doc.text('CATEGORY', margin + colWidths.item + 2, tableTop + 5);
  doc.text('DESCRIPTION', margin + colWidths.item + colWidths.category + 2, tableTop + 5);
  doc.text('AMOUNT', margin + colWidths.item + colWidths.category + colWidths.description + 2, tableTop + 5);

  doc.setDrawColor(0, 0, 0);
  doc.rect(margin, tableTop, contentWidth, 7);
  doc.line(margin + colWidths.item, tableTop, margin + colWidths.item, tableTop + 7);
  doc.line(margin + colWidths.item + colWidths.category, tableTop, margin + colWidths.item + colWidths.category, tableTop + 7);
  doc.line(margin + colWidths.item + colWidths.category + colWidths.description, tableTop, margin + colWidths.item + colWidths.category + colWidths.description, tableTop + 7);

  yPosition = tableTop + 8;

  // ===== TABLE CONTENT =====
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text('LN-' + loanId, margin + 2, yPosition);
  
  // Use actual collateral/item data from loan
  const itemCategory = loanData.item_category || loanData.itemCategory || settings.categoryDefaultText;
  const itemDescription = loanData.collateral_description || loanData.collateralDescription || loanData.item_description || loanData.itemDescription || settings.itemDescriptionTemplate;
  
  doc.text(itemCategory, margin + colWidths.item + 2, yPosition);
  doc.text(itemDescription, margin + colWidths.item + colWidths.category + 2, yPosition);

  const totalPayable = loanData.total_payable_amount || loanData.totalPayableAmount || loanAmount;
  doc.text(`$${parseFloat(totalPayable).toFixed(2)}`, margin + colWidths.item + colWidths.category + colWidths.description + 2, yPosition);

  yPosition += 8;

  // ===== CHARGES DUE & TOTAL =====
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text('CHARGES ON THIS ACCOUNT ARE DUE ON OR BEFORE', margin + colWidths.item + colWidths.category + 5, yPosition);
  doc.text(dueDate, pageWidth - margin - 40, yPosition);
  yPosition += 6;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL', margin + colWidths.item + colWidths.category + 5, yPosition);
  doc.text(`$${parseFloat(totalPayable).toFixed(2)}`, pageWidth - margin - 40, yPosition);
  yPosition += 8;

  // ===== LEGAL TERMS =====
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);
  const legalText1 = doc.splitTextToSize(settings.legalTerm1, contentWidth - 4);
  doc.text(legalText1, margin + 2, yPosition);
  yPosition += legalText1.length * 3 + 3;

  if (settings.legalTerm2) {
    const legalText2 = doc.splitTextToSize(settings.legalTerm2, contentWidth - 4);
    doc.text(legalText2, margin + 2, yPosition);
  }

  // ===== FOOTER =====
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
  doc.setFontSize(7);
  doc.text(settings.documentCode, pageWidth - margin - 30, pageHeight - 5);

  // ===== SAVE PDF =====
  const filename = options.filename || `loan-${transactionNumber}.pdf`;
  doc.save(filename);

  return { success: true, filename };
};
