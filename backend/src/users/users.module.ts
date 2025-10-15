import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CryptoModule } from '../crypto/crypto.module';

/**
 * UsersModule
 * 
 * Provides user management functionality including:
 * - User entity and repository
 * - User service with CRUD operations
 * - User controller with REST endpoints
 * - Integration with crypto services
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CryptoModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
