# PowerShell script to fix Brokard Williams account types
$API_BASE = "https://gatwickbank-production.up.railway.app/api/v1"

Write-Host "Step 1: Authenticating as admin..."

# Step 1: Login
$loginBody = @{
    email = "jonod@gmail.com"
    password = "Password123!"
} | ConvertTo-Json

$step1Response = Invoke-RestMethod -Uri "$API_BASE/mybanker/login/step1" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "Step 1 successful"

# Step 2: Security question
Write-Host "Step 2: Answering security question..."

$step2Body = @{
    email = "jonod@gmail.com"
    answer = "fluffy"
} | ConvertTo-Json

$step2Response = Invoke-RestMethod -Uri "$API_BASE/mybanker/login/step2" -Method Post -Body $step2Body -ContentType "application/json"

$token = $step2Response.token
Write-Host "Got authentication token"

# Step 3: Fix account types
Write-Host "Step 3: Fixing account types for Brokard Williams users..."

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $fixResponse = Invoke-RestMethod -Uri "$API_BASE/mybanker/fix-brokard-accounts" -Method Post -Headers $headers
    
    Write-Host ""
    Write-Host "SUCCESS! Account types fixed!"
    Write-Host ""
    Write-Host "Results:"
    $fixResponse.results | ForEach-Object {
        Write-Host "  User: $($_.email)"
        Write-Host "  Status: $($_.status)"
        if ($_.changes) {
            Write-Host "  Changes:"
            $_.changes | ForEach-Object {
                Write-Host "    Account $($_.accountNumber): $($_.oldType) -> $($_.newType)"
            }
        }
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "ERROR fixing accounts:"
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}
