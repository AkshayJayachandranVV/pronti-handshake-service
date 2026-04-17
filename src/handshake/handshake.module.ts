import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Handshake, HandshakeSchema } from './handshake.schema';
import { HandshakeService } from './handshake.service';
import { HandshakeResolver } from '../graphql/handshake.resolver';
import { HandshakeGrpcController } from '../grpc/handshake.grpc.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Handshake.name, schema: HandshakeSchema },
    ]),
  ],
  providers: [HandshakeService, HandshakeResolver],
  controllers: [HandshakeGrpcController],
  exports: [HandshakeService],
})
export class HandshakeModule { }
