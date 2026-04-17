import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Handshake, HandshakeDocument } from './handshake.schema';

export interface HandshakeDto {
  candidateId: string;
  message: string;
  persist: boolean;
}

export interface HandshakeResult {
  success: boolean;
  reply: string;
  persisted: boolean;
  timestamp: string;
}

@Injectable()
export class HandshakeService {
  private readonly logger = new Logger(HandshakeService.name);

  constructor(
    @InjectModel(Handshake.name)
    private readonly handshakeModel: Model<HandshakeDocument>,
  ) { }

  async processHandshake(dto: HandshakeDto): Promise<HandshakeResult> {
    const { candidateId, message, persist } = dto;


    const reply = `Hey ${candidateId}, got your message: "${message}". Handshake complete.`;
    const timestamp = new Date().toISOString();

    let persisted = false;

    if (persist) {
      try {
        await this.handshakeModel.create({ candidateId, message, reply });
        persisted = true;
        this.logger.log(`Saved handshake for candidate: ${candidateId}`);
      } catch (err) {
        this.logger.error(`Failed to persist handshake for ${candidateId}`, err);
      }
    }

    return { success: true, reply, persisted, timestamp };
  }
}
