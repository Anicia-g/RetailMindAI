const http = require('http');
const app = require('../backend/src/app');

async function testBackendServer() {
  console.log('=== TESTING EXPRESS BACKEND STARTUP & HEALTH ENDPOINTS ===');
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('✅ Express test server listening on port 5099');

  const makeReq = (path) => new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:5099${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    }).on('error', reject);
  });

  try {
    const rootRes = await makeReq('/');
    console.log('✅ GET / response:', rootRes);

    const healthRes = await makeReq('/api/health');
    console.log('✅ GET /api/health response:', healthRes);

    const mlHealthRes = await makeReq('/api/ml/health');
    console.log('✅ GET /api/ml/health response:', mlHealthRes);
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
  } finally {
    server.close();
    console.log('✅ Express test server cleanly closed.');
  }
}

testBackendServer();
