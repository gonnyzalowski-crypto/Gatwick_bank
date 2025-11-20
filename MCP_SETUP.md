# MCP Servers Setup Guide

This project is configured with the following Model Context Protocol (MCP) servers to optimize development workflow.

## Installed MCP Servers

### 1. **Figma MCP** (Remote Server)
- **Purpose**: Access Figma designs directly in your IDE
- **Features**:
  - Generate code from Figma frames
  - Extract design tokens and variables
  - Access component libraries
  - Retrieve Make resources
- **Authentication**: Requires Figma OAuth (will prompt on first use)
- **URL**: https://mcp.figma.com/mcp

### 2. **Playwright MCP**
- **Purpose**: Browser automation and testing
- **Features**:
  - Navigate web pages
  - Take screenshots
  - Execute JavaScript
  - Generate test code
  - Web scraping capabilities
- **Package**: `@playwright/mcp@latest`

### 3. **Magic UI MCP**
- **Purpose**: Access Magic UI component library
- **Features**:
  - Generate beautiful React components
  - Access pre-built UI templates
  - Modern design patterns
  - TailwindCSS integration
- **Package**: `@magicuidesign/mcp`

### 4. **Sequential Thinking MCP**
- **Purpose**: Structured problem-solving and reasoning
- **Features**:
  - Step-by-step problem breakdown
  - Reflective analysis
  - Tool recommendations
  - Complex task management
- **Package**: `@modelcontextprotocol/server-sequential-thinking`

### 5. **FastAPI MCP**
- **Purpose**: Expose FastAPI endpoints to AI agents
- **Features**:
  - Zero-configuration setup
  - Automatic schema preservation
  - Endpoint documentation
  - Request/response model handling
- **Package**: `fastapi-mcp`

### 6. **GitHub MCP** (Official - Remote Server)
- **Purpose**: Interact with GitHub repositories and workflows
- **Features**:
  - Repository management (create, clone, search)
  - Pull request operations
  - Issue tracking
  - GitHub Actions workflows
  - Code search and file operations
  - Branch and commit management
- **Type**: Remote HTTP server
- **URL**: `https://api.githubcopilot.com/mcp/`
- **Authentication**: OAuth (automatic in supported IDEs) or Personal Access Token

### 7. **Jenkins MCP**
- **Purpose**: Automate Jenkins CI/CD operations
- **Features**:
  - Job management (list, create, trigger builds)
  - Build monitoring and logs
  - Pipeline operations
  - Node and queue management
  - Plugin information
- **Package**: `mcp-jenkins` (Python-based, requires `uvx`)
- **Configuration**: Requires Jenkins URL, username, and password/token

### 8. **Memory MCP** 🧠
- **Purpose**: Persistent knowledge graph for context retention
- **Features**:
  - Remembers architecture decisions across sessions
  - Learns your coding patterns
  - Stores project-specific domain knowledge
  - Reduces need to repeat context
- **Package**: `@modelcontextprotocol/server-memory`
- **Key benefit**: "Say less, get more" - AI remembers your preferences

### 9. **Filesystem MCP** 📁
- **Purpose**: Deep file system access and manipulation
- **Features**:
  - Full codebase traversal
  - Directory scaffolding
  - File operations (read, write, search)
  - Understands project structure
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Scope**: Configured for your bank_deploy directory

### 10. **Agentic Framework MCP** 🤖
- **Purpose**: Multi-agent collaboration for complex tasks
- **Features**:
  - Breaks tasks into specialized sub-agents
  - Coordinates infrastructure + backend + frontend work
  - Asynchronous message exchange
  - Persistent task history
- **Package**: `mcp-agentic-framework`
- **Use case**: "Build authentication system" → handles all layers automatically

### 11. **Code Context Provider MCP** 🔍
- **Purpose**: Intelligent code analysis and context extraction
- **Features**:
  - Tree-sitter parsing for deep understanding
  - Symbol extraction (functions, classes, imports)
  - Directory structure analysis
  - No manual file specification needed
- **Package**: `code-context-provider-mcp`
- **Benefit**: AI understands code relationships automatically

### 12. **Cognee MCP (GraphRAG)** 🧬
- **Purpose**: Graph-based memory with Retrieval-Augmented Generation
- **Features**:
  - Customizable data ingestion
  - Knowledge graph construction
  - Advanced search and retrieval
  - Domain-specific learning
- **Package**: `cognee-mcp`
- **Perfect for**: Complex banking domain knowledge and regulations

## Installation Instructions

### For VS Code / Cursor

1. **Open MCP Configuration**:
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Select `MCP: Open User Configuration` (global) or `MCP: Open Workspace Folder MCP Configuration` (workspace-only)

2. **Use the provided configuration**:
   - The `mcp.json` file in this directory contains all server configurations
   - Copy its contents to your MCP configuration file

3. **Start the servers**:
   - Click "Start" next to each MCP server name in your IDE
   - For Figma MCP, you'll be prompted to authenticate via OAuth

### For Claude Desktop

Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "magic-ui": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "fastapi-mcp": {
      "command": "npx",
      "args": ["-y", "fastapi-mcp"]
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "jenkins": {
      "command": "uvx",
      "args": [
        "mcp-jenkins",
        "--jenkins-url",
        "YOUR_JENKINS_URL",
        "--jenkins-username",
        "YOUR_USERNAME",
        "--jenkins-password",
        "YOUR_PASSWORD_OR_TOKEN"
      ]
    }
  }
}
```

### For Claude Code (CLI)

Run these commands in your terminal:

```bash
# Figma MCP
claude mcp add --transport http figma https://mcp.figma.com/mcp

# Playwright MCP
claude mcp add playwright npx -y @playwright/mcp@latest

# Magic UI MCP
claude mcp add magic-ui npx -y @magicuidesign/mcp

# Sequential Thinking MCP
claude mcp add sequential-thinking npx -y @modelcontextprotocol/server-sequential-thinking

# FastAPI MCP
claude mcp add fastapi-mcp npx -y fastapi-mcp

# GitHub MCP
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# Jenkins MCP (requires Python uvx)
# First install: pip install uv
claude mcp add jenkins uvx mcp-jenkins --jenkins-url YOUR_URL --jenkins-username YOUR_USER --jenkins-password YOUR_TOKEN
```

## Usage Tips

### Figma MCP
- Provide Figma file URLs when prompting
- Use for generating components from designs
- Great for maintaining design-code consistency

### Playwright MCP
- Use for E2E testing automation
- Generate test scripts from user flows
- Debug web applications interactively

### Magic UI MCP
- Ask for specific component types (buttons, forms, cards, etc.)
- Request modern UI patterns
- Integrate with your existing TailwindCSS setup

### Sequential Thinking MCP
- Use for complex problem-solving tasks
- Break down large features into steps
- Get structured approach to debugging

### FastAPI MCP
- Point it at your backend FastAPI application
- Expose endpoints to AI for automated testing
- Generate API documentation and client code

### GitHub MCP
- Manage repositories and pull requests
- Search code across your organization
- Automate GitHub Actions workflows
- Create and manage issues
- Review and merge PRs with AI assistance

### Jenkins MCP
- Trigger and monitor CI/CD builds
- View build logs and status
- Manage Jenkins jobs and pipelines
- Automate deployment workflows
- Monitor build queues and nodes

## Verification

After installation, verify your MCP servers are running:

1. **VS Code/Cursor**: Check the MCP panel in your IDE
2. **Claude Desktop**: Type `/mcp` to see connected servers
3. **Claude Code**: Run `claude mcp list`

## Troubleshooting

- **Server won't start**: Ensure Node.js and npm are installed
- **Figma authentication fails**: Check your Figma account permissions
- **npx commands fail**: Update npm with `npm install -g npm@latest`
- **Port conflicts**: Check if ports 3845 (Figma desktop) or 8931 (Playwright) are available
- **Jenkins MCP fails**: Install Python and uvx with `pip install uv`
- **GitHub MCP authentication**: Use OAuth in supported IDEs or create a Personal Access Token
- **Environment variables not working**: Set actual values instead of `${VARIABLE}` placeholders

## Benefits for This Project

### Core Development
- **Figma MCP**: Generate React components matching your bank's design system
- **Playwright MCP**: Automate testing of banking workflows (login, transfers, KYC)
- **Magic UI MCP**: Create beautiful, modern UI components for the frontend
- **Sequential Thinking MCP**: Break down complex features like KYC verification
- **FastAPI MCP**: Test and document your backend API endpoints
- **GitHub MCP**: Manage this repository, create PRs, and automate workflows
- **Jenkins MCP**: Automate CI/CD pipelines for deployment to Railway

### Intelligence & Context (New! 🚀)
- **Memory MCP**: Remembers your banking domain rules, architecture decisions, and coding patterns
- **Filesystem MCP**: Full access to codebase structure - scaffolds entire features
- **Agentic Framework MCP**: "Build payment processing" → coordinates DB schema, API, frontend, tests automatically
- **Code Context Provider MCP**: Understands relationships between components without manual specification
- **Cognee MCP**: Learns banking regulations, compliance requirements, domain-specific knowledge

### "Say Less, Get More" Example

**Before (without intelligence MCPs):**
> "Create a new transaction endpoint at /api/v1/transactions with POST method. Use the existing auth middleware from src/middleware/auth.js. Create a Prisma schema for Transaction with userId, amount, description, timestamp. Add validation for amount > 0. Create a React form component in src/components/TransactionForm.jsx with validation. Add tests."

**After (with intelligence MCPs):**
> "Add transaction feature"

The MCP stack will:
1. **Memory** - Recalls your auth patterns and validation rules
2. **Filesystem** - Scans existing API structure and components
3. **Code Context** - Understands where Transaction model fits in schema
4. **Sequential Thinking** - Plans: API → DB → Frontend → Tests
5. **Agentic Framework** - Coordinates all layers simultaneously
6. **Cognee** - Applies banking compliance rules automatically

## 🚀 How to Use "Say Less, Get More"

### The Power of Memory MCP

Your MCPs now have complete knowledge of your banking system stored in Memory MCP. This means you can:

**Instead of 100 prompts, use 1:**

❌ **Old way (100+ prompts):**
1. "Create a debit card model in Prisma"
2. "Add card number field"
3. "Add CVV field"
4. "Make it encrypted"
5. "Add expiry date"
... 95 more prompts

✅ **New way (1 prompt):**
"Implement the complete card system"

The MCPs will:
1. Read COMPLETE_REBUILD_PLAN.md
2. Recall requirements from Memory MCP
3. Understand existing code via Code Context MCP
4. Plan implementation via Sequential Thinking MCP
5. Coordinate all changes via Agentic Framework MCP
6. Execute everything via Filesystem MCP

### Quick Start Commands

**For complete rebuild:**
```
Copy the prompt from SINGLE_PROMPT.md and paste it here
```

**For specific features:**
```
"Implement the money market system with crypto, forex, gold, and stocks"
"Build the transfer approval workflow for admin dashboard"
"Create the support ticket system with WebSocket"
```

**For fixes:**
```
"Fix all broken features in the dashboard"
"Update account numbers to 10 digits starting with 08 or 03"
```

### What's Already Stored in Memory MCP

The MCPs know:
- ✅ Your complete banking system architecture
- ✅ All feature requirements and business rules
- ✅ Database schema relationships
- ✅ Security requirements (JWT, backup codes, encryption)
- ✅ Balance calculation logic (available vs current)
- ✅ Card system (debit vs credit, approval workflows)
- ✅ Money market rules (circulation limits, P/L tracking)
- ✅ Transfer approval workflows
- ✅ Support ticket system design

### Testing Your MCPs

Ask:
```
"What do you know about the Gatwick Bank card system?"
"List all the features that need to be implemented"
"What's the account number format?"
```

If MCPs respond with accurate details, they're working!

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Figma MCP Docs](https://developers.figma.com/docs/figma-mcp-server/)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Magic UI MCP](https://magicui.design/docs/mcp)
- [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [GitHub MCP Official](https://github.com/github/github-mcp-server)
- [Jenkins MCP](https://github.com/lanbaoshen/mcp-jenkins)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
