import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * User role enumeration
 * Defines the access level and permissions for users
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * User status enumeration
 * Tracks the current state of user accounts
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * User Entity
 * 
 * Represents a user in the system with cryptographic security features.
 * Each user's email is hashed using SHA-384 and digitally signed for verification.
 * 
 * Security Features:
 * - emailHash: SHA-384 hash of the email address for privacy
 * - signature: Digital signature of the emailHash for integrity verification
 */
@Entity('users')
export class User {
  /**
   * Primary key - auto-incrementing integer
   * Unique identifier for each user record
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User's email address
   * Must be unique across the system
   * Used for authentication and communication
   */
  @Column({ unique: true })
  @Index()
  email: string;

  /**
   * User's role in the system
   * Determines access permissions and capabilities
   * @see UserRole enum for valid values
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  /**
   * Current status of the user account
   * Controls whether the user can access the system
   * @see UserStatus enum for valid values
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  /**
   * Timestamp when the user was created
   * Automatically set when the record is inserted
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * SHA-384 hash of the user's email address
   * Provides privacy protection while maintaining uniqueness
   * Used for cryptographic verification without exposing the actual email
   */
  @Column({ type: 'varchar', length: 96 }) // SHA-384 produces 96 hex characters
  emailHash: string;

  /**
   * Digital signature of the emailHash
   * Generated using RSA/ECDSA private key
   * Enables verification of email integrity and authenticity
   * Stored as base64-encoded signature
   */
  @Column({ type: 'text' })
  signature: string;
}
