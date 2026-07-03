# Guía Mobile — Módulo CRÍA (React Native)

> Guía de integración para el desarrollador de la app móvil.
> Cubre el flujo completo de reproducción bovina: servicio → diagnóstico → parto → destete.

---

## Flujo productivo

```
Hembra disponible
    ↓
POST /breeding/breeding-service       ← registrar servicio de monta
    ↓
POST /breeding/gestation-diagnosis    ← registrar diagnóstico (palpación/ecografía)
    ↓ (si result = "pregnant")
POST /breeding/parturition            ← registrar parto
    ↓ (si criaStatus = "alive")
    [nuevo ranch_animal creado automáticamente]
    ↓ (después de 120-300 días)
POST /breeding/weaning                ← registrar destete → animal pasa a Recría (ps=2)
```

---

## Endpoints Online

### Servicios de monta

**POST /breeding/breeding-service**
```json
{
  "idRanchAnimal": 10,
  "serviceType": "natural",
  "idAnimalMale": 3,
  "eventDate": "2026-03-01T09:00:00.000Z",
  "isSynced": false
}
```
- `serviceType`: `"natural"` | `"artificial_insemination"` | `"embryo_transfer"`
- `idAnimalMale`: obligatorio si `serviceType = "natural"`
- `semenBreed`: opcional, nombre de la raza del semen (IA)

**PATCH /breeding/breeding-service/:id** — actualiza campos editables
**DELETE /breeding/breeding-service/:id** — elimina en cascada (diagnóstico → parto incluidos)

---

### Diagnóstico de gestación

**POST /breeding/gestation-diagnosis**
```json
{
  "idRanchAnimal": 10,
  "idService": 5,
  "method": "ultrasound",
  "result": "pregnant",
  "gestationDays": 45,
  "estimatedBirth": "2026-10-15",
  "eventDate": "2026-04-15T10:00:00.000Z",
  "isSynced": false
}
```
- `method`: `"palpation"` | `"ultrasound"`
- `result`: `"pregnant"` | `"empty"`
- Se permite registrar múltiples diagnósticos por servicio (ej: primer diagnóstico vacía, segundo embarazada)

**PATCH /breeding/gestation-diagnosis/:id**
**DELETE /breeding/gestation-diagnosis/:id** — elimina también el parto asociado si existe

---

### Parto

**POST /breeding/parturition**
```json
{
  "idRanchAnimal": 10,
  "idDiagnosis": 2,
  "birthType": "normal",
  "criaStatus": "alive",
  "motherCondition": "good",
  "eventDate": "2026-10-14T06:30:00.000Z",
  "isSynced": false,
  "criaData": {
    "code": "BOV-2026-045",
    "idBreed": 1,
    "idStatus": 1,
    "idAnimalClass": 1,
    "sex": "F",
    "weight": 35.5
  }
}
```
- `birthType`: `"normal"` | `"assisted"` | `"cesarean"`
- `criaStatus`: `"alive"` | `"dead"`
- `criaData`: **obligatorio si criaStatus = "alive"**. El servidor crea automáticamente el nuevo animal.
- `idAnimalClass` de la cría: 1=Ternera, 2=Ternero Macho Entero, 3=Ternero Macho Castrado

**PATCH /breeding/parturition/:id**
**DELETE /breeding/parturition/:id**

---

### Destete

**POST /breeding/weaning**
```json
{
  "idRanchAnimal": 15,
  "idLotDest": 4,
  "weaningWeight": 145.0,
  "weaningAge": 180,
  "eventDate": "2027-04-12T08:00:00.000Z",
  "isSynced": false
}
```
- `idRanchAnimal`: ID de la **cría** (no la madre)
- `idLotDest`: debe ser un lote de tipo `"rearing"` (Recría) — RN-15
- El animal pasa automáticamente a `id_productive_status = 2` (Recría)
- `weaningAge`: edad en días al destete. Rango válido: 120–300 días (RN-19)

**PATCH /breeding/weaning/:id**
**DELETE /breeding/weaning/:id** — revierte ps=2 → ps=1 y elimina idLot del animal

---

### Historial declarado (animales importados)

**POST /breeding/animal-declared-history**
```json
{
  "idRanchAnimal": 10,
  "prevBirthsCount": 3,
  "prevLastBirthYear": 2025,
  "prevAvgWeaningWeight": 142.0
}
```
- Solo para animales que ya tenían historial reproductivo antes de ingresar al sistema
- Un solo historial por animal

---

## Endpoints GET (consulta)

```
GET /breeding-services/animal/:id       ← lista servicios de un animal
GET /breeding-services/:id              ← obtener servicio por ID

GET /gestation-diagnoses/animal/:id     ← lista diagnósticos de un animal
GET /gestation-diagnoses/:id

GET /parturitions/animal/:id            ← lista partos de un animal
GET /parturitions/:id

GET /breeding/weanings/animal/:id       ← lista destetes de un animal (por idCria)
GET /breeding/weanings/:id
GET /breeding/weanings/by-ranch/:id     ← todos los destetes de la estancia
```

Todos aceptan query params de paginación: `?page=1&limit=20`

---

## Sincronización offline — POST /sync/cria

Para operaciones sin conexión. Ver [mobile-guide-sync.md] o documentación Swagger completa.

**Orden de procesamiento garantizado:**
1. ranchPastures
2. ranchLots
3. ranchAnimals
4. breedingServices
5. gestationDiagnoses
6. parturitions
7. weanings
8. animalDeclaredHistories

**Estructura básica:**
```json
{
  "idRanch": 1,
  "breedingServices": [
    {
      "localId": "srv-uuid-001",
      "operation": "create",
      "happenedAt": "2026-03-01T09:00:00.000Z",
      "data": {
        "idRanchAnimal": 10,
        "serviceType": "natural",
        "idAnimalMale": 3
      }
    }
  ]
}
```

**Referencias cruzadas:** para referenciar registros creados en el mismo batch, usar `localRef_<campo>`:
```json
{
  "localId": "diag-001",
  "operation": "create",
  "happenedAt": "2026-04-15T10:00:00.000Z",
  "data": {
    "idRanchAnimal": 10,
    "localRef_idService": "srv-uuid-001",
    "method": "ultrasound",
    "result": "pregnant"
  }
}
```

---

## Catálogos necesarios

### Animal Classes (id_animal_class)
| ID | Nombre | Sexo |
|----|--------|------|
| 1 | Ternera | F |
| 2 | Ternero Macho Entero | M |
| 3 | Ternero Macho Castrado | M |
| 4 | Hembra Destetada | F |
| 5 | Macho Entero Destetado | M |
| 6 | Macho Castrado Destetado | M |
| 7 | Vaquilla | F |
| 8 | Vaca | F |
| 9 | Hembra Esterilizada | F |
| 10 | Torillo | M |
| 11 | Novillo | M |

### Lot Types (para idLotDest en weaning)
- `"rearing"` — Lote de Recría (único tipo válido para destete)

---

## Reglas de negocio críticas

| Regla | Descripción |
|-------|-------------|
| RN-04 | Animal debe estar activo para recibir eventos reproductivos |
| RN-11 | Cría viva requiere datos criaData completos |
| RN-12 | Solo diagnóstico con result=pregnant puede tener parto |
| RN-14 | Un diagnóstico → un solo parto (1:1) |
| RN-15 | idLotDest en destete debe ser lote tipo "rearing" |
| RN-19 | Edad destete: 120–300 días |

---

## Respuesta típica de creación

```json
{
  "data": {
    "parturition": {
      "id": 3,
      "idEvent": 12,
      "idDiagnosis": 2,
      "idCria": 15,
      "birthType": "normal",
      "criaStatus": "alive",
      "motherCondition": "good",
      "event": {
        "id": 12,
        "idRanchAnimal": 10,
        "idEventType": 3,
        "eventDate": "2026-10-14T06:30:00.000Z"
      }
    }
  }
}
```
