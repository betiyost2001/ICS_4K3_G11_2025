'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    setPaymentData({
      paymentId,
      status,
      reservationCode: externalReference
    });
  }, [searchParams]);

  return (
    <div className="container">
      <div className="payment-pending">
        <div className="pending-icon">⏳</div>
        <h1>Pago Pendiente</h1>
        <p>Tu pago está siendo procesado</p>
        
        {paymentData && (
          <div className="payment-details">
            <h3>Detalles del Pago</h3>
            <p><strong>Código de Reserva:</strong> {paymentData.reservationCode}</p>
            <p><strong>ID de Pago:</strong> {paymentData.paymentId}</p>
            <p><strong>Estado:</strong> {paymentData.status}</p>
          </div>
        )}

        <div className="next-steps">
          <h3>¿Qué sigue?</h3>
          <ul>
            <li>Tu pago está siendo verificado</li>
            <li>Recibirás una notificación cuando se complete</li>
            <li>Puedes cerrar esta ventana</li>
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