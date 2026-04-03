# Módulo de CRÍA — Estado Actual

**Última actualización**: 2 de abril de 2026  
**Status**: ✅ COMPLETO Y COMPILANDO

---

## 1. Descripción General

El **módulo de CRÍA** es el núcleo del sistema de Estancia 360, responsable de gestionar todo el ciclo reproductivo de los bovinos desde el servicio reproductivo (monta) hasta el destete.

### Ubicación en la arquitectura
```
src/
├── app/breeding/                     # Orquestador de CRÍA (use-cases, DTOs, lógica de negocio)
├── modules/
│   ├── breeding-modules/              # Módulos de CRÍA
│   │   ├── animal-declared-history/   # Tabla: animal_declared_history
│   │   ├── breeding-services/         # Tabla: breeding_services
│   │   ├── gestation-diagnoses/       # Tabla: gestation_diagnoses
│   │   ├── parturitions/              # Tabla: parturitions
│   │   └── weanings/                  # Tabla: weanings
│   └── ranch-management/
│       ├── animal-classes/            # Catálogo: animal_classes (NUEVO en diseño)
│       └── ranch-animals/             # Tabla: ranch_animals (entidad central)
```

---

## 2. Componentes del Módulo de CRÍA

### 2.1 animal-declared-history
**Base de datos**: `animal_declared_history`  
**Propósito**: Registra la genealogía declarada del animal (procedencia, pedigree)

- **Entity**: `AnimalDeclaredHistory`
- **DTO**: `AnimalDeclaredHistoryDto`, `CreateAnimalDeclaredHistoryDto`, `UpdateAnimalDeclaredHistoryDto`
- **Service**: `AnimalDeclaredHistoryService`
- **Controller**: `AnimalDeclaredHistoryController`
- **Use-cases**: 
  - `register-animal-declared-history.use-case.ts`
  - `update-animal-declared-history.use-case.ts`
  - `delete-animal-declared-history.use-case.ts`

**Relaciones**:
- FK `id_ranch_animal` → `ranch_animals.id_ranch_animal`

---

### 2.2 breeding-services
**Base de datos**: `breeding_services`  
**Propósito**: Registra los servicios reproductivos (montas naturales, IA, transferencia de embriones)

- **Entity**: `BreedingService` (con `ServiceType` enum: natural, artificial_insemination, embryo_transfer)
- **DTO**: `BreedingServiceDto`, `CreateBreedingServiceDto`, `UpdateBreedingServiceDto`
- **Service**: `BreedingServicesService`
- **Controller**: `BreedingServicesController`
- **Use-cases**:
  - `register-breeding-service.use-case.ts`
  - `update-breeding-service.use-case.ts`
  - `delete-breeding-service.use-case.ts`

**Relaciones**:
- FK `id_event` → `animal_events.id_event`
- FK `id_animal_male` → `ranch_animals.id_ranch_animal` (el toro, solo en servicios naturales)

**Validaciones**:
- RFC-04.1: Animal servido debe ser hembra en estado Cría (productive_status=1)
- RN-13: Una vaca NO puede tener múltiples servicios simultáneos con diagnóstico 'pregnant' activo

---

### 2.3 gestation-diagnoses
**Base de datos**: `gestation_diagnoses`  
**Propósito**: Registra los diagnósticos de gestación (ecografía, examen manual)

- **Entity**: `GestationDiagnosis` (con `GestationResult` enum: pregnant, empty, inconclusive)
- **DTO**: `GestationDiagnosisDto`, `CreateGestationDiagnosisDto`, `UpdateGestationDiagnosisDto`
- **Service**: `GestationDiagnosesService`
- **Controller**: `GestationDiagnosesController`
- **Use-cases**:
  - `register-gestation-diagnosis.use-case.ts`
  - `update-gestation-diagnosis.use-case.ts`
  - `delete-gestation-diagnosis.use-case.ts`

**Relaciones**:
- FK `id_service` → `breeding_services.id_service`
- FK `id_event` → `animal_events.id_event`

**Validación**:
- RN-14: Solo se puede registrar un diagnóstico 'pregnant' por servicio

---

### 2.4 parturitions
**Base de datos**: `parturitions`  
**Propósito**: Registra los partos (nacimientos)

- **Entity**: `Parturition` (con `CriaStatus` enum: alive, stillborn, malformed)
- **DTO**: `ParturitionDto`, `CreateParturitionDto`, `UpdateParturitionDto`
- **Service**: `ParturitionsService`
- **Controller**: `ParturitionsController`
- **Use-cases**:
  - `register-parturition.use-case.ts`
  - `update-parturition.use-case.ts`
  - `delete-parturition.use-case.ts`

**Relaciones**:
- FK `id_event` → `animal_events.id_event`
- FK `id_diagnosis` → `gestation_diagnoses.id_diagnosis`
- FK `id_cria` → `ranch_animals.id_ranch_animal` (el animal nacido, si criaStatus='alive')

**Lógica de creación de cría**:
Cuando se registra un parto con `criaStatus='alive'`, el sistema automáticamente:
1. Crea un nuevo `RanchAnimal` (cría)
2. Mediante `RanchAnimalsService.createCria()`:
   - Asigna el `id_animal_class` seleccionado por el usuario (Ternera, Ternero, etc.)
   - Establece `idProductiveStatus = 1` (Cría)
   - Establece `origin = 'born'`
   - Vincula la madre mediante `idMother`
   - NO calcula nada automáticamente; todo viene en `RegisterParturitionDto.criaData`

---

### 2.5 weanings
**Base de datos**: `weanings`  
**Propósito**: Registra los destetes (transición de Cría a Recría)

- **Entity**: `Weaning`
- **DTO**: `WeaningDto`, `CreateWeaningDto`, `UpdateWeaningDto`
- **Service**: `WeaningsService`
- **Controller**: `WeaningsController`
- **Use-cases**:
  - `register-weaning.use-case.ts`
  - `update-weaning.use-case.ts`
  - `delete-weaning.use-case.ts`

**Relaciones**:
- FK `id_event` → `animal_events.id_event`

**Lógica de actualización de estado**:
Cuando se registra un destete:
1. Se crea el evento animal (tipo WEANING)
2. Se llama a `RanchAnimalsService.markIsWeaned(idRanchAnimal, manager)`:
   - Actualiza `idProductiveStatus: 1 → 2` (Cría → Recría)
   - Automáticamente el animal se mueve a lotes de Recría

---

## 3. El Cambio de Diseño: De Booleanos a animal_classes

### Antes (Diseño antiguo)
- `RanchAnimal` tenía atributos booleanos para clasificación:
  - `is_ternera`, `is_vaca`, `is_toro`, etc.
  - Se calculaban automáticamente basándose en edad y sexo
  - Problema: lógica frágil, difícil de expandir

### Ahora (Diseño nuevo)
- Nueva tabla `animal_classes` con catálogo de categorías bovinas:
  ```sql
  animal_classes (
    id_animal_class INT PRIMARY KEY,
    name VARCHAR(100),
    sex CHAR(1), -- 'M' o 'F'
    is_active BOOLEAN
  )
  ```
- `RanchAnimal` tiene FK a `animal_classes`:
  ```sql
  id_animal_class INT NOT NULL FOREIGN KEY
  ```
- **La clase se selecciona manualmente** al crear o actualizar el animal
- El operador elige entre las categorías disponibles para el sexo del animal

### Categorías disponibles:
```
TERNEROS (menores de 11 meses, no destetados):
  - Ternera (F)
  - Ternero Macho Entero (M)
  - Ternero Macho Castrado (M)

DESTETADOS (post-destete, hasta 1 año):
  - Hembra Destetada (F)
  - Macho Entero Destetado (M)
  - Macho Castrado Destetado (M)

ADULTOS (12 meses o más):
  - Vaquilla (F, < 5 años, sin crías)
  - Vaca (F, con crías)
  - Hembra Esterilizada (F)
  - Toro (M)
  - Novillo (M)
```

---

## 4. Flujo Principal de CRÍA

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CICLO REPRODUCTIVO DE UNA VACA                                          │
└─────────────────────────────────────────────────────────────────────────┘

1. SERVICIO (breeding_services)
   ├─ Registrar monta natural → id_animal_male (toro)
   ├─ O registrar IA → semen_breed, technician
   └─ Crea evento animal (tipo 'SERVICE')

2. DIAGNÓSTICO (gestation_diagnoses)
   ├─ Registrar ecografía → resultado (pregnant, empty, inconclusive)
   ├─ Si pregnant → bloquea nuevos servicios
   └─ Crea evento animal (tipo 'DIAGNOSIS')

3. PARTO (parturitions)
   ├─ Registrar el parto
   ├─ Si cría viva:
   │  └─ Crear RanchAnimal automáticamente:
   │     ├─ id_animal_class: Ternera o Ternero (seleccionado)
   │     ├─ idProductiveStatus: 1 (Cría)
   │     ├─ idMother: vaca que pare
   │     └─ origin: 'born'
   ├─ Crea evento animal (tipo 'BIRTH')
   └─ Madre vuelve a estado fértil

4. DESTETE (weanings)
   ├─ Registrar destete cuando cría alcanza peso/edad
   ├─ Automáticamente actualiza:
   │  └─ idProductiveStatus: 1 → 2 (Cría → Recría)
   ├─ Cría se mueve a lote de Recría
   └─ Crea evento animal (tipo 'WEANING')

5. OPCIONAL: DESHACER DESTETE
   ├─ Si se elimina registro de weaning
   └─ Automáticamente revierte:
      └─ idProductiveStatus: 2 → 1 (Recría → Cría)
```

---

## 5. RanchAnimalsService — Métodos de CRÍA

Tres métodos nuevos en `RanchAnimalsService` soportan la lógica de CRÍA:

### 5.1 createCria(data, manager): Promise<RanchAnimal>
```typescript
async createCria(data: {
    idRanch: number;
    idBreed: number;
    idStatus: number;
    idAnimalClass: number;        // NUEVO: clase seleccionada (no calculada)
    code: string;                 // código único
    sex: 'F' | 'M';
    birthdate: Date;
    weight?: number;
    idMother?: number;
}, manager: EntityManager): Promise<RanchAnimal>
```

**Usado por**: `register-parturition.use-case.ts`  
**Asignaciones automáticas**:
- `idProductiveStatus = 1` (Cría)
- `origin = 'born'`

---

### 5.2 markIsWeaned(idRanchAnimal, manager): Promise<void>
```typescript
async markIsWeaned(
    idRanchAnimal: number, 
    manager: EntityManager
): Promise<void>
```

**Utilidad**: Actualiza `idProductiveStatus: 1 → 2`  
**Usado por**: `register-weaning.use-case.ts`  
**Operación**: Transacción en la BD

---

### 5.3 markIsNotWeaned(idRanchAnimal, manager): Promise<void>
```typescript
async markIsNotWeaned(
    idRanchAnimal: number, 
    manager: EntityManager
): Promise<void>
```

**Utilidad**: Revierte `idProductiveStatus: 2 → 1`  
**Usado por**: `delete-weaning.use-case.ts`  
**Operación**: Transacción en la BD

---

## 6. Reglas de Negocio (RN)

| RN | Descripción | Implementación |
|----|---------------------------------|---|
| **RN-11** | Toda cría viva debe tener `idMother NOT NULL` | En `create-parturition.dto.ts`: validar que si `criaStatus='alive'`, `criaData.idMother` es obligatorio |
| **RN-12** | Sin servicio registrado, no se puede diagnosticar ni registrar parto | En use-cases: verificar FK a `breeding_services` |
| **RN-13** | Una vaca con diagnóstico 'pregnant' activo NO puede recibir nuevo servicio | En `register-breeding-service.use-case.ts`: query de diagnósticos activos |
| **RN-14** | Solo un diagnóstico 'pregnant' por servicio | En `register-gestation-diagnosis.use-case.ts`: validar unicidad |

---

## 7. Animal Events (Eventos Animales)

Cada acción en CRÍA genera un registro en `animal_events`:

| Acción | Tipo de Evento | Tabla Asociada |
|--------|----------------|----|
| Servicio reproductivo | SERVICE | breeding_services |
| Diagnóstico de gestación | DIAGNOSIS | gestation_diagnoses |
| Parto | BIRTH | parturitions |
| Destete | WEANING | weanings |
| Historia declarada | DECLARED_HISTORY | animal_declared_history |

Estos eventos permiten:
- Trazabilidad completa del animal
- Línea de tiempo de eventos reproductivos
- Auditoría de cambios
- Offline sync (campo `isSynced`)

---

## 8. Bases de Datos — Estructura

### Tablasprin cipales:
```sql
-- Tabla central de animales
ranch_animals:
  id_ranch_animal BIGSERIAL
  id_animal_class INT            -- NUEVO: FK a animal_classes
  id_productive_status INT       -- 1=Cría, 2=Recría, 3=Engorde, 4=Baja
  id_mother BIGINT               -- FK a sí mismo (para crías nacidas)
  origin VARCHAR                 -- 'born' o 'purchased'

-- Catálogo de clases
animal_classes:
  id_animal_class INT
  name VARCHAR                   -- Ternera, Vaca, Toro, etc.
  sex CHAR(1)                    -- M o F

-- Módulo de CRÍA
breeding_services:
  id_service BIGSERIAL
  id_event BIGINT
  id_animal_male BIGINT          -- FK a ranch_animals (el toro)
  service_type VARCHAR           -- natural, artificial_insemination, embryo_transfer

gestation_diagnoses:
  id_diagnosis BIGSERIAL
  id_service BIGINT
  id_event BIGINT
  result VARCHAR                 -- pregnant, empty, inconclusive

parturitions:
  id_parturition BIGSERIAL
  id_diagnosis BIGINT
  id_event BIGINT
  id_cria BIGINT                 -- FK a ranch_animals (el animal nacido)
  cria_status VARCHAR            -- alive, stillborn, malformed

weanings:
  id_weaning BIGSERIAL
  id_event BIGINT
  weaning_weight NUMERIC
  age_days INT

animal_declared_history:
  id_declared_history BIGSERIAL
  id_ranch_animal BIGINT
  ...pedigree info...
```

---

## 9. DTOs y Validaciones

### CreateParturitionDto
```typescript
export class CreateParturitionDto {
    @IsNumber() idRanchAnimal: number;          // Madre
    @IsNumber() idDiagnosis: number;            // Diagnóstico 'pregnant'
    @IsEnum(CriaStatusEnum) criaStatus: string; // alive, stillborn, malformed
    @IsOptional() criaData?: {                  // Datos de cría SI criaStatus='alive'
        idBreed: number;
        idStatus: number;
        idAnimalClass: number;                  // NUEVO: obligatorio
        code: string;                           // código único
        sex: 'F' | 'M';
        weight?: number;
    };
    // ...otros campos...
}
```

---

## 10. Estado de Compilación

✅ **BUILD EXITOSO**  
```bash
> estancia-360-app@0.0.1 build
> nest build
[Sin errores]
```

### Módulos compilados:
- ✅ animal-declared-history
- ✅ breeding-services
- ✅ gestation-diagnoses
- ✅ parturitions
- ✅ weanings
- ✅ animal-classes (catálogo)
- ✅ app/breeding (orquestador)

### Métodos de RanchAnimalsService:
- ✅ `createCria()` — Crea animal nacido
- ✅ `markIsWeaned()` — Marca como destetado
- ✅ `markIsNotWeaned()` — Deshace destete

---

## 11. Próximos Pasos (En Caso Necesario)

- [ ] **Seed de datos**: Crear script `animal-classes.sql` con datos iniciales
- [ ] **Testing**: Unit tests para use-cases críticos (validaciones de RN)
- [ ] **Documentación API**: Swagger docs completos para endpoints
- [ ] **Validaciones**: Agregar más validaciones de negocio según requerimientos
- [ ] **Otros módulos**: Implementar Recría, Engorde, Sanidad (en paralello)

---

## 12. Contacto y Dudas

Para cuestiones sobre este módulo:
1. Revisar `db-estancia-360/breeding-*/init.sql` para ver esquema BD
2. Revisar `src/app/breeding/use-cases/` para lógica completa
3. Revisar `src/modules/breeding-modules/*/` para detalles de entidades y servicios

**Última actualización por**: Sistema de Documentación Automática  
**Fecha**: 2 de abril de 2026
