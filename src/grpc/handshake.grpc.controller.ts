import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HandshakeService } from '../handshake/handshake.service';

@Controller()
export class HandshakeGrpcController {
  constructor(private readonly handshakeService: HandshakeService) { }

  @GrpcMethod('HandshakeService', 'takeHomeHandshake')
  async takeHomeHandshake(data: {
    candidateId: string;
    message: string;
    persist: boolean;
  }) {
    return this.handshakeService.processHandshake(data);
  }
}
