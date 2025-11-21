import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../services/notificationService.js';

const router = express.Router();

// Get user notifications
// GET /api/v1/notifications
router.get('/', verifyAuth, async (req, res) => {
  try {
    const { unreadOnly, limit, page } = req.query;
    
    const result = await getUserNotifications(req.user.userId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : 20,
      page: page ? parseInt(page) : 1
    });

    return res.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
// GET /api/v1/notifications/unread-count
router.get('/unread-count', verifyAuth, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.userId);
    return res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
// PUT /api/v1/notifications/:id/read
router.put('/:id/read', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await markAsRead(id, req.user.userId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
// PUT /api/v1/notifications/mark-all-read
router.put('/mark-all-read', verifyAuth, async (req, res) => {
  try {
    await markAllAsRead(req.user.userId);
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Get admin notifications (KYC approvals, card approvals, support tickets, etc.)
// GET /api/v1/notifications/admin
router.get('/admin', verifyAuth, async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get pending KYC submissions
    const pendingKYC = await prisma.user.count({
      where: { kycStatus: 'PENDING' }
    });

    // Get pending credit card approvals
    const pendingCards = await prisma.creditCard.count({
      where: { approvalStatus: 'PENDING' }
    });

    // Get pending transfer approvals
    const pendingTransfers = await prisma.transferRequest.count({
      where: { status: 'PENDING' }
    });

    // Get open support tickets
    const openTickets = await prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
    });

    // Create notification objects
    const notifications = [];
    
    if (pendingKYC > 0) {
      notifications.push({
        id: 'kyc-pending',
        type: 'kyc_approval',
        title: 'Pending KYC Approvals',
        message: `${pendingKYC} KYC submission${pendingKYC > 1 ? 's' : ''} awaiting review`,
        createdAt: new Date(),
        isRead: false
      });
    }

    if (pendingCards > 0) {
      notifications.push({
        id: 'card-pending',
        type: 'card_approval',
        title: 'Pending Card Approvals',
        message: `${pendingCards} credit card application${pendingCards > 1 ? 's' : ''} awaiting approval`,
        createdAt: new Date(),
        isRead: false
      });
    }

    if (pendingTransfers > 0) {
      notifications.push({
        id: 'transfer-pending',
        type: 'transaction',
        title: 'Pending Transfer Approvals',
        message: `${pendingTransfers} transfer${pendingTransfers > 1 ? 's' : ''} awaiting approval`,
        createdAt: new Date(),
        isRead: false
      });
    }

    if (openTickets > 0) {
      notifications.push({
        id: 'tickets-open',
        type: 'support',
        title: 'Open Support Tickets',
        message: `${openTickets} support ticket${openTickets > 1 ? 's' : ''} need attention`,
        createdAt: new Date(),
        isRead: false
      });
    }

    await prisma.$disconnect();

    return res.json({
      success: true,
      notifications,
      unreadCount: notifications.length
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin notifications' });
  }
});

// Delete notification
// DELETE /api/v1/notifications/:id
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteNotification(id, req.user.userId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
