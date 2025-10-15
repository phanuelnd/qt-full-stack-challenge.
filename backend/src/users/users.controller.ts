import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { ProtobufService } from '../protobuf/protobuf.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  AnalyticsResponseDto,
  UserStatsResponseDto,
} from './dto/user.dto';

/**
 * UsersController
 * 
 * RESTful API controller for user management operations.
 * Provides endpoints for CRUD operations, analytics, and data export.
 * 
 * Security Features:
 * - Input validation using class-validator
 * - Proper HTTP status codes
 * - Error handling and logging
 * - Type-safe request/response handling
 * 
 * Endpoints:
 * - GET /users - Retrieve all users
 * - POST /users - Create new user
 * - PATCH /users/:id - Update user
 * - DELETE /users/:id - Delete user
 * - GET /users/stats/chart - Get user creation analytics
 * - GET /users/stats/summary - Get user statistics summary
 * - GET /users/export - Export users (placeholder for protobuf)
 */
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly protobufService: ProtobufService,
  ) {}

  /**
   * GET /users
   * 
   * Retrieve all users from the system.
   * Returns users ordered by creation date (newest first).
   * 
   * @returns Array of user response DTOs
   */
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Retrieving all users');
    
    const users = await this.usersService.findAll();
    return users.map(user => new UserResponseDto(user));
  }

  /**
   * POST /users
   * 
   * Create a new user with cryptographic security.
   * Automatically hashes email and creates digital signature.
   * 
   * @param createUserDto - User creation data
   * @returns Created user response DTO
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating new user: ${createUserDto.email}`);
    
    const user = await this.usersService.create(
      createUserDto.email,
      createUserDto.role,
      createUserDto.status,
    );
    
    return new UserResponseDto(user);
  }

  /**
   * PATCH /users/:id
   * 
   * Update an existing user's data.
   * If email is changed, automatically rehashes and re-signs.
   * 
   * @param id - User ID
   * @param updateUserDto - User update data
   * @returns Updated user response DTO
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);
    
    const user = await this.usersService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  /**
   * DELETE /users/:id
   * 
   * Remove a user from the system.
   * 
   * @param id - User ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);
    
    await this.usersService.remove(id);
  }

  /**
   * GET /users/stats/chart
   * 
   * Get user creation analytics for the last 7 days.
   * Returns data suitable for chart visualization.
   * 
   * @returns Array of analytics data points
   */
  @Get('stats/chart')
  async getUsersCreatedPerDay(): Promise<AnalyticsResponseDto[]> {
    this.logger.log('Retrieving user creation analytics');
    
    const analytics = await this.usersService.getUsersCreatedPerDay();
    return analytics.map(item => ({
      date: item.date,
      count: item.count,
    }));
  }

  /**
   * GET /users/stats/summary
   * 
   * Get user statistics summary including total, active, and admin counts.
   * Useful for dashboard overview widgets.
   * 
   * @returns User statistics summary
   */
  @Get('stats/summary')
  async getUserStats(): Promise<UserStatsResponseDto> {
    this.logger.log('Retrieving user statistics summary');
    
    const stats = await this.usersService.getUserStats();
    return {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      adminUsers: stats.adminUsers,
    };
  }

  /**
   * GET /users/export
   * 
   * Export users data in Protocol Buffers format.
   * Returns binary protobuf data containing all users with their
   * cryptographic security fields for frontend verification.
   * 
   * @param res - Express response object for binary data
   * @returns Binary protobuf data with application/octet-stream content type
   */
  @Get('export')
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment; filename="users_export.pb"')
  async exportUsers(@Res() res: Response): Promise<void> {
    this.logger.log('User export requested (protobuf format)');
    
    try {
      // Get all users from the database
      const users = await this.usersService.findAll();
      
      // Encode users to protobuf binary format
      const protobufData = await this.protobufService.encodeUsers(users);
      
      // Set response headers
      res.setHeader('Content-Length', protobufData.length);
      res.setHeader('X-Total-Count', users.length.toString());
      res.setHeader('X-Export-Date', new Date().toISOString());
      
      // Send binary data
      res.send(protobufData);
      
      this.logger.log(`Exported ${users.length} users in protobuf format`);
    } catch (error) {
      this.logger.error('Failed to export users:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Export failed',
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /users/:id
   * 
   * Retrieve a single user by ID.
   * 
   * @param id - User ID
   * @returns User response DTO
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    this.logger.log(`Retrieving user: ${id}`);
    
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }
}
