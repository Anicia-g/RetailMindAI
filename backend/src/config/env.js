const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  db: {
    host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'retailmind_ai',
    port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
    ssl: process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true',
  },
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