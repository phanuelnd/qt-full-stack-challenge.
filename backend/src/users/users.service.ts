import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CryptoService } from '../crypto/crypto.service';

/**
 * Interface for user creation data
 */
export interface CreateUserDto {
  email: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Interface for user update data
 */
export interface UpdateUserDto {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Interface for analytics data
 */
export interface UserAnalytics {
  date: string;
  count: number;
}

/**
 * UsersService
 * 
 * Provides comprehensive user management functionality including:
 * - CRUD operations with cryptographic security
 * - Email hashing and digital signing
 * - Analytics and reporting
 * - Data integrity validation
 * 
 * Security Features:
 * - Automatic email hashing using SHA-384
 * - Digital signature generation for each user
 * - Email uniqueness validation
 * - Secure update operations with re-signing
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Create a new user with cryptographic security
   * 
   * Automatically hashes the email using SHA-384 and creates a digital signature.
   * Validates email uniqueness before creation.
   * 
   * @param email - User's email address
   * @param role - User role (defaults to 'user')
   * @param status - User status (defaults to 'active')
   * @returns Created user entity
   * @throws ConflictException if email already exists
   */
  async create(email: string, role: UserRole = UserRole.USER, status: UserStatus = UserStatus.ACTIVE): Promise<User> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException(`User with email ${email} already exists`);
      }

      // Generate cryptographic data
      const emailHash = this.cryptoService.hashEmail(email);
      const signature = this.cryptoService.signHash(emailHash);

      // Create user entity
      const user = this.userRepository.create({
        email,
        role,
        status,
        emailHash,
        signature,
      });

      // Save to database
      const savedUser = await this.userRepository.save(user);
      
      this.logger.log(`User created successfully: ${savedUser.email} (ID: ${savedUser.id})`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user ${email}:`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve all users from the database
   * 
   * @returns Array of all user entities
   */
  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        order: { createdAt: 'DESC' },
      });
      
      this.logger.log(`Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error('Failed to retrieve users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Find a single user by ID
   * 
   * @param id - User ID
   * @returns User entity
   * @throws NotFoundException if user doesn't exist
   */
  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to find user ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`User lookup failed: ${error.message}`);
    }
  }

  /**
   * Update user data with cryptographic re-signing
   * 
   * If email is changed, automatically rehashes and re-signs the user data.
   * Validates email uniqueness for email updates.
   * 
   * @param id - User ID
   * @param updateData - Partial user data to update
   * @returns Updated user entity
   * @throws NotFoundException if user doesn't exist
   * @throws ConflictException if new email already exists
   */
  async update(id: number, updateData: UpdateUserDto): Promise<User> {
    try {
      // Find existing user
      const user = await this.findOne(id);

      // Check if email is being updated
      if (updateData.email && updateData.email !== user.email) {
        // Validate new email format
        if (!this.isValidEmail(updateData.email)) {
          throw new Error('Invalid email format');
        }

        // Check if new email already exists
        const existingUser = await this.userRepository.findOne({ 
          where: { email: updateData.email } 
        });
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException(`User with email ${updateData.email} already exists`);
        }

        // Rehash and re-sign for new email
        const newEmailHash = this.cryptoService.hashEmail(updateData.email);
        const newSignature = this.cryptoService.signHash(newEmailHash);

        updateData = {
          ...updateData,
          emailHash: newEmailHash,
          signature: newSignature,
        } as any;
      }

      // Update user data
      await this.userRepository.update(id, updateData);
      
      // Return updated user
      const updatedUser = await this.findOne(id);
      this.logger.log(`User updated successfully: ${updatedUser.email} (ID: ${id})`);
      
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user ${id}:`, error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`User update failed: ${error.message}`);
    }
  }

  /**
   * Remove a user from the database
   * 
   * @param id - User ID
   * @throws NotFoundException if user doesn't exist
   */
  async remove(id: number): Promise<void> {
    try {
      // Verify user exists
      await this.findOne(id);

      // Delete user
      await this.userRepository.delete(id);
      
      this.logger.log(`User deleted successfully (ID: ${id})`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }

  /**
   * Get user creation analytics for the last 7 days
   * 
   * Returns aggregated data showing how many users were created each day
   * for the past week. Useful for dashboard charts and analytics.
   * 
   * @returns Array of daily user creation counts
   */
  async getUsersCreatedPerDay(): Promise<UserAnalytics[]> {
    try {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Query for users created in the last 7 days
      const result = await this.userRepository
        .createQueryBuilder('user')
        .select('DATE(user.createdAt)', 'date')
        .addSelect('COUNT(user.id)', 'count')
        .where('user.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .groupBy('DATE(user.createdAt)')
        .orderBy('DATE(user.createdAt)', 'ASC')
        .getRawMany();

      // Format results
      const analytics: UserAnalytics[] = result.map(row => ({
        date: row.date,
        count: parseInt(row.count, 10),
      }));

      // Fill in missing days with zero counts
      const filledAnalytics = this.fillMissingDays(analytics);

      this.logger.log(`Retrieved user analytics for ${filledAnalytics.length} days`);
      return filledAnalytics;
    } catch (error) {
      this.logger.error('Failed to retrieve user analytics:', error);
      throw new Error('Analytics retrieval failed');
    }
  }

  /**
   * Fill in missing days with zero counts
   * 
   * Ensures we have data for all 7 days, even if no users were created
   * on certain days.
   * 
   * @param analytics - Partial analytics data
   * @returns Complete analytics data with all 7 days
   */
  private fillMissingDays(analytics: UserAnalytics[]): UserAnalytics[] {
    const result: UserAnalytics[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const existingData = analytics.find(a => a.date === dateString);
      result.push({
        date: dateString,
        count: existingData ? existingData.count : 0,
      });
    }

    return result;
  }

  /**
   * Validate email format using regex
   * 
   * @param email - Email to validate
   * @returns True if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user statistics summary
   * 
   * @returns Object containing total users, active users, and admin count
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
  }> {
    try {
      const [totalUsers, activeUsers, adminUsers] = await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
        this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      ]);

      return {
        totalUsers,
        activeUsers,
        adminUsers,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve user stats:', error);
      throw new Error('Statistics retrieval failed');
    }
  }
}
