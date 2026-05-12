import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedactingLogger } from './logger/redacting.logger';

async function bootstrap() {
  const logger = new RedactingLogger();
  const app = await NestFactory.create(AppModule, { logger });
  app.set('trust proxy', true);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
