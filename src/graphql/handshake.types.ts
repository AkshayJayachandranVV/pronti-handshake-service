import { ObjectType, Field } from '@nestjs/graphql';


@ObjectType()
export class HandshakeResponseType {
  @Field()
  success: boolean;

  @Field()
  reply: string;

  @Field()
  persisted: boolean;

  @Field()
  timestamp: string;
}
