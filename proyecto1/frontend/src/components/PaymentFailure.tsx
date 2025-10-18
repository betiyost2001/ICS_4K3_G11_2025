'use client';

export default function PaymentFailure() {
  return (
    <div className="container">
      <div className="payment-failure">
        <div className="failure-icon">❌</div>
        <h1>Pago No Procesado</h1>
        <p>Hubo un problema al procesar tu pago</p>
        
        <div className="failure-details">
          <h3>¿Qué puedes hacer?</h3>
          <ul>
            <li>Verifica que tu tarjeta tenga fondos suficientes</li>
            <li>Intenta con otro método de pago</li>
            <li>Contacta a tu banco si el problema persiste</li>
          </ul>
        </div>

        <div className="actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Intentar Nuevamente
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}