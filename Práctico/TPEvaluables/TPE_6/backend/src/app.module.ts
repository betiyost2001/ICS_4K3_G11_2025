import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { EmailService } from './email/email.service';
import { MercadoPagoService } from './mercadopago/mercadopago.service';
import { WebhooksController } from './mercadopago/webhooks.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TicketsController, WebhooksController],
  providers: [TicketsService, EmailService, MercadoPagoService],
})
export class AppModule {}