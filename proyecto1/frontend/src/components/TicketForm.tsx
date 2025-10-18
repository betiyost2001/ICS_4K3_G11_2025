'use client';

import { useState } from 'react';
import axios from 'axios';

interface Visitor {
  age: number;
  passType: 'regular' | 'vip';
}

interface TicketPricing {
  basePrice: number;
  finalPrice: number;
  discount: number;
  discountReason?: string;
}

interface TicketFormData {
  visitDate: string;
  quantity: number;
  visitors: Visitor[];
  paymentMethod: 'cash' | 'credit_card';
}

export default function TicketForm() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    visitDate: '',
    quantity: 1,
    visitors: [{ age: 0, passType: 'regular' }],
    paymentMethod: 'cash'
  });
  
  const [quantityInput, setQuantityInput] = useState<string>('1');
  
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const calculateTicketPricing = (age: number, passType: 'regular' | 'vip'): TicketPricing => {
    const basePrice = passType === 'vip' ? 10000 : 5000;
    let finalPrice = basePrice;
    let discount = 0;
    let discountReason = '';

    if (age <= 3) {
      finalPrice = 0;
      discount = 100;
      discountReason = 'Gratis (3 años o menos)';
    } else if (age >= 4 && age <= 15) {
      finalPrice = basePrice / 2;
      discount = 50;
      discountReason = '50% descuento (4-15 años)';
    } else if (age >= 60) {
      finalPrice = basePrice / 2;
      discount = 50;
      discountReason = '50% descuento (60+ años)';
    }

    return { basePrice, finalPrice, discount, discountReason };
  };

  const getTotalAmount = (): number => {
    return formData.visitors.reduce((total, visitor) => {
      const pricing = calculateTicketPricing(visitor.age, visitor.passType);
      return total + pricing.finalPrice;
    }, 0);
  };

  const handleQuantityChange = (quantity: number) => {
    const visitors = Array(quantity).fill(null).map((_, i) => 
      formData.visitors[i] || { age: 0, passType: 'regular' }
    );
    setFormData({ ...formData, quantity, visitors });
  };

  const handleVisitorAgeChange = (index: number, age: number) => {
    const visitors = [...formData.visitors];
    visitors[index] = { ...visitors[index], age };
    setFormData({ ...formData, visitors });
  };

  const handleVisitorPassTypeChange = (index: number, passType: 'regular' | 'vip') => {
    const visitors = [...formData.visitors];
    visitors[index] = { ...visitors[index], passType };
    setFormData({ ...formData, visitors });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.visitDate) {
      newErrors.push('Debe seleccionar una fecha de visita');
    }
    
    if (!formData.paymentMethod) {
      newErrors.push('Debe seleccionar una forma de pago');
    }
    
    if (formData.quantity > 10) {
      newErrors.push('La cantidad de entradas no puede ser mayor a 10');
    }
    
    if (formData.visitors.some(v => v.age < 0 || v.age > 100)) {
      newErrors.push('Las edades deben estar entre 0 y 100 años');
    }
    
    if (formData.visitors.some(v => v.age === null || v.age === undefined || (typeof v.age === 'string' && v.age === ''))) {
      newErrors.push('Debe ingresar la edad de todos los visitantes');
    }
    
    // Check if selected date is Monday
    if (formData.visitDate) {
      const selectedDate = new Date(formData.visitDate + 'T00:00:00');
      const dayOfWeek = selectedDate.getDay();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      
      if (dayOfWeek === 1) {
        newErrors.push('El parque está cerrado los lunes');
      }
      
      if ((month === 12 && day === 25) || (month === 1 && day === 1)) {
        newErrors.push('El parque está cerrado en la fecha seleccionada');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors([]);
    
    try {
      const response = await axios.post('http://localhost:3001/tickets', formData);
      
      // Save ticket data to localStorage for display on payment pages
      localStorage.setItem('lastTicketPurchase', JSON.stringify(response.data.ticket));
      
      if (response.data.paymentUrl) {
        // Redireccionar a Mercado Pago para pagos con tarjeta
        window.location.href = response.data.paymentUrl;
      } else {
        // Redireccionar a página de pago en efectivo
        window.location.href = `/cash-payment?code=${response.data.ticket.reservationCode}`;
      }
      
    } catch (error: any) {
      setErrors([error.response?.data?.message || 'Error al procesar la compra']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ticket-section">
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          🎫 Comprar Entradas
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Comprar Entradas al Parque</h2>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha de Visita:</label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Cantidad de Entradas (máx. 10):</label>
            <input
              type="text"
              placeholder="Ingrese cantidad (1-10)"
              value={quantityInput}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^[1-9]\d*$/.test(value)) {
                  setQuantityInput(value);
                  const num = parseInt(value) || 0;
                  if (num >= 1 && num <= 10) {
                    handleQuantityChange(num);
                  }
                }
              }}
            />
          </div>

          <div className="form-group">
            <label>Edades de los Visitantes:</label>
            {formData.visitors.map((visitor, index) => {
              const pricing = calculateTicketPricing(visitor.age, visitor.passType);
              return (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#134611' }}>Visitante {index + 1}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Edad:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Edad"
                        value={visitor.age || ''}
                        onChange={(e) => handleVisitorAgeChange(index, parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Tipo de Pase:</label>
                      <select
                        value={visitor.passType}
                        onChange={(e) => handleVisitorPassTypeChange(index, e.target.value as 'regular' | 'vip')}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="regular">Regular</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                  </div>
                  
                  {visitor.age > 0 && (
                    <div style={{ padding: '10px', background: '#E8FCCF', borderRadius: '5px', fontSize: '14px' }}>
                      <div><strong>Tipo:</strong> {visitor.passType.toUpperCase()} - <strong>Precio base:</strong> ${pricing.basePrice.toLocaleString()}</div>
                      {pricing.discountReason && <div style={{ color: '#3E8914', fontWeight: 'bold' }}>{pricing.discountReason}</div>}
                      <div style={{ fontWeight: 'bold', color: '#134611', fontSize: '16px', marginTop: '5px' }}>Precio final: ${pricing.finalPrice.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>



          <div className="form-group">
            <label>Forma de Pago:</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as 'cash' | 'credit_card'})}
            >
              <option value="">Seleccionar...</option>
              <option value="cash">Efectivo (en boletería)</option>
              <option value="credit_card">Tarjeta de Crédito (Mercado Pago)</option>
            </select>
          </div>

          {formData.visitors.length > 0 && formData.visitors.every(v => v.age > 0) && (
            <div className="form-group" style={{ background: '#E8FCCF', padding: '15px', borderRadius: '8px', border: '2px solid #3DA35D' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#134611' }}>Resumen de Compra</h3>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3E8914' }}>
                Total a pagar: ${getTotalAmount().toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                {formData.quantity} entrada{formData.quantity > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="error">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          {success && (
            <div className="success">{success}</div>
          )}

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}