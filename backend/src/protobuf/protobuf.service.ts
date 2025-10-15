import { Injectable, Logger } from '@nestjs/common';
import * as protobuf from 'protobufjs';
import { User } from '../users/entities/user.entity';

/**
 * Interface for protobuf User message
 * Maps to the User message defined in user.proto
 */
export interface ProtobufUser {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  emailHash: string;
  signature: string;
}

/**
 * Interface for protobuf UsersExport message
 * Contains array of users and export metadata
 */
export interface ProtobufUsersExport {
  users: ProtobufUser[];
  exportedAt: string;
  totalCount: number;
}

/**
 * ProtobufService
 * 
 * Handles Protocol Buffers serialization for user data export.
 * Provides methods to encode user entities into protobuf format
 * for efficient data transfer and frontend verification.
 * 
 * Features:
 * - Loads protobuf schema from user.proto file
 * - Converts TypeORM User entities to protobuf format
 * - Serializes data to binary format for transmission
 * - Includes all cryptographic fields for verification
 */
@Injectable()
export class ProtobufService {
  private readonly logger = new Logger(ProtobufService.name);
  private root: protobuf.Root | null = null;
  private UserMessage: protobuf.Type | null = null;
  private UsersExportMessage: protobuf.Type | null = null;

  /**
   * Initialize the protobuf service
   * Loads the proto schema and prepares message types
   */
  async initialize(): Promise<void> {
    try {
      // Load the protobuf schema
      this.root = await protobuf.load(process.cwd() + '/proto/user.proto');
      
      // Get message types
      this.UserMessage = this.root.lookupType('userdashboard.User');
      this.UsersExportMessage = this.root.lookupType('userdashboard.UsersExport');
      
      this.logger.log('Protobuf schema loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load protobuf schema:', error);
      throw new Error('Protobuf initialization failed');
    }
  }

  /**
   * Convert TypeORM User entity to protobuf User message
   * 
   * @param user - TypeORM User entity
   * @returns Protobuf User message
   */
  private convertUserToProtobuf(user: User): ProtobufUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      emailHash: user.emailHash,
      signature: user.signature,
    };
  }

  /**
   * Encode users to protobuf binary format
   * 
   * @param users - Array of TypeORM User entities
   * @returns Buffer containing serialized protobuf data
   */
  async encodeUsers(users: User[]): Promise<Buffer> {
    if (!this.UserMessage || !this.UsersExportMessage) {
      await this.initialize();
    }

    try {
      // Convert users to protobuf format
      const protobufUsers: ProtobufUser[] = users.map(user => 
        this.convertUserToProtobuf(user)
      );

      // Create export message
      const exportMessage: ProtobufUsersExport = {
        users: protobufUsers,
        exportedAt: new Date().toISOString(),
        totalCount: users.length,
      };

      // Encode to binary
      const message = this.UsersExportMessage!.create(exportMessage);
      const buffer = this.UsersExportMessage!.encode(message).finish();

      this.logger.log(`Encoded ${users.length} users to protobuf format`);
      return Buffer.from(buffer);
    } catch (error) {
      this.logger.error('Failed to encode users to protobuf:', error);
      throw new Error('Protobuf encoding failed');
    }
  }

  /**
   * Decode protobuf binary data to users (for testing/verification)
   * 
   * @param buffer - Buffer containing serialized protobuf data
   * @returns Decoded users export data
   */
  async decodeUsers(buffer: Buffer): Promise<ProtobufUsersExport> {
    if (!this.UsersExportMessage) {
      await this.initialize();
    }

    try {
      const message = this.UsersExportMessage!.decode(buffer);
      const decoded = this.UsersExportMessage!.toObject(message) as ProtobufUsersExport;
      
      this.logger.log(`Decoded ${decoded.totalCount} users from protobuf format`);
      return decoded;
    } catch (error) {
      this.logger.error('Failed to decode protobuf data:', error);
      throw new Error('Protobuf decoding failed');
    }
  }

  /**
   * Get protobuf schema information
   * 
   * @returns Schema information for debugging
   */
  getSchemaInfo(): { userFields: string[], exportFields: string[] } {
    if (!this.UserMessage || !this.UsersExportMessage) {
      return { userFields: [], exportFields: [] };
    }

    return {
      userFields: Object.keys(this.UserMessage.fields),
      exportFields: Object.keys(this.UsersExportMessage.fields),
    };
  }
}
