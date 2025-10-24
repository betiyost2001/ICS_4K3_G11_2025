import { Controller, Post, Body, HttpCode } from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {
  @Post('mercadopago')
  @HttpCode(200)
  async handleMercadoPagoWebhook(@Body() body: any) {
    return { status: 'ok' };
  }
}