import { Router } from 'express';
import prisma from '../config/prisma.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

// Generate ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${timestamp}${random}`;
};

// Middleware to check admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// POST /api/v1/support/tickets - Create new ticket (user)
router.post('/tickets', verifyAuth, async (req, res) => {
  try {
    const { subject, category, message, priority } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ error: 'Subject, category, and message are required' });
    }

    // Get user details for the ticket
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        accounts: {
          where: { isPrimary: true },
          select: { accountNumber: true }
        }
      }
    });

    const ticketNumber = generateTicketNumber();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.userId,
        ticketNumber,
        subject,
        category,
        priority: priority || 'MEDIUM',
        status: 'OPEN'
      }
    });

    // Create initial message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: req.user.userId,
        senderType: 'USER',
        message,
        isRead: false
      }
    });

    // Create notification for admins (you can implement admin notification logic)
    
    res.json({
      success: true,
      ticket: {
        ...ticket,
        userName: `${user.firstName} ${user.lastName}`,
        accountNumber: user.accounts[0]?.accountNumber || 'N/A'
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/support/tickets - Get user's tickets
router.get('/tickets', verifyAuth, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/support/tickets/:id - Get ticket details with messages
router.get('/tickets/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        ...(req.user.isAdmin ? {} : { userId: req.user.userId })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            accounts: {
              where: { isPrimary: true },
              select: { accountNumber: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Mark messages as read
    if (!req.user.isAdmin) {
      await prisma.supportMessage.updateMany({
        where: {
          ticketId: id,
          senderType: 'ADMIN',
          isRead: false
        },
        data: { isRead: true }
      });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/support/tickets/:id/messages - Add message to ticket
router.post('/tickets/:id/messages', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify ticket exists and user has access
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        ...(req.user.isAdmin ? {} : { userId: req.user.userId })
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: req.user.userId,
        senderType: req.user.isAdmin ? 'ADMIN' : 'USER',
        message,
        isRead: false
      }
    });

    // Update ticket status if it was resolved
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
    }

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN ROUTES

// GET /api/v1/support/admin/tickets - Get all tickets (admin)
router.get('/admin/tickets', verifyAuth, isAdmin, async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            accounts: {
              where: { isPrimary: true },
              select: { accountNumber: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: 'USER',
                isRead: false
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Get admin tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/support/admin/tickets/:id - Update ticket status (admin)
router.patch('/admin/tickets/:id', verifyAuth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
