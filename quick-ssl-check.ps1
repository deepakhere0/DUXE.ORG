# Quick SSL certificate check for duxe.org

Write-Host "Quick SSL Status Check" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

# Check DNS first
Write-Host "`nChecking DNS..." -ForegroundColor Yellow
$dns = nslookup duxe.org 2>$null | Select-String "Address"
Write-Host $dns

# Try HTTPS connection
Write-Host "`nTesting HTTPS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://duxe.org" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTPS is working! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*SSL/TLS*" -or $_.Exception.Message -like "*certificate*") {
        Write-Host "🔶 SSL certificate issue detected" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*timeout*" -or $_.Exception.Message -like "*unreachable*") {
        Write-Host "⏳ Still waiting for DNS/SSL provisioning..." -ForegroundColor Yellow  
    } else {
        Write-Host "❌ Connection failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update nameservers in Hostinger (if not done yet)" -ForegroundColor White
Write-Host "2. Wait 4-8 hours for DNS propagation" -ForegroundColor White  
Write-Host "3. SSL certificate will be automatic after DNS works" -ForegroundColor White
