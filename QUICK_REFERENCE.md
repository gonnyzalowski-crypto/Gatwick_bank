# 🎯 Gatwick Bank - Quick Reference Card

## 🚀 Your MCP Superpowers

### What Each MCP Does

| MCP | What It Does | When to Use |
|-----|-------------|-------------|
| **Memory** 🧠 | Remembers everything about your project | Always active - stores requirements |
| **Filesystem** 📁 | Creates/edits files | "Create [component]", "Update [file]" |
| **Code Context** 🔍 | Understands your codebase | Automatic - helps maintain patterns |
| **Sequential Thinking** 🤔 | Plans complex tasks | "Plan how to implement [feature]" |
| **Agentic Framework** 🤖 | Coordinates multiple agents | Large features with many files |
| **Cognee** 🧬 | Banking domain knowledge | Compliance, regulations, best practices |
| **Playwright** 🎭 | **Sees your browser** | "Screenshot my site", "Test login flow" |
| **Magic UI** ✨ | Beautiful components | "Create a card component" |

---

## 🌐 See Your Live Site with Playwright

### Basic Commands

**Take Screenshots:**
```
"Open [YOUR_RAILWAY_URL] and screenshot the dashboard"
"Navigate to the cards page and take a screenshot"
```

**Test Flows:**
```
"Test the login flow on my live site"
"Try to create a transfer and report any errors"
```

**Full Audit:**
```
"Open my live Gatwick Bank site and audit all pages with screenshots"
```

**Find Bugs:**
```
"Navigate through my app and identify broken features"
```

---

## 📝 Quick Prompts for Common Tasks

### Account System
```
"Add account creation feature with 10-digit numbers starting with 08 or 03"
"Update balance display to show available, pending, and current"
```

### Cards
```
"Implement debit card creation linked to accounts"
"Add credit card application with banker approval"
"Mask card numbers showing only first 4 digits"
```

### Transfers
```
"Add bank selection dropdown with top 100 US banks"
"Implement transfer approval workflow for admin"
"Add beneficiary management for saved recipients"
```

### Money Markets
```
"Create crypto wallet system with buy/sell"
"Implement forex trading with USDCAD"
"Add gold reserve trading (XAUUSD)"
```

### Support
```
"Build support ticket system with WebSocket chat"
"Create admin communications page for tickets"
```

### Admin
```
"Create backup codes viewing page for admin"
"Add credit card approval page with limit/APR settings"
"Build transfer approval interface with approve/decline/reverse"
```

---

## 🛡️ Safe Deployment Commands

### Before Making Changes
```bash
# Create feature branch
git checkout -b feature/[feature-name]

# Test locally
cd backend && npm run dev
cd frontend && npm run dev
```

### After Making Changes
```bash
# Commit changes
git add .
git commit -m "feat: [description]"
git push origin feature/[feature-name]

# Create PR on GitHub
# Review → Merge → Railway auto-deploys
```

### If Something Breaks
```bash
# Rollback
git revert HEAD
git push origin main
# Railway will auto-deploy previous version
```

---

## 🎯 Today's Quick Wins

### 1. Visual Audit (30 min)
```
"Use Playwright to open my live Gatwick Bank site at [URL] and create a complete visual audit with screenshots of all pages"
```

### 2. Account Creation (2 hours)
```
"Implement account creation feature:
- Update schema: 10-digit account numbers starting with 08 or 03
- Add 'Create Account' button to AccountsPage
- Modal with type selection
- Keep existing features intact"
```

### 3. Card Masking (1 hour)
```
"Update CardsPage to mask card numbers (first 4 + ****) and add 'View Details' button requiring backup code"
```

### 4. Balance Display (1 hour)
```
"Update dashboard to show Available, Pending, and Current balance with color coding and tooltips"
```

---

## 🔥 The Power Prompt (Use When Ready)

When you're ready for the full rebuild:

```
Implement the complete system from SINGLE_PROMPT.md on feature branch.
This is LIVE production - maintain existing functionality.
Test each phase before proceeding.
Use Playwright to verify after each major change.
```

---

## 📊 What's Stored in Memory MCP

The MCPs already know:
- ✅ Your project is LIVE on Railway
- ✅ GitHub → Railway auto-deployment
- ✅ All 16 missing features
- ✅ Complete database schema
- ✅ All business rules (cards, transfers, markets)
- ✅ Security requirements
- ✅ Tech stack details

You don't need to repeat this context!

---

## 💡 Pro Tips

### Tip 1: Always Test Locally First
```bash
npm run dev
# Test the feature
# Then commit and push
```

### Tip 2: Use Playwright for Verification
```
"After implementing [feature], test it with Playwright"
```

### Tip 3: Small Commits
```bash
git commit -m "feat: add account creation button"
git commit -m "feat: add account creation modal"
git commit -m "feat: add account creation API"
# Not: "feat: add entire account system"
```

### Tip 4: Railway Preview Deployments
- Push to feature branch
- Create PR
- Railway creates preview URL
- Test on preview
- Merge when ready

---

## 🚨 Emergency Commands

### Check Railway Logs
```bash
railway logs
```

### Check Database
```bash
cd backend
npx prisma studio
```

### Reset Local Database
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Check What Changed
```bash
git status
git diff
```

---

## 📞 Getting Help from MCPs

### Debugging
```
"Debug this error: [paste error]"
"Why is [feature] not working?"
```

### Understanding Code
```
"Explain how the authentication flow works"
"What does the accountService.js do?"
```

### Planning
```
"Plan the implementation of [feature]"
"What's the safest way to add [feature] to production?"
```

### Testing
```
"Write Playwright tests for [feature]"
"Test the [feature] flow end-to-end"
```

---

## 🎊 Your Next Command

**Start here:**
```
"Use Playwright MCP to open my live Gatwick Bank site and give me a visual audit with recommendations for what to fix first"
```

**Then:**
```
"Implement the top priority feature you identified"
```

---

## 📚 Key Files

- **COMPLETE_REBUILD_PLAN.md** - Full specifications
- **SINGLE_PROMPT.md** - One prompt for everything
- **NEXT_STEPS.md** - Safe deployment strategy
- **MCP_SETUP.md** - MCP configuration guide
- **JENKINS_SETUP.md** - Jenkins installation
- **QUICK_START_JENKINS.md** - Jenkins quick start

---

## 🎯 Success Metrics

After each feature:
- [ ] Works locally
- [ ] Playwright tests pass
- [ ] Deployed to Railway
- [ ] No existing features broken
- [ ] Users can use it successfully

---

**Remember: You have 12 MCPs working for you. Say less, get more!** 🚀
