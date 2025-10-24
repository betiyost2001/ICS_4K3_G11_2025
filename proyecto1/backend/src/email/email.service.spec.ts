import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';

jest.mock('nodemailer');
jest.mock('qrcode');

describe('EmailService', () => {
  let service: EmailService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (QRCode.toBuffer as jest.Mock).mockResolvedValue(Buffer.from('fake-qr-data'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enviar email de confirmación', () => {
    it('debería enviar email de reserva para pago en efectivo', async () => {
      const ticket = {
        reservationCode: 'RES-123',
        visitDate: '2024-12-25',
        quantity: 2,
        paymentMethod: 'cash',
        ticketSummary: {
          totalAmount: 10000,
          ticketDetails: [
            { age: 25, passType: 'regular', pricing: { basePrice: 5000, finalPrice: 5000, discount: 0 } },
            { age: 30, passType: 'vip', pricing: { basePrice: 10000, finalPrice: 10000, discount: 0 } }
          ]
        }
      };

      await service.sendConfirmationEmail('test@example.com', ticket);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER_TO,
        subject: 'Confirmación de Reserva - EcoHarmony Park',
        html: expect.stringContaining('¡Reserva Confirmada!'),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'qr-reserva.png',
            cid: 'qr-reserva'
          })
        ])
      });
    });

    it('debería enviar email de entradas para pago con tarjeta', async () => {
      const ticket = {
        reservationCode: 'RES-456',
        visitDate: '2024-12-26',
        quantity: 2,
        paymentMethod: 'credit_card',
        ticketSummary: {
          totalAmount: 15000,
          ticketDetails: [
            { age: 25, passType: 'regular', pricing: { basePrice: 5000, finalPrice: 5000, discount: 0 } },
            { age: 30, passType: 'vip', pricing: { basePrice: 10000, finalPrice: 10000, discount: 0 } }
          ]
        }
      };

      await service.sendConfirmationEmail('test@example.com', ticket);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER_TO,
        subject: 'Entradas Confirmadas - EcoHarmony Park',
        html: expect.stringContaining('¡Entradas Confirmadas!'),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'qr-entrada-1.png',
            cid: 'qr-entrada-1'
          }),
          expect.objectContaining({
            filename: 'qr-entrada-2.png',
            cid: 'qr-entrada-2'
          })
        ])
      });
    });

    it('debería generar QR codes correctamente', async () => {
      const ticket = {
        reservationCode: 'RES-789',
        visitDate: '2024-12-27',
        quantity: 1,
        paymentMethod: 'cash',
        ticketSummary: {
          totalAmount: 5000,
          ticketDetails: [
            { age: 25, passType: 'regular', pricing: { basePrice: 5000, finalPrice: 5000, discount: 0 } }
          ]
        }
      };

      await service.sendConfirmationEmail('test@example.com', ticket);

      expect(QRCode.toBuffer).toHaveBeenCalledWith('RES-789');
    });

    it('debería incluir información de descuentos en el email', async () => {
      const ticket = {
        reservationCode: 'RES-DISCOUNT',
        visitDate: '2024-12-28',
        quantity: 1,
        paymentMethod: 'cash',
        ticketSummary: {
          totalAmount: 2500,
          ticketDetails: [
            { 
              age: 10, 
              passType: 'regular', 
              pricing: { 
                basePrice: 5000, 
                finalPrice: 2500, 
                discount: 50,
                discountReason: '50% descuento (4-15 años)'
              } 
            }
          ]
        }
      };

      await service.sendConfirmationEmail('test@example.com', ticket);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('50% descuento (4-15 años)')
        })
      );
    });
  });

  describe('generar email de reserva', () => {
    it('debería incluir código de reserva en el HTML', async () => {
      const ticket = {
        reservationCode: 'TEST-CODE',
        visitDate: '2024-12-25',
        quantity: 1,
        ticketSummary: {
          totalAmount: 5000,
          ticketDetails: [
            { age: 25, passType: 'regular', pricing: { basePrice: 5000, finalPrice: 5000, discount: 0 } }
          ]
        }
      };

      const result = await (service as any).generateReservationEmail(ticket);

      expect(result.html).toContain('TEST-CODE');
      expect(result.html).toContain('¡Reserva Confirmada!');
      expect(result.html).toContain('PAGO EN EFECTIVO');
    });
  });

  describe('generar email de entradas pagadas', () => {
    it('debería generar QR individuales para cada entrada', async () => {
      const ticket = {
        reservationCode: 'PAID-123',
        visitDate: '2024-12-25',
        quantity: 2,
        ticketSummary: {
          totalAmount: 15000,
          ticketDetails: [
            { age: 25, passType: 'regular', pricing: { basePrice: 5000, finalPrice: 5000, discount: 0 } },
            { age: 30, passType: 'vip', pricing: { basePrice: 10000, finalPrice: 10000, discount: 0 } }
          ]
        }
      };

      const result = await (service as any).generatePaidTicketEmail(ticket);

      expect(QRCode.toBuffer).toHaveBeenCalledWith('PAID-123-T1');
      expect(QRCode.toBuffer).toHaveBeenCalledWith('PAID-123-T2');
      expect(result.html).toContain('¡Entradas Confirmadas!');
      expect(result.html).toContain('PAGO CONFIRMADO');
      expect(result.qrBuffers).toHaveLength(2);
    });
  });
});