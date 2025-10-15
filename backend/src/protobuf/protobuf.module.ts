import { Module } from '@nestjs/common';
import { ProtobufService } from './protobuf.service';

/**
 * ProtobufModule
 * 
 * Provides Protocol Buffers serialization services for the application.
 * Exports ProtobufService for use in other modules.
 */
@Module({
  providers: [ProtobufService],
  exports: [ProtobufService],
})
export class ProtobufModule {}
