import https from 'https';

function testEndpoint(path) {
  return new Promise((resolve) => {
    console.log(`\nTesting: https://gatwickbank.up.railway.app${path}`);
    
    https.get(`https://gatwickbank.up.railway.app${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 200)}`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`Error: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  await testEndpoint('/healthz');
  await testEndpoint('/api/v1/currencies');
  await testEndpoint('/api/v1/auth/login');
}

main();
