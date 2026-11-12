const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

const startServer = async () => {
  try {
    // Connect to MySQL (XAMPP)
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 RetailMind AI Backend Server Online`);
      console.log(`📡 Port: ${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`🔗 API Base: http://localhost:${config.port}/api`);
      console.log(`🩺 Health Check: http://localhost:${config.port}/api/health`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const handleShutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
