# Guía móvil — Módulo Recría

> Flujo online. Para el batch offline ver `mobile-guide-sync.md` (`POST /sync/recria`).

## Flujo

```
Animal destetado (ps=2)
  → POST /rearing/weight-record       pesajes periódicos (permitido también en ps=1 y ps=3)
  → POST /rearing/rearing-selection   selección de destino: replacement | fattening | sale
```

## Endpoints

| Método | Ruta | Envuelve como |
|---|---|---|
| POST/PATCH/DELETE | `/rearing/weight-record` | `{ weightRecord }` |
| POST/PATCH/DELETE | `/rearing/rearing-selection` | `{ rearingSelection }` |
| GET | `/weight-records/animal/:id`, `/weight-records/lot/:id`, `/weight-records/:id` | `{ weightRecord }` en `:id`; lista paginada sin envolver |
| GET | `/rearing-selections/animal/:id`, `/rearing-selections/:id` | `{ rearingSelection }` en `:id` |

### `POST /rearing/weight-record`
```json
{ "idRanchAnimal": 20, "idLot": 3, "weight": 210.5, "weightType": "scale", "bodyCondition": 3, "ageDays": 150, "eventDate": "2026-06-01T08:00:00.000Z" }
```
`weightType`: `scale` | `estimated`. `idLot` es opcional — si se omite, el backend lo toma del
`idLot` actual del animal. Actualiza `ranch_animals.weight` al guardar. Al borrar, revierte el
peso al pesaje inmediato anterior por `eventDate` (o `null` si no hay previo). GMD se calcula en
cliente a partir de la serie de pesajes — no se almacena.

### `POST /rearing/rearing-selection`
```json
{ "idRanchAnimal": 20, "destination": "fattening", "idLotDest": 5, "systemType": "field", "weightAtSelection": 220, "bodyCondition": 4, "geneticScore": 8.5, "eventDate": "2026-06-05T09:00:00.000Z" }
```
`destination`:
- `replacement` — no cambia `ps` (el animal sigue en Recría hasta su primer servicio).
- `fattening` — requiere `idLotDest` (lote `lotType=engorde`) y `systemType` (`field`|`feedlot`).
  Crea automáticamente un `fattening_entries` y cambia el animal a `ps=3`.
- `sale` — cambia el animal a `ps=4`/`status=Inactivo` directo (sin pasar por Movimientos) —
  **irreversible**.

Al borrar una selección `fattening`, revierte `ps=2` y elimina el `fattening_entries` asociado.
