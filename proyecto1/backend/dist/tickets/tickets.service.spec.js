"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const tickets_service_1 = require("./tickets.service");
const common_1 = require("@nestjs/common");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const mercadopago_service_1 = require("../mercadopago/mercadopago.service");
describe('TicketsService', () => {
    let service;
    let mockMercadoPagoService;
    beforeEach(async () => {
        const mockMercadoPago = {
            createPaymentPreference: jest.fn().mockResolvedValue({
                id: 'test-preference-id',
                init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=test',
                sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=test'
            })
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tickets_service_1.TicketsService,
                { provide: mercadopago_service_1.MercadoPagoService, useValue: mockMercadoPago }
            ],
        }).compile();
        service = module.get(tickets_service_1.TicketsService);
        mockMercadoPagoService = module.get(mercadopago_service_1.MercadoPagoService);
    });
    describe('validateTicketPurchase', () => {
        it('should pass with valid data', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dto = {
                visitDate: tomorrow.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).not.toThrow();
        });
        it('should fail when quantity exceeds 10', () => {
            const dto = {
                visitDate: '2024-12-25',
                quantity: 11,
                visitors: Array(11).fill({ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }),
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should fail when visit date is in the past', () => {
            const dto = {
                visitDate: '2020-01-01',
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should fail when park is closed on Mondays', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            while (futureDate.getDay() !== 1) {
                futureDate.setDate(futureDate.getDate() + 1);
            }
            const dto = {
                visitDate: futureDate.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should fail when park is closed on Christmas (Dec 25)', () => {
            const dto = {
                visitDate: '2025-12-25',
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should fail when park is closed on New Year (Jan 1)', () => {
            const dto = {
                visitDate: '2026-01-01',
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should fail when visitor has negative age', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dto = {
                visitDate: tomorrow.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: -5, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should fail when visitor age exceeds 100', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dto = {
                visitDate: tomorrow.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 150, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).toThrow(common_1.BadRequestException);
        });
        it('should pass on Tuesday (park open)', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            while (futureDate.getDay() !== 2) {
                futureDate.setDate(futureDate.getDate() + 1);
            }
            const dto = {
                visitDate: futureDate.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).not.toThrow();
        });
        it('should pass on Sunday (park open)', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            while (futureDate.getDay() !== 0) {
                futureDate.setDate(futureDate.getDate() + 1);
            }
            const dto = {
                visitDate: futureDate.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            expect(() => service.validateTicketPurchase(dto)).not.toThrow();
        });
    });
    describe('calculateTicketPricing', () => {
        it('should calculate full price for adults (16-59 years)', () => {
            const pricing = service.calculateTicketPricing(25, create_ticket_dto_1.PassType.REGULAR);
            expect(pricing.basePrice).toBe(5000);
            expect(pricing.finalPrice).toBe(5000);
            expect(pricing.discount).toBe(0);
        });
        it('should calculate VIP full price for adults', () => {
            const pricing = service.calculateTicketPricing(30, create_ticket_dto_1.PassType.VIP);
            expect(pricing.basePrice).toBe(10000);
            expect(pricing.finalPrice).toBe(10000);
            expect(pricing.discount).toBe(0);
        });
        it('should be free for children 3 years or younger', () => {
            const pricing = service.calculateTicketPricing(3, create_ticket_dto_1.PassType.REGULAR);
            expect(pricing.basePrice).toBe(5000);
            expect(pricing.finalPrice).toBe(0);
            expect(pricing.discount).toBe(100);
            expect(pricing.discountReason).toBe('Gratis (3 años o menos)');
        });
        it('should be 50% off for children 4-15 years', () => {
            const pricing = service.calculateTicketPricing(10, create_ticket_dto_1.PassType.REGULAR);
            expect(pricing.basePrice).toBe(5000);
            expect(pricing.finalPrice).toBe(2500);
            expect(pricing.discount).toBe(50);
            expect(pricing.discountReason).toBe('50% descuento (4-15 años)');
        });
        it('should be 50% off for seniors 60+ years', () => {
            const pricing = service.calculateTicketPricing(65, create_ticket_dto_1.PassType.VIP);
            expect(pricing.basePrice).toBe(10000);
            expect(pricing.finalPrice).toBe(5000);
            expect(pricing.discount).toBe(50);
            expect(pricing.discountReason).toBe('50% descuento (60+ años)');
        });
    });
    describe('calculateTicketSummary', () => {
        it('should calculate total for mixed ages and pass types', () => {
            const dto = {
                visitDate: '2024-12-25',
                quantity: 4,
                visitors: [
                    { age: 2, passType: create_ticket_dto_1.PassType.REGULAR },
                    { age: 8, passType: create_ticket_dto_1.PassType.VIP },
                    { age: 30, passType: create_ticket_dto_1.PassType.REGULAR },
                    { age: 65, passType: create_ticket_dto_1.PassType.VIP }
                ],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CASH
            };
            const summary = service.calculateTicketSummary(dto);
            expect(summary.totalTickets).toBe(4);
            expect(summary.totalAmount).toBe(0 + 5000 + 5000 + 5000);
            expect(summary.ticketDetails).toHaveLength(4);
        });
    });
    describe('createTicket', () => {
        it('should create ticket with pricing summary', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dto = {
                visitDate: tomorrow.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CREDIT_CARD
            };
            const result = await service.createTicket(dto, 'user123');
            expect(result.ticket).toBeDefined();
            expect(result.ticket.ticketSummary).toBeDefined();
            expect(result.ticket.ticketSummary.totalAmount).toBe(15000);
            expect(result.paymentUrl).toContain('mercadopago.com');
        });
        it('should create ticket without payment URL for cash payment', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dto = {
                visitDate: tomorrow.toISOString().split('T')[0],
                quantity: 2,
                visitors: [{ age: 25, passType: create_ticket_dto_1.PassType.REGULAR }, { age: 30, passType: create_ticket_dto_1.PassType.VIP }],
                paymentMethod: create_ticket_dto_1.PaymentMethod.CASH
            };
            const result = await service.createTicket(dto, 'user123');
            expect(result.ticket).toBeDefined();
            expect(result.paymentUrl).toBeNull();
            expect(mockMercadoPagoService.createPaymentPreference).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=tickets.service.spec.js.map