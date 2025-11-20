# Gatwick Bank - Complete System Rebuild Plan

## 🎯 Objective
Transform Gatwick Bank into a fully functional banking platform with cards, money markets, transfer approvals, and support system. This is a comprehensive rebuild touching database, backend, frontend, and admin dashboard.

---

## 📊 Phase 1: Database Schema Updates

### 1.1 Update Account Model
```prisma
model Account {
  id              String   @id @default(cuid())
  userId          String
  accountType     String   // 'CHECKING', 'SAVINGS', 'BUSINESS', 'CREDIT_CARD', 'CRYPTO_WALLET'
  accountNumber   String   @unique // 10 digits starting with 08 or 03
  accountName     String?  // User-defined name for account
  balance         Decimal  @default(0) @db.Decimal(15, 2)
  availableBalance Decimal @default(0) @db.Decimal(15, 2) // Spendable balance
  pendingBalance  Decimal  @default(0) @db.Decimal(15, 2) // Waiting to clear
  currency        String   @default("USD")
  isActive        Boolean  @default(true)
  isPrimary       Boolean  @default(false)
  
  // For crypto wallets
  cryptoSymbol    String?  // BTC, ETH, etc.
  cryptoAddress   String?  // Wallet address
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards           Card[]
  transactions    Transaction[]
  debitCards      DebitCard[]
  creditCardFundings CreditCardFunding[]
}
```

### 1.2 Create DebitCard Model
```prisma
model DebitCard {
  id              String    @id @default(cuid())
  userId          String
  accountId       String    // Linked account
  cardNumber      String    @unique // Encrypted, 16 digits
  cardHolderName  String    // User's full name
  cvv             String    // Encrypted
  expiryDate      DateTime
  cardType        String    @default("DEBIT")
  cardBrand       String    @default("MASTERCARD")
  isActive        Boolean   @default(true)
  isFrozen        Boolean   @default(false)
  dailyLimit      Decimal   @default(5000) @db.Decimal(10, 2)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  account         Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  transactions    CardTransaction[]
}
```

### 1.3 Create CreditCard Model
```prisma
model CreditCard {
  id              String    @id @default(cuid())
  userId          String
  cardNumber      String    @unique // Encrypted
  cardHolderName  String
  cvv             String    // Encrypted
  expiryDate      DateTime
  cardBrand       String    @default("MASTERCARD")
  
  // Credit card specific
  creditLimit     Decimal   @db.Decimal(15, 2)
  availableCredit Decimal   @db.Decimal(15, 2)
  currentBalance  Decimal   @default(0) @db.Decimal(15, 2)
  apr             Decimal   @db.Decimal(5, 2) // Annual Percentage Rate
  minimumPayment  Decimal   @default(0) @db.Decimal(10, 2)
  paymentDueDate  DateTime?
  statementDate   DateTime?
  gracePeriodDays Int       @default(25)
  
  // Status
  status          String    @default("PENDING") // PENDING | APPROVED | ACTIVE | SUSPENDED | CLOSED
  approvalStatus  String    @default("PENDING") // PENDING | APPROVED | DECLINED
  approvedBy      String?   // Admin ID
  approvedAt      DateTime?
  declineReason   String?
  
  isActive        Boolean   @default(false)
  isFrozen        Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    CardTransaction[]
  fundings        CreditCardFunding[]
}
```

### 1.4 Create CreditCardFunding Model
```prisma
model CreditCardFunding {
  id              String    @id @default(cuid())
  creditCardId    String
  accountId       String    // Source account
  amount          Decimal   @db.Decimal(15, 2)
  status          String    @default("COMPLETED") // COMPLETED | FAILED
  createdAt       DateTime  @default(now())

  creditCard      CreditCard @relation(fields: [creditCardId], references: [id], onDelete: Cascade)
  account         Account    @relation(fields: [accountId], references: [id], onDelete: Cascade)
}
```

### 1.5 Create CardTransaction Model
```prisma
model CardTransaction {
  id              String    @id @default(cuid())
  userId          String
  debitCardId     String?
  creditCardId    String?
  amount          Decimal   @db.Decimal(15, 2)
  merchantName    String
  merchantCategory String?
  description     String
  status          String    @default("COMPLETED")
  createdAt       DateTime  @default(now())

  debitCard       DebitCard?  @relation(fields: [debitCardId], references: [id], onDelete: SetNull)
  creditCard      CreditCard? @relation(fields: [creditCardId], references: [id], onDelete: SetNull)
}
```

### 1.6 Create MoneyMarket Models
```prisma
model CryptoWallet {
  id              String    @id @default(cuid())
  userId          String
  symbol          String    // BTC, ETH, USDT, etc.
  name            String    // Bitcoin, Ethereum, etc.
  balance         Decimal   @default(0) @db.Decimal(20, 8)
  usdValue        Decimal   @default(0) @db.Decimal(15, 2)
  currentPrice    Decimal   @db.Decimal(15, 2)
  purchasePrice   Decimal   @db.Decimal(15, 2)
  profitLoss      Decimal   @default(0) @db.Decimal(15, 2)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    CryptoTransaction[]
}

model CryptoTransaction {
  id              String    @id @default(cuid())
  walletId        String
  type            String    // BUY | SELL
  amount          Decimal   @db.Decimal(20, 8)
  pricePerUnit    Decimal   @db.Decimal(15, 2)
  totalUsd        Decimal   @db.Decimal(15, 2)
  createdAt       DateTime  @default(now())

  wallet          CryptoWallet @relation(fields: [walletId], references: [id], onDelete: Cascade)
}

model CryptoCirculation {
  id              String    @id @default(cuid())
  symbol          String    @unique
  totalCirculation Decimal  @db.Decimal(20, 8) // Total crypto bank has
  userHoldings    Decimal   @default(0) @db.Decimal(20, 8)
  availableSupply Decimal   @db.Decimal(20, 8)
  currentPrice    Decimal   @db.Decimal(15, 2)
  updatedAt       DateTime  @updatedAt
}

model ForexPosition {
  id              String    @id @default(cuid())
  userId          String
  pair            String    // USDCAD, EURUSD, etc.
  type            String    // BUY | SELL
  amount          Decimal   @db.Decimal(15, 2)
  entryPrice      Decimal   @db.Decimal(10, 5)
  currentPrice    Decimal   @db.Decimal(10, 5)
  profitLoss      Decimal   @default(0) @db.Decimal(15, 2)
  status          String    @default("OPEN") // OPEN | CLOSED
  createdAt       DateTime  @default(now())
  closedAt        DateTime?

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GoldPosition {
  id              String    @id @default(cuid())
  userId          String
  ounces          Decimal   @db.Decimal(10, 4)
  purchasePrice   Decimal   @db.Decimal(10, 2) // Per ounce
  currentPrice    Decimal   @db.Decimal(10, 2)
  totalValue      Decimal   @db.Decimal(15, 2)
  profitLoss      Decimal   @default(0) @db.Decimal(15, 2)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model StockPosition {
  id              String    @id @default(cuid())
  userId          String
  symbol          String    // AAPL, GOOGL, etc.
  name            String
  shares          Decimal   @db.Decimal(10, 4)
  purchasePrice   Decimal   @db.Decimal(10, 2)
  currentPrice    Decimal   @db.Decimal(10, 2)
  totalValue      Decimal   @db.Decimal(15, 2)
  profitLoss      Decimal   @default(0) @db.Decimal(15, 2)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 1.7 Create Transfer System Models
```prisma
model BankList {
  id              String    @id @default(cuid())
  bankName        String
  routingNumber   String    @unique
  swiftCode       String?
  bankType        String    // COMMERCIAL | CREDIT_UNION | SAVINGS
  isActive        Boolean   @default(true)
}

model TransferRequest {
  id              String    @id @default(cuid())
  userId          String
  fromAccountId   String
  
  // Destination
  destinationBank String
  routingNumber   String
  accountNumber   String
  accountName     String
  
  amount          Decimal   @db.Decimal(15, 2)
  description     String?
  reference       String    @unique
  
  // Status
  status          String    @default("PENDING") // PENDING | APPROVED | DECLINED | REVERSED | COMPLETED
  adminAction     String?   // APPROVE | DECLINE | REVERSE
  adminId         String?
  adminNotes      String?
  processedAt     DateTime?
  
  // Timing
  estimatedCompletion DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Beneficiary {
  id              String    @id @default(cuid())
  userId          String
  bankName        String
  routingNumber   String
  accountNumber   String
  accountName     String
  nickname        String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 1.8 Create Support Ticket System
```prisma
model SupportTicket {
  id              String    @id @default(cuid())
  userId          String
  ticketNumber    String    @unique
  category        String    // ACCOUNT | CARDS | TRANSFERS | TECHNICAL | OTHER
  priority        String    @default("MEDIUM") // LOW | MEDIUM | HIGH | URGENT
  status          String    @default("OPEN") // OPEN | IN_PROGRESS | RESOLVED | CLOSED
  subject         String
  
  // Assignment
  assignedTo      String?   // Admin ID
  assignedAt      DateTime?
  
  // Resolution
  resolvedAt      DateTime?
  closedAt        DateTime?
  satisfactionRating Int?   // 1-5
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages        TicketMessage[]
}

model TicketMessage {
  id              String    @id @default(cuid())
  ticketId        String
  senderId        String    // User ID or Admin ID
  senderType      String    // USER | ADMIN
  message         String    @db.Text
  attachments     Json?     // Array of file paths
  isInternal      Boolean   @default(false) // Admin-only notes
  createdAt       DateTime  @default(now())

  ticket          SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}
```

### 1.9 Update User Model Relations
Add to User model:
```prisma
debitCards        DebitCard[]
creditCards       CreditCard[]
cryptoWallets     CryptoWallet[]
forexPositions    ForexPosition[]
goldPositions     GoldPosition[]
stockPositions    StockPosition[]
transferRequests  TransferRequest[]
beneficiaries     Beneficiary[]
supportTickets    SupportTicket[]
```

---

## 📦 Phase 2: Backend Services

### 2.1 Account Service Updates
**File:** `backend/src/services/accountService.js`

**New Functions:**
- `generateAccountNumber()` - Generate 10-digit number starting with 08 or 03
- `createAccount(userId, accountType, accountName)` - Create new account
- `calculateBalances(accountId)` - Calculate available, pending, current
- `getAccountsByType(userId, type)` - Get accounts by type
- `createCryptoWallet(userId, symbol)` - Create crypto wallet account

### 2.2 Card Service (NEW)
**File:** `backend/src/services/cardService.js`

**Functions:**
- `createDebitCard(userId, accountId)` - Create debit card
- `createCreditCardApplication(userId, requestedLimit)` - Apply for credit card
- `approveCreditCard(cardId, adminId, limit, apr)` - Admin approves credit card
- `declineCreditCard(cardId, adminId, reason)` - Admin declines
- `fundCreditCard(creditCardId, accountId, amount)` - Fund credit card from account
- `freezeCard(cardId)` - Freeze card
- `unfreezeCard(cardId)` - Unfreeze card
- `getCardDetails(cardId, userId)` - Get full card details (requires auth)
- `maskCardNumber(cardNumber)` - Show first 4 digits only
- `calculateCreditCardPayment(balance, apr, limit)` - Calculate minimum payment

### 2.3 Money Market Service (NEW)
**File:** `backend/src/services/moneyMarketService.js`

**Functions:**
- `createCryptoWallet(userId, symbol)` - Create crypto wallet
- `buyCrypto(userId, symbol, usdAmount)` - Buy crypto
- `sellCrypto(userId, walletId, amount)` - Sell crypto
- `updateCryptoPrices()` - Admin updates crypto prices
- `getCryptoCirculation(symbol)` - Check circulation limits
- `buyForex(userId, pair, amount)` - Buy forex
- `sellForex(userId, positionId)` - Sell forex
- `buyGold(userId, ounces)` - Buy gold
- `sellGold(userId, positionId)` - Sell gold
- `buyStock(userId, symbol, shares)` - Buy stock
- `sellStock(userId, positionId)` - Sell stock
- `updateMarketPrices(market, symbol, price)` - Admin updates prices
- `calculateProfitLoss(position)` - Calculate P/L

### 2.4 Transfer Service Updates
**File:** `backend/src/services/transferService.js`

**New Functions:**
- `getBankList()` - Get top 100 US banks
- `createTransferRequest(userId, data)` - Create transfer request
- `approveTransfer(requestId, adminId)` - Admin approves
- `declineTransfer(requestId, adminId, reason)` - Admin declines
- `reverseTransfer(requestId, adminId)` - Admin reverses
- `saveBeneficiary(userId, data)` - Save beneficiary
- `getBeneficiaries(userId)` - Get user's beneficiaries
- `validateRoutingNumber(routingNumber)` - Validate routing number

### 2.5 Support Ticket Service (NEW)
**File:** `backend/src/services/supportService.js`

**Functions:**
- `createTicket(userId, subject, category, message)` - Create ticket
- `getTickets(userId)` - Get user's tickets
- `getAllTickets()` - Admin gets all tickets
- `addMessage(ticketId, senderId, senderType, message)` - Add message
- `assignTicket(ticketId, adminId)` - Assign to admin
- `updateTicketStatus(ticketId, status)` - Update status
- `closeTicket(ticketId, rating)` - Close with rating
- `uploadAttachment(ticketId, file)` - Upload file

### 2.6 Backup Code Service Updates
**File:** `backend/src/services/backupCodeService.js`

**New Functions:**
- `getAllUsersBackupCodes()` - Admin gets all users' codes
- `getUserBackupCodes(userId)` - Get specific user's codes
- `regenerateBackupCodes(userId)` - Regenerate codes

---

## 🎨 Phase 3: Frontend Components

### 3.1 Account Page Updates
**File:** `frontend/src/pages/AccountsPage.jsx`

**Add:**
- Account creation modal with type selection
- Display all account types (checking, savings, credit card, crypto)
- Show available balance vs current balance
- Account number generation (10 digits, 08/03 prefix)

### 3.2 Card Page Complete Rebuild
**File:** `frontend/src/pages/CardsPage.jsx`

**Features:**
- Card type selection (Debit vs Credit)
- Debit card: Select account to link
- Credit card: Application form with requested limit
- Card display component (realistic card design)
- Masked card number (first 4 + ****)
- "View Details" button → Backup code modal → Show full details
- Freeze/Unfreeze toggle
- Fund credit card from account

### 3.3 Money Market Page (NEW)
**File:** `frontend/src/pages/MoneyMarketPage.jsx`

**Sections:**
- Crypto Market: Top performing cryptos with charts, buy/sell
- Forex Market: Currency pairs, buy/sell
- Gold Reserve: XAUUSD, buy/sell
- Stock Market: Top stocks, buy/sell
- Portfolio overview with P/L

### 3.4 Transfer Page Rebuild
**File:** `frontend/src/pages/DomesticTransferPage.jsx`

**Features:**
- Bank selection dropdown (top 100 US banks)
- Transfer form (routing, account number, name, amount)
- Beneficiary management (save/select recipients)
- Backup code authentication
- Status tracking (Pending → Processing → Completed)
- Transfer history with admin actions

### 3.5 Support Page Rebuild
**File:** `frontend/src/pages/SupportPage.jsx`

**Features:**
- Ticket list with status badges
- Create ticket modal (category, priority, message)
- Ticket detail view (chat interface)
- Real-time messages (WebSocket)
- File attachments
- Satisfaction rating on close

---

## 👨‍💼 Phase 4: Admin Dashboard

### 4.1 Credit Card Approvals Page (NEW)
**File:** `frontend/src/pages/admin/CreditCardApprovalsPage.jsx`

**Features:**
- List of pending credit card applications
- Application details modal
- Set credit limit and APR
- Approve/Decline buttons
- Decline reason input

### 4.2 Transfer Approvals Page (NEW)
**File:** `frontend/src/pages/admin/TransferApprovalsPage.jsx`

**Features:**
- List of pending transfers
- Transfer details modal
- Three buttons: Approve, Decline, Reverse
- Bulk approval checkbox
- Fraud detection flags

### 4.3 Backup Codes Page (NEW)
**File:** `frontend/src/pages/admin/BackupCodesPage.jsx`

**Features:**
- List of all users
- "View Codes" button per user
- Modal showing user's backup codes
- Regenerate codes button

### 4.4 Communications Page (NEW)
**File:** `frontend/src/pages/admin/CommunicationsPage.jsx`

**Features:**
- List of all support tickets
- Filter by status, priority, category
- Ticket assignment dropdown
- Chat interface for each ticket
- Internal notes (admin-only)
- Canned responses

### 4.5 Market Management Page (NEW)
**File:** `frontend/src/pages/admin/MarketManagementPage.jsx`

**Features:**
- Update crypto prices (per symbol)
- Update forex prices
- Update gold price
- Update stock prices
- Set crypto circulation limits
- Price history charts

---

## 🔌 Phase 5: WebSocket Implementation

### 5.1 Backend WebSocket Server
**File:** `backend/src/websocket/server.js`

**Channels:**
- `support-ticket-{ticketId}` - Real-time ticket messages
- `user-notifications-{userId}` - Real-time notifications
- `market-prices` - Real-time price updates

### 5.2 Frontend WebSocket Client
**File:** `frontend/src/hooks/useWebSocket.js`

**Functions:**
- `connectWebSocket()` - Connect to server
- `subscribeToTicket(ticketId)` - Subscribe to ticket updates
- `subscribeToNotifications(userId)` - Subscribe to notifications
- `subscribeToMarketPrices()` - Subscribe to price updates

---

## 🧪 Phase 6: Testing & Validation

### 6.1 Playwright Tests
- Card creation flow (debit and credit)
- Credit card approval workflow
- Transfer request and approval
- Support ticket creation and messaging
- Money market buy/sell operations

### 6.2 Manual Testing Checklist
- [ ] Create debit card from account
- [ ] Apply for credit card
- [ ] Admin approves credit card with limit/APR
- [ ] Fund credit card from account
- [ ] View full card details with backup code
- [ ] Create crypto wallet and buy crypto
- [ ] Create transfer request with bank selection
- [ ] Admin approves/declines/reverses transfer
- [ ] Create support ticket
- [ ] Admin responds to ticket
- [ ] Real-time message updates via WebSocket

---

## 📋 Implementation Priority

### Must Have (Phase 1 - Week 1)
1. ✅ Account creation with 10-digit numbers (08/03 prefix)
2. ✅ Debit card creation
3. ✅ Credit card application and approval workflow
4. ✅ Transfer request system with admin approval
5. ✅ Backup codes admin page

### Should Have (Phase 2 - Week 2)
6. ✅ Money market - Crypto wallets
7. ✅ Money market - Forex trading
8. ✅ Support ticket system with WebSocket
9. ✅ Beneficiary management
10. ✅ Card freeze/unfreeze

### Nice to Have (Phase 3 - Week 3)
11. ✅ Money market - Gold reserve
12. ✅ Money market - Stock trading
13. ✅ Bulk transfer approvals
14. ✅ Fraud detection flags
15. ✅ Statement generation

---

## 🚀 Single Prompt for MCP Implementation

Use this prompt to implement everything:

**"Implement the complete Gatwick Bank system rebuild as specified in COMPLETE_REBUILD_PLAN.md. Follow this order:

1. Update Prisma schema with all new models (accounts, cards, money markets, transfers, support tickets)
2. Run migration: `npx prisma migrate dev --name complete_rebuild`
3. Create all backend services with the specified functions
4. Update existing frontend pages and create new pages
5. Implement WebSocket for real-time support tickets
6. Add all admin dashboard pages
7. Test critical flows with Playwright

Key requirements:
- Account numbers: 10 digits starting with 08 or 03
- Balance types: available, pending, current
- Credit cards require banker approval
- Transfers require banker approval
- Support tickets use WebSocket
- Money markets: crypto, forex, gold, stocks
- Admin can view all user backup codes
- Card details require backup code authentication

Maintain existing code patterns, use Prisma for database, React for frontend, Express for backend. Ensure all security measures are in place."**

---

## 📊 Expected Outcome

After implementation:
- ✅ Users can create multiple accounts of any type
- ✅ Users can apply for debit and credit cards
- ✅ Bankers approve credit cards with limits and APR
- ✅ Users can trade crypto, forex, gold, stocks
- ✅ Transfers go through banker approval workflow
- ✅ Support tickets work like real-time chat
- ✅ Bankers can view user backup codes
- ✅ Complete balance tracking (available vs current)
- ✅ Professional card designs with security
- ✅ Full audit trail of all actions

**Estimated Development Time:** 2-3 weeks with AI assistance
**Estimated Time with MCP Stack:** 3-5 days

---

## 🎯 Success Metrics

- [ ] All 15 new database models created
- [ ] 8 new backend services implemented
- [ ] 5 new frontend pages created
- [ ] 4 existing pages rebuilt
- [ ] WebSocket working for support tickets
- [ ] All admin approval workflows functional
- [ ] Money market fully operational
- [ ] 100% test coverage on critical flows
