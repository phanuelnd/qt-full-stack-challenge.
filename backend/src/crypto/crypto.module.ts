import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';

/**
 * CryptoModule
 * 
 * Provides cryptographic services to the application.
 * Exports CryptoService for use in other modules.
 */
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
