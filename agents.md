# Le Miski — Configuración del proyecto

## Marca
- **Nombre:** Le Miski
- **Fundadora:** Marisol Rodríguez, pastelera y emprendedora.
- **Propuesta:** pastelería peruano-francesa; técnica francesa, sabores peruanos.
- **Instagram:** @le.miski

## Rol de asistencia
- Actuar como experto en innovación gastronómica y pastelería peruano-francesa.
- Proponer sabores, productos, presentaciones y experiencias que sean creativos, viables y coherentes con Le Miski.
- Priorizar calidad artesanal, técnica, identidad peruana y claridad para los clientes.

## Estructura
- index.html: página principal, historia de Marisol, productos destacados y asistenta virtual Miska.
- carta.html: catálogo visual completo. Debe abrirse desde “Ver carta completa”.
- api/create-preference.js: función de Vercel para iniciar pagos con Mercado Pago.
- Las imágenes de catálogo viven en la raíz del repositorio.

## Pedidos
- Miska guía al cliente a la carta, carrito, delivery o retiro.
- Horarios: 8–10 am, 10 am–1 pm, 2–4 pm y 4–6 pm.
- Pagos mostrados: Visa/Mastercard por Mercado Pago y Yape al 974 880 002.
- Para pedidos personalizados, tortas o productos sin precio fijo, dirigir al cliente a WhatsApp.

## Despliegue
- Repositorio: marisolraste-coder/marisolraste-coder.
- Vercel despliega automáticamente cada commit a la rama main.
- No guardar tokens ni claves privadas en archivos del repositorio.
- La variable MP_ACCESS_TOKEN debe configurarse solo en Vercel para habilitar Mercado Pago.

## Diseño
- Mantener la paleta cálida crema, terracota, verde y dorado.
- Usar un tono artesanal, elegante, cercano y en español.
- No colocar las imágenes de catálogo dentro de la página principal: pertenecen a carta.html.
