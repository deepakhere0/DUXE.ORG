# PowerShell script to check SSL certificate status for duxe.org

Write-Host "Checking SSL Certificate Status for duxe.org..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Function to check SSL certificate
function Check-SSLCert {
    param($domain)
    
    Write-Host "`nTesting HTTPS connection to $domain..." -ForegroundColor Yellow
    
    try {
        # Test HTTPS connection
        $request = [System.Net.WebRequest]::Create("https://$domain")
        $request.Method = "HEAD"
        $request.Timeout = 10000
        
        $response = $request.GetResponse()
        
        Write-Host "✅ HTTPS is working for $domain" -ForegroundColor Green
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
        
        # Get certificate details
        $cert = $request.ServicePoint.Certificate
        if ($cert) {
            Write-Host "`nCertificate Details:" -ForegroundColor Cyan
            Write-Host "Subject: $($cert.Subject)" -ForegroundColor White
            Write-Host "Issuer: $($cert.Issuer)" -ForegroundColor White
            Write-Host "Valid From: $($cert.GetEffectiveDateString())" -ForegroundColor White
            Write-Host "Valid To: $($cert.GetExpirationDateString())" -ForegroundColor White
        }
        
        $response.Close()
    }
    catch {
        Write-Host "❌ HTTPS connection failed for $domain" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to check if DNS is working
        try {
            $ip = [System.Net.Dns]::GetHostAddresses($domain)[0].IPAddressToString
            Write-Host "✅ DNS Resolution: $domain -> $ip" -ForegroundColor Yellow
            Write-Host "💡 DNS is working, SSL certificate may still be provisioning..." -ForegroundColor Yellow
        }
        catch {
            Write-Host "❌ DNS Resolution failed for $domain" -ForegroundColor Red
        }
    }
}

# Check both domain variations
Check-SSLCert "duxe.org"
Check-SSLCert "www.duxe.org"

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "SSL Certificate Process:" -ForegroundColor Magenta
Write-Host "1. DNS must point to Netlify first ✓" -ForegroundColor White
Write-Host "2. Netlify detects the custom domain ✓" -ForegroundColor White  
Write-Host "3. Netlify requests SSL certificate from Let's Encrypt" -ForegroundColor White
Write-Host "4. Certificate is automatically installed" -ForegroundColor White
Write-Host "5. HTTPS becomes available (usually within 1-60 minutes)" -ForegroundColor White

Write-Host "`nIf HTTPS is not working yet:" -ForegroundColor Yellow
Write-Host "- DNS changes may still be propagating" -ForegroundColor White
Write-Host "- SSL certificate may still be provisioning" -ForegroundColor White
Write-Host "- Check your Netlify dashboard for certificate status" -ForegroundColor White
