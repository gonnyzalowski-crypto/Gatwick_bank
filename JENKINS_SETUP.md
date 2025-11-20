# Jenkins Installation and Setup Guide

This guide will help you install Jenkins locally or use an existing Jenkins instance, and obtain the credentials needed for the Jenkins MCP server.

## Option 1: Install Jenkins Locally (Recommended for Development)

### Method A: Using Docker (Easiest)

#### Prerequisites
- Docker Desktop installed on Windows

#### Installation Steps

1. **Pull and run Jenkins Docker container:**

```powershell
# Create a volume for Jenkins data persistence
docker volume create jenkins_home

# Run Jenkins container
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  jenkins/jenkins:lts
```

2. **Get the initial admin password:**

```powershell
# Wait about 30 seconds for Jenkins to start, then run:
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copy the password that appears.

3. **Access Jenkins:**
   - Open browser: http://localhost:8080
   - Paste the initial admin password
   - Click "Install suggested plugins"
   - Create your first admin user (save these credentials!)

4. **Your Jenkins credentials:**
   - **URL**: `http://localhost:8080`
   - **Username**: The admin username you created
   - **Password**: The admin password you created

### Method B: Using Windows Installer

#### Prerequisites
- Java 17 or 21 installed

#### Installation Steps

1. **Download Jenkins:**
   - Visit: https://www.jenkins.io/download/
   - Download the Windows installer (.msi)

2. **Install Jenkins:**
   - Run the installer
   - Follow the installation wizard
   - Jenkins will install as a Windows service

3. **Access Jenkins:**
   - Open browser: http://localhost:8080
   - Find initial password at: `C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword`
   - Complete setup wizard

4. **Your Jenkins credentials:**
   - **URL**: `http://localhost:8080`
   - **Username**: The admin username you created
   - **Password**: The admin password you created

## Option 2: Use Existing Jenkins Instance

If you already have access to a Jenkins server:

### Getting Your Jenkins URL
- Your Jenkins URL (e.g., `https://jenkins.yourcompany.com`)

### Creating an API Token (Recommended)

1. **Log in to Jenkins**

2. **Navigate to your user settings:**
   - Click your username (top right)
   - Click "Configure"

3. **Generate API Token:**
   - Scroll to "API Token" section
   - Click "Add new Token"
   - Give it a name (e.g., "MCP Server")
   - Click "Generate"
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)

4. **Your Jenkins credentials:**
   - **URL**: Your Jenkins server URL
   - **Username**: Your Jenkins username
   - **Password/Token**: The API token you just generated

## Configuring Jenkins MCP Server

### Step 1: Install Python and uvx

Jenkins MCP requires Python and the `uvx` tool:

```powershell
# Check if Python is installed
python --version

# If not installed, download from: https://www.python.org/downloads/

# Install uv (which includes uvx)
pip install uv
```

### Step 2: Create .env.mcp file

Copy the example file and add your credentials:

```powershell
# In your project directory
cd "c:\Users\sayv\Documents\Gatwick Bank\bank_deploy"
copy .env.mcp.example .env.mcp
```

Edit `.env.mcp` with your actual values:

```env
# Jenkins MCP Configuration
JENKINS_URL=http://localhost:8080
JENKINS_USERNAME=your-admin-username
JENKINS_PASSWORD=your-api-token-or-password
```

### Step 3: Update mcp.json

Your `mcp.json` is already configured, but you need to replace the environment variable placeholders:

**Option A: Use environment variables (recommended)**
- Set Windows environment variables:
  ```powershell
  [System.Environment]::SetEnvironmentVariable('JENKINS_URL', 'http://localhost:8080', 'User')
  [System.Environment]::SetEnvironmentVariable('JENKINS_USERNAME', 'your-username', 'User')
  [System.Environment]::SetEnvironmentVariable('JENKINS_PASSWORD', 'your-token', 'User')
  ```
- Restart your IDE for changes to take effect

**Option B: Hard-code values (less secure)**
- Edit `mcp.json` and replace `${JENKINS_URL}`, `${JENKINS_USERNAME}`, `${JENKINS_PASSWORD}` with actual values
- **Warning**: Don't commit this file with credentials!

### Step 4: Test Jenkins MCP

Test the connection manually:

```powershell
uvx mcp-jenkins `
  --jenkins-url "http://localhost:8080" `
  --jenkins-username "your-username" `
  --jenkins-password "your-token" `
  --read-only
```

If successful, you'll see Jenkins MCP server starting without errors.

## Verifying Jenkins Installation

### Check Jenkins is Running

**Docker:**
```powershell
docker ps | Select-String jenkins
```

**Windows Service:**
```powershell
Get-Service jenkins
```

### Access Jenkins Web UI

Open browser to your Jenkins URL (e.g., http://localhost:8080)

### Test API Access

```powershell
# Replace with your credentials
$jenkins_url = "http://localhost:8080"
$username = "your-username"
$token = "your-api-token"

# Create base64 auth header
$pair = "$($username):$($token)"
$encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))

# Test API
Invoke-RestMethod -Uri "$jenkins_url/api/json" -Headers @{Authorization = "Basic $encodedCreds"}
```

If successful, you'll see Jenkins API response with version info.

## Security Best Practices

1. **Use API Tokens**: Always use API tokens instead of passwords for automation
2. **Token Permissions**: Create tokens with minimal required permissions
3. **Don't Commit Credentials**: Add `.env.mcp` to `.gitignore`
4. **Rotate Tokens**: Regularly rotate your API tokens
5. **Use Environment Variables**: Prefer environment variables over hard-coded values

## Common Issues and Solutions

### Issue: "Connection refused" error
**Solution**: Ensure Jenkins is running and accessible at the specified URL

### Issue: "Authentication failed"
**Solution**: 
- Verify username and token are correct
- Ensure token hasn't expired
- Check if Jenkins requires CSRF protection (use API token)

### Issue: "uvx command not found"
**Solution**: Install uv with `pip install uv`

### Issue: Jenkins container won't start
**Solution**: 
```powershell
# Check logs
docker logs jenkins

# Restart container
docker restart jenkins
```

### Issue: Port 8080 already in use
**Solution**: 
```powershell
# Use different port
docker run -d --name jenkins -p 9090:8080 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts

# Update JENKINS_URL to http://localhost:9090
```

## Creating Your First Jenkins Job (Optional)

Once Jenkins is set up, create a test job:

1. **Click "New Item"**
2. **Enter name**: "test-job"
3. **Select**: "Freestyle project"
4. **Build Steps**: Add "Execute shell" or "Execute Windows batch command"
5. **Command**: `echo "Hello from Jenkins!"`
6. **Save**

Now you can use Jenkins MCP to trigger this job!

## Next Steps

After Jenkins is configured:

1. ✅ Jenkins installed and running
2. ✅ API token generated
3. ✅ `.env.mcp` configured
4. ✅ Environment variables set (optional)
5. ✅ Jenkins MCP tested
6. 🚀 Start using Jenkins MCP in your IDE!

## Useful Jenkins Commands

```powershell
# Docker commands
docker start jenkins          # Start Jenkins
docker stop jenkins           # Stop Jenkins
docker restart jenkins        # Restart Jenkins
docker logs jenkins           # View logs
docker exec -it jenkins bash  # Access container shell

# Windows Service commands
Start-Service jenkins         # Start Jenkins
Stop-Service jenkins          # Stop Jenkins
Restart-Service jenkins       # Restart Jenkins
```

## Resources

- [Jenkins Official Documentation](https://www.jenkins.io/doc/)
- [Jenkins Docker Hub](https://hub.docker.com/r/jenkins/jenkins)
- [Jenkins API Documentation](https://www.jenkins.io/doc/book/using/remote-access-api/)
- [Jenkins MCP Server](https://github.com/lanbaoshen/mcp-jenkins)
