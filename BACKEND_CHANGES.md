# Backend Changes - Security & Admin Features

## Overview
This document outlines all backend changes made to implement security questions, backup codes, audit logging, notifications, and admin features for Gatwick Bank.

## Database Schema Changes

### Updated Models

#### User Model
Added fields:
- `profilePhoto` (String?) - Path to uploaded profile photo
- `isAdmin` (Boolean) - Admin access flag
- `accountStatus` (String) - LIMITED | ACTIVE | SUSPENDED
- `kycStatus` (String) - PENDING | UNDER_REVIEW | APPROVED | REJECTED
- `totalSentAmount` (Decimal) - Cumulative transfer amount for LIMITED users

Relations added:
- `securityQuestions` - SecurityQuestion[]
- `backupCodes` - BackupCode[]
- `auditLogs` - AuditLog[]
- `notifications` - Notification[]
- `kycDocument` - KYCDocument?

### New Models

#### SecurityQuestion
- User's chosen security questions and hashed answers
- Used for account recovery and login verification
- Fields: id, userId, question, answerHash, createdAt

#### BackupCode
- 100 one-time backup codes per user
- Used for login and sensitive operations
- Fields: id, userId, codeHash, used, usedAt, usedFor, createdAt

#### AuditLog
- Complete audit trail of all user actions
- Fields: id, userId, action, ipAddress, userAgent, metadata, createdAt
- Actions tracked: REGISTER, LOGIN_ATTEMPT, LOGIN_SUCCESS, TRANSFER, KYC_SUBMIT, etc.

#### Notification
- User notifications for transactions, KYC status, security events
- Fields: id, userId, type, title, message, metadata, read, createdAt

#### KYCDocument
- KYC verification documents and status
- Fields: id, userId, fullName, dateOfBirth, nationality, address, phoneNumber, sourceOfFunds
- File paths: idFrontPath, idBackPath, selfiePath, proofAddressPath
- Review fields: status, reviewedBy, reviewedAt, rejectionReason

## New Services

### securityService.js
- `generateBackupCodes(userId)` - Generate 100 codes + PDF
- `verifyBackupCode(userId, code)` - Verify and mark code as used
- `saveSecurityQuestions(userId, questionsArray)` - Save 3 security questions
- `verifySecurityAnswer(userId, questionId, answer)` - Verify security answer
- `getUnusedCodesCount(userId)` - Get remaining backup codes
- `regenerateBackupCodes(userId)` - Regenerate all codes

### auditService.js
- `logAction(userId, action, ipAddress, userAgent, metadata)` - Log user action
- `getAuditLogs(filters)` - Get filtered audit logs
- `getUserActivity(userId, limit)` - Get user's recent activity
- `getLoginHistory(userId, limit)` - Get login history
- `getAuditStats(startDate, endDate)` - Get audit statistics

### notificationService.js
- `createNotification(userId, type, title, message, metadata)` - Create notification
- `getUserNotifications(userId, options)` - Get user's notifications
- `markAsRead(notificationId, userId)` - Mark notification as read
- `markAllAsRead(userId)` - Mark all as read
- `deleteNotification(notificationId, userId)` - Delete notification
- `notifyTransaction(userId, transaction, type)` - Create transaction notification
- `notifyKYCStatus(userId, status, reason)` - Create KYC status notification
- `notifySecurityEvent(userId, event, details)` - Create security notification

## Updated Routes

### auth.js
**New endpoints:**
- `GET /api/v1/auth/security-questions` - Get available security questions
- `POST /api/v1/auth/login/verify` - Step 2 of login (verify security question OR backup code)

**Updated endpoints:**
- `POST /api/v1/auth/register` - Now requires 3 security questions, generates backup codes
- `POST /api/v1/auth/login` - Now returns security questions instead of tokens (step 1)

### admin.js (NEW)
- `GET /api/v1/admin/users` - Get all users with filters
- `GET /api/v1/admin/audit-logs` - Get audit logs
- `GET /api/v1/admin/audit-stats` - Get audit statistics
- `GET /api/v1/admin/users/:userId/backup-codes` - Download backup codes PDF
- `GET /api/v1/admin/kyc/pending` - Get pending KYC submissions
- `GET /api/v1/admin/kyc/:kycId` - Get KYC details
- `POST /api/v1/admin/kyc/:kycId/review` - Approve/reject KYC
- `GET /api/v1/admin/stats` - Get dashboard statistics

### notifications.js (NEW)
- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

## Constants

### securityQuestions.js
Pool of 15 security questions:
1. What was the name of your first pet?
2. In what city were you born?
3. What is your mother's maiden name?
4. What was the make of your first car?
5. What was the name of your elementary school?
6. What is your favorite movie?
7. What was your childhood nickname?
8. Who was your childhood hero?
9. What was the first concert you attended?
10. What is your oldest sibling's middle name?
11. What is the name of the hospital where you were born?
12. What was the name of the street you grew up on?
13. What is your maternal grandmother's maiden name?
14. What was your favorite food as a child?
15. What was the name of your favorite teacher?

## Configuration Changes

### package.json
Added dependencies:
- `pdfkit` - For generating backup codes PDF
- `multer` - For file uploads (KYC documents)

### railway.json
Added persistent volume mount:
```json
{
  "volumeMounts": [
    {
      "mountPath": "/app/storage",
      "name": "gatwick-storage"
    }
  ]
}
```

## File Storage Structure
```
/app/storage/
├── kyc/
│   └── user_{id}/
│       ├── id_front.*
│       ├── id_back.*
│       ├── selfie.*
│       └── proof_of_address.*
└── backup-codes/
    └── user_{id}/
        └── gatwick-backup-codes-{firstName}-{lastName}.pdf
```

## Security Features

### Two-Step Login Flow
1. User enters email + password
2. Backend verifies credentials and returns security questions
3. User chooses verification method:
   - Answer 1 security question, OR
   - Enter 1 backup code
4. Backend verifies and issues tokens

### Backup Codes
- 100 unique 6-digit codes generated at registration
- Stored as bcrypt hashes
- Each code can only be used once
- PDF generated and saved to local storage
- Admin downloads PDF and sends via official email

### Account Status Logic
- **LIMITED**: Default for new users
  - Can receive funds (unlimited)
  - Can send up to $100 total (cumulative)
  - Must complete KYC to unlock
- **ACTIVE**: After KYC approval
  - Full access to all features
  - No transfer limits
- **SUSPENDED**: Admin can suspend accounts

### Audit Logging
All actions logged:
- REGISTER
- LOGIN_ATTEMPT
- LOGIN_SUCCESS
- LOGIN_FAILED
- LOGOUT
- TRANSFER
- KYC_SUBMIT
- KYC_APPROVED
- KYC_REJECTED
- PASSWORD_CHANGED
- SECURITY_QUESTION_CHANGED

## Admin Features

### User Management
- View all users with filters (KYC status, account status, search)
- Download backup codes PDF for any user
- View user activity and login history

### KYC Review
- Queue of pending KYC submissions
- View all uploaded documents
- Approve or reject with reason
- Automatic account status update on approval

### Audit Trail
- View all system actions
- Filter by user, action type, date range
- Export capabilities (future)

### Dashboard Statistics
- Total users
- Active users
- Pending KYC count
- Total transactions
- Total balance across all accounts

## Migration Required

After pushing to GitHub, Railway will need to run:
```bash
npx prisma migrate dev --name add_security_features
npx prisma generate
```

Or manually create migration and push:
```bash
npx prisma db push
```

## Environment Variables

No new environment variables required. Existing ones:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Frontend URL
- `PORT` - Server port

## Next Steps (Frontend)

1. Update registration page with security questions
2. Implement two-step login flow
3. Create admin dashboard
4. Add notifications dropdown to top nav
5. Implement KYC upload page
6. Add transfer limits UI
