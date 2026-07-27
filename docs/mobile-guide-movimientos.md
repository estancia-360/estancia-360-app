# Guía móvil — Módulo Movimientos

> Flujo online. Para el batch offline ver `mobile-guide-sync.md` (`POST /sync/movimientos`).
>
> Diseño **batch-first**: una operación cubre varios animales a la vez. El cliente arma la lista
> de `animals[]` — el servidor nunca expande un lote por su cuenta (evita que dos dispositivos
> offline se pisen sobre el mismo lote).

## Endpoints

| Método | Ruta | Envuelve como |
|---|---|---|
| POST | `/movements/register` | `{ movement }` |
| PATCH | `/movements/animal/:idMovementAnimal/confirm` | `{ movement }` |
| PATCH | `/movements/:idMovement/cancel` | `{ movement }` |
| POST | `/movements/animal-exit` | `{ animalExit }` |
| PATCH | `/movements/animal-exit/:id` | `{ animalExit }` |
| GET | `/movements/ranch/:idRanch`, `/movements/:id` | `{ movement }` en `:id`; lista paginada sin envolver |
| GET | `/animal-exits/animal/:id`, `/animal-exits/:id` | `{ animalExit }` en `:id` |

`GET /movements/*` y las mutaciones (`POST/PATCH /movements/*`) son dos controllers distintos
que comparten el prefijo `movements` sin colisionar.

## `POST /movements/register`

```json
{
  "idRanch": 1, "idUser": 1, "movementType": "sale", "movementDate": "2027-03-01",
  "counterpartName": "Comprador X", "totalPrice": 45000, "notes": "...",
  "animals": [{ "idRanchAnimal": 10 }, { "idRanchAnimal": 11 }]
}
```
`movementType`: `sale` | `purchase` | `pasture_transfer` | `ranch_exit`. Solo el **Owner**
(`ranch_role=1`) puede registrar `sale`/`purchase`/`ranch_exit` (RN-01/RN-16) — se valida contra
`idUser` en el body (sin JWT real todavía, mismo nivel de confianza que el resto del proyecto).

- **`purchase`**: cada item de `animals[]` lleva `newAnimal: {idBreed, idAnimalClass, code, sex, birthdate, weight?, idLot?, idProductiveStatus?}` en vez de `idRanchAnimal` — el servidor crea el `ranch_animal` con `origin=purchased`. Queda `confirmed` directo.
- **`pasture_transfer`**: cada item lleva `idRanchAnimal` + `idLotDest`. Queda `confirmed` directo, no cambia el `id_status` del animal.
- **`sale`**: queda `status=pending`. Cada animal arranca `movement_animals.status=pending` — confirmar/rechazar uno por uno con `PATCH /movements/animal/:id/confirm`.
- **`ranch_exit`**: cada item lleva solo `idRanchAnimal`. Queda `confirmed` directo — `ps=4`, `status=5` (Vendido). La estancia destino registra su ingreso como `purchase` independiente (sin FK entre estancias).

RN-18 (retiro sanitario activo bloquea venta) y el chequeo de capacidad del plan (en `purchase`)
se validan antes de confirmar.

## `PATCH /movements/animal/:idMovementAnimal/confirm`
```json
{ "status": "accepted" }
```
`status`: `accepted` (venta final — **irreversible**, `ps=4`/`status=5` Vendido) | `rejected`
(revierte al `prevIdStatus` que tenía antes del movimiento). Máquina de estados idempotente:
repetir la misma decisión → `200` sin efecto. Transición incompatible → `409
INVALID_STATUS_TRANSITION`. Movimiento ya cancelado → `409 MOVEMENT_CANCELLED`.

## `PATCH /movements/:idMovement/cancel`
Cancela un `sale` pendiente — revierte los animales todavía `pending` a su `prevIdStatus` (los ya
`accepted` NO se revierten, RN-07). Cancelar uno ya cancelado es idempotente (`200`). Cancelar uno
`confirmed` → `409 MOVEMENT_ALREADY_CONFIRMED`.

## `POST /movements/animal-exit`
```json
{ "idRanchAnimal": 10, "reason": "death", "notes": "...", "eventDate": "2027-03-01T08:00:00.000Z" }
```
`reason`: `death` | `discard` | `loss` | `other` (`other` requiere `notes`). Cambia el animal a
`ps=4`/`status=3` (Inactivo) — **irreversible**, distinto de una venta (que deja `status=5`
Vendido). No existe `DELETE` — solo `PATCH /movements/animal-exit/:id` para corregir
`reason`/`notes` sin tocar el estado del animal.

## Reglas de negocio

| RN | — |
|---|---|
| RN-01/RN-16 | Solo el Owner registra `sale`/`purchase`/`ranch_exit` |
| RN-07 | `ps=4` es irreversible: aplica a `sale(accepted)`, `ranch_exit` y `animal_exit` |
| RN-18 | Retiro sanitario activo (`withdrawal_end_date >= hoy`) bloquea la venta |
