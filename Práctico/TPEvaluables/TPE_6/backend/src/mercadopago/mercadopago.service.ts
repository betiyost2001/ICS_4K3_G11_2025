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
      default_payment_method_id: 'credit_card',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [
          {id: 'debit_card'},
            {id: 'ticket'},
            {id: 'bank_transfer'},
            {id: 'atm'},
            {id: 'prepaid_card'}
        ],
        installments: 12
      },
      back_urls: {
        success: 'www.localhost:3000/payment-success-page',
        failure: 'www.localhost:3000/payment-failure-page',
        pending: 'www.localhost:3000/payment-pending-page',
      },
      auto_return: 'approved',
      external_reference: ticketData.reservationCode,
      notification_url: 'www.localhost:3001/webhooks/mercadopago',
      metadata: {
        ticket_details: JSON.stringify(ticketData.ticketDetails || [])
      }
    };

    const response = await this.preference.create({ body: preferenceData });
    return response;
  }
}