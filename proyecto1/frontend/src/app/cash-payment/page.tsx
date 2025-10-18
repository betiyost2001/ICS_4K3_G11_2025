'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CashPaymentPage() {
  const searchParams = useSearchParams();
  const [reservationCode, setReservationCode] = useState<string>('');
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setReservationCode(code);
    }
    
    // Get ticket data from localStorage if available
    const storedTicketData = localStorage.getItem('lastTicketPurchase');
    if (storedTicketData) {
      setTicketData(JSON.parse(storedTicketData));
    }
  }, [searchParams]);

  return (
    <div className="container">
      <div className="payment-success">
        <div className="success-icon">💰</div>
        <h1>Reserva Confirmada</h1>
        <p>Tu reserva ha sido creada exitosamente</p>
        
        <div className="payment-details">
          <h3>Información de Pago</h3>
          <p><strong>Código de Reserva:</strong> {reservationCode}</p>
          <p><strong>Método de Pago:</strong> Efectivo en boletería</p>
          
          {ticketData && ticketData.ticketSummary && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#E8FCCF', borderRadius: '8px' }}>
              <h4>Detalle de tu compra:</h4>
              <p><strong>Fecha de visita:</strong> {ticketData.visitDate}</p>
              <p><strong>Cantidad:</strong> {ticketData.quantity} entrada{ticketData.quantity > 1 ? 's' : ''}</p>
              
              {ticketData.ticketSummary.ticketDetails && (
                <div style={{ marginTop: '15px' }}>
                  <h5>Detalle por visitante:</h5>
                  {ticketData.ticketSummary.ticketDetails.map((detail: any, index: number) => (
                    <div key={index} style={{ padding: '8px', margin: '5px 0', background: 'white', borderRadius: '5px', fontSize: '14px' }}>
                      <span><strong>Visitante {index + 1}</strong> ({detail.age} años) - {detail.passType.toUpperCase()}: </span>
                      <span style={{ color: '#3E8914', fontWeight: 'bold' }}>
                        ${detail.pricing.finalPrice.toLocaleString()}
                      </span>
                      {detail.pricing.discountReason && (
                        <span style={{ color: '#666', fontSize: '12px', marginLeft: '5px' }}>({detail.pricing.discountReason})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#3E8914' }}>
                <strong>Total a pagar: ${ticketData.ticketSummary.totalAmount?.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h3>Instrucciones de Pago</h3>
          <ul>
            <li>Dirígete a la <strong>boletería del parque</strong></li>
            <li>Presenta tu código de reserva: <strong>{reservationCode}</strong></li>
            <li>Realiza el pago en efectivo</li>
            <li>Recibirás tus entradas físicas</li>
            <li>¡Disfruta tu visita al parque!</li>
          </ul>
        </div>

        <div className="important-note">
          <h4>⚠️ Importante</h4>
          <p>Debes completar el pago en boletería antes de tu fecha de visita. La reserva se cancelará automáticamente si no se paga.</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/'}
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}