import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

/**
 * DTO for creating a new user
 * Validates input data for user creation endpoint
 */
export class CreateUserDto {
  /**
   * User's email address
   * Must be a valid email format and unique
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  /**
   * User's role in the system
   * Optional, defaults to 'user' if not provided
   */
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either admin or user' })
  role?: UserRole;

  /**
   * User's account status
   * Optional, defaults to 'active' if not provided
   */
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be either active or inactive' })
  status?: UserStatus;
}

/**
 * DTO for updating an existing user
 * All fields are optional for partial updates
 */
export class UpdateUserDto {
  /**
   * User's email address
   * Must be a valid email format and unique
   */
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  /**
   * User's role in the system
   */
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either admin or user' })
  role?: UserRole;

  /**
   * User's account status
   */
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be either active or inactive' })
  status?: UserStatus;
}

/**
 * Response DTO for user data
 * Excludes sensitive cryptographic data from API responses
 */
export class UserResponseDto {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  emailHash: string;
  signature: string;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.createdAt = user.createdAt;
    this.emailHash = user.emailHash;
    this.signature = user.signature;
  }
}

/**
 * Response DTO for analytics data
 */
export class AnalyticsResponseDto {
  date: string;
  count: number;
}

/**
 * Response DTO for user statistics
 */
export class UserStatsResponseDto {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}
