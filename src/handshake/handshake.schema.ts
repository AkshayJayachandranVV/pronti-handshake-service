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

// Index on candidateId so we can query "all handshakes for candidate X" efficiently.
// Should be relatively low-cardinality in prod, but still worth having.
HandshakeSchema.index({ candidateId: 1 });
