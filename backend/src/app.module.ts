import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CryptoModule } from './crypto/crypto.module';
import { User } from './users/entities/user.entity';

/**
 * AppModule
 * 
 * Root module of the NestJS application.
 * Configures global services, database connections, and feature modules.
 * 
 * Features:
 * - Global configuration management
 * - SQLite database with TypeORM
 * - User management module
 * - Cryptographic services module
 * - CORS enabled for frontend integration
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database configuration with TypeORM and SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [User],
      synchronize: true, // Auto-create tables
      logging: true, // Set to true for SQL query logging
    }),
    
    // Feature modules
    UsersModule,
    CryptoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
