import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto, PassType, PaymentMethod } from './dto/create-ticket.dto';

describe('TicketsController', () => {
  let controller: TicketsController;
  let ticketsService: jest.Mocked<TicketsService>;
  let emailService: jest.Mocked<EmailService>;

  const mockTicketResult = {
    ticket: {
      id: 'ticket-123',
      userId: 'user-123',
      reservationCode: 'RES-ABC123',
      visitDate: '2024-12-25',
      quantity: 2,
      visitors: [
        { age: 25, passType: PassType.REGULAR },
        { age: 30, passType: PassType.VIP }
      ],
      paymentMethod: PaymentMethod.CREDIT_CARD,
      ticketSummary: {
        totalTickets: 2,
        totalAmount: 15000,
        ticketDetails: [
          { age: 25, passType: PassType.REGULAR, pricing: { basePrice: 5000, finalPrice: 5000, discount: 0, discountReason: '' } },
          { age: 30, passType: PassType.VIP, pricing: { basePrice: 10000, finalPrice: 10000, discount: 0, discountReason: '' } }
        ]
      },
      createdAt: new Date()
    },
    paymentUrl: 'https://mock-mercadopago.com/payment'
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  };

  beforeEach(async () => {
    const mockTicketsService = {
      createTicket: jest.fn().mockResolvedValue(mockTicketResult)
    };

    const mockEmailService = {
      sendConfirmationEmail: jest.fn().mockResolvedValue(undefined)
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        { provide: TicketsService, useValue: mockTicketsService },
        { provide: EmailService, useValue: mockEmailService }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<TicketsController>(TicketsController);
    ticketsService = module.get(TicketsService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crear ticket', () => {
    const validDto: CreateTicketDto = {
      visitDate: '2024-12-25',
      quantity: 2,
      visitors: [
        { age: 25, passType: PassType.REGULAR },
        { age: 30, passType: PassType.VIP }
      ],
      paymentMethod: PaymentMethod.CREDIT_CARD
    };

    const mockRequest = { user: mockUser };

    it('debería crear un ticket exitosamente', async () => {
      const result = await controller.create(validDto, mockRequest);

      expect(ticketsService.createTicket).toHaveBeenCalledWith(validDto, mockUser.id);
      expect(result.message).toBe('Compra realizada: 2 entradas para 2024-12-25');
      expect(result.ticket).toEqual(mockTicketResult.ticket);
      expect(result.paymentUrl).toBe(mockTicketResult.paymentUrl);
    });

    it('debería enviar email de confirmación después de crear el ticket', async () => {
      await controller.create(validDto, mockRequest);

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockTicketResult.ticket
      );
    });

    it('debería manejar pago en efectivo sin URL de pago', async () => {
      const cashDto = { ...validDto, paymentMethod: PaymentMethod.CASH };
      const cashResult = { ...mockTicketResult, paymentUrl: null };
      
      ticketsService.createTicket.mockResolvedValueOnce(cashResult);

      const result = await controller.create(cashDto, mockRequest);

      expect(result.paymentUrl).toBeNull();
      expect(emailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('debería propagar errores del servicio de tickets', async () => {
      const error = new Error('Error de validación');
      ticketsService.createTicket.mockRejectedValueOnce(error);

      await expect(controller.create(validDto, mockRequest)).rejects.toThrow(error);
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it('debería manejar errores del servicio de email', async () => {
      const emailError = new Error('Error al enviar email');
      emailService.sendConfirmationEmail.mockRejectedValueOnce(emailError);

      await expect(controller.create(validDto, mockRequest)).rejects.toThrow(emailError);
      expect(ticketsService.createTicket).toHaveBeenCalled();
    });

    it('debería incluir información del usuario en la creación del ticket', async () => {
      const customUser = { id: 'custom-user', email: 'custom@example.com' };
      const customRequest = { user: customUser };

      await controller.create(validDto, customRequest);

      expect(ticketsService.createTicket).toHaveBeenCalledWith(validDto, customUser.id);
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(
        customUser.email,
        mockTicketResult.ticket
      );
    });

    it('debería formatear correctamente el mensaje de respuesta', async () => {
      const singleTicketDto = {
        ...validDto,
        quantity: 1,
        visitors: [{ age: 25, passType: PassType.REGULAR }]
      };

      const singleTicketResult = {
        ...mockTicketResult,
        ticket: { 
          ...mockTicketResult.ticket, 
          quantity: 1,
          visitors: [{ age: 25, passType: PassType.REGULAR }],
          ticketSummary: {
            ...mockTicketResult.ticket.ticketSummary,
            totalTickets: 1
          }
        }
      };

      ticketsService.createTicket.mockResolvedValueOnce(singleTicketResult);

      const result = await controller.create(singleTicketDto, mockRequest);

      expect(result.message).toBe('Compra realizada: 1 entradas para 2024-12-25');
    });

    it('debería manejar diferentes tipos de pase', async () => {
      const vipDto = {
        ...validDto,
        visitors: [
          { age: 25, passType: PassType.VIP },
          { age: 30, passType: PassType.VIP }
        ]
      };

      await controller.create(vipDto, mockRequest);

      expect(ticketsService.createTicket).toHaveBeenCalledWith(vipDto, mockUser.id);
    });
  });
});