import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTicketDto, PaymentMethod, PassType, TicketPricing, TicketSummary } from './dto/create-ticket.dto';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';

@Injectable()
export class TicketsService {
  // Park is open Tuesday to Sunday (closed Mondays)

  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  validateTicketPurchase(dto: CreateTicketDto): void {
    this.validateQuantity(dto.quantity);
    this.validateVisitDate(dto.visitDate);
    this.validateParkOpen(dto.visitDate);
    this.validateVisitorAges(dto.visitors);
  }

  private validateQuantity(quantity: number): void {
    if (quantity > 10) {
      throw new BadRequestException('La cantidad de entradas no puede ser mayor a 10');
    }
  }

  private validateVisitDate(visitDate: string): void {
    const date = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      throw new BadRequestException('La fecha de visita debe ser del día actual o futuro');
    }
  }

  private validateParkOpen(visitDate: string): void {
    const date = new Date(visitDate + 'T00:00:00'); // Ensure correct timezone
    const dayOfWeek = date.getDay();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Check if it's Monday (closed)
    if (dayOfWeek === 1) {
      throw new BadRequestException('El parque está cerrado los lunes');
    }

    // Check if it's Christmas (Dec 25) or New Year (Jan 1)
    if ((month === 12 && day === 25) || (month === 1 && day === 1)) {
      throw new BadRequestException('El parque está cerrado en la fecha seleccionada');
    }
  }

  private validateVisitorAges(visitors: { age: number }[]): void {
    for (const visitor of visitors) {
      if (visitor.age < 1 || visitor.age > 100) {
        throw new BadRequestException('Las edades deben estar entre 0 y 100 años');
      }
    }
  }

  calculateTicketPricing(age: number, passType: PassType): TicketPricing {
    const basePrice = passType === PassType.VIP ? 10000 : 5000;
    let finalPrice = basePrice;
    let discount = 0;
    let discountReason = '';

    if (age <= 3) {
      finalPrice = 0;
      discount = 100;
      discountReason = 'Gratis (3 años o menos)';
    } else if (age >= 4 && age <= 15) {
      finalPrice = basePrice / 2;
      discount = 50;
      discountReason = '50% descuento (4-15 años)';
    } else if (age >= 60) {
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

  calculateTicketSummary(dto: CreateTicketDto): TicketSummary {
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

  async createTicket(dto: CreateTicketDto, userId: string) {
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
    
    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) {
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

  private generateReservationCode(): string {
    return 'RES-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
}