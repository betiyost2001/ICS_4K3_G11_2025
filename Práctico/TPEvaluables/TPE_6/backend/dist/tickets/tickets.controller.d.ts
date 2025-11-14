import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { EmailService } from '../email/email.service';
export declare class TicketsController {
    private readonly ticketsService;
    private readonly emailService;
    constructor(ticketsService: TicketsService, emailService: EmailService);
    create(createTicketDto: CreateTicketDto, req: any): Promise<{
        message: string;
        ticket: {
            id: string;
            userId: string;
            visitDate: string;
            quantity: number;
            visitors: import("./dto/create-ticket.dto").VisitorDto[];
            paymentMethod: import("./dto/create-ticket.dto").PaymentMethod;
            reservationCode: string;
            ticketSummary: import("./dto/create-ticket.dto").TicketSummary;
            createdAt: Date;
        };
        paymentUrl: any;
    }>;
}
