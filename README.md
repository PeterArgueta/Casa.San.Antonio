# Tienda Textil React

Proyecto base en React + Vite + Tailwind CSS para tienda online de productos textiles del hogar.

## Requisitos

- Node.js 18 o superior
- npm

## Comandos

```bash
npm install
npm run dev
```

Luego abrir el enlace que muestre la terminal, normalmente:

```bash
http://localhost:5173/
```

## Cambiar número de WhatsApp

Editar `src/App.jsx`:

```js
const WHATSAPP_NUMBER = '50200000000'
```

Usar formato internacional sin `+`, por ejemplo:

```js
const WHATSAPP_NUMBER = '50255555555'
```

## Futuras versiones

- Versión 1: productos quemados en `productsData` dentro de `src/App.jsx`.
- Versión 2: cargar productos desde Excel con columnas `id`, `nombre`, `categoria`, `precio`, `imagen`, `stock`, `descripcion`.
- Versión 3: consumir productos desde API conectada a SQL.
