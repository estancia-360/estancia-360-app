# Guía Mobile — Módulo RECRÍA (React Native)

> Guía de integración para el desarrollador de la app móvil.
> Cubre el flujo de Recría: pesajes de seguimiento y selección de destino final del animal.

---

## ¿Qué es Recría?

La Recría es la etapa posterior al destete (ps=2). El animal creció, ya no depende de la madre.  
El objetivo en esta etapa es **monitorear el crecimiento** (pesajes) y **decidir su destino** (selección).

```
Cría destetada (ps=2, Recría)
    ↓
POST /rearing/weight-record    ← pesaje periódico (ej: cada 30-60 días)
POST /rearing/weight-record    ← pesaje siguiente
    ... (múltiples pesajes para calcular GMD)
    ↓
POST /rearing/rearing-selection  ← decisión final:
    - replacement → queda en estancia como reproductor
    - fattening   → pasa a Engorde (ps=3)
    - sale        → dado de baja / venta (ps=4, IRREVERSIBLE)
```

---

## Endpoints Online

### Pesajes

**POST /rearing/weight-record**
```json
{
  "idRanchAnimal": 15,
  "idLot": 4,
  "weight": 185.5,
  "weightType": "scale",
  "bodyCondition": 3,
  "ageDays": 180,
  "notes": "Pesaje rutinario",
  "eventDate": "2026-05-10T08:00:00.000Z",
  "isSynced": false
}
```
- `weightType`: `"scale"` (balanza) | `"estimated"` (visual/estimado)
- `bodyCondition`: 1 (muy malo) a 5 (excelente) — opcional
- `ageDays`: edad del animal en días al momento del pesaje — opcional pero recomendado
- El servidor actualiza automáticamente `ranch_animals.weight` con el nuevo peso

**PATCH /rearing/weight-record/:id** — actualiza peso, tipo, condición, edad o notas
**DELETE /rearing/weight-record/:id** — elimina pesaje y su evento animal

---

### Calcular GMD (Ganancia Media Diaria)

La GMD **no se almacena en el servidor**. El móvil debe calcularla consultando los pesajes en orden cronológico:

```
GET /weight-records/animal/:idRanchAnimal?page=1&limit=50
```

La respuesta retorna los pesajes ordenados cronológicamente (ASC). El móvil calcula:
```javascript
const gmd = (pesoActual - pesoPrevio) / diasEntreAmbos;
```

**Ejemplo:**
```
Pesaje 1: 145 kg — día 0 (destete)
Pesaje 2: 185 kg — día 60
GMD = (185 - 145) / 60 = 0.667 kg/día
```

---

### Selección de recría

**POST /rearing/rearing-selection**
```json
{
  "idRanchAnimal": 15,
  "destination": "replacement",
  "weightAtSelection": 200.0,
  "bodyCondition": 4,
  "geneticScore": 7.5,
  "eventDate": "2026-06-15T10:00:00.000Z",
  "isSynced": false
}
```

#### Destinos posibles

**`replacement`** — Reemplazante / vientre reproductor
```json
{
  "idRanchAnimal": 15,
  "destination": "replacement",
  "weightAtSelection": 200.0,
  "eventDate": "2026-06-15T10:00:00.000Z"
}
```
→ Animal permanece en Recría (ps=2). Sin cambios de estado.

---

**`fattening`** — Ingresa a Engorde
```json
{
  "idRanchAnimal": 16,
  "destination": "fattening",
  "idLotDest": 7,
  "systemType": "feedlot",
  "weightAtSelection": 220.0,
  "eventDate": "2026-06-15T10:00:00.000Z"
}
```
→ `idLotDest` y `systemType` son **obligatorios** para este destino.  
→ Servidor crea automáticamente un `fattening_entry`.  
→ Animal pasa a ps=3 (Engorde).  
→ `systemType`: `"feedlot"` | `"field"`

---

**`sale`** — Destinado a venta / baja
```json
{
  "idRanchAnimal": 17,
  "destination": "sale",
  "weightAtSelection": 195.0,
  "eventDate": "2026-06-15T10:00:00.000Z"
}
```
→ Animal pasa a ps=4, status=3.  
→ **IRREVERSIBLE** — no se puede deshacer (RN-07).

---

**PATCH /rearing/rearing-selection/:id** — actualiza peso, condición o score genético
**DELETE /rearing/rearing-selection/:id**
- Si destino era `fattening`: revierte ps=3 → ps=2 y elimina el fattening_entry
- Si destino era `sale`: **NO revierte** (baja irreversible)

---

## Endpoints GET (consulta)

```
GET /weight-records/animal/:idRanchAnimal    ← pesajes de un animal (ordenados ASC para GMD)
GET /weight-records/lot/:idLot               ← todos los pesajes de un lote
GET /weight-records/:id                      ← pesaje por ID

GET /rearing-selections/animal/:idRanchAnimal ← selecciones de un animal
GET /rearing-selections/:id                   ← selección por ID
```

Todos aceptan `?page=1&limit=20`.

---

## Sincronización offline — POST /sync/recria

Para operaciones registradas sin conexión.

**Orden de procesamiento:**
1. `weightRecords` — Pesajes
2. `rearingSelections` — Selecciones

**Estructura del batch:**
```json
{
  "idRanch": 1,
  "weightRecords": [
    {
      "localId": "peso-uuid-001",
      "operation": "create",
      "happenedAt": "2026-05-10T08:00:00.000Z",
      "data": {
        "idRanchAnimal": 15,
        "idLot": 4,
        "weight": 185.5,
        "weightType": "scale",
        "bodyCondition": 3,
        "ageDays": 180
      }
    }
  ],
  "rearingSelections": [
    {
      "localId": "sel-uuid-001",
      "operation": "create",
      "happenedAt": "2026-06-15T10:00:00.000Z",
      "data": {
        "idRanchAnimal": 15,
        "destination": "fattening",
        "idLotDest": 7,
        "systemType": "feedlot",
        "weightAtSelection": 220.0
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
    "results": [{ "localId": "peso-uuid-001", "status": "success", "serverId": 45 }]
  },
  "rearingSelections": {
    "succeeded": 1,
    "failed": 0,
    "results": [{ "localId": "sel-uuid-001", "status": "success", "serverId": 12 }]
  }
}
```

---

## Reglas de negocio críticas

| Regla | Descripción |
|-------|-------------|
| RN-02 | Animal dado de baja (ps=4) no puede recibir más eventos |
| RN-07 | Baja (ps=4) es IRREVERSIBLE |
| RN-09 | Solo animales en ps=2 (Recría) pueden ir a Engorde |

---

## Flujo de pantallas sugerido

### Pantalla "Detalle Animal en Recría"
1. Mostrar lista de pesajes (`GET /weight-records/animal/:id`)
2. Calcular GMD entre el último y el anterior
3. Botón "Registrar Pesaje" → `POST /rearing/weight-record`
4. Botón "Seleccionar Destino" → pantalla de selección → `POST /rearing/rearing-selection`

### Pantalla "Lote de Recría"
1. Listar animales del lote con peso actual
2. Ver pesajes del lote: `GET /weight-records/lot/:idLot`
3. Acceso rápido a pesaje masivo (un pesaje por animal, crear batch para `/sync/recria`)

---

## Notas importantes

- **GMD calculado en cliente**: El servidor solo guarda pesajes individuales. La GMD la calcula el móvil.
- **Destino `fattening`**: El servidor crea el `fattening_entry` automáticamente. El móvil no necesita hacer un segundo request.
- **Destino `sale`**: El animal queda bloqueado para cualquier evento posterior. Confirmar antes de enviar.
- **`weight` en ranch_animal**: Cada pesaje actualiza el peso actual del animal. El móvil puede confiar en `ranch_animal.weight` como el peso más reciente.
