# Guía móvil — Módulo Pagos / Suscripciones

> Administrativo, no es una pasarela de pagos — el cobro (QR/transferencia) se gestiona por
> fuera del sistema. Sin sync offline: es el único módulo 100% online-admin, la app móvil solo
> **lee** su propio estado.

## Endpoint relevante para la app móvil

### `GET /subscriptions/my-ranch/:idRanch`
Requiere JWT; el usuario debe pertenecer a `idRanch` (cualquier `ranch_role`), si no →
`403 PERMISSION_DENIED`.

```json
{
  "subscription": {
    "id": 1, "idRanch": 1, "ranch": { "id": 1, "name": "Estancia Test" },
    "idPlan": 2, "billingCycle": "monthly",
    "trialEndsAt": null, "currentPeriodEnd": "2027-03-13", "cancelledAt": null,
    "effectiveStatus": "active",
    "plan": { "id": 2, "name": "Estancia", "capacityMin": 31, "capacityMax": 350, "priceMonthly": 100, "priceAnnual": 1000, "trialDays": 7, "isActive": true },
    "createdAt": "2026-07-15T23:15:48.007Z"
  }
}
```

`effectiveStatus` se calcula en cada consulta (no hay columna `status` en DB):
- `cancelledAt` presente → `cancelled`
- `hoy < trialEndsAt` → `trial`
- `hoy <= currentPeriodEnd` → `active`
- si no → `expired`

## `GET /subscription-plans` (público, sin auth)
Catálogo completo de planes — útil para mostrar comparativas en la app.

## Enforcement en la app móvil (soft)

La app **nunca bloquea el acceso a datos ya existentes**. Solo bloquea **dar de alta animales
nuevos** por encima de la capacidad efectiva del plan — el backend devuelve
`400 SUBSCRIPTION_CAPACITY_EXCEEDED` en los 3 puntos de alta (`POST /ranch-animals`,
`POST /breeding/parturition` con cría viva, `POST /movements/register` tipo `purchase`). Si la
suscripción está `expired`/`cancelled`, la capacidad efectiva cae a la del plan Free (30
animales) — los animales existentes no se tocan.

Usar `GET /subscriptions/my-ranch/:idRanch` para mostrar advertencias locales (ej. "tu plan vence
en 3 días", "llegaste al límite de tu plan") antes de que el usuario intente la acción y reciba
el 400 del servidor.

## Endpoints admin (panel web, no consumidos por la app móvil)

`GET /admin/subscriptions`, `GET /admin/subscriptions/metrics`, `GET /admin/subscriptions/:idRanch`,
`POST /admin/subscriptions/:idRanch/activate`, `POST /admin/subscriptions/:idRanch/payments`,
`PATCH /admin/subscriptions/:idRanch/cancel` — todos `@AdminUp()`, no aplican al integrador móvil.
