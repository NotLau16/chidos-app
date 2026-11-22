# 📋 Chido's Street Food - Próximas Configuraciones

Este documento resume los 3 módulos clave acordados para configurar y activar en el proyecto:

---

## 1. Impresión de Pedidos (Comanda Térmica)
- **Estado actual**: Plantilla CSS `@media print` lista y funcional en `/admin` con formatos de 80mm y 58mm.
- **Detalle de la comanda**: Número de comanda correlativo, fecha/hora, modalidad (DELIVERY / TAKE AWAY), datos del cliente (nombre, teléfono, dirección y referencia), desglose de productos con adicionales, salsas elegidas, exclusiones y notas para cocina, totales y vuelto a preparar.
- **Pasos de configuración**:
  1. Conexión física de impresora térmica (USB/Wi-Fi/Bluetooth) a la máquina de mostrador.
  2. Ajustar impresora como predeterminada en el navegador.
  3. *(Opcional)* Configurar Chrome/Edge en modo `--kiosk-printing` para impresión automática con 1 solo clic sin cuadros de diálogo.

---

## 2. Asistente de IA en WhatsApp
- **Estado actual**: Endpoint backend listo en `/api/whatsapp-ai` con el System Prompt oficial de Chido's (horarios de 20:30 a 00:50 hs, ubicación en Vía Aurelia Mza 44 Lote 05, alias `Chidos`, derivación a la web y respuesta de resguardo). Soporta Google Gemini y Anthropic Claude.
- **Pasos de configuración**:
  1. Dar de alta la app en [developers.facebook.com](https://developers.facebook.com) (WhatsApp Cloud API) o conectar mediante puente de WhatsApp Web.
  2. Obtener `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` y `WHATSAPP_VERIFY_TOKEN`.
  3. Configurar el Webhook en Meta apuntando a `https://chidos-app.vercel.app/api/whatsapp-ai`.
  4. Cargar la variable `AI_API_KEY` (Gemini o Claude) en Vercel.

---

## 3. Seguimiento del Rider en Tiempo Real y ETA Dinámico
- **Objetivo**: Brindar la experiencia estilo PedidosYa / UberEats sin pagar comisiones a terceros.
- **Arquitectura a implementar**:
  1. **Cálculo de Distancia y Demora Dinámica**:
     - Origen fijo: Vía Aurelia Mza 44 Lote 05, Salta Capital.
     - Destino del cliente: Geocodificación y selector de ubicación en mapa en el checkout.
     - Estimación de minutos de viaje según km + tiempo de cocina.
  2. **Portal del Cadete (`/rider/[orderId]`)**:
     - Vista web ultra liviana para el repartidor (sin instalar apps).
     - Botón "Iniciar viaje 🛵" que activa el GPS (`navigator.geolocation.watchPosition`).
     - Botón "Entregado ✅" para cerrar la comanda.
  3. **Mapa Nocturno en Vivo para el Cliente**:
     - Visualización en la tienda con Leaflet / OpenStreetMap (100% gratuito).
     - Marcador de local, casa del cliente e ícono de moto moviéndose en vivo por las calles de Salta.
