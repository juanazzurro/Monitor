# CLAUDE.md

## Proyecto
SITREP — Dashboard de monitoreo en tiempo real estilo HUD táctico/Mission Impossible.
Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Arquitectura
- Cada widget es un componente independiente en `components/widgets/`.
- Cada widget se registra en `config/widgets.ts` (array de `WidgetConfig`).
- Si un widget necesita data externa, su fetching va en un route handler en `app/api/` (para evitar CORS y mantener API keys server-side).
- El componente `WidgetShell` envuelve todos los widgets con el frame HUD.
- Data fetching client-side con SWR o React Query.

## Convenciones de codigo
- TypeScript estricto, no usar `any`.
- Componentes funcionales con named exports.
- Nombres de archivo: PascalCase para componentes, camelCase para utils.
- Tailwind para estilos, no CSS modules. Las CSS variables del design system estan en `globals.css`.
- Colores del HUD: verde (`#00ff41`), ambar (`#ffbf00`), rojo (`#ff3333`), cyan (`#00e5ff`), fondo (`#0a0a0a`).
- Fuente monoespaciada (JetBrains Mono).

## Agregar un widget nuevo
1. Crear componente en `components/widgets/NombreWidget.tsx`
2. Si necesita data, crear route handler en `app/api/nombre/route.ts`
3. Registrar en `config/widgets.ts` con id, title, size, category y component
4. Sizes disponibles: `'sm'` (1 col), `'md'` (2 col), `'lg'` (3 col), `'xl'` (full width)

## APIs en uso
- CoinGecko (crypto, sin key)
- mempool.space (BTC on-chain, sin key)
- Alternative.me (Fear & Greed, sin key)
- dolarapi.com (dolar argentino, sin key)
- RSS feeds (Reuters, BBC, AP, medios argentinos) parseados server-side
- Yahoo Finance via proxy route handler

## Reglas importantes
- No instalar librerias de UI (no shadcn, no Material UI, no Chakra). Todo el styling es custom con Tailwind + CSS variables.
- No usar librerias de charts pesadas. Preferir SVG/canvas manual o recharts como maximo.
- Los widgets deben ser autonomos: si su API falla, muestran estado de error dentro de su propio panel, no rompen el resto.
- Cada widget maneja su propio refresh interval.
- Mobile first: todo debe ser usable en una columna.
- Git commit y git push después de terminar cada fase.
