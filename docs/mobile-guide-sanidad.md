# Guía móvil — Módulo Sanidad

> Flujo online. Para el batch offline ver `mobile-guide-sync.md` (`POST /sync/sanidad` — **sin
> idempotencia**, ver la nota ahí).
>
> A diferencia de Cría/Recría/Engorde, Sanidad está disponible en todos los planes de
> suscripción, sin límite por plan. Aplica en cualquier etapa productiva del animal.

## Endpoints

| Método | Ruta | Envuelve como |
|---|---|---|
| POST/PATCH/DELETE | `/health/vaccination` | `{ vaccination }` |
| POST/PATCH/DELETE | `/health/treatment` | `{ treatment }` |
| POST/PATCH/DELETE | `/health/health-incident` | `{ healthIncident }` |
| GET | `/vaccinations/animal/:id`, `/vaccinations/:id` | `{ vaccination }` en `:id` |
| GET | `/treatments/animal/:id`, `/treatments/:id` | `{ treatment }` en `:id` |
| GET | `/health-incidents/animal/:id`, `/health-incidents/:id` | `{ healthIncident }` en `:id` |

Nota: la ruta base es `/health/*` (no `/animal-health/*`) — coincide con el prefijo de infra
`GET /health` del propio backend, pero no colisionan (métodos y sub-rutas distintos).

### `POST /health/vaccination`
```json
{ "idRanchAnimal": 10, "vaccineName": "Aftosa", "dose": "5ml", "responsible": "Dr. Pérez", "eventDate": "2026-06-01T09:00:00.000Z" }
```

### `POST /health/treatment`
```json
{ "idRanchAnimal": 10, "illness": "Fiebre", "medication": "Antibiótico X", "dose": "10ml", "durationDays": 5, "withdrawalDays": 30, "responsible": "Vet", "eventDate": "2026-06-01T09:00:00.000Z" }
```
Si se envía `withdrawalDays`, el backend calcula `withdrawalEndDate = eventDate + withdrawalDays`
(en `create` y en `update`). **RN-18**: mientras `withdrawalEndDate >= hoy`, Movimientos bloquea
la venta de ese animal con `409 ANIMAL_UNDER_WITHDRAWAL`.

### `POST /health/health-incident`
```json
{ "idRanchAnimal": 10, "incidentType": "quarantine", "description": "Sospecha de fiebre aftosa", "eventDate": "2026-06-01T09:00:00.000Z" }
```
`incidentType`: `illness_detected` | `quarantine`. `quarantine` pone al animal en
`idStatus=2` (Observación) automáticamente; resolverlo (`PATCH` con `resolvedAt`) o borrarlo
mientras está sin resolver revierte a `idStatus=1` (Activo). **La mortalidad no se registra
acá** — usar `POST /movements/animal-exit` (Movimientos).
