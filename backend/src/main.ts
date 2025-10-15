import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

/**
 * Bootstrap function
 * 
 * Initializes the NestJS application with production-ready configurations:
 * - Global validation pipes for request validation
 * - CORS enabled for frontend integration
 * - Environment-based port configuration
 * - Comprehensive error handling
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Enable global validation pipes
  // Automatically validates DTOs using class-validator decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not defined in DTO
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable type conversion
      },
    }),
  );

  // Enable CORS for frontend integration
  // Allows requests from Next.js frontend running on port 3001
  app.enableCors({
    origin: [
      'http://localhost:3001', // Next.js frontend
      'http://localhost:3000', // Alternative frontend port
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and authorization headers
  });

  // Get port from environment variables
  // Defaults to 3000 if PORT is not set
  let port = configService.get<number>('PORT') || 3000;
  
  // Start the application with automatic port shifting
  try {
    await app.listen(port);
    console.log(`User Dashboard Management System API running on port ${port}`);
    console.log(`API Documentation: http://localhost:${port}/api`);
    console.log(`Crypto keys directory: ${process.cwd()}/keys`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
      port = port + 1;
      await app.listen(port);
      console.log(`User Dashboard Management System API running on port ${port}`);
      console.log(`API Documentation: http://localhost:${port}/api`);
      console.log(`Crypto keys directory: ${process.cwd()}/keys`);
    } else {
      throw error;
    }
  }
}

// Start the application
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});