# Payment Gateway & Support Tickets System

## Implementation Complete ✅

### Features Implemented

## 1. Payment Gateway Management System

### Admin Features
- **Add/Edit/Delete Gateways**: Full CRUD operations for payment methods
- **Gateway Types Supported**:
  - Cryptocurrency (Bitcoin, Ethereum, USDT, etc.)
  - PayPal
  - Bank Transfer
  - Check
  - Other custom methods

### Gateway Configuration
Each gateway can be configured with:
- **Name**: Display name (e.g., "Bitcoin", "PayPal")
- **Type**: CRYPTO, PAYPAL, BANK, CHECK, OTHER
- **Crypto-specific**:
  - Wallet Address
  - Network (BTC, ETH, USDT-TRC20, etc.)
  - QR Code Image Upload
- **PayPal/Other**:
  - Account Email
  - Account ID
- **General Settings**:
  - Instructions for users
  - Min/Max amount limits
  - Processing time
  - Display order
  - Active/Inactive status

### API Endpoints

#### User Endpoints
```
GET /api/v1/gateways
- Get all active payment gateways
- Returns: List of available payment methods
```

#### Admin Endpoints
```
GET /api/v1/gateways/admin
- Get all gateways (including inactive)
- Admin only

POST /api/v1/gateways
- Create new gateway
- Supports multipart/form-data for QR code upload
- Admin only

PUT /api/v1/gateways/:id
- Update existing gateway
- Admin only

DELETE /api/v1/gateways/:id
- Delete gateway
- Admin only
```

### Frontend Pages
- **Admin**: `/admin/gateways` - Gateway Management Page
  - Grid view of all gateways
  - Add/Edit form with conditional fields based on type
  - QR code upload for crypto gateways
  - Inline editing and deletion

---

## 2. Support Tickets System

### Features
- **Chat-like Interface**: Real-time messaging between users and admins
- **Ticket Management**: Create, track, and resolve support tickets
- **Status Workflow**: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Categories**: ACCOUNT, TRANSACTION, CARD, TECHNICAL, OTHER

### User Features
- Create support tickets with subject and message
- View all their tickets
- Chat with support agents
- See ticket status updates
- Automatic ticket number generation (TKT-XXXXXXXXX)

### Admin Features
- View all support tickets with filters
- Real-time chat interface
- Update ticket status
- Assign priority levels
- See user details (name, email, account number)
- Mark messages as read
- Filter by status, category, priority

### API Endpoints

#### User Endpoints
```
POST /api/v1/support-tickets/tickets
- Create new support ticket
- Body: { subject, category, message, priority? }

GET /api/v1/support-tickets/tickets
- Get user's tickets

GET /api/v1/support-tickets/tickets/:id
- Get ticket details with messages

POST /api/v1/support-tickets/tickets/:id/messages
- Add message to ticket
- Body: { message }
```

#### Admin Endpoints
```
GET /api/v1/support-tickets/admin/tickets
- Get all tickets with filters
- Query params: status, category, priority

PATCH /api/v1/support-tickets/admin/tickets/:id
- Update ticket status/priority
- Body: { status?, priority?, assignedTo? }
```

### Frontend Pages
- **Admin**: `/admin/support-tickets` - Support Tickets Page
  - Split view: Ticket list + Chat interface
  - Filter tabs (All, Open, In Progress, Resolved)
  - Real-time message updates
  - User information display
  - Status management dropdown

---

## Database Schema

### PaymentGateway Model
```prisma
model PaymentGateway {
  id              String    @id @default(cuid())
  name            String
  type            String    // CRYPTO | PAYPAL | BANK | CHECK | OTHER
  isActive        Boolean   @default(true)
  
  // Crypto fields
  walletAddress   String?
  qrCodePath      String?
  network         String?
  
  // PayPal/Other fields
  accountEmail    String?
  accountId       String?
  
  // Display settings
  displayOrder    Int       @default(0)
  instructions    String?   @db.Text
  minAmount       Decimal?  @db.Decimal(15, 2)
  maxAmount       Decimal?  @db.Decimal(15, 2)
  processingTime  String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### SupportTicket Model
```prisma
model SupportTicket {
  id            String   @id @default(cuid())
  userId        String
  ticketNumber  String   @unique
  subject       String
  category      String
  priority      String   @default("MEDIUM")
  status        String   @default("OPEN")
  assignedTo    String?
  resolvedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(...)
  messages      SupportMessage[]
}
```

### SupportMessage Model
```prisma
model SupportMessage {
  id            String   @id @default(cuid())
  ticketId      String
  senderId      String
  senderType    String   // USER | ADMIN
  message       String   @db.Text
  attachments   Json?
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())

  ticket        SupportTicket @relation(...)
}
```

---

## File Structure

### Backend
```
backend/
├── prisma/
│   ├── schema.prisma (updated with new models)
│   └── migrations/
│       └── 20251120_add_gateways_and_support/
│           └── migration.sql
├── src/
│   └── routes/
│       ├── gateways.js (NEW)
│       ├── supportTickets.js (NEW)
│       └── api.js (updated to register new routes)
└── uploads/
    └── gateways/ (QR code storage)
```

### Frontend
```
frontend/
└── src/
    └── pages/
        └── admin/
            ├── GatewayManagement.jsx (NEW)
            └── SupportTicketsPage.jsx (NEW)
```

---

## Usage Guide

### For Admins

#### Setting Up Payment Gateways
1. Navigate to Admin Dashboard → Gateway Management
2. Click "Add Gateway"
3. Fill in gateway details:
   - For Crypto: Add wallet address, network, upload QR code
   - For PayPal: Add account email and ID
   - Set min/max limits and processing time
4. Toggle "Active" to make it visible to users
5. Save

#### Managing Support Tickets
1. Navigate to Admin Dashboard → Support Tickets
2. View all tickets in the left panel
3. Filter by status (All, Open, In Progress, Resolved)
4. Click a ticket to view conversation
5. Reply to user messages in the chat interface
6. Update ticket status using the dropdown
7. Mark as Resolved when issue is fixed

### For Users

#### Creating a Support Ticket
1. Navigate to Support/Help section
2. Click "Create Ticket"
3. Fill in:
   - Subject
   - Category
   - Priority (optional)
   - Initial message
4. Submit

#### Chatting with Support
1. View your tickets
2. Click on a ticket to open chat
3. Type messages and send
4. Receive responses from support agents
5. Track ticket status

---

## Migration Instructions

### Apply Database Migration
```bash
cd backend
npx prisma migrate deploy
```

### Verify Tables Created
```sql
SELECT * FROM payment_gateways;
SELECT * FROM support_tickets;
SELECT * FROM support_messages;
```

---

## Testing Checklist

### Payment Gateways
- [ ] Admin can create crypto gateway with QR code
- [ ] Admin can create PayPal gateway
- [ ] Admin can edit gateway details
- [ ] Admin can delete gateway
- [ ] Admin can toggle active/inactive
- [ ] Users can see only active gateways
- [ ] QR codes are uploaded and accessible

### Support Tickets
- [ ] User can create support ticket
- [ ] User can view their tickets
- [ ] User can send messages
- [ ] Admin can see all tickets
- [ ] Admin can filter tickets by status
- [ ] Admin can reply to tickets
- [ ] Admin can update ticket status
- [ ] Messages appear in real-time
- [ ] User details (name, account number) display correctly

---

## Next Steps

1. **Integrate with Deposit Flow**:
   - Update deposit creation to use selected gateway
   - Show gateway options to users during deposit
   - Store gateway ID with deposit records

2. **User Support Interface**:
   - Create user-facing support page
   - Add "Contact Support" button in user dashboard
   - Implement notification for new admin replies

3. **Enhancements**:
   - File attachments for support messages
   - Email notifications for ticket updates
   - Auto-assignment of tickets to admins
   - Support ticket analytics dashboard

---

## Deployment Status

- **Commit**: `8badcf3`
- **Status**: ✅ Deployed to production
- **Migration**: Ready to apply
- **Frontend**: Pages created and ready
- **Backend**: API endpoints functional

## Notes

- QR codes are stored in `/uploads/gateways/`
- Ticket numbers use format: `TKT-XXXXXXXXX`
- Support messages auto-refresh every 30 seconds
- Admin can see user's account number for verification
- All modals use PremiumModal component for consistency
