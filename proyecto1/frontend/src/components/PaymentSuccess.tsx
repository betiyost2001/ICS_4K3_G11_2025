'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    setPaymentData({
      paymentId,
      status,
      reservationCode: externalReference
    });
    
    // Get ticket data from localStorage
    const storedTicketData = localStorage.getItem('lastTicketPurchase');
    if (storedTicketData) {
      setTicketData(JSON.parse(storedTicketData));
    }
  }, [searchParams]);

  return (
    <div className="container">
      <div className="payment-success">
        <div className="success-icon">✅</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu compra ha sido procesada correctamente</p>
        
        {paymentData && (
          <div className="payment-details">
            <h3>Detalles del Pago</h3>
            <p><strong>Código de Reserva:</strong> {paymentData.reservationCode}</p>
            <p><strong>ID de Pago:</strong> {paymentData.paymentId}</p>
            <p><strong>Estado:</strong> {paymentData.status}</p>
          </div>
        )}
        
        {ticketData && ticketData.ticketSummary && (
          <div className="payment-details" style={{ marginTop: '20px', padding: '20px', background: '#E8FCCF', borderRadius: '10px' }}>
            <h3>Resumen de tu Compra</h3>
            <p><strong>Fecha de visita:</strong> {ticketData.visitDate}</p>
            <p><strong>Cantidad:</strong> {ticketData.quantity} entrada{ticketData.quantity > 1 ? 's' : ''}</p>
            
            <div style={{ marginTop: '15px' }}>
              <h4>Detalle por visitante:</h4>
              {ticketData.ticketSummary.ticketDetails?.map((detail: any, index: number) => (
                <div key={index} style={{ padding: '8px', margin: '5px 0', background: 'white', borderRadius: '5px' }}>
                  <span>Visitante {index + 1} ({detail.age} años) - </span>
                  <span style={{ color: '#3E8914' }}>
                    {detail.pricing.discountReason || 'Precio regular'}: ${detail.pricing.finalPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '15px', fontSize: '20px', fontWeight: 'bold', color: '#134611', textAlign: 'center', padding: '10px', background: '#96E072', borderRadius: '5px' }}>
              Total pagado: ${ticketData.ticketSummary.totalAmount?.toLocaleString()}
            </div>
          </div>
        )}

        <div className="next-steps">
          <h3>Próximos Pasos</h3>
          <ul>
            <li>Recibirás un email de confirmación con tu código QR</li>
            <li>Presenta el código QR en la entrada del parque</li>
            <li>¡Disfruta tu visita a EcoHarmony Park!</li>
          </ul>
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