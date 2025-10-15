import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';

/**
 * CryptoModule
 * 
 * Provides cryptographic services to the application.
 * Exports CryptoService for use in other modules.
 */
@Module({
  providers: [CryptoService],
  controllers: [CryptoController],
  exports: [CryptoService],
})
export class CryptoModule {}
