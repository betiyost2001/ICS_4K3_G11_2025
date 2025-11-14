# Sistema de Compra de Entradas - Parque

## Descripción
Sistema completo para la compra de entradas al parque, desarrollado con **Next.js** (frontend) y **NestJS** (backend) siguiendo metodología **TDD**.

## User Story Implementada
**COMO** visitante **QUIERO** comprar una entrada **PARA** asegurar mi visita al parque

### Criterios de Aceptación ✅
- ✅ Indicar fecha de visita, cantidad de entradas, edad de visitantes y tipo de pase
- ✅ Fecha de visita del día actual o futuro
- ✅ Envío de confirmación por email con código de reserva y QR
- ✅ Redirección a Mercado Pago (mockeado)
- ✅ Validación de días de apertura del parque
- ✅ Selección de forma de pago (efectivo/tarjeta)
- ✅ Límite máximo de 10 entradas
- ✅ Información final de compra
- ✅ Compra solo para usuarios registrados

## Arquitectura del Proyecto

```
proyecto1/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── tickets/  # Módulo de entradas
│   │   ├── auth/     # Autenticación
│   │   ├── email/    # Servicio de emails
│   │   └── common/   # Utilidades compartidas
│   └── package.json
├── frontend/         # Next.js App
│   ├── src/
│   │   ├── app/      # App Router
│   │   ├── components/ # Componentes React
│   │   └── styles/   # Estilos CSS
│   └── package.json
└── README.md
```

## Tecnologías Utilizadas

### Backend (NestJS)
- **NestJS** - Framework Node.js
- **TypeScript** - Tipado estático
- **Jest** - Testing framework (TDD)
- **Class-validator** - Validaciones de DTOs
- **Nodemailer** - Envío de emails
- **QRCode** - Generación de códigos QR
- **SQLite** - Base de datos (desarrollo)

### Frontend (Next.js)
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **CSS Custom Properties** - Estilos

## Paleta de Colores
- **Primary Dark**: `#134611`
- **Primary Medium**: `#3E8914`
- **Primary Light**: `#3DA35D`
- **Accent**: `#96E072`
- **Background**: `#E8FCCF`

## Tipografía
- **Montserrat** (Google Fonts) - Todas las variantes

## Instalación y Ejecución

### Backend
```bash
cd backend
npm install
npm run test        # Ejecutar tests TDD
npm run start:dev   # Servidor desarrollo (puerto 3001)
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # Servidor desarrollo (puerto 3000)
```

## Testing (TDD)

### Tests Implementados (TDD)
- ✅ Validación de cantidad máxima (10 entradas)
- ✅ Validación de fecha futura
- ✅ Validación de días de apertura (martes a domingo)
- ✅ Validación de cierre los lunes
- ✅ Validación de cierre en Navidad (25 dic) y Año Nuevo (1 ene)
- ✅ Validación de edades entre 0 y 100 años
- ✅ Validación de edades negativas
- ✅ Validación de forma de pago requerida

### Ejecutar Tests
```bash
cd backend
npm run test        # Tests unitarios
npm run test:watch  # Tests en modo watch
npm run test:cov    # Coverage report
```

## Validaciones del Backend

### CreateTicketDto
- **visitDate**: Fecha válida (ISO string)
- **quantity**: Entero entre 1 y 10
- **visitors**: Array de visitantes con edades entre 0 y 100 años
- **passType**: 'regular' o 'vip'
- **paymentMethod**: 'cash' o 'credit_card'

### Reglas de Negocio
- Máximo 10 entradas por compra
- Fecha de visita actual o futura
- Parque abierto martes a domingo (cerrado lunes)
- Cerrado 25 de diciembre y 1 de enero
- Edades de visitantes entre 0 y 100 años
- Usuario debe estar autenticado
- Forma de pago obligatoria

## API Endpoints

### POST /tickets
Crear nueva compra de entradas

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "visitDate": "2024-12-25",
  "quantity": 2,
  "visitors": [
    { "age": 25 },
    { "age": 30 }
  ],
  "passType": "regular",
  "paymentMethod": "credit_card"
}
```

**Response:**
```json
{
  "message": "Compra realizada: 2 entradas para 2024-12-25",
  "ticket": {
    "id": "abc123",
    "reservationCode": "RES-XYZ789",
    "visitDate": "2024-12-25",
    "quantity": 2,
    "passType": "regular"
  },
  "paymentUrl": "https://mock-mercadopago.com/payment"
}
```

## Funcionalidades del Email

### Template de Confirmación
- Diseño responsive con colores corporativos
- Código de reserva destacado
- Código QR para validación
- Información completa de la compra
- Tipografía Montserrat

### Contenido del Email
- Código de reserva único
- Fecha y detalles de la visita
- Código QR generado automáticamente
- Diseño estéticamente agradable

## Integración con Mercado Pago

### Estado Actual: Mockeado
- URL de pago simulada: `https://mock-mercadopago.com/payment`
- Redirección automática para pagos con tarjeta
- Preparado para integración real

### Para Implementación Real
1. Registrar aplicación en Mercado Pago
2. Obtener credenciales (Access Token)
3. Implementar webhook para confirmaciones
4. Actualizar URLs en configuración

## Casos de Prueba Implementados

### ✅ Casos que Pasan
- Compra con fecha válida (martes a domingo), cantidad ≤10, edades 0-100, forma de pago seleccionada
- Email de confirmación enviado correctamente
- Redirección a Mercado Pago para pagos con tarjeta
- Páginas de pago exitoso, fallido y pendiente funcionando

### ❌ Casos que Fallan
- Compra sin seleccionar forma de pago
- Fecha de visita en lunes (día cerrado)
- Fecha de visita en Navidad (25 dic) o Año Nuevo (1 ene)
- Edades negativas o mayores a 100 años
- Cantidad de entradas > 10
- Usuario no autenticado

## Configuración de Desarrollo

### Variables de Entorno (Backend)
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-app
```

### CORS
- Frontend permitido: `http://localhost:3000`
- Credenciales habilitadas

## Cambios Recientes (v2.0)

### ✅ Mejoras Implementadas
- **Input de Cantidad**: Solucionado problema de borrado del valor por defecto
- **Validación de Edades**: Rango 0-100 años en frontend y backend
- **Horarios del Parque**: Actualizado a martes-domingo (cerrado lunes)
- **Días Festivos**: Cerrado 25 diciembre y 1 enero
- **Páginas de Pago**: Creadas rutas para éxito, fallo y pendiente
- **Tests TDD**: Ampliados con nuevas validaciones
- **Validaciones Frontend**: Sincronizadas con backend

### 📝 Estructura de Páginas de Pago
- `/payment-success-page` - Pago exitoso
- `/payment-failure-page` - Pago fallido  
- `/payment-pending-page` - Pago pendiente

## Próximos Pasos

1. **Autenticación Real**: Implementar JWT completo
2. **Base de Datos**: Migrar a PostgreSQL/MySQL
3. **Mercado Pago**: Integración real con webhooks
4. **Tests E2E**: Cypress o Playwright
5. **Deployment**: Docker + CI/CD

## Estructura de Archivos Clave

### Backend
- `src/tickets/tickets.service.spec.ts` - Tests TDD
- `src/tickets/dto/create-ticket.dto.ts` - Validaciones
- `src/email/email.service.ts` - Template de email
- `src/tickets/tickets.controller.ts` - API endpoints

### Frontend
- `src/components/TicketForm.tsx` - Formulario principal
- `src/styles/globals.css` - Estilos con paleta de colores
- `src/app/page.tsx` - Página principal

## Comandos Útiles

```bash
# Backend
npm run test:watch    # Tests en tiempo real
npm run start:dev     # Desarrollo con hot reload

# Frontend  
npm run dev          # Desarrollo Next.js
npm run build        # Build de producción

# Ambos
npm install          # Instalar dependencias
```

---

**Desarrollado con ❤️ siguiendo TDD y mejores prácticas**