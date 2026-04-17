import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HandshakeDocument = Handshake & Document;


@Schema({ timestamps: true })
export class Handshake {
  @Prop({ required: true })
  candidateId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  reply: string;
}

export const HandshakeSchema = SchemaFactory.createForClass(Handshake);


HandshakeSchema.index({ candidateId: 1 });
