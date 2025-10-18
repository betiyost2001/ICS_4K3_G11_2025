import { CreateTicketDto, PaymentMethod, PassType, TicketPricing, TicketSummary } from './dto/create-ticket.dto';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
export declare class TicketsService {
    private readonly mercadoPagoService;
    constructor(mercadoPagoService: MercadoPagoService);
    validateTicketPurchase(dto: CreateTicketDto): void;
    private validateQuantity;
    private validateVisitDate;
    private validateParkOpen;
    private validateVisitorAges;
    calculateTicketPricing(age: number, passType: PassType): TicketPricing;
    calculateTicketSummary(dto: CreateTicketDto): TicketSummary;
    createTicket(dto: CreateTicketDto, userId: string): Promise<{
        ticket: {
            id: string;
            userId: string;
            visitDate: string;
            quantity: number;
            visitors: import("./dto/create-ticket.dto").VisitorDto[];
            paymentMethod: PaymentMethod;
            reservationCode: string;
            ticketSummary: TicketSummary;
            createdAt: Date;
        };
        paymentUrl: any;
    }>;
    private generateReservationCode;
}
