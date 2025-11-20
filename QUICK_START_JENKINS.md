# Quick Start: Jenkins Setup for MCP

## ✅ Prerequisites Check

- ✅ Python 3.14.0 installed
- ✅ uv package installed
- ✅ Docker installed (but not running)

## 🚀 Quick Setup Options

### Option 1: Start Jenkins with Docker (Recommended)

**Step 1: Start Docker Desktop**
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray should be stable)

**Step 2: Run Jenkins Container**

Open PowerShell and run:

```powershell
# Create volume for Jenkins data
docker volume create jenkins_home

# Run Jenkins
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  jenkins/jenkins:lts

# Wait 30 seconds, then get the initial password
Start-Sleep -Seconds 30
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Step 3: Complete Jenkins Setup**
1. Open browser: http://localhost:8080
2. Paste the initial admin password from the terminal
3. Click "Install suggested plugins"
4. Create admin user:
   - Username: `admin` (or your choice)
   - Password: `your-secure-password`
   - Full name: `Your Name`
   - Email: `your-email@example.com`
5. Click "Save and Continue"
6. Keep default Jenkins URL: http://localhost:8080
7. Click "Start using Jenkins"

**Step 4: Generate API Token**
1. Click your username (top right) → "Configure"
2. Scroll to "API Token" section
3. Click "Add new Token"
4. Name: `MCP Server`
5. Click "Generate"
6. **COPY THE TOKEN** (you won't see it again!)

**Step 5: Configure Jenkins MCP**

Create `.env.mcp` file:

```powershell
cd "c:\Users\sayv\Documents\Gatwick Bank\bank_deploy"

# Create .env.mcp file with your credentials
@"
# Jenkins MCP Configuration
JENKINS_URL=http://localhost:8080
JENKINS_USERNAME=admin
JENKINS_PASSWORD=YOUR_API_TOKEN_HERE
"@ | Out-File -FilePath .env.mcp -Encoding utf8
```

Replace `YOUR_API_TOKEN_HERE` with the token you copied.

**Step 6: Test Jenkins MCP**

```powershell
uvx mcp-jenkins `
  --jenkins-url "http://localhost:8080" `
  --jenkins-username "admin" `
  --jenkins-password "YOUR_API_TOKEN_HERE" `
  --read-only
```

If successful, you'll see the MCP server start without errors!

### Option 2: Use Cloud Jenkins (No Local Installation)

If you don't want to run Jenkins locally, you can use a cloud provider:

**CloudBees (Free Trial):**
1. Sign up: https://www.cloudbees.com/
2. Get your Jenkins URL and credentials
3. Generate API token
4. Update `.env.mcp` with your cloud Jenkins details

**Jenkins on Railway/Render:**
1. Deploy Jenkins to Railway or Render
2. Get the public URL
3. Configure authentication
4. Update `.env.mcp`

### Option 3: Skip Jenkins for Now

If you don't need Jenkins CI/CD right now, you can skip it and use the other 6 MCP servers:

1. Remove Jenkins from `mcp.json`:
   - Open `mcp.json`
   - Delete the `"jenkins"` section
   - Save the file

2. You'll still have:
   - ✅ Figma MCP
   - ✅ Playwright MCP
   - ✅ Magic UI MCP
   - ✅ Sequential Thinking MCP
   - ✅ FastAPI MCP
   - ✅ GitHub MCP

## 🔧 Setting Environment Variables (Alternative to .env.mcp)

Instead of using `.env.mcp`, you can set Windows environment variables:

```powershell
# Set environment variables (restart IDE after)
[System.Environment]::SetEnvironmentVariable('JENKINS_URL', 'http://localhost:8080', 'User')
[System.Environment]::SetEnvironmentVariable('JENKINS_USERNAME', 'admin', 'User')
[System.Environment]::SetEnvironmentVariable('JENKINS_PASSWORD', 'your-api-token', 'User')

# Verify they're set
[System.Environment]::GetEnvironmentVariable('JENKINS_URL', 'User')
```

**Important:** Restart your IDE (Cursor/VS Code) after setting environment variables!

## 📝 Update mcp.json for Your IDE

Your `mcp.json` currently uses environment variable placeholders. You have two options:

**Option A: Use environment variables (recommended)**
- Set the environment variables as shown above
- Restart your IDE
- The `${JENKINS_URL}` placeholders will be automatically replaced

**Option B: Hard-code values (less secure)**
- Edit `mcp.json`
- Replace:
  ```json
  "--jenkins-url",
  "${JENKINS_URL}",
  "--jenkins-username",
  "${JENKINS_USERNAME}",
  "--jenkins-password",
  "${JENKINS_PASSWORD}"
  ```
- With:
  ```json
  "--jenkins-url",
  "http://localhost:8080",
  "--jenkins-username",
  "admin",
  "--jenkins-password",
  "your-actual-token-here"
  ```
- **Warning:** Don't commit this file with credentials!

## 🎯 Next Steps

After Jenkins is configured:

1. **In Cursor/VS Code:**
   - Press `Ctrl+Shift+P`
   - Select `MCP: Open Workspace Folder MCP Configuration`
   - Copy contents from your `mcp.json`
   - Click "Start" next to Jenkins server

2. **Test it:**
   - Ask your AI assistant: "List all Jenkins jobs"
   - Or: "What's the status of my Jenkins server?"

3. **Create a test job:**
   - In Jenkins UI, click "New Item"
   - Name: "test-build"
   - Type: "Freestyle project"
   - Add build step: `echo "Hello from Jenkins!"`
   - Save
   - Use MCP to trigger it!

## 🐛 Troubleshooting

### Docker not running
```powershell
# Start Docker Desktop manually, or:
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Port 8080 already in use
```powershell
# Use different port
docker run -d --name jenkins -p 9090:8080 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts

# Update JENKINS_URL to http://localhost:9090
```

### Can't access Jenkins at localhost:8080
```powershell
# Check if container is running
docker ps

# View logs
docker logs jenkins

# Restart container
docker restart jenkins
```

### uvx command not found after installing uv
```powershell
# Verify installation
pip show uv

# Try using full path
python -m uv run mcp-jenkins --help
```

## 📚 Resources

- Full setup guide: See `JENKINS_SETUP.md`
- Jenkins docs: https://www.jenkins.io/doc/
- Jenkins MCP: https://github.com/lanbaoshen/mcp-jenkins
