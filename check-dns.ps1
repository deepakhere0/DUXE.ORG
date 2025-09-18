# PowerShell script to check DNS propagation for duxe.org

Write-Host "Checking DNS propagation for duxe.org..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check current nameservers
Write-Host "`nCurrent Nameservers:" -ForegroundColor Yellow
nslookup -type=NS duxe.org

# Check A record
Write-Host "`nA Record (should point to Netlify IP):" -ForegroundColor Yellow  
nslookup duxe.org

# Check WWW CNAME
Write-Host "`nWWW CNAME:" -ForegroundColor Yellow
nslookup www.duxe.org

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "- Nameservers: dns1.p01.nsone.net (or similar Netlify nameservers)" -ForegroundColor Cyan
Write-Host "- A Record: Should show Netlify IP (like 75.2.60.5)" -ForegroundColor Cyan
Write-Host "- If still showing 84.32.84.32, DNS is still propagating" -ForegroundColor Cyan

Write-Host "`nOnline Tools:" -ForegroundColor Magenta
Write-Host "- https://whatsmydns.net" -ForegroundColor Magenta
Write-Host "- https://dnschecker.org" -ForegroundColor Magenta
