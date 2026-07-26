# Configuración privada del checkout

El checkout está listo para pedidos programados con pagos manuales. Todas estas variables se agregan únicamente en **Vercel → Settings → Environment Variables** (Production, Preview y Development según corresponda); no se guardan en GitHub.

## Servicios que debes conectar en Vercel

1. Crea y conecta un almacenamiento **Vercel Blob** privado. Vercel añadirá `BLOB_READ_WRITE_TOKEN`.
2. Crea y conecta **Vercel KV**. Vercel añadirá `KV_REST_API_URL` y `KV_REST_API_TOKEN`.

## Datos que debes completar

```dotenv
# Modalidad y antelación
NEXT_PUBLIC_PAYMENT_MODE=manual
MIN_ORDER_NOTICE_HOURS=24
ORDER_TIME_SLOTS_JSON=["8–10 am","10 am–1 pm","2–4 pm","4–6 pm"]
DELIVERY_FEES_JSON={"miraflores":10,"san isidro":10}
BUSINESS_WHATSAPP=51999999999

# Métodos manuales
NEXT_PUBLIC_YAPE_ENABLED=true
YAPE_PHONE=
YAPE_HOLDER=
YAPE_QR_URL=
NEXT_PUBLIC_PLIN_ENABLED=true
PLIN_PHONE=
PLIN_HOLDER=
PLIN_QR_URL=
NEXT_PUBLIC_TRANSFER_ENABLED=true
BANK_NAME=
BANK_HOLDER=
BANK_ACCOUNT=
BANK_CCI=

# Preparados, pero no activados todavía
NEXT_PUBLIC_CARD_ENABLED=false
PAYMENTS_CARD_ENABLED=false
NEXT_PUBLIC_PAGOEFECTIVO_ENABLED=false
```

Completa: número y titular de Yape, número y titular de Plin, QR públicos de cada billetera si los usarás, banco/titular/cuenta/CCI, WhatsApp de negocio, distritos con tarifa y horarios disponibles. No publiques ni compartas los tokens de Blob o KV.

Cuando Izipay esté contratado, agrega sus credenciales privadas solo en Vercel y activa el proveedor tras implementar su firma/verificación de webhooks. No se deben habilitar tarjetas con una clave solo del frontend.
