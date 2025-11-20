# KYC Workflow - From Start to Completion

## Overview
Know Your Customer (KYC) is a mandatory verification process for all bank accounts. This document outlines the complete KYC workflow from registration to account activation.

## KYC Status Levels

### 1. NOT_SUBMITTED
**Description:** User has registered but hasn't submitted KYC documents  
**Account Access:** Limited (view only, cannot transact)  
**User Can:**
- Login to account
- View dashboard
- Update profile information
- View KYC requirements

**User Cannot:**
- Make deposits
- Make withdrawals
- Transfer money
- Request cards
- Apply for loans

**Next Step:** Submit KYC documents

---

### 2. PENDING
**Description:** KYC documents submitted, awaiting admin review  
**Account Access:** Limited (same as NOT_SUBMITTED)  
**User Can:**
- Login to account
- View dashboard
- View submission status
- Upload additional documents if requested

**User Cannot:**
- Make any transactions
- Modify submitted KYC data
- Request financial services

**Admin Actions:**
- Review submitted documents
- Request additional documents
- Approve or reject KYC

**Next Step:** Admin review and decision

---

### 3. VERIFIED
**Description:** KYC approved by admin, account fully activated  
**Account Access:** Full access  
**User Can:**
- All banking operations
- Deposits and withdrawals
- Money transfers
- Request debit/credit cards
- Apply for loans
- Use all banking services

**User Cannot:**
- Modify KYC information (must contact admin)

**Maintenance:**
- Periodic re-verification may be required
- Document updates for expired IDs

**Next Step:** Full banking access granted

---

### 4. REJECTED
**Description:** KYC documents rejected due to issues  
**Account Access:** Limited (view only)  
**User Can:**
- Login to account
- View rejection reason
- Re-submit corrected documents
- Contact support

**User Cannot:**
- Make any transactions
- Access financial services

**Common Rejection Reasons:**
- Blurry or unreadable documents
- Expired identification
- Information mismatch
- Fraudulent documents
- Incomplete information
- Invalid business registration (for business accounts)

**Next Step:** Correct issues and re-submit

---

## Account Type Specific Requirements

### Personal Accounts (Checking/Savings)

#### Required Information at Registration:
1. **Personal Details:**
   - First Name *
   - Last Name *
   - Email Address *
   - Phone Number (with country code) *
   - Date of Birth *

2. **Address Information:**
   - Street Address *
   - City *
   - State/Province *
   - ZIP/Postal Code *
   - Country *

3. **Account Preferences:**
   - Account Type (Checking or Savings) *
   - Password *
   - Security Questions (3) *

#### Required KYC Documents:
1. **Government-Issued ID** (one of):
   - Passport
   - Driver's License
   - National ID Card
   - State ID

2. **Proof of Address** (one of, dated within 3 months):
   - Utility Bill
   - Bank Statement
   - Lease Agreement
   - Government Letter

3. **Tax Identification:**
   - SSN (Social Security Number) - USA
   - TIN (Tax Identification Number) - International
   - SIN (Social Insurance Number) - Canada
   - NIN (National Insurance Number) - UK

4. **Selfie/Photo:**
   - Clear photo holding ID
   - Face must be visible
   - ID details must be readable

---

### Business Accounts

#### Required Information at Registration:
1. **Business Details:**
   - Business Legal Name *
   - Business Type (LLC, Corporation, Partnership, Sole Proprietorship) *
   - Business Email *
   - Business Phone (with country code) *
   - Tax ID/EIN *

2. **Business Address:**
   - Business Street Address *
   - City *
   - State/Province *
   - ZIP/Postal Code *
   - Country *

3. **Representative Information:**
   - Authorized Representative Name *
   - Representative Email *
   - Representative Phone *
   - Representative Title/Position *

4. **Account Preferences:**
   - Password *
   - Security Questions (3) *

#### Required KYC Documents:
1. **Business Registration:**
   - Certificate of Incorporation
   - Business License
   - Articles of Organization
   - Partnership Agreement

2. **Tax Documents:**
   - EIN Letter (USA)
   - Business Tax ID
   - VAT Registration (if applicable)

3. **Proof of Business Address:**
   - Utility Bill (business address)
   - Lease Agreement
   - Property Deed
   - Bank Statement

4. **Authorized Representative ID:**
   - Government-issued ID of representative
   - Proof of authority (board resolution, etc.)

5. **Additional Documents (may be required):**
   - Financial Statements
   - Bank References
   - Trade References
   - Beneficial Ownership Information

---

## KYC Submission Process

### Step 1: Registration
```
User fills registration form → Account created with status: NOT_SUBMITTED
```

**For Personal Accounts:**
- Choose Checking or Savings
- Enter personal details
- Enter address
- Select phone country code
- Set password
- Answer security questions

**For Business Accounts:**
- Enter business details
- Enter business address
- Enter representative information
- Select phone country code
- Set password
- Answer security questions

### Step 2: Document Upload
```
User logs in → Navigate to KYC section → Upload required documents
```

**Upload Requirements:**
- File formats: PDF, JPG, PNG
- Max file size: 5MB per document
- Clear, readable images
- All corners visible
- No glare or shadows

**Multiple Document Upload:**
- Users can upload multiple files
- Each document type can have multiple files
- Documents can be added/removed before submission

### Step 3: Submission
```
User reviews documents → Clicks "Submit for Review" → Status changes to PENDING
```

**What Happens:**
- All documents locked for editing
- Admin notification sent
- User receives confirmation email
- Status changes to PENDING

### Step 4: Admin Review
```
Admin reviews documents → Approves or Rejects → User notified
```

**Admin Checks:**
- Document authenticity
- Information accuracy
- Document validity (not expired)
- Address verification
- Identity verification
- Business legitimacy (for business accounts)

**Admin Actions:**
- **Approve:** Status → VERIFIED, full access granted
- **Reject:** Status → REJECTED, reason provided
- **Request More:** User notified to upload additional documents

### Step 5: Activation or Re-submission
```
If APPROVED: Full account access granted
If REJECTED: User corrects and re-submits
```

**Upon Approval:**
- Email notification sent
- Account status: VERIFIED
- All features unlocked
- Welcome package sent

**Upon Rejection:**
- Email with rejection reason
- Specific issues highlighted
- Instructions for correction
- Re-submission allowed

---

## Timeline

### Expected Processing Times:
- **Personal Accounts:** 1-3 business days
- **Business Accounts:** 3-7 business days
- **Re-submissions:** 1-2 business days

### Expedited Review (if available):
- Additional fee may apply
- 24-hour processing
- Priority queue

---

## User Dashboard KYC Section

### NOT_SUBMITTED View:
```
┌─────────────────────────────────────────┐
│ KYC Verification Required               │
│                                         │
│ ⚠️ Your account has limited access     │
│                                         │
│ To unlock full banking features:        │
│ 1. Upload required documents            │
│ 2. Submit for review                    │
│ 3. Wait for approval (1-3 days)         │
│                                         │
│ [Start KYC Verification]                │
└─────────────────────────────────────────┘
```

### PENDING View:
```
┌─────────────────────────────────────────┐
│ KYC Under Review                        │
│                                         │
│ ⏳ Your documents are being reviewed    │
│                                         │
│ Submitted: Nov 18, 2025                 │
│ Expected completion: Nov 21, 2025       │
│                                         │
│ Documents submitted:                    │
│ ✓ Government ID                         │
│ ✓ Proof of Address                      │
│ ✓ Tax ID (SSN)                          │
│ ✓ Selfie with ID                        │
│                                         │
│ [View Submitted Documents]              │
└─────────────────────────────────────────┘
```

### VERIFIED View:
```
┌─────────────────────────────────────────┐
│ KYC Verified ✓                          │
│                                         │
│ ✅ Your account is fully verified       │
│                                         │
│ Verified on: Nov 18, 2025               │
│ Next review: Nov 18, 2026               │
│                                         │
│ You have full access to:                │
│ • Deposits & Withdrawals                │
│ • Money Transfers                       │
│ • Card Services                         │
│ • Loan Applications                     │
│ • All Banking Features                  │
│                                         │
│ [View Verification Details]             │
└─────────────────────────────────────────┘
```

### REJECTED View:
```
┌─────────────────────────────────────────┐
│ KYC Verification Failed                 │
│                                         │
│ ❌ Your submission was rejected          │
│                                         │
│ Reason:                                 │
│ "Proof of address document is expired.  │
│  Please submit a recent utility bill    │
│  dated within the last 3 months."       │
│                                         │
│ Rejected on: Nov 18, 2025               │
│                                         │
│ [Re-submit Documents]                   │
│ [Contact Support]                       │
└─────────────────────────────────────────┘
```

---

## Admin Dashboard KYC Review

### Pending KYC Queue:
```
┌──────────────────────────────────────────────────────────┐
│ Pending KYC Reviews (12)                                 │
├──────────────────────────────────────────────────────────┤
│ Name            Type      Submitted    Age    Actions    │
│ John Doe        Personal  2 hours ago  1d     [Review]   │
│ ABC Corp        Business  1 day ago    3d     [Review]   │
│ Jane Smith      Personal  3 hours ago  1d     [Review]   │
└──────────────────────────────────────────────────────────┘
```

### Review Interface:
```
┌─────────────────────────────────────────────────────────┐
│ KYC Review: John Doe                                    │
│ Account Type: Personal - Checking                       │
│ Submitted: Nov 18, 2025 10:30 AM                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Personal Information:                                   │
│ Name: John Doe                                          │
│ Email: john@example.com                                 │
│ Phone: +1 (555) 123-4567                                │
│ DOB: Jan 15, 1990 (35 years old)                        │
│ Address: 123 Main St, New York, NY 10001, USA           │
│                                                         │
│ Submitted Documents:                                    │
│ 1. Government ID (Driver's License)    [View] [Download]│
│ 2. Proof of Address (Utility Bill)     [View] [Download]│
│ 3. SSN Document                        [View] [Download]│
│ 4. Selfie with ID                      [View] [Download]│
│                                                         │
│ Verification Checklist:                                 │
│ ☐ ID is valid and not expired                          │
│ ☐ Photo matches ID                                      │
│ ☐ Address matches documents                             │
│ ☐ All information is accurate                           │
│ ☐ No red flags detected                                 │
│                                                         │
│ Decision:                                               │
│ ( ) Approve - Grant full access                         │
│ ( ) Reject - Provide reason below                       │
│ ( ) Request More Documents                              │
│                                                         │
│ Notes/Rejection Reason:                                 │
│ [_____________________________________________]          │
│                                                         │
│ [Cancel]                    [Submit Decision]           │
└─────────────────────────────────────────────────────────┘
```

---

## Security & Compliance

### Data Protection:
- All documents encrypted at rest
- Secure transmission (HTTPS/TLS)
- Access logs maintained
- GDPR/CCPA compliant
- Right to deletion honored

### Document Retention:
- Active accounts: Indefinite
- Closed accounts: 7 years
- Rejected applications: 90 days

### Privacy:
- Documents only accessible by authorized admins
- Audit trail of all access
- User can download their documents
- Automatic redaction of sensitive data in logs

---

## API Endpoints

### User Endpoints:
```
POST   /api/v1/kyc/submit              - Submit KYC documents
GET    /api/v1/kyc/status              - Get KYC status
GET    /api/v1/kyc/documents           - Get submitted documents
POST   /api/v1/kyc/documents/upload    - Upload additional documents
DELETE /api/v1/kyc/documents/:id       - Remove document before submission
```

### Admin Endpoints:
```
GET    /api/v1/mybanker/kyc/pending    - Get pending KYC submissions
GET    /api/v1/mybanker/kyc/:id        - Get KYC submission details
PUT    /api/v1/mybanker/kyc/:id/approve - Approve KYC
PUT    /api/v1/mybanker/kyc/:id/reject  - Reject KYC with reason
POST   /api/v1/mybanker/kyc/:id/request - Request additional documents
```

---

## Implementation Checklist

### Registration Enhancement:
- [ ] Add account type selection (Checking/Savings/Business)
- [ ] Add phone number with country code dropdown
- [ ] Add DOB field for personal accounts
- [ ] Add address fields (street, city, state, ZIP, country)
- [ ] Add business-specific fields for business accounts
- [ ] Validate all required fields
- [ ] Set initial KYC status to NOT_SUBMITTED

### KYC Submission Page:
- [ ] Create KYC upload interface
- [ ] Support multiple file uploads per document type
- [ ] File validation (type, size, format)
- [ ] Preview uploaded documents
- [ ] Remove/replace documents before submission
- [ ] Submit button with confirmation
- [ ] Progress indicator

### Admin Review Interface:
- [ ] Pending KYC queue with filters
- [ ] Detailed review page
- [ ] Document viewer/downloader
- [ ] Verification checklist
- [ ] Approve/Reject/Request More actions
- [ ] Rejection reason text area
- [ ] Email notifications

### Database Schema:
- [ ] Add KYC status field to User model
- [ ] Create KYCDocument model with multiple uploads
- [ ] Add business fields to User model
- [ ] Add rejection reason field
- [ ] Add submission/review timestamps
- [ ] Add reviewer admin ID

---

## Future Enhancements

1. **Automated Verification:**
   - AI-powered document verification
   - Facial recognition
   - Address verification API integration

2. **Enhanced Security:**
   - Liveness detection
   - Biometric verification
   - Two-factor authentication for KYC submission

3. **User Experience:**
   - Mobile app for document capture
   - Real-time status updates
   - Chat support during review

4. **Compliance:**
   - AML (Anti-Money Laundering) checks
   - Sanctions list screening
   - PEP (Politically Exposed Person) screening

---

## Summary

The KYC workflow ensures regulatory compliance while providing a smooth user experience. The four-status system (NOT_SUBMITTED → PENDING → VERIFIED/REJECTED) clearly tracks each user's verification journey, with different requirements for personal and business accounts.

**Key Points:**
- ✅ Clear status progression
- ✅ Account-type specific requirements
- ✅ Multiple document upload support
- ✅ Admin review workflow
- ✅ Re-submission capability
- ✅ Full audit trail
- ✅ Secure document handling
