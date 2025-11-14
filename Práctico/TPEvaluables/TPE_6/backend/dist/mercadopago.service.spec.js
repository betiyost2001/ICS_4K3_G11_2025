"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const mercadopago_service_1 = require("./mercadopago.service");
jest.mock('mercadopago', () => ({
    MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
    Preference: jest.fn().mockImplementation(() => ({
        create: jest.fn().mockResolvedValue({
            id: 'test-preference-id',
            init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=test-preference-id',
            sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=test-preference-id'
        })
    }))
}));
describe('MercadoPagoService', () => {
    let service;
    beforeEach(async () => {
        process.env.MP_ACCESS_TOKEN = 'test-token';
        const module = await testing_1.Test.createTestingModule({
            providers: [mercadopago_service_1.MercadoPagoService],
        }).compile();
        service = module.get(mercadopago_service_1.MercadoPagoService);
    });
    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });
    it('debe crear preferencia de pago para entrada regular', async () => {
        const ticketData = {
            quantity: 2,
            passType: 'regular',
            reservationCode: 'RES-TEST123'
        };
        const result = await service.createPaymentPreference(ticketData);
        expect(result).toBeDefined();
        expect(result.id).toBe('test-preference-id');
        expect(result.init_point).toContain('mercadopago.com');
    });
    it('debe crear preferencia de pago para entrada VIP con precio correcto', async () => {
        const ticketData = {
            quantity: 1,
            passType: 'vip',
            reservationCode: 'RES-VIP123'
        };
        const result = await service.createPaymentPreference(ticketData);
        expect(result).toBeDefined();
        expect(result.id).toBe('test-preference-id');
    });
    it('debe incluir URLs de retorno correctas', async () => {
        const ticketData = {
            quantity: 1,
            passType: 'regular',
            reservationCode: 'RES-TEST123'
        };
        const mockCreate = jest.fn().mockResolvedValue({
            id: 'test-preference-id',
            init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=test-preference-id'
        });
        service['preference'].create = mockCreate;
        await service.createPaymentPreference(ticketData);
        expect(mockCreate).toHaveBeenCalledWith({
            body: expect.objectContaining({
                back_urls: {
                    success: 'http://localhost:3000/payment-success-page',
                    failure: 'http://localhost:3000/payment-failure-page',
                    pending: 'http://localhost:3000/payment-pending-page',
                }
            })
        });
    });
});
//# sourceMappingURL=mercadopago.service.spec.js.map