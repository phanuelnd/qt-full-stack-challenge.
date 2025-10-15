import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createHash, generateKeyPairSync, sign, constants } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * CryptoService
 * 
 * Handles cryptographic operations for the application:
 * - Generates RSA keypair on startup
 * - Hashes emails using SHA-384
 * - Creates digital signatures for data integrity
 * - Manages key storage and retrieval
 * 
 * Security Features:
 * - Uses RSA-2048 for digital signatures
 * - SHA-384 for email hashing (stronger than SHA-256)
 * - Keys stored in PEM format for portability
 * - Automatic key generation if keys don't exist
 */
@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private privateKey: Buffer;
  private publicKey: Buffer;
  private readonly keysDir = join(process.cwd(), 'keys');
  private readonly privateKeyPath = join(this.keysDir, 'private.pem');
  private readonly publicKeyPath = join(this.keysDir, 'public.pem');

  /**
   * Initialize the crypto service
   * Generates or loads RSA keypair on module initialization
   */
  async onModuleInit() {
    await this.initializeKeys();
  }

  /**
   * Initialize RSA keypair
   * Generates new keys if they don't exist, otherwise loads existing keys
   */
  private async initializeKeys(): Promise<void> {
    try {
      // Create keys directory if it doesn't exist
      if (!existsSync(this.keysDir)) {
        mkdirSync(this.keysDir, { recursive: true });
        this.logger.log(`Created keys directory: ${this.keysDir}`);
      }

      // Check if keys already exist
      if (existsSync(this.privateKeyPath) && existsSync(this.publicKeyPath)) {
        this.logger.log('Loading existing RSA keypair...');
        this.privateKey = readFileSync(this.privateKeyPath);
        this.publicKey = readFileSync(this.publicKeyPath);
        this.logger.log('RSA keypair loaded successfully');
      } else {
        this.logger.log('Generating new RSA keypair...');
        await this.generateKeyPair();
        this.logger.log('RSA keypair generated and saved successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize keys:', error);
      throw new Error('Crypto service initialization failed');
    }
  }

  /**
   * Generate new RSA keypair and save to files
   * Uses RSA-2048 for strong security
   */
  private async generateKeyPair(): Promise<void> {
    try {
      // Generate RSA-2048 keypair
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      // Save keys to files
      writeFileSync(this.privateKeyPath, privateKey);
      writeFileSync(this.publicKeyPath, publicKey);

      // Store keys in memory
      this.privateKey = Buffer.from(privateKey);
      this.publicKey = Buffer.from(publicKey);
    } catch (error) {
      this.logger.error('Failed to generate keypair:', error);
      throw new Error('Key generation failed');
    }
  }

  /**
   * Hash email using SHA-384
   * 
   * SHA-384 provides stronger security than SHA-256 while being
   * more efficient than SHA-512. The hash is deterministic and
   * irreversible, providing privacy protection for email addresses.
   * 
   * @param email - The email address to hash
   * @returns SHA-384 hash as hexadecimal string (96 characters)
   */
  hashEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Email must be a non-empty string');
    }

    // Normalize email (lowercase, trim whitespace)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Create SHA-384 hash
    const hash = createHash('sha384');
    hash.update(normalizedEmail, 'utf8');
    
    return hash.digest('hex');
  }

  /**
   * Sign a hash using RSA private key
   * 
   * Creates a digital signature that can be verified using the public key.
   * The signature proves that the hash was created by someone with access
   * to the private key, ensuring data integrity and authenticity.
   * 
   * @param hash - The hash to sign (typically emailHash)
   * @returns Base64-encoded digital signature
   */
  signHash(hash: string): string {
    if (!hash || typeof hash !== 'string') {
      throw new Error('Hash must be a non-empty string');
    }

    if (!this.privateKey) {
      throw new Error('Private key not initialized');
    }

    try {
      // Create signature using RSA-SHA256
      const signature = sign('RSA-SHA256', Buffer.from(hash, 'utf8'), {
        key: this.privateKey,
        padding: constants.RSA_PKCS1_PADDING,
      });

      // Return base64-encoded signature
      return signature.toString('base64');
    } catch (error) {
      this.logger.error('Failed to sign hash:', error);
      throw new Error('Signature creation failed');
    }
  }

  /**
   * Get the public key for signature verification
   * 
   * Returns the PEM-formatted public key that can be used by clients
   * to verify digital signatures created by this service.
   * 
   * @returns PEM-formatted public key
   */
  getPublicKey(): string {
    if (!this.publicKey) {
      throw new Error('Public key not initialized');
    }

    return this.publicKey.toString('utf8');
  }

  /**
   * Verify a signature against a hash
   * 
   * This method can be used for internal verification or testing.
   * In production, signature verification should typically be done
   * on the client side using the public key.
   * 
   * @param hash - The original hash
   * @param signature - The signature to verify (base64-encoded)
   * @returns True if signature is valid, false otherwise
   */
  verifySignature(hash: string, signature: string): boolean {
    try {
      const { verify } = require('crypto');
      return verify(
        'RSA-SHA256',
        Buffer.from(hash, 'utf8'),
        this.publicKey,
        Buffer.from(signature, 'base64')
      );
    } catch (error) {
      this.logger.error('Signature verification failed:', error);
      return false;
    }
  }
}
