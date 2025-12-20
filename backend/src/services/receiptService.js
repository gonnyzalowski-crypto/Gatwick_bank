import PDFDocument from 'pdfkit';
import prisma from '../config/prisma.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a clean, professional PDF receipt for a transaction
 * Design: Document-style layout with proper alignment
 */
export const generateTransactionReceipt = async (transactionId, userId) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      account: { userId: userId }
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
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
        info: {
          Title: `Transaction Receipt - ${transaction.reference}`,
          Author: 'Rosch Capital Bank',
          Subject: 'Transaction Receipt'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 120;
      const leftMargin = 60;
      const primaryColor = '#581C87';
      const textDark = '#1F2937';
      const textMuted = '#6B7280';

      // ============ HEADER ============
      // Logo image from assets
      const logoPath = path.join(__dirname, '../assets/logo.png');
      try {
        doc.image(logoPath, leftMargin, 45, { width: 44, height: 44 });
      } catch (e) {
        // Fallback: draw a simple purple square if logo not found
        doc.roundedRect(leftMargin, 45, 44, 44, 8).fill(primaryColor);
      }

      // Bank name
      doc.fillColor(textDark)
         .font('Helvetica-Bold')
         .fontSize(22)
         .text('Rosch Capital Bank', leftMargin + 54, 52);
      
      doc.fillColor(textMuted)
         .font('Helvetica')
         .fontSize(10)
         .text('Secure Digital Banking', leftMargin + 54, 76);

      // Receipt title - right aligned
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('TRANSACTION RECEIPT', leftMargin, 55, { width: contentWidth, align: 'right' });

      // Horizontal line
      doc.moveTo(leftMargin, 105).lineTo(pageWidth - 60, 105).strokeColor('#E5E7EB').lineWidth(1).stroke();

      // ============ RECEIPT INFO BAR ============
      let y = 120;
      
      doc.fillColor(textMuted).font('Helvetica').fontSize(9).text('Reference Number', leftMargin, y);
      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(11).text(transaction.reference || 'N/A', leftMargin, y + 14);

      doc.fillColor(textMuted).font('Helvetica').fontSize(9).text('Date & Time', leftMargin + 200, y);
      const txDate = new Date(transaction.createdAt);
      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(11).text(
        txDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + 
        ' at ' + txDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        leftMargin + 200, y + 14
      );

      // Status badge
      const statusColors = { 'COMPLETED': '#059669', 'PENDING': '#D97706', 'FAILED': '#DC2626' };
      const statusColor = statusColors[transaction.status?.toUpperCase()] || '#6B7280';
      const statusText = transaction.status?.toUpperCase() || 'UNKNOWN';
      const statusWidth = doc.widthOfString(statusText) + 16;
      
      doc.roundedRect(pageWidth - 60 - statusWidth, y + 8, statusWidth, 22, 4).fill(statusColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text(statusText, pageWidth - 60 - statusWidth + 8, y + 14);

      // ============ AMOUNT SECTION ============
      y = 175;
      doc.rect(leftMargin, y, contentWidth, 70).fill('#F9FAFB').stroke('#E5E7EB');
      
      const isCredit = ['CREDIT', 'DEPOSIT'].includes(transaction.type?.toUpperCase());
      const amountColor = isCredit ? '#059669' : '#DC2626';
      const amountSign = isCredit ? '+' : '-';
      const formattedAmount = parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      doc.fillColor(textMuted).font('Helvetica').fontSize(10).text('Amount', leftMargin + 20, y + 12);
      doc.fillColor(amountColor).font('Helvetica-Bold').fontSize(28).text(`${amountSign}$${formattedAmount}`, leftMargin + 20, y + 28);
      
      doc.fillColor(textMuted).font('Helvetica').fontSize(10).text('Transaction Type', leftMargin + 280, y + 25);
      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(12).text(transaction.type?.toUpperCase() || 'N/A', leftMargin + 280, y + 40);

      // ============ TRANSACTION DETAILS ============
      y = 265;
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('Transaction Details', leftMargin, y);
      doc.moveTo(leftMargin, y + 18).lineTo(pageWidth - 60, y + 18).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      y += 30;
      const details = [
        ['Description', transaction.description || 'N/A'],
        ['Category', transaction.category || 'General'],
        ['Merchant/Recipient', transaction.merchantName || 'N/A']
      ];

      details.forEach(([label, value]) => {
        doc.fillColor(textMuted).font('Helvetica').fontSize(10).text(label, leftMargin, y);
        doc.fillColor(textDark).font('Helvetica').fontSize(10).text(value, leftMargin + 150, y, { width: contentWidth - 150 });
        y += 22;
      });

      // ============ ACCOUNT INFORMATION ============
      y += 15;
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('Account Information', leftMargin, y);
      doc.moveTo(leftMargin, y + 18).lineTo(pageWidth - 60, y + 18).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      y += 30;
      const accountInfo = [
        ['Account Holder', `${transaction.account.user.firstName} ${transaction.account.user.lastName}`],
        ['Account Number', `****${transaction.account.accountNumber?.slice(-4) || 'XXXX'}`],
        ['Account Type', transaction.account.type || 'N/A'],
        ['Email', transaction.account.user.email || 'N/A']
      ];

      accountInfo.forEach(([label, value]) => {
        doc.fillColor(textMuted).font('Helvetica').fontSize(10).text(label, leftMargin, y);
        doc.fillColor(textDark).font('Helvetica').fontSize(10).text(value, leftMargin + 150, y, { width: contentWidth - 150 });
        y += 22;
      });

      // ============ VERIFICATION BOX ============
      y += 20;
      doc.rect(leftMargin, y, contentWidth, 65).fill('#F0FDF4').stroke('#86EFAC');
      
      doc.fillColor('#166534').font('Helvetica-Bold').fontSize(10).text('Verification', leftMargin + 15, y + 12);
      doc.fillColor('#15803D').font('Helvetica').fontSize(9)
         .text('This receipt was generated electronically by Rosch Capital Bank.', leftMargin + 15, y + 28)
         .text(`Document ID: RCB-${transaction.id.slice(-8).toUpperCase()}`, leftMargin + 15, y + 42)
         .text(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`, leftMargin + 15, y + 54);

      // ============ FOOTER ============
      const footerY = doc.page.height - 80;
      doc.moveTo(leftMargin, footerY).lineTo(pageWidth - 60, footerY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

      doc.fillColor(textMuted).font('Helvetica').fontSize(8)
         .text('Rosch Capital Bank  •  support@roschcapital.com  •  +1 (800) 55-ROSCH', leftMargin, footerY + 15, { width: contentWidth, align: 'center' })
         .text('This is an official transaction receipt. FDIC Insured.', leftMargin, footerY + 28, { width: contentWidth, align: 'center' })
         .text('© 2025 Rosch Capital Bank. All rights reserved.', leftMargin, footerY + 41, { width: contentWidth, align: 'center' });

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
