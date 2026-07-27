# Guía móvil — Sincronización offline

> Endpoints: `GET /sync/ranches`, `GET /sync/catalogs`, `GET /sync/download/:idRanch`,
> `POST /sync/cria`, `POST /sync/recria`, `POST /sync/engorde`, `POST /sync/sanidad`,
> `POST /sync/movimientos`
>
> Todos requieren JWT (`Authorization: Bearer <token>`).

---

## 1. Flujo recomendado

```
1. Login → JWT
2. GET /sync/ranches          → estancias del usuario + rol en cada una
3. GET /sync/catalogs          → catálogos estáticos (una vez, o si se sospecha desactualización)
4. Por cada idRanch relevante:
   GET /sync/download/:idRanch          (bootstrap, sin "since")
   → paginar con nextCursor hasta null
   → guardar serverTime devuelto como "lastSyncAt"

5. Trabajo offline: el operador registra datos localmente con un localId (UUID) por registro.

6. Cuando hay conexión, subir lo pendiente en orden:
   POST /sync/cria → /sync/recria → /sync/engorde → /sync/sanidad → /sync/movimientos
   (el orden entre módulos no es estrictamente obligatorio salvo que un batch de un módulo
   referencie por localRef un registro creado en otro — en ese caso, subir primero el que crea
   el registro referenciado)

7. Sincronizaciones periódicas: GET /sync/download/:idRanch?since=<lastSyncAt>
```

**Importante**: `since` se compara contra `updatedAt` de cada tabla en el servidor. Guardar
siempre el `serverTime` que devuelve la respuesta (no la hora del dispositivo) y usarlo como
`since` en la siguiente llamada.

**Todas las respuestas de este módulo van SIN envolver** (no hay un `{data: ...}` genérico) —
cada endpoint devuelve directamente el objeto documentado abajo, salvo `GET /sync/ranches` que
envuelve como `{ ranches: [...] }`.

---

## 2. `GET /sync/ranches`

```json
{
  "ranches": [
    { "idRanch": 1, "name": "Estancia La Esperanza", "idRanchRole": 1, "ranchRoleName": "Dueño" },
    { "idRanch": 3, "name": "Estancia El Recreo", "idRanchRole": 2, "ranchRoleName": "Trabajador" }
  ]
}
```

`idRanchRole`: 1=Dueño, 2=Trabajador, 3=Administrador. Un usuario puede pertenecer a varias
estancias con roles distintos en cada una. Usar los `idRanch` devueltos para iterar
`GET /sync/download/:idRanch`.

---

## 3. `GET /sync/catalogs`

Sin parámetros, sin paginación — tablas pequeñas y estáticas.

```json
{
  "animalClasses":      [{ "id": 1, "name": "Ternera", "sex": "F", "isActive": true }, ...],
  "animalBreeds":       [{ "id": 1, "name": "Criollo Boliviano", "isActive": true }, ...],
  "animalStatuses":     [{ "id": 1, "name": "Activo", "isActive": true }, ...],
  "eventTypes":         [{ "id": 1, "name": "Servicio de monta", "isActive": true }, ...],
  "productiveStatuses": [{ "id": 1, "name": "Cría", "isActive": true }, ...],
  "productionTypes":    [{ "id": 1, "name": "Cria", "isActive": true }, ...]
}
```

Descargar una vez en el primer arranque y guardar local. `animalStatuses` incluye
`4=Pendiente de Movimiento` y `5=Vendido` (usados por Movimientos).

---

## 4. `GET /sync/download/:idRanch`

El usuario debe pertenecer a `idRanch` (`ranch_users`) — si no, `403 RANCH_ACCESS_DENIED`.

### Query params

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `since` | ISO 8601 | _(ninguno)_ | Omitido → bootstrap completo. Presente → solo lo creado/modificado/eliminado desde esa fecha (`updatedAt > since`). |
| `cursor` | string base64 opaco | _(ninguno)_ | Tomar literal de `nextCursor` de la respuesta anterior. |
| `limit` | int 1–1000 | 200 | Filas máx. **por tabla** en esta página. |

### Respuesta

```json
{
  "serverTime": "2026-06-13T15:42:10.123Z",
  "nextCursor": "eyJyYW5jaF9hbmltYWxzIjo1MH0=",
  "entities": {
    "ranchPastures": [...], "ranchLots": [...], "ranchAnimals": [...], "animalEvents": [...],
    "breedingServices": [...], "gestationDiagnoses": [...], "parturitions": [...], "weanings": [...],
    "animalDeclaredHistories": [...], "weightRecords": [...], "rearingSelections": [...],
    "fatteningEntries": [...], "feedRecords": [...], "vaccinations": [...], "treatments": [...],
    "healthIncidents": [...], "movements": [...], "movementAnimals": [...], "animalExits": [...]
  },
  "deletions": [
    { "table": "weight_records", "ids": [12, 15] }
  ]
}
```

### 4.1 Orden de `entities` (respeta dependencias FK)

```
ranchPastures → ranchLots → ranchAnimals → animalEvents
→ breedingServices → gestationDiagnoses → parturitions → weanings → animalDeclaredHistories
→ weightRecords → rearingSelections → fatteningEntries → feedRecords
→ vaccinations → treatments → healthIncidents
→ movements → movementAnimals → animalExits
```

Cada fila trae `id` (serverId), `createdAt`, `updatedAt`, y `localId` cuando la tabla lo soporta
— ver la nota sobre `vaccinations`/`treatments`/`healthIncidents` en §4.4. Upsert recomendado:
`INSERT ... ON CONFLICT (id) DO UPDATE` por `id` (serverId), no por `localId`.

### 4.2 Paginación

Un solo cursor opaco para las 19 tablas a la vez. Si `nextCursor` es distinto de `null`, al
menos una tabla tiene más filas — repetir con el mismo `since` y `cursor=<nextCursor>` hasta que
sea `null`. Tablas que ya terminaron devuelven `[]` en páginas siguientes mientras otras más
grandes siguen entregando filas — normal.

```javascript
let cursor, serverTime;
do {
  const url = `https://api.estancia.com/api/sync/download/${idRanch}`
    + (since ? `?since=${encodeURIComponent(since)}` : '')
    + (cursor ? `${since ? '&' : '?'}cursor=${encodeURIComponent(cursor)}` : '');
  const body = await (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).json();
  applyEntities(body.entities);
  applyDeletions(body.deletions);
  cursor = body.nextCursor;
  serverTime = body.serverTime;
} while (cursor);
await saveLastSyncAt(idRanch, serverTime);
```

### 4.3 `deletions` — tombstones

Cada hard delete de un registro sincronizable guarda un tombstone en `sync_deletions`
(`table`, `record_id`, `id_ranch`, `deleted_at`). En bootstrap (`since` omitido) viene vacío —
todo lo existente ya está en `entities`. En incremental, agrupa por tabla los IDs eliminados
desde `since`; el cliente debe borrarlos localmente.

### 4.4 Nota — `vaccinations`/`treatments`/`healthIncidents` sin `localId`

A diferencia de todas las demás tablas sincronizables, estas tres **no tienen columna
`local_id`** en la base real. Eso significa: (a) no aparece `localId` en su fila dentro de
`entities`, y (b) reintentar el mismo `create` en `POST /sync/sanidad` **no es idempotente** —
crea un duplicado. Diseñar el cliente para no reintentar un `create` de Sanidad ya confirmado
como exitoso.

---

## 5. Subida — patrón común a `POST /sync/{cria,recria,engorde,sanidad,movimientos}`

Cada request es un batch:

```json
{
  "idRanch": 1,
  "<sección>": [
    { "localId": "uuid-local-1", "operation": "create", "data": { ... } },
    { "localId": "uuid-local-2", "operation": "update", "serverId": 42, "data": { ... } },
    { "localId": "uuid-local-3", "operation": "delete", "serverId": 7, "data": {} }
  ]
}
```

- `localId`: string único generado por el dispositivo, por registro **dentro de este batch**.
- `operation`: `"create" | "update" | "delete"`.
- `serverId`: obligatorio en `update`/`delete`, ignorado en `create`.
- Los tipos de evento (todo salvo potreros/lotes/animales/historial/feedRecords/animalExits en
  edición) llevan además `happenedAt` (ISO 8601) — se guarda como `eventDate`.
- **Cada operación falla independientemente** — un error en una no aborta el resto del batch.

### 5.1 `localRef_<campo>` — referencias cruzadas dentro del mismo batch

Para referenciar un registro creado **en este mismo batch** que todavía no tiene `serverId`,
usar `"localRef_<campo>": "<localId del registro referenciado>"` en vez del campo normal.
El servidor lo sustituye automáticamente por el `serverId` real.

```json
{
  "ranchLots": [{
    "localId": "lote-001", "operation": "create",
    "data": { "name": "Lote Cría A", "lotType": "cria", "localRef_idRanchPasture": "pot-001" }
  }]
}
```

Si el registro referenciado **ya existe en el servidor** (no es de este batch), usar el campo
normal con el `serverId` real (`"idRanchPasture": 5`), nunca `localRef_*`.

Si un `localRef_*` no resuelve contra ningún `localId` de este batch, la operación falla
explícitamente:
```json
{ "localId": "lote-001", "status": "failed", "error": "localRef_idRanchPasture=\"pot-001\" does not match any localId registered earlier in this batch" }
```

### 5.2 Respuesta — forma común

```json
{
  "totalSucceeded": 2,
  "totalFailed": 0,
  "<sección>": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      { "localId": "uuid-local-1", "status": "success", "serverId": 5 }
    ]
  }
}
```

`status: "failed"` trae además `"error": "<mensaje>"`. Mapear `localId → serverId` en la base
local ni bien llega la respuesta.

### 5.3 Idempotencia

Todas las entidades sincronizables (salvo Sanidad, ver §4.4) soportan reintento seguro del mismo
`create`: si se reenvía el mismo `localId`, el servidor detecta que ya existe y devuelve el
`serverId` ya asignado, sin crear un duplicado. Diseñar el cliente para reintentar libremente
ante fallas de red — el peor caso es una respuesta idéntica a la anterior.

---

## 6. `POST /sync/cria`

Orden de secciones: `ranchPastures → ranchLots → ranchAnimals → breedingServices →
gestationDiagnoses → parturitions → weanings → animalDeclaredHistories`.

| Sección | Campos de `data` (create) |
|---|---|
| `ranchPastures` | `name, areaHectares, description?, isActive?` — el `idRanch` lo toma del nivel superior del batch (NO va en `data`). |
| `ranchLots` | `idRanchPasture` (o `localRef_idRanchPasture`), `name, lotType, capacity?` — `idRanch` NO va en `data`. |
| `ranchAnimals` | `idRanch` (sí, obligatorio en `data` — no se hereda del nivel superior), `code, idBreed, idStatus, idAnimalClass, sex, birthdate, idProductiveStatus?, weight?, origin?, codeMother?, codeFather?, idLot?/localRef_idLot`, `createdAt?` |
| `breedingServices` | `idRanchAnimal`/`localRef_idRanchAnimal`, `serviceType, idAnimalMale?, semenBreed?, technician?, reproductiveLot?` + `happenedAt` |
| `gestationDiagnoses` | `idRanchAnimal, idService`/`localRef_*`, `method, result, gestationDays?, estimatedBirth?, veterinarian?` + `happenedAt` |
| `parturitions` | `idRanchAnimal, idDiagnosis`/`localRef_*`, `birthType, criaStatus, criaWeight?, motherCondition?, criaData?` (si `criaStatus="alive"`, `criaData` es obligatorio: `{code, idBreed, idStatus, idAnimalClass, sex, weight?}`) + `happenedAt` |
| `weanings` | `idRanchAnimal`/`localRef_*`, `idLotDest`/`localRef_idLotDest`, `weaningWeight?, weaningAge?` + `happenedAt` |
| `animalDeclaredHistories` | `idRanchAnimal`/`localRef_*`, `prevBirthsCount?, prevLastBirthYear?, prevAvgWeaningWeight?, notes?` (sin `happenedAt` — no genera evento) |

**Valores de enum:**
- `lotType`: `cria` \| `recria` \| `engorde` \| `reproductiva` \| `general`
- `serviceType`: `natural` \| `artificial_insemination` \| `embryo_transfer`
- `method` (diagnóstico): `palpation` \| `ultrasound`
- `result` (diagnóstico): `pregnant` \| `empty`
- `birthType`: `normal` \| `assisted` \| `cesarean`
- `criaStatus`: `alive` \| `dead`
- `motherCondition`: `good` \| `regular` \| `bad`

**Reglas de negocio activas también en sync**: RN-13 (hembra con diagnóstico `pregnant` activo no
recibe nuevo servicio), RN-12 (parto requiere diagnóstico `pregnant`), RN-14 (1:1
diagnóstico↔parto — repetir un parto sobre el mismo diagnóstico falla con
`PARTURITION_ALREADY_EXISTS`, incluso si es un reintento con el mismo `localId`), RN-19
(edad de destete 120–300 días), chequeo de capacidad de plan al crear una cría viva.

---

## 7. `POST /sync/recria`

Orden: `weightRecords → rearingSelections`.

| Sección | Campos de `data` (create) |
|---|---|
| `weightRecords` | `idRanchAnimal, idLot?, weight, weightType, bodyCondition?, ageDays?, notes?` + `happenedAt` |
| `rearingSelections` | `idRanchAnimal, destination, idLotDest?/localRef_idLotDest, weightAtSelection?, bodyCondition?, geneticScore?` + `happenedAt` |

`weightType`: `scale` \| `estimated`. `destination`: `replacement` \| `fattening` \| `sale`.

- `destination="fattening"` requiere `idLotDest` — crea automáticamente un `fattening_entries` y
  cambia el animal a ps=3 (Engorde). Requiere además `systemType` (`field`|`feedlot`) en `data`.
- `destination="sale"` cambia el animal a ps=4/status=Vendido — **irreversible**.
- Permitido en ps=1 (Cría), 2 (Recría) y 3 (Engorde) — necesario para el pesaje a 120 días.

---

## 8. `POST /sync/engorde`

Orden: `weightRecords → feedRecords`.

`weightRecords` usa el mismo endpoint/reglas que en Recría (§7).

| Sección | Campos de `data` (create) |
|---|---|
| `feedRecords` | `idLot, feedDate, feedType, quantity?, unit?, cost?, notes?` (sin `happenedAt` — `feed_records` es la única tabla del sistema sin `animal_event`, va por lote no por animal) |

---

## 9. `POST /sync/sanidad`

Orden: `vaccinations → treatments → healthIncidents`. Aplica en cualquier etapa productiva
(Cría, Recría, Engorde) sin importar el rubro habilitado en la estancia. **Ver §4.4: sin
`localId`, sin idempotencia en `create`.**

| Sección | Campos de `data` (create) |
|---|---|
| `vaccinations` | `idRanchAnimal, vaccineName, dose?, responsible?, notes?` + `happenedAt` |
| `treatments` | `idRanchAnimal, illness?, medication, dose?, durationDays?, withdrawalDays?, responsible?, notes?` + `happenedAt` — si se envía `withdrawalDays`, el backend calcula `withdrawalEndDate = eventDate + withdrawalDays`. |
| `healthIncidents` | `idRanchAnimal, incidentType, description?, notes?` + `happenedAt` |

`incidentType`: `illness_detected` \| `quarantine`. `quarantine` pone al animal en
`idStatus=2` (Observación); resolverlo (`update` con `resolvedAt`) lo revierte a `idStatus=1`.
**La mortalidad NO se registra acá** — va en `animalExits` (Movimientos, §10).

RN-18: un `treatment` con `withdrawalEndDate >= hoy` bloquea la venta del animal en Movimientos.

---

## 10. `POST /sync/movimientos`

Orden: `animalExits → movements → movementAnimals`.

### 10.1 `animalExits`

| Campo (`data`, create) | — |
|---|---|
| `idRanchAnimal, reason, notes?` + `happenedAt` | `reason`: `death` \| `discard` \| `loss` \| `other` (`other` requiere `notes`) |

Cambia el animal a ps=4/status=Inactivo — **irreversible**. `update` solo corrige `reason`/`notes`
(no revierte estado). **No admite `delete`** — falla con error explícito si se intenta.

### 10.2 `movements`

`data` (create): `idUser` (obligatorio — debe ser Owner de la estancia para
`sale`/`purchase`/`ranch_exit`, si no → falla con `RANCH_ACCESS_DENIED`/`403`),
`movementType, movementDate, counterpartName?, originName?, totalPrice?, pricePerKg?, notes?`,
y **`animals[]`** (mínimo 1):

```json
"animals": [
  { "localId": "ma-001", "idRanchAnimal": 4, "idLotDest": 8, "notes": "..." },
  { "localId": "ma-002", "newAnimal": { "idBreed": 1, "idAnimalClass": 8, "code": "COMP-01", "sex": "F", "birthdate": "2024-05-10", "weight": 320.5 } }
]
```

- `idRanchAnimal` (o `localRef_idRanchAnimal`): requerido para `sale`/`pasture_transfer`/`ranch_exit`.
- `newAnimal`: requerido solo para `purchase` — el servidor crea el `ranch_animal` con
  `origin=purchased`.
- `idLotDest`: requerido solo en `pasture_transfer`.
- Cada animal dentro de `animals[]` tiene su propio `localId` — el servidor lo registra en la
  respuesta (`movementAnimals` — ver §10.4) para poder confirmarlo/rechazarlo después.

`movementType`: `sale` \| `purchase` \| `pasture_transfer` \| `ranch_exit`.

- `pasture_transfer`/`purchase`/`ranch_exit` quedan **confirmados directo** al registrarse.
- `sale` queda **pending** hasta que cada animal se confirma/rechaza individualmente
  (`movementAnimals`, §10.3).
- `update` solo acepta `{ "data": { "status": "cancelled" } }` — cancela un `sale` pendiente,
  revirtiendo los animales todavía `pending` a su `prevIdStatus`. Cancelar un movimiento ya
  `confirmed` → falla con `MOVEMENT_ALREADY_CONFIRMED`. **No admite `delete`.**

### 10.3 `movementAnimals`

**Solo admite `update`** (confirmar/rechazar un animal de una venta pendiente) — los detalles se
crean anidados dentro de `movements`, nunca directo acá.

```json
{ "localId": "confirm-1", "operation": "update", "serverId": 63, "data": { "idUser": 1, "status": "accepted" } }
```

- `status`: `accepted` (venta final, irreversible — ps=4/Vendido) \| `rejected` (revierte a
  `prevIdStatus`).
- Target por `serverId` (si ya se conoce) **o por `localId`** si el animal fue creado en un
  batch anterior (o en la sección `movements` de este mismo batch) y todavía no se le devolvió
  el `serverId` al cliente.
- Máquina de estados idempotente: repetir la misma decisión → éxito sin efecto. Transición
  incompatible (ej. `accepted` sobre uno ya `rejected`) → falla solo esa operación con
  `INVALID_STATUS_TRANSITION`, el resto del batch sigue.

### 10.4 Ejemplo completo — venta + confirmación en el mismo batch

```json
{
  "idRanch": 1,
  "movements": [{
    "localId": "mv-1", "operation": "create",
    "data": {
      "idUser": 1, "movementType": "sale", "movementDate": "2026-07-16",
      "counterpartName": "Comprador X",
      "animals": [{ "localId": "ma-1", "idRanchAnimal": 76 }]
    }
  }],
  "movementAnimals": [
    { "localId": "confirm-1", "operation": "update", "localId": "ma-1", "data": { "idUser": 1, "status": "accepted" } }
  ]
}
```

La respuesta trae en `movementAnimals.results` DOS entradas para el mismo animal: una del
registro anidado (creación silenciosa dentro de `movements`) y otra de la confirmación explícita
— es el log completo de lo que pasó, no un resumen deduplicado.

---

## 11. Checklist de integración

- [ ] Login → guardar JWT
- [ ] `GET /sync/ranches` → estancias + rol del usuario
- [ ] `GET /sync/catalogs` → guardar en SQLite (una vez)
- [ ] Por cada `idRanch`: `GET /sync/download/:idRanch` sin `since` (bootstrap), paginar hasta `nextCursor=null`
- [ ] Guardar `serverTime` como `lastSyncAt` por estancia
- [ ] Aplicar `entities` con upsert por `id` (orden FK) y `deletions` borrando localmente
- [ ] `localRef_*` solo para registros del mismo batch — para uno ya existente, usar el campo normal con el serverId real
- [ ] Vaccinations/Treatments/HealthIncidents: no reintentar un `create` ya confirmado como exitoso (sin idempotencia)
- [ ] Movimientos: guardar el `localId→serverId` de cada `movementAnimal` anidado para confirmar/rechazar después
- [ ] Sincronizaciones periódicas: repetir descarga con `since=<lastSyncAt>`
