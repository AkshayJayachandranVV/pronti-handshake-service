import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'handshake',
      protoPath: join(__dirname, 'proto/handshake.proto'),
      url: '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`GraphQL ready at http://localhost:${port}/graphql`);
  logger.log(`gRPC listening on :50051`);
}

bootstrap();
