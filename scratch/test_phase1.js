const mlClient = require('../backend/src/services/mlClientService');
const { connectDB, pool } = require('../backend/src/config/db');

async function testPhase1Connectivity() {
  console.log('=== PHASE 1 VALIDATION TEST ===');

  // 1. MySQL Local Connection Test
  console.log('\n[1] Testing MySQL Connection...');
  try {
    await connectDB();
    const [result] = await pool.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = ?', ['retailmind_ai']);
    console.log(`✅ MySQL query success: Found ${result[0].table_count} tables in database 'retailmind_ai'`);
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  }

  // 2. ML Service Health Check
  console.log('\n[2] Testing ML Service Health (HTTPS to https://retailmindai.onrender.com)...');
  try {
    const health = await mlClient.checkHealth();
    console.log('✅ ML Health Response:', JSON.stringify(health, null, 2));
  } catch (err) {
    console.error('❌ ML Health Failed:', err.message);
  }

  // 3. ML Customer Segmentation Predict
  console.log('\n[3] Testing ML Endpoint: Customer Segmentation (K-Means)...');
  try {
    const seg = await mlClient.predictCustomerSegment('cust-001', 5, 24, 45000);
    console.log('✅ ML Segmentation Response:', JSON.stringify(seg, null, 2));
  } catch (err) {
    console.error('❌ ML Segmentation Failed:', err.message);
  }

  // 4. ML Demand Forecasting Predict
  console.log('\n[4] Testing ML Endpoint: Demand Forecasting (ARIMA / Holt-Winters)...');
  try {
    const forecast = await mlClient.predictDemandForecast('prod-001', 'store-01', 7);
    console.log('✅ ML Forecasting Response:', JSON.stringify(forecast, null, 2));
  } catch (err) {
    console.error('❌ ML Forecasting Failed:', err.message);
  }

  // 5. ML Decision Tree Discount Predict
  console.log('\n[5] Testing ML Endpoint: Smart Discount (C4.5 / ID3)...');
  try {
    const discount = await mlClient.predictDiscount('prod-001', 30, 25, 2.0, 4, 'MONSOON', 'C4.5');
    console.log('✅ ML Discount Response:', JSON.stringify(discount, null, 2));
  } catch (err) {
    console.error('❌ ML Discount Failed:', err.message);
  }

  // 6. ML Model Performance Metrics
  console.log('\n[6] Testing ML Endpoint: Model Performance Metrics...');
  try {
    const perf = await mlClient.getModelPerformance();
    console.log('✅ ML Performance Metrics:', Object.keys(perf));
  } catch (err) {
    console.error('❌ ML Performance Metrics Failed:', err.message);
  }

  await pool.end();
  console.log('\n=== ALL PHASE 1 CONNECTIVITY TESTS COMPLETED ===');
}

testPhase1Connectivity();
