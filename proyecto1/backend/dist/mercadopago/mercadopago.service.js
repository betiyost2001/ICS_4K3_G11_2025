"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const common_1 = require("@nestjs/common");
const mercadopago_1 = require("mercadopago");
let MercadoPagoService = class MercadoPagoService {
    constructor() {
        this.client = new mercadopago_1.MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN,
        });
        this.preference = new mercadopago_1.Preference(this.client);
    }
    async createPaymentPreference(ticketData) {
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
                    { id: 'debit_card' },
                    { id: 'ticket' },
                    { id: 'bank_transfer' },
                    { id: 'atm' },
                    { id: 'prepaid_card' }
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
};
exports.MercadoPagoService = MercadoPagoService;
exports.MercadoPagoService = MercadoPagoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MercadoPagoService);
//# sourceMappingURL=mercadopago.service.js.map