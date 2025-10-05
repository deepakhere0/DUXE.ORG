/**
 * Firebase Domain Configuration Script
 * This script helps configure authorized domains for Firebase Authentication
 */

const os = require('os');
const fs = require('fs');

// Get network interfaces
function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });
  
  return ips;
}

// Development port from vite config
const DEV_PORT = 5173;

// Get current network IPs
const networkIPs = getNetworkIPs();

console.log('🔧 Firebase Domain Configuration Helper');
console.log('=====================================\n');

console.log('📍 Detected Network IPs:');
networkIPs.forEach(ip => {
  console.log(`   • ${ip}`);
});

console.log('\n🌐 Domains to add to Firebase Console:');
console.log('--------------------------------------');

// Generate all domain variations
const domainsToAdd = [
  'localhost:5173',
  '127.0.0.1:5173',
  ...networkIPs.map(ip => `${ip}:${DEV_PORT}`)
];

domainsToAdd.forEach(domain => {
  console.log(`   ✅ http://${domain}`);
  console.log(`   ✅ https://${domain}`);
});

console.log('\n📋 Manual Steps to Configure Firebase:');
console.log('======================================');
console.log('1. Go to: https://console.firebase.google.com/');
console.log('2. Select project: duxe-5c071');
console.log('3. Navigate to: Authentication → Settings → Authorized domains');
console.log('4. Click "Add domain" and add each domain above');
console.log('5. Save changes');

console.log('\n🔄 Alternative: Use Firebase CLI (if installed):');
console.log('===============================================');

const firebaseConfig = {
  projectId: 'duxe-5c071',
  domains: domainsToAdd.map(domain => ({
    http: `http://${domain}`,
    https: `https://${domain}`
  }))
};

console.log('Run this command if you have Firebase CLI:');
console.log(`firebase auth:domains:add ${domainsToAdd.map(d => `http://${d}`).join(' ')} --project duxe-5c071`);

// Save configuration to file
const configPath = './firebase-domains-config.json';
fs.writeFileSync(configPath, JSON.stringify(firebaseConfig, null, 2));
console.log(`\n💾 Configuration saved to: ${configPath}`);

console.log('\n⚡ After adding domains, restart your dev server with:');
console.log('npm run dev');