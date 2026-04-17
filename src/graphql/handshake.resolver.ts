import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { HandshakeService } from '../handshake/handshake.service';
import { HandshakeResponseType } from './handshake.types';


@Resolver()
export class HandshakeResolver {
  constructor(private readonly handshakeService: HandshakeService) { }

  @Query(() => String)
  ping(): string {
    return 'pong';
  }

  @Mutation(() => HandshakeResponseType)
  async takeHomeHandshake(
    @Args('candidateId') candidateId: string,
    @Args('message') message: string,
    @Args('persist', { defaultValue: false }) persist: boolean,
  ): Promise<HandshakeResponseType> {
    return this.handshakeService.processHandshake({ candidateId, message, persist });
  }
}
