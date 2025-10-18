# 🎫 Guía de Instalación - Sistema de Entradas EcoHarmony Park

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **Git** (para clonar el repositorio)

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto1
```

### 2. Configurar el Backend

#### 2.1 Instalar Dependencias
```bash
cd backend
npm install
```

#### 2.2 Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend`:
```bash
# Email Configuration
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-app

# MercadoPago (opcional - para pagos reales)
MP_ACCESS_TOKEN=tu-access-token-de-mercadopago
```

#### 2.3 Ejecutar Tests (Opcional)
```bash
npm test
```

#### 2.4 Iniciar Backend
```bash
npm run start:dev
```
✅ **Backend corriendo en:** `http://localhost:3001`

### 3. Configurar el Frontend

#### 3.1 Abrir Nueva Terminal
```bash
cd frontend
npm install
```

#### 3.2 Iniciar Frontend
```bash
npm run dev
```
✅ **Frontend corriendo en:** `http://localhost:3000`

### 4. Configurar Túnel Público (Opcional)

#### 4.1 Instalar Ngrok Globalmente
```bash
npm install -g ngrok
```

#### 4.2 Iniciar Túnel
```bash
cd tunnel
npm install
npm start
```
✅ **URL pública generada:** `https://xxx.ngrok-free.dev`

## 🎯 Verificar Instalación

### ✅ Checklist de Funcionamiento

1. **Backend activo:** Visitar `http://localhost:3001` (debería mostrar "Cannot GET /")
2. **Frontend activo:** Visitar `http://localhost:3000` (debería mostrar la página principal)
3. **Formulario funcional:** Probar crear una reserva con pago en efectivo
4. **Email enviado:** Verificar logs del backend para confirmación de email

### 🧪 Prueba Rápida

1. Abrir `http://localhost:3000`
2. Hacer clic en "🎫 Comprar Entradas"
3. Completar formulario:
   - Fecha: Mañana
   - Cantidad: 2
   - Edades: 25 y 30 años
   - Tipos: Regular y VIP
   - Pago: Efectivo
4. Enviar formulario
5. Verificar redirección a página de confirmación

## 🔧 Solución de Problemas

### Error: "Puerto en uso"
```bash
# Matar procesos en puertos específicos
npx kill-port 3000
npx kill-port 3001
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: CORS
- Verificar que ambos servidores estén corriendo
- Revisar que las URLs en `backend/src/main.ts` coincidan

### Error: Email no se envía
- Verificar configuración en `.env`
- Revisar logs del backend para errores específicos

## 📁 Estructura del Proyecto

```
proyecto1/
├── backend/          # API NestJS (Puerto 3001)
├── frontend/         # App Next.js (Puerto 3000)
├── tunnel/           # Ngrok para exposición pública
├── README.md         # Documentación del proyecto
└── INSTALACION.md    # Esta guía
```

## 🎮 Comandos Útiles

### Backend
```bash
npm run start:dev     # Desarrollo con hot reload
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
```

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
```

### Túnel
```bash
npm start            # Iniciar túnel ngrok
```

## 📞 Soporte

Si encuentras problemas:

1. Verificar que Node.js esté instalado: `node --version`
2. Verificar que npm esté instalado: `npm --version`
3. Revisar logs de consola para errores específicos
4. Asegurar que los puertos 3000 y 3001 estén libres

---

**¡Listo! 🎉 El sistema debería estar funcionando correctamente.**