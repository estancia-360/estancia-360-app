# Guía móvil — Módulo Cría

> Flujo online (en tiempo real, con conexión). Para el batch offline ver `mobile-guide-sync.md`
> (`POST /sync/cria`).

## Flujo productivo

```
Hembra disponible (ps=1, sex=F)
  → POST /breeding/breeding-service       servicio de monta
  → POST /breeding/gestation-diagnosis    diagnóstico (si result=pregnant, continúa)
  → POST /breeding/parturition            parto (si criaStatus=alive, crea el ranch_animal de la cría)
  → POST /breeding/weaning                destete (120–300 días) → cría pasa a ps=2 (Recría)
```

Todos los endpoints requieren JWT y devuelven el recurso envuelto por nombre, ej.
`{ "breedingService": { ... } }`, salvo donde se indique lo contrario.

## Endpoints

| Método | Ruta | Envuelve como |
|---|---|---|
| POST/PATCH/DELETE | `/breeding/breeding-service` | `{ breedingService }` |
| POST/PATCH/DELETE | `/breeding/gestation-diagnosis` | `{ gestationDiagnosis }` |
| POST/PATCH/DELETE | `/breeding/parturition` | `{ parturition }` |
| POST/PATCH/DELETE | `/breeding/weaning` | `{ weaning }` |
| POST/PATCH/DELETE | `/breeding/animal-declared-history` | `{ history }` |
| GET | `/breeding-services/animal/:id`, `/breeding-services/:id` | `{ breedingService }` en el `:id`; lista paginada sin envolver en el `/animal/:id` |
| GET | `/gestation-diagnoses/animal/:id`, `/gestation-diagnoses/:id` | ídem |
| GET | `/parturitions/animal/:id`, `/parturitions/:id` | ídem |
| GET | `/breeding/weanings/animal/:id`, `/breeding/weanings/:id`, `/breeding/weanings/by-ranch/:idRanch` | ídem |
| GET | `/animal-declared-history/animal/:idRanchAnimal`, `/animal-declared-history/:idHistory` | `{ history }` |

### `POST /breeding/breeding-service`
```json
{ "idRanchAnimal": 10, "serviceType": "natural", "idAnimalMale": 3, "eventDate": "2026-03-01T09:00:00.000Z", "isSynced": false }
```
`serviceType`: `natural` (requiere `idAnimalMale`) | `artificial_insemination` (usar `semenBreed`, `technician`) | `embryo_transfer`.

### `POST /breeding/gestation-diagnosis`
```json
{ "idRanchAnimal": 10, "idService": 5, "method": "ultrasound", "result": "pregnant", "gestationDays": 45, "estimatedBirth": "2026-10-15", "eventDate": "2026-04-15T10:00:00.000Z" }
```
`method`: `palpation` | `ultrasound`. `result`: `pregnant` | `empty`. Se permite más de un
diagnóstico por servicio (re-evaluaciones en campo).

### `POST /breeding/parturition`
```json
{
  "idRanchAnimal": 10, "idDiagnosis": 5, "birthType": "normal", "criaStatus": "alive",
  "criaWeight": 35.5, "motherCondition": "good",
  "criaData": { "code": "BOV-2026-045", "idBreed": 2, "idStatus": 1, "idAnimalClass": 1, "sex": "F", "weight": 35.5 },
  "eventDate": "2026-07-10T06:30:00.000Z"
}
```
`birthType`: `normal` | `assisted` | `cesarean`. `criaStatus`: `alive` | `dead`.
`motherCondition`: `good` | `regular` | `bad`. `criaData` es obligatorio solo si
`criaStatus=alive` — el servidor crea el `ranch_animal` de la cría automáticamente.
`criaWeight` acepta decimales (`NUMERIC(6,2)`).

RN-12: requiere diagnóstico con `result=pregnant`. RN-14: un diagnóstico solo puede tener un
parto — repetirlo falla con `409 PARTURITION_ALREADY_EXISTS`. Si la estancia llegó al límite de
animales de su plan y `criaStatus=alive`, falla con `400 SUBSCRIPTION_CAPACITY_EXCEEDED`.

### `POST /breeding/weaning`
```json
{ "idRanchAnimal": 45, "idLotDest": 8, "weaningWeight": 195, "weaningAge": 180, "eventDate": "2026-11-25T08:00:00.000Z" }
```
RN-15: `idLotDest` debe ser un lote `lotType=recria`. RN-19: edad de destete 120–300 días
(no bloquea, solo se documenta — offline-first no permite hard blocks aquí). Cambia el animal a
`ps=2` (Recría) y lo mueve a `idLotDest`.

### `POST /breeding/animal-declared-history`
```json
{ "idRanchAnimal": 22, "prevBirthsCount": 4, "prevLastBirthYear": 2025, "prevAvgWeaningWeight": 185, "notes": "Vaca importada..." }
```
Historial reproductivo previo de un animal importado — sin `eventDate` (no genera `animal_event`).
Un solo historial por animal.

## Catálogo `id_animal_class` (usado en `criaData.idAnimalClass`)

`1=Ternera 2=Ternero Macho Entero 3=Ternero Macho Castrado 4=Hembra Destetada
5=Macho Entero Destetado 6=Macho Castrado Destetado 7=Vaquilla 8=Vaca 9=Hembra Esterilizada
10=Torillo 11=Novillo`
