const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/retailmind_ai',
  jwtSecret: process.env.JWT_SECRET || 'retailmind_jwt_super_secret_key_2026_production_grade',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  otpDevAutoVerify: process.env.OTP_DEV_AUTO_VERIFY === 'true',
  whatsappApiEnabled: process.env.WHATSAPP_API_ENABLED === 'true',
  whatsappApiKey: process.env.WHATSAPP_API_KEY || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
};

module.exports = config;