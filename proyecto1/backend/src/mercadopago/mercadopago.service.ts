import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preference: Preference;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    this.preference = new Preference(this.client);
  }

  async createPaymentPreference(ticketData: any) {
    // Use the calculated total amount from the ticket summary
    const totalAmount = ticketData.totalAmount || 0;
    
    const preferenceData = {
      items: [
        {
          id: 'entradas-parque',
          title: `Entradas EcoHarmony Park (${ticketData.quantity} entradas)`,
          quantity: 1,
          unit_price: totalAmount,
          currency_id: 'ARS',
        },
      ],
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: 'http://localhost:3000/payment-success-page',
        failure: 'http://localhost:3000/payment-failure-page',
        pending: 'http://localhost:3000/payment-pending-page',
      },
      external_reference: ticketData.reservationCode,
      //notification_url: 'http://localhost:3001/webhooks/mercadopago',
      metadata: {
        ticket_details: JSON.stringify(ticketData.ticketDetails || [])
      }
    };

    const response = await this.preference.create({ body: preferenceData });
    return response;
  }
}