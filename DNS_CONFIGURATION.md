# DNS Configuration for duxe.org on Netlify

## Current Status
- Domain: `duxe.org`
- Current IP: `84.32.84.32` (Not Netlify)
- Status: DNS needs to be updated to point to Netlify

## Option 1: Use Netlify DNS (Recommended)

### Steps:
1. **In Netlify Dashboard:**
   - Go to your site
   - Click "Domain settings"
   - Add custom domain: `duxe.org`
   - Click "Use Netlify DNS"
   - Note the 4 nameservers provided

2. **At Your Domain Registrar:**
   - Log in to where you bought duxe.org
   - Find DNS/Nameserver settings
   - Replace current nameservers with Netlify's nameservers
   - Save changes

3. **Wait:**
   - DNS propagation: 4-48 hours
   - SSL certificate: Automatic after DNS is active

## Option 2: External DNS Configuration

If you prefer to keep your current DNS provider:

### Required DNS Records:
```
# Root domain
Type: A
Name: @ (or blank/root)
Value: 75.2.60.5

# WWW subdomain  
Type: CNAME
Name: www
Value: your-site-name.netlify.app

# Alternative for root (if A record doesn't work)
Type: ALIAS/ANAME  
Name: @
Value: your-site-name.netlify.app
```

**Note:** Replace `your-site-name.netlify.app` with your actual Netlify site URL.

## Verification Steps

### 1. Check DNS Propagation:
```bash
# Check if DNS is updated
nslookup duxe.org
nslookup www.duxe.org

# Should show Netlify IPs (75.2.60.5 or similar)
```

### 2. Online Tools:
- Visit: https://whatsmydns.net
- Enter: duxe.org
- Check global propagation status

### 3. SSL Certificate:
- In Netlify dashboard, check "Domain settings"
- Should show "Certificate provisioned" when ready

## Common Issues & Solutions

### Issue 1: "Site can't be reached"
- **Cause:** DNS not updated or still propagating
- **Solution:** Wait longer or verify DNS records

### Issue 2: "Your connection is not private" (SSL error)
- **Cause:** SSL certificate not yet provisioned
- **Solution:** Wait for DNS to fully propagate, then SSL follows

### Issue 3: Shows old site content
- **Cause:** Browser cache or DNS cache
- **Solution:** Clear browser cache, try incognito mode

### Issue 4: Works on netlify.app but not custom domain
- **Cause:** DNS configuration issue
- **Solution:** Double-check DNS records match requirements

## Timeline Expectations

- **DNS Update:** Immediate to 48 hours
- **Global Propagation:** 4-24 hours typically  
- **SSL Certificate:** 1-60 minutes after DNS is active
- **Full Availability:** Usually within 24 hours

## Need Help?

1. Share your default Netlify URL (https://xyz.netlify.app)
2. Confirm if it works on the default URL
3. Check your DNS provider's interface for current records
4. Try accessing via different browsers/devices
