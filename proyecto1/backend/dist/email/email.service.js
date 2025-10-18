"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'parkecoharmony@gmail.com',
                pass: 'vwul mqzv jsgd mtww',
            },
        });
    }
    async sendConfirmationEmail(email, ticket) {
        console.log('📧 Email enviado a:', email);
        console.log('🎫 Código de reserva:', ticket.reservationCode);
        console.log('📅 Fecha de visita:', ticket.visitDate);
        console.log('👥 Cantidad:', ticket.quantity);
        console.log('💰 Total:', ticket.ticketSummary?.totalAmount || 0);
        console.log('💳 Método de pago:', ticket.paymentMethod);
        let html;
        let attachments = [];
        if (ticket.paymentMethod === 'cash') {
            const { html: emailHtml, qrBuffer } = await this.generateReservationEmail(ticket);
            html = emailHtml;
            attachments = [{
                    filename: 'qr-reserva.png',
                    content: qrBuffer,
                    cid: 'qr-reserva'
                }];
        }
        else {
            const { html: emailHtml, qrBuffers } = await this.generatePaidTicketEmail(ticket);
            html = emailHtml;
            attachments = qrBuffers.map((buffer, index) => ({
                filename: `qr-entrada-${index + 1}.png`,
                content: buffer,
                cid: `qr-entrada-${index + 1}`
            }));
        }
        await this.transporter.sendMail({
            from: 'parkecoharmony@gmail.com',
            to: 'leoavram7@gmail.com',
            subject: ticket.paymentMethod === 'cash' ? 'Confirmación de Reserva - EcoHarmony Park' : 'Entradas Confirmadas - EcoHarmony Park',
            html,
            attachments
        });
    }
    async generateReservationEmail(ticket) {
        const qrBuffer = await QRCode.toBuffer(ticket.reservationCode);
        console.log('📱 QR de reserva generado');
        const ticketDetails = ticket.ticketSummary?.ticketDetails || [];
        const totalAmount = ticket.ticketSummary?.totalAmount || 0;
        const ticketDetailsHtml = ticketDetails.map((detail, index) => `
      <tr>
        <td>Visitante ${index + 1} (${detail.age} años)</td>
        <td>${detail.passType.toUpperCase()}</td>
        <td>$${detail.pricing.basePrice.toLocaleString()}</td>
        <td>${detail.pricing.discount > 0 ? detail.pricing.discountReason : '-'}</td>
        <td><strong>$${detail.pricing.finalPrice.toLocaleString()}</strong></td>
      </tr>
    `).join('');
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Montserrat', Arial, sans-serif; margin: 0; padding: 20px; background-color: #E8FCCF; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #134611, #3E8914); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .ticket-info { background: #E8FCCF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3DA35D; }
          .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .pricing-table th, .pricing-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .pricing-table th { background-color: #3DA35D; color: white; }
          .total-row { background-color: #96E072; font-weight: bold; }
          .qr-section { text-align: center; margin: 30px 0; }
          .footer { background: #96E072; padding: 20px; text-align: center; color: #134611; }
          .code { font-size: 24px; font-weight: bold; color: #3E8914; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Reserva Confirmada!</h1>
            <p>Tu reserva ha sido creada exitosamente</p>
          </div>
          <div class="content">
            <div class="ticket-info">
              <h3>Detalles de tu reserva:</h3>
              <p><strong>Código de Reserva:</strong> <span class="code">${ticket.reservationCode}</span></p>
              <p><strong>Fecha de Visita:</strong> ${ticket.visitDate}</p>
              <p><strong>Cantidad de Entradas:</strong> ${ticket.quantity}</p>
            </div>
            
            <div class="ticket-info">
              <h3>Detalle de Precios:</h3>
              <table class="pricing-table">
                <thead>
                  <tr>
                    <th>Visitante</th>
                    <th>Tipo</th>
                    <th>Precio Base</th>
                    <th>Descuento</th>
                    <th>Precio Final</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketDetailsHtml}
                  <tr class="total-row">
                    <td colspan="4"><strong>TOTAL A PAGAR EN BOLETERÍA</strong></td>
                    <td><strong>$${totalAmount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="warning">
              <h4>⚠️ IMPORTANTE - PAGO EN EFECTIVO</h4>
              <p>Esta es una <strong>RESERVA</strong>. Debes completar el pago en la boletería del parque antes de tu visita.</p>
            </div>
            
            <div class="qr-section">
              <h3>Código QR de tu reserva:</h3>
              <img src="cid:qr-reserva" alt="QR Reserva" style="max-width: 200px; display: block; margin: 0 auto;">
              <p><strong>Presenta este QR en boletería para pagar y recibir tus entradas</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>¡Esperamos verte pronto en el parque!</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return { html, qrBuffer };
    }
    async generatePaidTicketEmail(ticket) {
        const ticketDetails = ticket.ticketSummary?.ticketDetails || [];
        const totalAmount = ticket.ticketSummary?.totalAmount || 0;
        const ticketQRs = await Promise.all(ticketDetails.map(async (detail, index) => {
            const ticketId = `${ticket.reservationCode}-T${index + 1}`;
            const qrBuffer = await QRCode.toBuffer(ticketId);
            console.log(`📱 QR entrada ${index + 1} generado:`, ticketId);
            return { ...detail, ticketId, qrBuffer, visitorNumber: index + 1 };
        }));
        const qrBuffers = ticketQRs.map(qr => qr.qrBuffer);
        const ticketDetailsHtml = ticketDetails.map((detail, index) => `
      <tr>
        <td>Visitante ${index + 1} (${detail.age} años)</td>
        <td>${detail.passType.toUpperCase()}</td>
        <td>$${detail.pricing.basePrice.toLocaleString()}</td>
        <td>${detail.pricing.discount > 0 ? detail.pricing.discountReason : '-'}</td>
        <td><strong>$${detail.pricing.finalPrice.toLocaleString()}</strong></td>
      </tr>
    `).join('');
        const individualTicketsHtml = ticketQRs.map(ticketQR => `
      <div class="individual-ticket">
        <h4>Entrada ${ticketQR.visitorNumber} - ${ticketQR.passType.toUpperCase()}</h4>
        <p><strong>Visitante:</strong> ${ticketQR.age} años</p>
        <p><strong>Precio:</strong> $${ticketQR.pricing.finalPrice.toLocaleString()}</p>
        ${ticketQR.pricing.discountReason ? `<p><strong>Descuento:</strong> ${ticketQR.pricing.discountReason}</p>` : ''}
        <div class="qr-individual">
          <img src="cid:qr-entrada-${ticketQR.visitorNumber}" alt="QR Entrada ${ticketQR.visitorNumber}" style="max-width: 150px; display: block; margin: 0 auto;">
          <p><strong>ID:</strong> ${ticketQR.ticketId}</p>
        </div>
      </div>
    `).join('');
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Montserrat', Arial, sans-serif; margin: 0; padding: 20px; background-color: #E8FCCF; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #134611, #3E8914); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .ticket-info { background: #E8FCCF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3DA35D; }
          .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .pricing-table th, .pricing-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .pricing-table th { background-color: #3DA35D; color: white; }
          .total-row { background-color: #96E072; font-weight: bold; }
          .individual-ticket { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; border: 2px solid #3DA35D; }
          .qr-individual { text-align: center; margin: 10px 0; }
          .footer { background: #96E072; padding: 20px; text-align: center; color: #134611; }
          .code { font-size: 24px; font-weight: bold; color: #3E8914; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Entradas Confirmadas!</h1>
            <p>Tu pago ha sido procesado exitosamente</p>
          </div>
          <div class="content">
            <div class="success">
              <h4>✅ PAGO CONFIRMADO</h4>
              <p>Tus entradas están listas. Presenta el DNI + QR de cada entrada al ingresar al parque.</p>
            </div>
            
            <div class="ticket-info">
              <h3>Detalles de tu compra:</h3>
              <p><strong>Código de Reserva:</strong> <span class="code">${ticket.reservationCode}</span></p>
              <p><strong>Fecha de Visita:</strong> ${ticket.visitDate}</p>
              <p><strong>Cantidad de Entradas:</strong> ${ticket.quantity}</p>
            </div>
            
            <div class="ticket-info">
              <h3>Resumen de Pago:</h3>
              <table class="pricing-table">
                <thead>
                  <tr>
                    <th>Visitante</th>
                    <th>Tipo</th>
                    <th>Precio Base</th>
                    <th>Descuento</th>
                    <th>Precio Final</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketDetailsHtml}
                  <tr class="total-row">
                    <td colspan="4"><strong>TOTAL PAGADO</strong></td>
                    <td><strong>$${totalAmount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="ticket-info">
              <h3>🎫 Tus Entradas Individuales:</h3>
              <p><strong>IMPORTANTE:</strong> Cada visitante debe presentar su DNI + el QR de su entrada correspondiente</p>
              ${individualTicketsHtml}
            </div>
          </div>
          <div class="footer">
            <p>¡Disfruta tu visita al parque!</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return { html, qrBuffers };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)()
], EmailService);
//# sourceMappingURL=email.service.js.map