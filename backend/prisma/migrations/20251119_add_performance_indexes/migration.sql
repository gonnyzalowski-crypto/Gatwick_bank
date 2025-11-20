-- Add indexes for frequently queried fields to improve API performance

-- User table indexes
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_accountNumber" ON "User"("accountNumber");
CREATE INDEX IF NOT EXISTS "idx_user_accountStatus" ON "User"("accountStatus");
CREATE INDEX IF NOT EXISTS "idx_user_kycStatus" ON "User"("kycStatus");
CREATE INDEX IF NOT EXISTS "idx_user_isAdmin" ON "User"("isAdmin");
CREATE INDEX IF NOT EXISTS "idx_user_createdAt" ON "User"("createdAt" DESC);

-- Account table indexes
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "idx_account_accountNumber" ON "Account"("accountNumber");
CREATE INDEX IF NOT EXISTS "idx_account_accountType" ON "Account"("accountType");
CREATE INDEX IF NOT EXISTS "idx_account_isActive" ON "Account"("isActive");
CREATE INDEX IF NOT EXISTS "idx_account_isPrimary" ON "Account"("isPrimary");

-- Transaction table indexes
CREATE INDEX IF NOT EXISTS "idx_transaction_userId" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "idx_transaction_accountId" ON "Transaction"("accountId");
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "Transaction"("type");
CREATE INDEX IF NOT EXISTS "idx_transaction_status" ON "Transaction"("status");
CREATE INDEX IF NOT EXISTS "idx_transaction_createdAt" ON "Transaction"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_transaction_category" ON "Transaction"("category");

-- Card table indexes (DebitCard and CreditCard)
CREATE INDEX IF NOT EXISTS "idx_debitcard_userId" ON "DebitCard"("userId");
CREATE INDEX IF NOT EXISTS "idx_debitcard_accountId" ON "DebitCard"("accountId");
CREATE INDEX IF NOT EXISTS "idx_debitcard_status" ON "DebitCard"("status");
CREATE INDEX IF NOT EXISTS "idx_debitcard_createdAt" ON "DebitCard"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_creditcard_userId" ON "CreditCard"("userId");
CREATE INDEX IF NOT EXISTS "idx_creditcard_status" ON "CreditCard"("status");
CREATE INDEX IF NOT EXISTS "idx_creditcard_createdAt" ON "CreditCard"("createdAt" DESC);

-- Transfer table indexes
CREATE INDEX IF NOT EXISTS "idx_transfer_userId" ON "Transfer"("userId");
CREATE INDEX IF NOT EXISTS "idx_transfer_fromAccountId" ON "Transfer"("fromAccountId");
CREATE INDEX IF NOT EXISTS "idx_transfer_status" ON "Transfer"("status");
CREATE INDEX IF NOT EXISTS "idx_transfer_type" ON "Transfer"("type");
CREATE INDEX IF NOT EXISTS "idx_transfer_createdAt" ON "Transfer"("createdAt" DESC);

-- KYC Document indexes
CREATE INDEX IF NOT EXISTS "idx_kycdocument_userId" ON "KYCDocument"("userId");
CREATE INDEX IF NOT EXISTS "idx_kycdocument_status" ON "KYCDocument"("status");
CREATE INDEX IF NOT EXISTS "idx_kycdocument_verificationStatus" ON "KYCDocument"("verificationStatus");
CREATE INDEX IF NOT EXISTS "idx_kycdocument_createdAt" ON "KYCDocument"("createdAt" DESC);

-- Backup Code indexes
CREATE INDEX IF NOT EXISTS "idx_backupcode_userId" ON "BackupCode"("userId");
CREATE INDEX IF NOT EXISTS "idx_backupcode_used" ON "BackupCode"("used");

-- Security Question indexes
CREATE INDEX IF NOT EXISTS "idx_securityquestion_userId" ON "SecurityQuestion"("userId");

-- Audit Log indexes
CREATE INDEX IF NOT EXISTS "idx_auditlog_userId" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_auditlog_action" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "idx_auditlog_severity" ON "AuditLog"("severity");
CREATE INDEX IF NOT EXISTS "idx_auditlog_createdAt" ON "AuditLog"("createdAt" DESC);

-- Support Ticket indexes
CREATE INDEX IF NOT EXISTS "idx_supportticket_userId" ON "SupportTicket"("userId");
CREATE INDEX IF NOT EXISTS "idx_supportticket_status" ON "SupportTicket"("status");
CREATE INDEX IF NOT EXISTS "idx_supportticket_priority" ON "SupportTicket"("priority");
CREATE INDEX IF NOT EXISTS "idx_supportticket_createdAt" ON "SupportTicket"("createdAt" DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_user_status_kyc" ON "User"("accountStatus", "kycStatus");
CREATE INDEX IF NOT EXISTS "idx_transaction_user_status" ON "Transaction"("userId", "status");
CREATE INDEX IF NOT EXISTS "idx_transaction_account_created" ON "Transaction"("accountId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_transfer_user_status" ON "Transfer"("userId", "status");
CREATE INDEX IF NOT EXISTS "idx_account_user_primary" ON "Account"("userId", "isPrimary");
