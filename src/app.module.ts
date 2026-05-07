import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BetsModule } from './bets/bets.module';
import { WalletModule } from './wallet/wallet.module';
import { OddsModule } from './odds/odds.module';

@Module({
  imports: [AuthModule, UsersModule, EventsModule, BetsModule, WalletModule, OddsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
