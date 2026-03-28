# Contributing

## Agregar un widget nuevo

Tenés dos caminos:

1. **Manual** (3 pasos):
   - Crear el componente en `src/app/components/widgets/`.
   - Registrarlo en `src/config/widgets.ts`.
   - Si necesita datos, crear un route handler en `src/app/api/`.
2. **Automático** usando el generador (`scripts/new-widget.ts`).

---

## Proceso manual

### 1) Crear el componente

Creá un archivo en `src/app/components/widgets/` con el nombre del widget en PascalCase, por ejemplo `MiWidget.tsx`.

> El `WidgetShell` se aplica en `src/app/page.tsx`, por lo que el componente del widget debe renderizar solo el contenido interno.

### 2) Registrarlo en el widget registry

Editá `src/config/widgets.ts` y agregá:

- Import del componente.
- Nuevo objeto dentro de `widgets` con:
  - `id`
  - `title`
  - `size` (`sm | md | lg | xl`)
  - `refreshInterval` (opcional)
  - `component`
  - `category` (`markets | news | argentina | crypto | custom`)

### 3) Si necesita data: route handler

Creá un endpoint en `src/app/api/<widget-id>/route.ts`.

Ejemplo mínimo:

```ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "TODO: implement data feed",
    timestamp: new Date().toISOString(),
  });
}
```

---

## Generador automático

Comando:

```bash
npx tsx scripts/new-widget.ts --name MiWidget --size md --category custom
```

### Qué crea automáticamente

- `src/app/components/widgets/<Nombre>.tsx` con boilerplate.
- `src/app/api/<widget-id>/route.ts` vacío (stub inicial).
- Registro automático en `src/config/widgets.ts` (import + entrada en `widgets`).

### Parámetros

- `--name` (requerido): nombre del componente en PascalCase.
- `--size` (opcional): `sm | md | lg | xl` (default: `md`).
- `--category` (opcional): `markets | news | argentina | crypto | custom` (default: `custom`).

### Ejemplo

```bash
npx tsx scripts/new-widget.ts --name RiskRadar --size lg --category markets
```
