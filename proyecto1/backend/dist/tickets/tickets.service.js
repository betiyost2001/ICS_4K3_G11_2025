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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const mercadopago_service_1 = require("../mercadopago/mercadopago.service");
let TicketsService = class TicketsService {
    constructor(mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
    }
    validateTicketPurchase(dto) {
        this.validateQuantity(dto.quantity);
        this.validateVisitDate(dto.visitDate);
        this.validateParkOpen(dto.visitDate);
        this.validateVisitorAges(dto.visitors);
    }
    validateQuantity(quantity) {
        if (quantity > 10) {
            throw new common_1.BadRequestException('La cantidad de entradas no puede ser mayor a 10');
        }
    }
    validateVisitDate(visitDate) {
        const date = new Date(visitDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            throw new common_1.BadRequestException('La fecha de visita debe ser del día actual o futuro');
        }
    }
    validateParkOpen(visitDate) {
        const date = new Date(visitDate + 'T00:00:00');
        const dayOfWeek = date.getDay();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        if (dayOfWeek === 1) {
            throw new common_1.BadRequestException('El parque está cerrado los lunes');
        }
        if ((month === 12 && day === 25) || (month === 1 && day === 1)) {
            throw new common_1.BadRequestException('El parque está cerrado en la fecha seleccionada');
        }
    }
    validateVisitorAges(visitors) {
        for (const visitor of visitors) {
            if (visitor.age < 1 || visitor.age > 100) {
                throw new common_1.BadRequestException('Las edades deben estar entre 0 y 100 años');
            }
        }
    }
    calculateTicketPricing(age, passType) {
        const basePrice = passType === create_ticket_dto_1.PassType.VIP ? 10000 : 5000;
        let finalPrice = basePrice;
        let discount = 0;
        let discountReason = '';
        if (age <= 3) {
            finalPrice = 0;
            discount = 100;
            discountReason = 'Gratis (3 años o menos)';
        }
        else if (age >= 4 && age <= 15) {
            finalPrice = basePrice / 2;
            discount = 50;
            discountReason = '50% descuento (4-15 años)';
        }
        else if (age >= 60) {
            finalPrice = basePrice / 2;
            discount = 50;
            discountReason = '50% descuento (60+ años)';
        }
        return {
            basePrice,
            finalPrice,
            discount,
            discountReason
        };
    }
    calculateTicketSummary(dto) {
        const ticketDetails = dto.visitors.map(visitor => ({
            age: visitor.age,
            passType: visitor.passType,
            pricing: this.calculateTicketPricing(visitor.age, visitor.passType)
        }));
        const totalAmount = ticketDetails.reduce((sum, ticket) => sum + ticket.pricing.finalPrice, 0);
        return {
            totalTickets: dto.quantity,
            totalAmount,
            ticketDetails
        };
    }
    async createTicket(dto, userId) {
        this.validateTicketPurchase(dto);
        const reservationCode = this.generateReservationCode();
        const ticketSummary = this.calculateTicketSummary(dto);
        const ticket = {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            visitDate: dto.visitDate,
            quantity: dto.quantity,
            visitors: dto.visitors,
            paymentMethod: dto.paymentMethod,
            reservationCode,
            ticketSummary,
            createdAt: new Date()
        };
        let paymentUrl = null;
        if (dto.paymentMethod === create_ticket_dto_1.PaymentMethod.CREDIT_CARD) {
            const preference = await this.mercadoPagoService.createPaymentPreference({
                quantity: dto.quantity,
                reservationCode,
                totalAmount: ticketSummary.totalAmount,
                ticketDetails: ticketSummary.ticketDetails
            });
            paymentUrl = preference.init_point;
        }
        return {
            ticket,
            paymentUrl
        };
    }
    generateReservationCode() {
        return 'RES-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mercadopago_service_1.MercadoPagoService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map