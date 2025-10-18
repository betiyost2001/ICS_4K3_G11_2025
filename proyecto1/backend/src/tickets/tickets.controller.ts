import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailService } from '../email/email.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly emailService: EmailService
  ) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    const result = await this.ticketsService.createTicket(createTicketDto, req.user.id);
    
    await this.emailService.sendConfirmationEmail(
      req.user.email,
      result.ticket
    );

    return {
      message: `Compra realizada: ${result.ticket.quantity} entradas para ${result.ticket.visitDate}`,
      ticket: result.ticket,
      paymentUrl: result.paymentUrl
    };
  }
}