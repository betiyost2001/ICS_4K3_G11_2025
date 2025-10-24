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

  describe('Validar compra de boleto', () => {
    it('Debería pasar con datos válidos', () => {
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

    it('Debería fallar cuando la cantidad exceda 10', () => {
      const dto: CreateTicketDto = {
        visitDate: '2024-12-25',
        quantity: 11,
        visitors: Array(11).fill({ age: 25, passType: PassType.REGULAR }),
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('Debería fallar cuando la fecha de la visita ya es pasada', () => {
      const dto: CreateTicketDto = {
        visitDate: '2020-01-01',
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('Debería fallar cuando el parque esté cerrado los lunes.', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      while (futureDate.getDay() !== 1) {
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

    it('Debería fallar cuando el parque esté cerrado en Navidad (25 de diciembre)', () => {
      const dto: CreateTicketDto = {
        visitDate: '2025-12-25',
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('Debería fallar cuando el parque esté cerrado el día de Año Nuevo (1 de enero)', () => {
      const dto: CreateTicketDto = {
        visitDate: '2026-01-01',
        quantity: 2,
        visitors: [{ age: 25, passType: PassType.REGULAR }, { age: 30, passType: PassType.VIP }],
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      expect(() => service.validateTicketPurchase(dto)).toThrow(BadRequestException);
    });

    it('Debería fallar cuando el visitante tiene edad negativa', () => {
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

    it('Debería fallar cuando la edad del visitante supere los 100 años', () => {
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

    it('Debería pasar el martes (parque abierto)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      while (futureDate.getDay() !== 2) {
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

    it('Debería pasar el domingo (parque abierto)', () => {
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

  describe('Calcular precio de boleto', () => {
    it('Debería calcularse el precio completo para adultos (16-59 años)', () => {
      const pricing = service.calculateTicketPricing(25, PassType.REGULAR);
      expect(pricing.basePrice).toBe(5000);
      expect(pricing.finalPrice).toBe(5000);
      expect(pricing.discount).toBe(0);
    });

    it('Debería calcularse el precio completo VIP para adultos', () => {
      const pricing = service.calculateTicketPricing(30, PassType.VIP);
      expect(pricing.basePrice).toBe(10000);
      expect(pricing.finalPrice).toBe(10000);
      expect(pricing.discount).toBe(0);
    });

    it('Debería ser gratuito para niños de 3 años o menos.', () => {
      const pricing = service.calculateTicketPricing(3, PassType.REGULAR);
      expect(pricing.basePrice).toBe(5000);
      expect(pricing.finalPrice).toBe(0);
      expect(pricing.discount).toBe(100);
      expect(pricing.discountReason).toBe('Gratis (3 años o menos)');
    });

    it('Debería haber un descuento del 50% para niños de 4 a 15 años', () => {
      const pricing = service.calculateTicketPricing(10, PassType.REGULAR);
      expect(pricing.basePrice).toBe(5000);
      expect(pricing.finalPrice).toBe(2500);
      expect(pricing.discount).toBe(50);
      expect(pricing.discountReason).toBe('50% descuento (4-15 años)');
    });

    it('Debería haber un descuento del 50% para personas mayores de 60 años', () => {
      const pricing = service.calculateTicketPricing(65, PassType.VIP);
      expect(pricing.basePrice).toBe(10000);
      expect(pricing.finalPrice).toBe(5000);
      expect(pricing.discount).toBe(50);
      expect(pricing.discountReason).toBe('50% descuento (60+ años)');
    });
  });

  describe('Calcular ticket', () => {
    it('Debería calcularse el total para edades mixtas y tipos de pases', () => {
      const dto: CreateTicketDto = {
        visitDate: '2024-12-25',
        quantity: 4,
        visitors: [
          { age: 2, passType: PassType.REGULAR },
          { age: 8, passType: PassType.VIP },
          { age: 30, passType: PassType.REGULAR },
          { age: 65, passType: PassType.VIP }
        ],
        paymentMethod: PaymentMethod.CASH
      };

      const summary = service.calculateTicketSummary(dto);
      expect(summary.totalTickets).toBe(4);
      expect(summary.totalAmount).toBe(0 + 5000 + 5000 + 5000); // 15000
      expect(summary.ticketDetails).toHaveLength(4);
    });
  });

  describe('crear ticket', () => {
    it('Debería crear un ticket con un resumen de precios', async () => {
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
      expect(result.ticket.ticketSummary.totalAmount).toBe(15000);
      expect(result.paymentUrl).toContain('mercadopago.com');
    });

    it('Debería crear un ticket sin URL de pago para el pago en efectivo', async () => {
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