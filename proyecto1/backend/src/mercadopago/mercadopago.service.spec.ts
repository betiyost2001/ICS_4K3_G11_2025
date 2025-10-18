import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from './mercadopago.service';

// Mock de MercadoPago
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
  let service: MercadoPagoService;

  beforeEach(async () => {
    process.env.MP_ACCESS_TOKEN = 'test-token';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadoPagoService],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
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

    // Verificamos que el mock sea llamado con los parámetros correctos
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