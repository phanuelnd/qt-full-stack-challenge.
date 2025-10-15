import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // --- Global Validation ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // --- Enable CORS for Frontend Integration ---
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // --- Determine initial port ---
  let port = configService.get<number>('PORT') || 3000;

  const startServer = async (portToTry: number) => {
    try {
      await app.listen(portToTry);
      console.log(`Server running on port ${portToTry}`);
      console.log(`API Docs: http://localhost:${portToTry}/api`);
      console.log(`Crypto keys: ${process.cwd()}/keys`);
    } catch (error: any) {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, retrying with ${port + 1}...`);
        port = Number(port) + 1; // ensure numeric increment
        await startServer(port);
      } else {
        console.error('Failed to start server:', error);
        process.exit(1);
      }
    }
  };

  await startServer(port);
}

bootstrap().catch((err) => {
  console.error('Application bootstrap failed:', err);
  process.exit(1);
});