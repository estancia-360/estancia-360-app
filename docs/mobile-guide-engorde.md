# Guía Mobile — Módulo ENGORDE (React Native)

> Guía de integración para el desarrollador de la app móvil.
> Cubre el flujo de Engorde: ingreso al ciclo, pesajes de control, alimentación y salida.

---

## ¿Qué es Engorde?

El Engorde es la etapa final de producción del animal (ps=3). El animal llega aquí desde Recría (via selección de destino `fattening`) o directamente por compra. El objetivo es maximizar la ganancia de peso hasta la venta.

```
Animal en Recría (ps=2)
    ↓
rearing_selection (destination='fattening')  ← crea fattening_entry automáticamente
    ó
POST /fattening/entry  ← ingreso manual directo
    ↓
Animal en Engorde (ps=3, idLot = lote de engorde)
    ↓
POST /rearing/weight-record  ← pesajes periódicos (mismo endpoint que Recría)
POST /fattening/feed-record  ← alimentación del lote (por lote, no por animal)
    ↓
animal_sale (Módulo Movimientos — pendiente)  ← venta final
```

---

## Endpoints Online

### Ingreso a Engorde (manual)

> Solo necesario si el animal NO llega desde la selección de recría.
> Si viene de `rearing_selection destination='fattening'`, el `fattening_entry` ya fue creado automáticamente.

**POST /fattening/entry**
```json
{
  "idRanchAnimal": 4,
  "idLotDest": 3,
  "systemType": "feedlot",
  "initialWeight": 220.0,
  "eventDate": "2027-02-01T08:00:00.000Z",
  "isSynced": false
}
```
- `systemType`: `"feedlot"` (corral de engorde) | `"field"` (campo abierto)
- `initialWeight`: peso base del ciclo — se usa para calcular ganancia total (opcional pero recomendado)
- El servidor actualiza automáticamente `ranch_animals.id_productive_status = 3` y `ranch_animals.id_lot = idLotDest`
- El animal debe estar en ps=2 (Recría) — si no, retorna error

**PATCH /fattening/entry/:id** — actualiza `systemType` o `initialWeight`
**DELETE /fattening/entry/:id** — revierte ps=3 → ps=2 y limpia el lote (idLot=null)

---

### Pesajes en Engorde

**Mismo endpoint que Recría:** `POST /rearing/weight-record`

```json
{
  "idRanchAnimal": 4,
  "idLot": 3,
  "weight": 280.5,
  "weightType": "scale",
  "bodyCondition": 4,
  "ageDays": 420,
  "eventDate": "2027-05-10T08:00:00.000Z",
  "isSynced": false
}
```

El sistema permite pesajes en ps=1, ps=2 y ps=3. **ps=4 (baja) rechaza con error 400.**

**Calcular ganancia en Engorde:**
```javascript
// Obtener pesajes ordenados cronológicamente
GET /weight-records/animal/:idRanchAnimal

// Ganancia total desde el ingreso:
const gananciaTotal = pesoActual - initialWeight; // del fattening_entry

// GMD entre dos pesajes:
const gmd = (pesoActual - pesoPrevio) / diasEntreAmbos;
```

---

### Alimentación del Lote

> **IMPORTANTE:** Este es el único registro del sistema que NO genera un `animal_event`.
> La alimentación se registra por LOTE, no por animal individual.

**POST /fattening/feed-record**
```json
{
  "idLot": 3,
  "feedDate": "2027-05-10",
  "feedType": "Maíz molido",
  "quantity": 250.5,
  "unit": "kg",
  "cost": 1500.00,
  "isSynced": false
}
```
- `feedType`: texto libre — maíz, balanceado, heno, silaje, etc.
- `unit`: `"kg"` | `"bolsas"` | `"fardos"` | cualquier texto — si no se envía se asume kg
- `cost`: costo total del suministro (para indicadores económicos)
- `feedDate`: solo fecha, sin hora (`YYYY-MM-DD`)

**PATCH /fattening/feed-record/:id** — actualiza feedType, quantity, unit, cost, notes
**DELETE /fattening/feed-record/:id** — elimina el registro

**Conversión Alimenticia (calculada en cliente):**
```javascript
// Para un período de tiempo:
const consumoTotal = feedRecords.reduce((acc, r) => acc + r.quantity, 0);
const gananciaPeso = pesoFinal - pesoInicial;
const eficiencia = consumoTotal / gananciaPeso; // kg alimento / kg ganado
```

---

## Endpoints GET (consulta)

```
GET /fattening-entries/animal/:idRanchAnimal  ← ingresos a engorde de un animal
GET /fattening-entries/:id                    ← ingreso por ID

GET /feed-records/lot/:idLot                  ← alimentación de un lote (paginado, orden DESC)
GET /feed-records/:id                         ← registro de alimentación por ID

GET /weight-records/animal/:idRanchAnimal     ← pesajes del animal (ASC para GMD)
GET /weight-records/lot/:idLot                ← pesajes de todos los animales del lote
```

Todos aceptan `?page=1&limit=20`.

---

## Sincronización offline — POST /sync/engorde

Para operaciones registradas sin conexión.

**Orden de procesamiento:**
1. `weightRecords` — Pesajes de animales en Engorde
2. `feedRecords` — Alimentación por lote

**Estructura del batch:**
```json
{
  "idRanch": 1,
  "weightRecords": [
    {
      "localId": "peso-engorde-uuid-001",
      "operation": "create",
      "happenedAt": "2027-05-10T08:00:00.000Z",
      "data": {
        "idRanchAnimal": 4,
        "idLot": 3,
        "weight": 280.5,
        "weightType": "scale",
        "bodyCondition": 4,
        "ageDays": 420
      }
    }
  ],
  "feedRecords": [
    {
      "localId": "feed-uuid-001",
      "operation": "create",
      "happenedAt": "2027-05-10T08:00:00.000Z",
      "data": {
        "idLot": 3,
        "feedDate": "2027-05-10",
        "feedType": "Maíz molido",
        "quantity": 250,
        "unit": "kg",
        "cost": 1500
      }
    }
  ]
}
```

**Respuesta:**
```json
{
  "totalSucceeded": 2,
  "totalFailed": 0,
  "weightRecords": {
    "succeeded": 1,
    "failed": 0,
    "results": [{ "localId": "peso-engorde-uuid-001", "status": "success", "serverId": 8 }]
  },
  "feedRecords": {
    "succeeded": 1,
    "failed": 0,
    "results": [{ "localId": "feed-uuid-001", "status": "success", "serverId": 1 }]
  }
}
```

---

## Diferencias clave respecto a Recría

| | Recría | Engorde |
|---|---|---|
| Pesajes | `POST /rearing/weight-record` | mismo endpoint (ps=3 permitido) |
| Referencia base de peso | último pesaje | `fattening_entry.initial_weight` |
| Alimentación | no aplica | `POST /fattening/feed-record` (por lote) |
| Sync | `POST /sync/recria` | `POST /sync/engorde` |
| Evento animal | sí (animal_events) | pesajes sí — alimentación NO |

---

## Reglas de negocio críticas

| Regla | Descripción |
|---|---|
| RN-09 | Solo animales en ps=2 (Recría) pueden ingresar a Engorde |
| RN-02 | Animal dado de baja (ps=4) no puede recibir más eventos |
| RN-07 | Baja (ps=4) es IRREVERSIBLE |

---

## Flujo de pantallas sugerido

### Pantalla "Detalle Animal en Engorde"
1. Mostrar `fattening_entry` del animal (`GET /fattening-entries/animal/:id`)
2. Mostrar lista de pesajes (`GET /weight-records/animal/:id`)
3. Calcular GMD y ganancia total vs `initial_weight`
4. Botón "Registrar Pesaje" → `POST /rearing/weight-record`

### Pantalla "Lote de Engorde"
1. Listar animales del lote con peso actual
2. Pestañas: Pesajes del lote / Alimentación del lote
3. `GET /weight-records/lot/:idLot` — pesajes
4. `GET /feed-records/lot/:idLot` — alimentación
5. Botón "Registrar Alimentación" → `POST /fattening/feed-record`
6. Calcular conversión alimenticia del período

---

## Idempotencia offline (localId)

Tanto `weightRecords` como `feedRecords` en el sync soportan idempotencia via `localId`.

**Cómo funciona:**
- El móvil genera un UUID único por cada registro creado offline y lo almacena localmente junto al registro.
- Al enviar el batch, incluye ese UUID en `localId`.
- Si el servidor ya procesó ese `localId` (por un reenvío), devuelve el mismo `serverId` sin crear duplicado.
- Si el servidor nunca lo vio, crea el registro y guarda el `localId`.

```json
// ✅ CORRECTO — siempre incluir localId en create
{
  "localId": "feed-uuid-generado-en-dispositivo",
  "operation": "create",
  "data": { ... }
}

// ✅ CORRECTO — update/delete requieren serverId (el que retornó el primer create)
{
  "localId": "cualquier-string-unico",
  "serverId": 5,
  "operation": "update",
  "data": { "quantity": 300 }
}
```

**Qué pasa si omitís localId en un create:** El registro se crea igual, pero si la red falla después de que el servidor confirme y antes de que el móvil reciba la respuesta, el próximo reenvío creará un duplicado. **Siempre incluir localId.**

---

## Notas importantes

- **`fattening_entry` automático**: Si el animal llega de `rearing_selection destination='fattening'`, el servidor ya creó el `fattening_entry`. No hay que crearlo de nuevo con `POST /fattening/entry`.
- **`feedRecords` sin `isSynced` automático**: Como no tiene `animal_event`, tiene su propio campo `is_synced`. Enviar siempre `"isSynced": false` en modo online, `true` cuando viene del sync offline.
- **`localRef_` en feedRecords**: Si en el mismo batch de sync creaste un lote offline y querés referenciar ese lote en `feedRecords`, podés usar `"localRef_idLot": "uuid-del-lote"`.
- **Conversión alimenticia**: El servidor NO la calcula ni almacena. El móvil la calcula con `feed_records` y `weight_records` del lote en el período deseado.
- **RN-02**: Intentar pesar un animal en ps=4 (baja) retorna `400 ANIMAL_IS_BAJA`. Validar en UI antes de enviar.
