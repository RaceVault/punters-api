import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedactingLogger } from './logger/redacting.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new RedactingLogger(),
  });
  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
