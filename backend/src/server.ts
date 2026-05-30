import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { initSocket } from './socket';

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    // Check DB connection
    await prisma.$connect();
    console.log('✅ Database connected');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    console.log('Database disconnected');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
