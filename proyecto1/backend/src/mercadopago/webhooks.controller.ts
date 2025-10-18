import { Controller, Post, Body, HttpCode } from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {
  @Post('mercadopago')
  @HttpCode(200)
  async handleMercadoPagoWebhook(@Body() body: any) {
    console.log('Webhook recibido de Mercado Pago:', body);
    
    // Aquí procesarías la notificación de pago
    // Por ejemplo, actualizar el estado del ticket en la base de datos
    
    return { status: 'ok' };
  }
}