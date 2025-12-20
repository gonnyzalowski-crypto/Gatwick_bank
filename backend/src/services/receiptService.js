import PDFDocument from 'pdfkit';
import prisma from '../config/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a PDF receipt for a transaction
 * @param {string} transactionId - The transaction ID
 * @param {string} userId - The user ID (for authorization)
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generateTransactionReceipt = async (transactionId, userId) => {
  // Fetch transaction with account and user details
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      account: {
        userId: userId
      }
    },
    include: {
      account: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }
    }
  });

  if (!transaction) {
    throw new Error('Transaction not found or unauthorized');
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Transaction Receipt - ${transaction.reference}`,
          Author: 'Rosch Capital Bank',
          Subject: 'Transaction Receipt',
          Creator: 'Rosch Capital Bank Digital Banking'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#6B21A8';
      const secondaryColor = '#7C3AED';
      const textColor = '#333333';
      const lightGray = '#F3F4F6';
      const borderColor = '#E5E7EB';

      // Header Background
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      // Bank Logo Area (Icon representation)
      doc.rect(50, 30, 50, 50).fill('#ffffff');
      doc.fontSize(28).fillColor(primaryColor).text('RC', 55, 42, { width: 40, align: 'center' });

      // Bank Name
      doc.fontSize(24).fillColor('#ffffff').text('Rosch Capital Bank', 115, 35);
      doc.fontSize(11).fillColor('#E9D5FF').text('Secure Banking Solutions', 115, 62);

      // Receipt Title
      doc.fontSize(14).fillColor('#ffffff').text('TRANSACTION RECEIPT', 115, 85);

      // Reset position
      doc.fillColor(textColor);

      // Receipt Reference Box
      doc.rect(50, 140, doc.page.width - 100, 60).fill(lightGray);
      doc.fontSize(10).fillColor('#6B7280').text('Reference Number', 60, 150);
      doc.fontSize(14).fillColor(textColor).font('Helvetica-Bold').text(transaction.reference || 'N/A', 60, 165);
      
      doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text('Date & Time', 350, 150);
      const txDate = new Date(transaction.createdAt);
      doc.fontSize(12).fillColor(textColor).font('Helvetica-Bold').text(
        txDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }), 
        350, 165
      );

      // Transaction Status Badge
      const statusColors = {
        'COMPLETED': '#10B981',
        'PENDING': '#F59E0B',
        'FAILED': '#EF4444'
      };
      const statusColor = statusColors[transaction.status?.toUpperCase()] || '#6B7280';
      
      doc.rect(450, 145, 90, 25).fill(statusColor);
      doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold').text(
        transaction.status?.toUpperCase() || 'UNKNOWN', 
        455, 152, 
        { width: 80, align: 'center' }
      );

      // Main Content Area
      let yPos = 230;

      // Transaction Details Section
      doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor).text('Transaction Details', 50, yPos);
      doc.moveTo(50, yPos + 20).lineTo(doc.page.width - 50, yPos + 20).stroke(borderColor);
      yPos += 35;

      // Transaction Type
      const typeColors = {
        'CREDIT': '#10B981',
        'DEBIT': '#EF4444',
        'DEPOSIT': '#10B981',
        'WITHDRAWAL': '#EF4444',
        'TRANSFER': '#3B82F6',
        'PAYMENT': '#EF4444'
      };
      const typeColor = typeColors[transaction.type?.toUpperCase()] || textColor;
      const typeSign = ['CREDIT', 'DEPOSIT'].includes(transaction.type?.toUpperCase()) ? '+' : '-';

      // Amount Box
      doc.rect(50, yPos, doc.page.width - 100, 70).fill('#FAFAFA').stroke(borderColor);
      doc.fontSize(12).fillColor('#6B7280').font('Helvetica').text('Amount', 60, yPos + 10);
      doc.fontSize(32).fillColor(typeColor).font('Helvetica-Bold').text(
        `${typeSign}$${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        60, yPos + 28
      );
      doc.fontSize(11).fillColor('#6B7280').font('Helvetica').text(
        `Transaction Type: ${transaction.type?.toUpperCase() || 'N/A'}`,
        350, yPos + 35
      );
      yPos += 90;

      // Details Grid
      const detailsData = [
        { label: 'Description', value: transaction.description || 'N/A' },
        { label: 'Category', value: transaction.category || 'General' },
        { label: 'Merchant/Recipient', value: transaction.merchantName || 'N/A' },
        { label: 'Merchant Category', value: transaction.merchantCategory || 'N/A' }
      ];

      detailsData.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#FFFFFF' : lightGray;
        doc.rect(50, yPos, doc.page.width - 100, 30).fill(bgColor);
        doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text(item.label, 60, yPos + 10);
        doc.fontSize(11).fillColor(textColor).font('Helvetica-Bold').text(item.value, 200, yPos + 10, { width: 300 });
        yPos += 30;
      });

      yPos += 20;

      // Account Information Section
      doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor).text('Account Information', 50, yPos);
      doc.moveTo(50, yPos + 20).lineTo(doc.page.width - 50, yPos + 20).stroke(borderColor);
      yPos += 35;

      const accountData = [
        { label: 'Account Holder', value: `${transaction.account.user.firstName} ${transaction.account.user.lastName}` },
        { label: 'Account Number', value: `****${transaction.account.accountNumber?.slice(-4) || 'XXXX'}` },
        { label: 'Account Type', value: transaction.account.type || 'N/A' },
        { label: 'Email', value: transaction.account.user.email || 'N/A' }
      ];

      accountData.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#FFFFFF' : lightGray;
        doc.rect(50, yPos, doc.page.width - 100, 30).fill(bgColor);
        doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text(item.label, 60, yPos + 10);
        doc.fontSize(11).fillColor(textColor).font('Helvetica-Bold').text(item.value, 200, yPos + 10, { width: 300 });
        yPos += 30;
      });

      yPos += 30;

      // Verification Section
      doc.rect(50, yPos, doc.page.width - 100, 80).fill('#EFF6FF').stroke('#3B82F6');
      doc.fontSize(11).fillColor('#1E40AF').font('Helvetica-Bold').text('Verification Information', 60, yPos + 10);
      doc.fontSize(9).fillColor('#1E3A8A').font('Helvetica').text(
        `This receipt was generated electronically by Rosch Capital Bank's secure banking system.`,
        60, yPos + 28, { width: doc.page.width - 140 }
      );
      doc.text(
        `Document ID: RCB-${transaction.id.slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        60, yPos + 45
      );
      doc.text(
        `Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`,
        60, yPos + 58
      );

      // Footer
      const footerY = doc.page.height - 100;
      doc.rect(0, footerY, doc.page.width, 100).fill('#1F2937');
      
      doc.fontSize(10).fillColor('#9CA3AF').text(
        '© 2025 Rosch Capital Bank. All rights reserved.',
        50, footerY + 20, { width: doc.page.width - 100, align: 'center' }
      );
      doc.fontSize(9).text(
        'This is an official transaction receipt. For inquiries, contact support@roschcapital.com or call +1 (800) 55-ROSCH',
        50, footerY + 38, { width: doc.page.width - 100, align: 'center' }
      );
      doc.fontSize(8).fillColor('#6B7280').text(
        'Rosch Capital Bank is a registered financial institution. FDIC Insured.',
        50, footerY + 55, { width: doc.page.width - 100, align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get transaction details for receipt preview
 */
export const getReceiptData = async (transactionId, userId) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      account: {
        userId: userId
      }
    },
    include: {
      account: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!transaction) {
    throw new Error('Transaction not found or unauthorized');
  }

  return {
    id: transaction.id,
    reference: transaction.reference,
    amount: parseFloat(transaction.amount),
    type: transaction.type,
    description: transaction.description,
    category: transaction.category,
    merchantName: transaction.merchantName,
    status: transaction.status,
    createdAt: transaction.createdAt,
    account: {
      number: `****${transaction.account.accountNumber?.slice(-4) || 'XXXX'}`,
      type: transaction.account.type,
      holder: `${transaction.account.user.firstName} ${transaction.account.user.lastName}`
    }
  };
};
