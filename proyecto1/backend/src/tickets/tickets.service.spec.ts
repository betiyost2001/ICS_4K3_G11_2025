import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTicketDto, PassType, PaymentMethod } from './dto/create-ticket.dto';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let mockMercadoPagoService: jest.Mocked<MercadoPagoService>;

  beforeEach(async () => {
    const mockMercadoPago = {
      createPaymentPreference: jest.fn().mockResolvedValue({
        id: 'test-preference-id',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=test',
        sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=test'
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: MercadoPagoService, useValue: mockMercadoPago }
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    mockMercadoPagoService = module.get(MercadoPagoService);
  });

  describe('validateTicketPurchase', () => {
    it('should pass with valid data', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dto: CreateTicketDto = {
        visitDate: tomorrow.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).not.toThrow();
    });

    it('should fail when quantity exceeds 10', () => {
      const dto: CreateTicketDto = {
        visitDate: '2024-12-25',
        quantity: 11,
        visitors: Array(11).fill({ age: 25, passType: PassType.REGULAR }),
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should fail when visit date is in the past', () => {
      const dto: CreateTicketDto = {
        visitDate: '2020-01-01',
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should fail when park is closed on Mondays', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Next week
      while (futureDate.getDay() !== 1) { // Find next Monday
        futureDate.setDate(futureDate.getDate() + 1);
      }
      
      const dto: CreateTicketDto = {
        visitDate: futureDate.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should fail when park is closed on Christmas (Dec 25)', () => {
      const dto: CreateTicketDto = {
        visitDate: '2025-12-25', // Future Christmas
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should fail when park is closed on New Year (Jan 1)', () => {
      const dto: CreateTicketDto = {
        visitDate: '2026-01-01', // Future New Year
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should fail when visitor has negative age', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dto: CreateTicketDto = {
        visitDate: tomorrow.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: -5, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should fail when visitor age exceeds 100', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dto: CreateTicketDto = {
        visitDate: tomorrow.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 150, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('should pass on Tuesday (park open)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Next week
      while (futureDate.getDay() !== 2) { // Find next Tuesday
        futureDate.setDate(futureDate.getDate() + 1);
      }
      
      const dto: CreateTicketDto = {
        visitDate: futureDate.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).not.toThrow();
    });

    it('should pass on Sunday (park open)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); 
      while (futureDate.getDay() !== 0) { 
        futureDate.setDate(futureDate.getDate() + 1);
      }
      
      const dto: CreateTicketDto = {
        visitDate: futureDate.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).not.toThrow();
    });
  });

  describe('calculateTicketPricing', () => {
    it('should calculate full price for adults (16-59 years)', () => {
      const pricing = service.calculateTicketPricing(25, PassType.REGULAR);
      expect(pricing.basePrice).toBe(5000);
      expect(pricing.finalPrice).toBe(5000);
      expect(pricing.discount).toBe(0);
    });

    it('should calculate VIP full price for adults', () => {
      const pricing = service.calculateTicketPricing(30, PassType.VIP);
      expect(pricing.basePrice).toBe(10000);
      expect(pricing.finalPrice).toBe(10000);
      expect(pricing.discount).toBe(0);
    });

    it('should be free for children 3 years or younger', () => {
      const pricing = service.calculateTicketPricing(3, PassType.REGULAR);
      expect(pricing.basePrice).toBe(5000);
      expect(pricing.finalPrice).toBe(0);
      expect(pricing.discount).toBe(100);
      expect(pricing.discountReason).toBe('Gratis (3 años o menos)');
    });

    it('should be 50% off for children 4-15 years', () => {
      const pricing = service.calculateTicketPricing(10, PassType.REGULAR);
      expect(pricing.basePrice).toBe(5000);
      expect(pricing.finalPrice).toBe(2500);
      expect(pricing.discount).toBe(50);
      expect(pricing.discountReason).toBe('50% descuento (4-15 años)');
    });

    it('should be 50% off for seniors 60+ years', () => {
      const pricing = service.calculateTicketPricing(65, PassType.VIP);
      expect(pricing.basePrice).toBe(10000);
      expect(pricing.finalPrice).toBe(5000);
      expect(pricing.discount).toBe(50);
      expect(pricing.discountReason).toBe('50% descuento (60+ años)');
    });
  });

  describe('calculateTicketSummary', () => {
    it('should calculate total for mixed ages and pass types', () => {
      const dto: CreateTicketDto = {
        visitDate: '2024-12-25',
        quantity: 4,
        visitors: [
          { age: 2, passType: PassType.REGULAR },  // Free
          { age: 8, passType: PassType.VIP },      // 50% off VIP
          { age: 30, passType: PassType.REGULAR }, // Full price Regular
          { age: 65, passType: PassType.VIP }      // 50% off VIP
        ],
        paymentMethod: PaymentMethod.CASH
      };

      const summary = service.calculateTicketSummary(dto);
      expect(summary.totalTickets).toBe(4);
      expect(summary.totalAmount).toBe(0 + 5000 + 5000 + 5000); // 15000
      expect(summary.ticketDetails).toHaveLength(4);
    });
  });

  describe('createTicket', () => {
    it('should create ticket with pricing summary', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dto: CreateTicketDto = {
        visitDate: tomorrow.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      const result = await service.createTicket(dto, 'user123');

      expect(result.ticket).toBeDefined();
      expect(result.ticket.ticketSummary).toBeDefined();
      expect(result.ticket.ticketSummary.totalAmount).toBe(15000); // Regular + VIP
      expect(result.paymentUrl).toContain('mercadopago.com');
    });

    it('should create ticket without payment URL for cash payment', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dto: CreateTicketDto = {
        visitDate: tomorrow.toISOString().split('T')[0],
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CASH
      };

      const result = await service.createTicket(dto, 'user123');

      expect(result.ticket).toBeDefined();
      expect(result.paymentUrl).toBeNull();
      expect(mockMercadoPagoService.createPaymentPreference).not.toHaveBeenCalled();
    });
  });
});