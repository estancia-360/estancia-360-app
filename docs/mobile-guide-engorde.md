# Guía móvil — Módulo Engorde

> Flujo online. Para el batch offline ver `mobile-guide-sync.md` (`POST /sync/engorde`).

## Flujo

```
Animal en engorde (ps=3, llegado vía rearing-selection o alta manual)
  → POST /fattening/entry          alta manual a engorde (alternativa a rearing-selection.fattening)
  → POST /rearing/weight-record    pesajes (mismo endpoint que Recría)
  → POST /fattening/feed-record    registro de alimentación, por LOTE no por animal
```

## Endpoints

| Método | Ruta | Envuelve como |
|---|---|---|
| POST/PATCH/DELETE | `/fattening/entry` | `{ fatteningEntry }` |
| POST/PATCH/DELETE | `/fattening/feed-record` | `{ feedRecord }` |
| POST/PATCH/DELETE | `/rearing/weight-record` | `{ weightRecord }` (mismo endpoint que Recría) |
| GET | `/fattening-entries/animal/:id`, `/fattening-entries/:id` | `{ fatteningEntry }` en `:id` |
| GET | `/feed-records/lot/:id`, `/feed-records/:id` | `{ feedRecord }` en `:id` |

### `POST /fattening/entry`
```json
{ "idRanchAnimal": 20, "systemType": "feedlot", "initialWeight": 220, "eventDate": "2026-06-05T09:00:00.000Z" }
```
`systemType`: `field` | `feedlot`. Requiere que el animal esté en `ps=2` (Recría) — es la vía
manual, alternativa a `rearing-selection` con `destination=fattening`.

### `POST /fattening/feed-record`
```json
{ "idLot": 5, "feedDate": "2026-06-10", "feedType": "Silo de maíz", "quantity": 500, "unit": "kg", "cost": 1200.50, "notes": "..." }
```
**Único registro del sistema sin `animal_event`** — es por lote, no por animal, sin `eventDate`.
`idUser` se toma del JWT si se omite en el body.
