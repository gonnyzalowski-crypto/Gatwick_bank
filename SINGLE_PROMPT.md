# 🚀 Single Prompt for Complete Gatwick Bank Rebuild

Copy and paste this entire prompt to implement everything:

---

## THE PROMPT

Implement the complete Gatwick Bank system rebuild. Read COMPLETE_REBUILD_PLAN.md for full specifications. Here's what needs to be done:

### Database Changes (Prisma Schema)

1. **Update Account model:**
   - Change accountNumber to 10 digits starting with 08 or 03
   - Add: availableBalance, pendingBalance fields
   - Add: accountName, cryptoSymbol, cryptoAddress fields
   - Add accountType options: CREDIT_CARD, CRYPTO_WALLET

2. **Create new models:**
   - DebitCard (linked to accounts)
   - CreditCard (independent, requires approval)
   - CreditCardFunding (track funding from accounts)
   - CardTransaction (card purchase history)
   - CryptoWallet, CryptoTransaction, CryptoCirculation
   - ForexPosition, GoldPosition, StockPosition
   - BankList (top 100 US banks)
   - TransferRequest (with admin approval workflow)
   - Beneficiary (saved recipients)
   - SupportTicket, TicketMessage (chat system)

3. **Update User model relations** to include all new models

4. **Run migration:** `npx prisma migrate dev --name complete_rebuild`

### Backend Services

Create/update these services in `backend/src/services/`:

1. **accountService.js:**
   - generateAccountNumber() → 10 digits, 08/03 prefix
   - createAccount(userId, type, name)
   - calculateBalances(accountId) → available, pending, current

2. **cardService.js (NEW):**
   - createDebitCard(userId, accountId)
   - createCreditCardApplication(userId, requestedLimit)
   - approveCreditCard(cardId, adminId, limit, apr)
   - declineCreditCard(cardId, adminId, reason)
   - fundCreditCard(creditCardId, accountId, amount)
   - getCardDetails(cardId) → requires backup code auth
   - maskCardNumber(number) → show first 4 only

3. **moneyMarketService.js (NEW):**
   - Crypto: createWallet, buy, sell, updatePrices
   - Forex: buy, sell, updatePrices
   - Gold: buy, sell, updatePrice
   - Stocks: buy, sell, updatePrices
   - checkCirculationLimit(symbol)

4. **transferService.js:**
   - getBankList() → top 100 US banks
   - createTransferRequest(userId, data)
   - approveTransfer(requestId, adminId)
   - declineTransfer(requestId, adminId, reason)
   - reverseTransfer(requestId, adminId) → auto-creates reversal
   - saveBeneficiary, getBeneficiaries

5. **supportService.js (NEW):**
   - createTicket(userId, subject, category, message)
   - addMessage(ticketId, senderId, senderType, message)
   - assignTicket(ticketId, adminId)
   - updateStatus, closeTicket

6. **backupCodeService.js:**
   - getAllUsersBackupCodes() → for admin
   - getUserBackupCodes(userId)

### Frontend Pages

Update/create these pages in `frontend/src/pages/`:

1. **AccountsPage.jsx:**
   - Add "Create Account" button
   - Modal: select type (Checking, Savings, Credit Card, Crypto Wallet)
   - Display all accounts with available vs current balance
   - Show account numbers (10 digits)

2. **CardsPage.jsx (REBUILD):**
   - Card type selector: Debit or Credit
   - Debit: select account to link
   - Credit: application form (requested limit)
   - Card display: realistic design with Mastercard logo
   - Masked PAN (first 4 + ****)
   - "View Details" → backup code modal → show full card
   - Freeze/Unfreeze toggle
   - Fund credit card button

3. **MoneyMarketPage.jsx (NEW):**
   - Four tabs: Crypto, Forex, Gold, Stocks
   - Crypto: list of top cryptos with charts, buy/sell buttons
   - Forex: currency pairs (USDCAD, etc.), buy/sell
   - Gold: XAUUSD, buy/sell
   - Stocks: top stocks, buy/sell
   - Portfolio section showing P/L

4. **DomesticTransferPage.jsx (REBUILD):**
   - Bank selection dropdown (top 100 US banks)
   - Form: routing number, account number, name, amount
   - Beneficiary dropdown (saved recipients)
   - "Save as beneficiary" checkbox
   - Backup code authentication before submit
   - Status: "Processing - may take up to 24 hours"

5. **SupportPage.jsx (REBUILD):**
   - Ticket list with status badges
   - "Create Ticket" button → modal (category, priority, subject, message)
   - Ticket detail: chat interface
   - Real-time messages via WebSocket
   - File attachment support

### Admin Dashboard Pages

Create these in `frontend/src/pages/admin/`:

1. **CreditCardApprovalsPage.jsx (NEW):**
   - List pending credit card applications
   - Application details modal
   - Set credit limit and APR inputs
   - Approve/Decline buttons

2. **TransferApprovalsPage.jsx (NEW):**
   - List pending transfer requests
   - Transfer details modal
   - Three buttons: Approve, Decline, Reverse
   - Show all transfer info

3. **BackupCodesPage.jsx (NEW):**
   - List all users
   - "View Codes" button per user
   - Modal showing backup codes

4. **CommunicationsPage.jsx (NEW):**
   - List all support tickets
   - Filter by status, priority, category
   - Ticket assignment dropdown
   - Chat interface
   - Canned responses

5. **MarketManagementPage.jsx (NEW):**
   - Update prices per market/symbol
   - Set crypto circulation limits
   - Price history charts

### WebSocket Implementation

1. **Backend:** `backend/src/websocket/server.js`
   - Support ticket messages channel
   - User notifications channel
   - Market prices channel

2. **Frontend:** `frontend/src/hooks/useWebSocket.js`
   - Connect to WebSocket
   - Subscribe to ticket updates
   - Subscribe to notifications

### API Routes

Create/update routes in `backend/src/routes/`:
- `/api/accounts` - CRUD accounts
- `/api/cards` - Card management
- `/api/money-market` - Market operations
- `/api/transfers` - Transfer requests
- `/api/support` - Support tickets
- `/api/admin/approvals` - All approval workflows
- `/api/admin/backup-codes` - View user codes
- `/api/admin/market` - Update prices

### Key Business Rules

1. **Account Numbers:** Generate 10 random digits starting with 08 or 03
2. **Balance Calculation:** Current = Available + Pending
3. **Available Balance:** Fiat + Crypto + Card balances (spendable)
4. **Debit Cards:** Linked to account, use account balance
5. **Credit Cards:** Independent balance, can be funded from any account
6. **Credit Card Approval:** Banker sets limit and APR during approval
7. **Transfers:** Require banker approval, 24-hour processing time
8. **Transfer Actions:**
   - Approve: Complete transfer
   - Decline: Return money to available balance
   - Reverse: Approve then immediately reverse with RVSL ID
9. **Crypto Circulation:** Users cannot hold more than bank's total supply
10. **Card Security:** Full details require backup code authentication
11. **Support Tickets:** Real-time chat via WebSocket

### Testing

Use Playwright MCP to test:
- Create debit card flow
- Credit card application and approval
- Transfer request and approval
- Support ticket creation and messaging
- Crypto buy/sell operations

### Implementation Order

1. ✅ Database schema (all models)
2. ✅ Backend services (all functions)
3. ✅ API routes
4. ✅ Frontend pages (user-facing)
5. ✅ Admin dashboard pages
6. ✅ WebSocket implementation
7. ✅ Testing

### Code Style

- Use existing patterns from codebase
- Prisma for database operations
- Express.js for backend
- React with Tailwind CSS for frontend
- JWT authentication
- Backup codes for sensitive operations
- Audit logging for all admin actions

---

## Expected Result

After implementation:
- Users can create multiple accounts (checking, savings, credit card, crypto)
- Users can apply for debit and credit cards
- Bankers approve credit cards with custom limits and APR
- Users can trade crypto, forex, gold, stocks
- Transfers require banker approval (approve/decline/reverse)
- Support tickets work as real-time chat
- Bankers can view all user backup codes
- Complete balance tracking system
- Professional card designs with security
- Full audit trail

Start implementation now. Use Memory MCP to recall requirements, Filesystem MCP to create files, Code Context MCP to understand existing patterns, and Sequential Thinking MCP to plan each phase.
