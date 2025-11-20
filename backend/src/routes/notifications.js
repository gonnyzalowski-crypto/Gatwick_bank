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
// PUT /api/v1/notifications/read-all
router.put('/read-all', verifyAuth, async (req, res) => {
  try {
    await markAllAsRead(req.user.userId);
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ error: 'Failed to mark all as read' });
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
