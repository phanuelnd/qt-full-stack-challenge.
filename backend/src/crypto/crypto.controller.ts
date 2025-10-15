import { Controller, Get, Header } from '@nestjs/common';
import { CryptoService } from './crypto.service';

/**
 * CryptoController
 *
 * Exposes cryptographic utilities for clients.
 * - GET /crypto/public-key → returns PEM-formatted public key for signature verification
 */
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  /**
   * Returns the PEM-formatted public key.
   * Clients can use this key with Web Crypto API to verify signatures.
   */
  @Get('public-key')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  getPublicKey(): string {
    return this.cryptoService.getPublicKey();
  }
}


