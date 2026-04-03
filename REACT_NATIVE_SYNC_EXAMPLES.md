# 📱 Guía Completa: Sincronización de CRÍA para React Native

**Versión:** 1.0  
**Fecha:** 3 de abril de 2026  
**Audiencia:** Desarrolladores mobile (React Native)

---

## 📋 Tabla de Contenidos

1. [Valores Permitidos Globales](#valores-permitidos-globales)
2. [Proceso 1: Potreros (Pastures)](#proceso-1-potreros-pastures)
3. [Proceso 2: Lotes (Lots)](#proceso-2-lotes-lots)
4. [Proceso 3: Animales (Animals)](#proceso-3-animales-animals)
5. [Proceso 4: Servicios de Cría (Breeding Services)](#proceso-4-servicios-de-cría-breeding-services)
6. [Proceso 5: Diagnósticos de Gestación (Gestation Diagnoses)](#proceso-5-diagnósticos-de-gestación-gestation-diagnoses)
7. [Proceso 6: Partos (Parturitions)](#proceso-6-partos-parturitions)
8. [Proceso 7: Destetes (Weanings)](#proceso-7-destetes-weanings)
9. [Proceso 8: Historiales de Cría (Animal Declared History)](#proceso-8-historiales-de-cría-animal-declared-history)
10. [Flujo Completo: Ejemplo End-to-End](#flujo-completo-ejemplo-end-to-end)

---

## Valores Permitidos Globales

### Operaciones CRUD
```javascript
const OPERATIONS = ['create', 'update', 'delete'];
```

### Sexo del Animal
```javascript
const SEX = ['F', 'M'];  // F = Femenino, M = Masculino
```

### Tipos de Lotes y sus Propósitos
```javascript
const LOT_TYPES = {
  'breeding': 'Reproducción (cría)',
  'rearing': 'Recría/Levante (jóvenes en crecimiento)',
  'fattening': 'Engorde (ganancia rápida de peso)',
  'reproductive': 'Reproductivo especializado',
  'general': 'General/Sin clasificación'
};
```

### Clases de Animales (id_animal_class)
```javascript
const ANIMAL_CLASSES = {
  1: 'Ternera',
  2: 'Ternero macho entero',
  3: 'Ternero macho castrado',
  4: 'Hembra destetada',
  5: 'Macho entero destetado',
  6: 'Macho castrado destetado',
  7: 'Vaquilla',
  8: 'Vaca',
  9: 'Hembra esterilizada',
  10: 'Toro',
  11: 'Novillo'
};
```

### Estados de Salud del Animal (id_status)
Estos son dinámicos en BD, pero típicamente:
```javascript
const ANIMAL_STATUSES = {
  1: 'Sano',
  2: 'Enfermo',
  3: 'Inactivo',
  4: 'Cuarentena'
};
```

### Estados Productivos (id_productive_status)
```javascript
const PRODUCTIVE_STATUSES = {
  1: 'Activo en reproducción',
  2: 'Inactivo',
  3: 'En ceba'
};
```

---

## Proceso 1: Potreros (Pastures)

### Schema en BD
```sql
CREATE TABLE ranch_pastures (
  id_ranch_pasture BIGINT PRIMARY KEY,
  id_ranch BIGINT NOT NULL,
  name VARCHAR(50) NOT NULL UNIQUE,
  local_id VARCHAR(100) UNIQUE,
  area_hectares DECIMAL(12,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `name` | string | ✅ | Max 100 chars, ÚNICO en estancia | "Potrero Norte" |
| `areaHectares` | number | ✅ | > 0, 2 decimales | 15.5, 22.75 |
| `description` | string | ❌ | Max 500 chars | "Campo natural con agua" |
| `isActive` | boolean | ❌ | Default: true | true / false |

### Ejemplo CREATE (Potrero Nueva)

```json
{
  "localId": "pot-abc-123",
  "operation": "create",
  "data": {
    "name": "Potrero Norte",
    "areaHectares": 15.5,
    "description": "Campo natural con agua permanente. Pasto mejorado Brachiaria",
    "isActive": true
  }
}
```

### Ejemplo UPDATE (Modificar Descripción)

```json
{
  "localId": "pot-abc-124",
  "operation": "update",
  "serverId": 5,
  "data": {
    "description": "Campo actualizado. Nuevo bebedero instalado",
    "areaHectares": 16.2
  }
}
```

### Ejemplo DELETE (Soft Delete)

```json
{
  "localId": "pot-abc-125",
  "operation": "delete",
  "serverId": 5,
  "data": {}
}
```

### Código React Native

```typescript
import { v4 as uuidv4 } from 'uuid';

interface PastureOperation {
  localId: string;
  operation: 'create' | 'update' | 'delete';
  serverId?: number;
  data: Record<string, any>;
}

// CREATE
const createPasture = (): PastureOperation => {
  return {
    localId: `pot-${uuidv4()}`,
    operation: 'create',
    data: {
      name: 'Potrero Sur', // DEBE ser único
      areaHectares: 18.75,
      description: 'Campo en regeneración después de pastoreo',
      isActive: true
    }
  };
};

// UPDATE
const updatePasture = (serverId: number): PastureOperation => {
  return {
    localId: `pot-${uuidv4()}`,
    operation: 'update',
    serverId, // NECESARIO para update
    data: {
      areaHectares: 19.0 // Cambiar solo lo que necesites
    }
  };
};

// DELETE (soft delete)
const deletePasture = (serverId: number): PastureOperation => {
  return {
    localId: `pot-${uuidv4()}`,
    operation: 'delete',
    serverId, // NECESARIO para delete
    data: {} // Vacío
  };
};
```

---

## Proceso 2: Lotes (Lots)

### Schema en BD
```sql
CREATE TABLE ranch_lots (
  id_lot BIGINT PRIMARY KEY,
  id_ranch BIGINT NOT NULL,
  id_ranch_pasture BIGINT NOT NULL,
  name VARCHAR(50) NOT NULL UNIQUE,
  local_id VARCHAR(100) UNIQUE,
  lot_type VARCHAR(30) NOT NULL,
  capacity INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_ranch_pasture) REFERENCES ranch_pastures(id_ranch_pasture)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Valores Válidos |
|-------|------|-------------|-------------|-----------------|
| `name` | string | ✅ | Max 100 chars, ÚNICO | "Lote Cría A" |
| `lotType` | enum | ✅ | Debe existir | `breeding`, `rearing`, `fattening`, `reproductive`, `general` |
| `idRanchPasture` | number | ✅ | FK a potreros | ID del potrero o `localRef_idRanchPasture` |
| `capacity` | number | ❌ | Entero positivo | 50, 100, 200 (informativo) |
| `isActive` | boolean | ❌ | Default: true | true / false |

### Ejemplo CREATE (Lote Breeding)

```json
{
  "localId": "lote-xyz-001",
  "operation": "create",
  "data": {
    "name": "Lote Cría A",
    "lotType": "breeding",
    "idRanchPasture": 5,
    "capacity": 50,
    "isActive": true
  }
}
```

### Ejemplo CREATE con Referencia Local (Potrero del Batch)

```json
{
  "localId": "lote-xyz-002",
  "operation": "create",
  "data": {
    "name": "Lote Recría B",
    "lotType": "rearing",
    "localRef_idRanchPasture": "pot-abc-123",
    "capacity": 75
  }
}
```

### Ejemplo UPDATE

```json
{
  "localId": "lote-xyz-003",
  "operation": "update",
  "serverId": 12,
  "data": {
    "capacity": 60
  }
}
```

### Código React Native

```typescript
interface LotOperation {
  localId: string;
  operation: 'create' | 'update' | 'delete';
  serverId?: number;
  data: Record<string, any>;
}

enum LotType {
  BREEDING = 'breeding',
  REARING = 'rearing',
  FATTENING = 'fattening',
  REPRODUCTIVE = 'reproductive',
  GENERAL = 'general'
}

// CREATE con potrero existente
const createLot = (pastureId: number): LotOperation => {
  return {
    localId: `lote-${uuidv4()}`,
    operation: 'create',
    data: {
      name: 'Lote Engorde Final', // ÚNICO
      lotType: LotType.FATTENING,
      idRanchPasture: pastureId, // O localRef_idRanchPasture si es del batch
      capacity: 100,
      isActive: true
    }
  };
};

// CREATE con referencia a potrero del MISMO batch
const createLotWithLocalRef = (pastureLocalId: string): LotOperation => {
  return {
    localId: `lote-${uuidv4()}`,
    operation: 'create',
    data: {
      name: 'Lote Destete',
      lotType: LotType.REARING,
      localRef_idRanchPasture: pastureLocalId, // Referencia al localId del potrero
      capacity: 80
    }
  };
};

// UPDATE
const updateLot = (serverId: number, newCapacity: number): LotOperation => {
  return {
    localId: `lote-${uuidv4()}`,
    operation: 'update',
    serverId,
    data: {
      capacity: newCapacity
    }
  };
};
```

---

## Proceso 3: Animales (Animals)

### Schema en BD
```sql
CREATE TABLE ranch_animals (
  id_ranch_animal BIGINT PRIMARY KEY,
  id_ranch BIGINT NOT NULL,
  id_mother BIGINT,
  id_father BIGINT,
  id_breed INT NOT NULL,
  id_status INT NOT NULL,
  id_productive_status INT,
  id_animal_class INT NOT NULL,
  id_lot BIGINT,
  code VARCHAR(50) NOT NULL UNIQUE,
  local_id VARCHAR(100) UNIQUE,
  birthdate DATE NOT NULL,
  weight NUMERIC(12,2),
  sex CHAR(1) NOT NULL,
  origin VARCHAR(300),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT check_sex CHECK (sex IN ('F','M')),
  FOREIGN KEY (id_breed) REFERENCES animal_breeds(id_breed),
  FOREIGN KEY (id_status) REFERENCES animal_statuses(id_status),
  FOREIGN KEY (id_productive_status) REFERENCES productive_statuses(id),
  FOREIGN KEY (id_animal_class) REFERENCES animal_classes(id_animal_class)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `code` | string | ✅ | Max 50 chars, ÚNICO (caravana/marca) | "HAC-001", "2025-F-5432" |
| `idBreed` | number | ✅ | FK a razas | 1, 2, 3 (Angus, Charolais, Hereford) |
| `idStatus` | number | ✅ | FK a estados | 1=Sano, 2=Enfermo, 3=Inactivo, 4=Cuarentena |
| `idAnimalClass` | number | ✅ | FK a clases | 1-11 (ver tabla de clases) |
| `sex` | string | ✅ | SOLO: "F" o "M" | "F" o "M" |
| `birthdate` | date | ✅ | ISO 8601 (YYYY-MM-DD), ≤ hoy | "2024-03-15" |
| `idProductiveStatus` | number | ✅ | FK a estados productivos | 1, 2, 3 |
| `weight` | number | ❌ | Kg, 2 decimales | 350.5, 450 |
| `origin` | string | ❌ | Trazabilidad | "Crianza local", "Compra importación" |
| `codeMother` / `idMother` | string/number | ❌ | Ref a madre (female) | Ver ejemplo |
| `codeFather` / `idFather` | string/number | ❌ | Ref a padre (male) | Ver ejemplo |

### Validaciones Críticas

⚠️ **GENEALOGÍA:**
- Madre (idMother/codeMother) DEBE estar en BD o ser del MISMO batch con `localRef_idMother`
- Padre (idFather/codeFather) DEBE estar en BD o ser del MISMO batch con `localRef_idFather`
- Si se proporciona, madre DEBE ser sexo "F"
- Si se proporciona, padre DEBE ser sexo "M"
- Un animal NO PUEDE ser padre/madre de sí mismo

⚠️ **SEX MATCH:**
- sex="F" es válido para cualquier idAnimalClass
- sex="M" se valida: idAnimalClass debe ser 2 (macho entero) o 3 (macho castrado) o 5, 6, 10, 11

### Ejemplo CREATE (Hembra Nacida in Situ)

```json
{
  "localId": "ani-hembra-001",
  "operation": "create",
  "data": {
    "code": "HAC-001",
    "idBreed": 1,
    "idStatus": 1,
    "idAnimalClass": 4,
    "sex": "F",
    "birthdate": "2024-03-15",
    "idProductiveStatus": 1,
    "weight": 380,
    "origin": "Crianza local",
    "codeMother": "HAC-005",
    "codeFather": "HAC-003",
    "idLot": 5
  }
}
```

### Ejemplo CREATE (Animal Importado sin Genealogía)

```json
{
  "localId": "ani-importado-001",
  "operation": "create",
  "data": {
    "code": "IMP-ANGUS-2025-01",
    "idBreed": 1,
    "idStatus": 1,
    "idAnimalClass": 8,
    "sex": "F",
    "birthdate": "2020-11-20",
    "idProductiveStatus": 1,
    "weight": 420,
    "origin": "Importación Uruguay - Ganadería Las Flores"
  }
}
```

### Ejemplo CREATE con Referencias Locales (Batch)

```json
{
  "localId": "ani-cria-batch",
  "operation": "create",
  "data": {
    "code": "CRIA-BATCH-001",
    "idBreed": 2,
    "idStatus": 1,
    "idAnimalClass": 4,
    "sex": "F",
    "birthdate": "2026-06-20",
    "idProductiveStatus": 1,
    "weight": 32,
    "localRef_idMother": "ani-hembra-001",
    "localRef_idFather": "ani-macho-002",
    "localRef_idLot": "lote-xyz-001"
  }
}
```

### Código React Native

```typescript
interface AnimalOperation {
  localId: string;
  operation: 'create' | 'update' | 'delete';
  serverId?: number;
  data: Record<string, any>;
}

enum Sex {
  FEMALE = 'F',
  MALE = 'M'
}

enum AnimalClass {
  TERNERA = 1,
  TERNERO_MACHO_ENTERO = 2,
  TERNERO_MACHO_CASTRADO = 3,
  HEMBRA_DESTETADA = 4,
  MACHO_ENTERO_DESTETADO = 5,
  MACHO_CASTRADO_DESTETADO = 6,
  VAQUILLA = 7,
  VACA = 8,
  HEMBRA_ESTERILIZADA = 9,
  TORO = 10,
  NOVILLO = 11
}

// CREATE: Hembra nueva
const createHeifer = (motherCode?: string, fatherCode?: string): AnimalOperation => {
  return {
    localId: `ani-${uuidv4()}`,
    operation: 'create',
    data: {
      code: `HAC-${Date.now()}`, // ÚNICO
      idBreed: 1, // Charolais
      idStatus: 1, // Sano
      idAnimalClass: AnimalClass.HEMBRA_DESTETADA,
      sex: Sex.FEMALE,
      birthdate: '2024-03-15', // YYYY-MM-DD, <= hoy
      idProductiveStatus: 1,
      weight: 350,
      origin: 'Crianza local',
      ...(motherCode && { codeMother: motherCode }),
      ...(fatherCode && { codeFather: fatherCode })
    }
  };
};

// CREATE: Macho reprod​uctor
const createMale = (): AnimalOperation => {
  return {
    localId: `ani-${uuidv4()}`,
    operation: 'create',
    data: {
      code: `TAU-${Date.now()}`, // ÚNICO
      idBreed: 1,
      idStatus: 1,
      idAnimalClass: AnimalClass.TORO,
      sex: Sex.MALE, // MALE
      birthdate: '2020-06-01',
      idProductiveStatus: 1,
      weight: 850,
      origin: 'Crianza local'
    }
  };
};

// CREATE: Cría con referencias del MISMO BATCH
const createNewbornWithLocalRefs = (
  motherLocalId: string,
  fatherLocalId: string,
  lotLocalId: string
): AnimalOperation => {
  const birthdate = new Date().toISOString().split('T')[0]; // Hoy
  return {
    localId: `ani-${uuidv4()}`,
    operation: 'create',
    data: {
      code: `NEWBORN-${Date.now()}`,
      idBreed: 1,
      idStatus: 1,
      idAnimalClass: AnimalClass.TERNERA,
      sex: Sex.FEMALE,
      birthdate, // Hoy
      idProductiveStatus: 1,
      weight: 32,
      localRef_idMother: motherLocalId,
      localRef_idFather: fatherLocalId,
      localRef_idLot: lotLocalId
    }
  };
};

// UPDATE: Cambiar peso y estado productivo
const updateAnimalWeight = (serverId: number, newWeight: number): AnimalOperation => {
  return {
    localId: `ani-${uuidv4()}`,
    operation: 'update',
    serverId,
    data: {
      weight: newWeight
    }
  };
};
```

---

## Proceso 4: Servicios de Cría (Breeding Services)

### Schema en BD
```sql
CREATE TABLE breeding_services (
  id_service BIGINT PRIMARY KEY,
  id_event BIGINT NOT NULL,
  id_animal_male BIGINT,
  service_type ENUM('natural', 'artificial_insemination', 'embryo_transfer') NOT NULL,
  semen_breed VARCHAR(100),
  technician VARCHAR(150),
  reproductive_lot VARCHAR(100),
  local_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_event) REFERENCES animal_events(id_event)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Valores Válidos |
|-------|------|-------------|-------------|-----------------|
| `idRanchAnimal` | number | ✅ | FK a hembra | ID o `localRef_idRanchAnimal` |
| `serviceType` | enum | ✅ | Debe ser exacto | `"natural"`, `"artificial"`, `"embryo"` |
| `idAnimalMale` | number | ⚠️ | Obligatorio si serviceType="natural" | ID del macho o `localRef_idAnimalMale` |
| `semenBreed` | string | ❌ | Raza/tipo semen | "Charolais", "Angus", "Brahman" |
| `technician` | string | ❌ | Nombre del técnico | "Dr. López", "María García" |
| `reproductiveLot` | string | ❌ | Grupo/lote reproductor | "Lote Cría A", "Grupo 5" |

### Validaciones Críticas

⚠️ **RESTRICCIÓN:** La misma hembra NO puede tener 2 servicios el MISMO día
⚠️ **RESTRICCIÓN:** idRanchAnimal DEBE ser hembra (sex = 'F')
⚠️ **RESTRICCIÓN:** Si serviceType = 'natural', idAnimalMale es obligatorio y DEBE ser macho (sex = 'M')

### Ejemplo CREATE (Monta Natural)

```json
{
  "localId": "srv-nat-001",
  "operation": "create",
  "happenedAt": "2026-03-10T09:30:00.000Z",
  "data": {
    "idRanchAnimal": 15,
    "serviceType": "natural",
    "idAnimalMale": 8,
    "reproductiveLot": "Lote Cría A",
    "notes": "Monta natural exitosa, rechazo positivo"
  }
}
```

### Ejemplo CREATE (Inseminación Artificial)

```json
{
  "localId": "srv-ia-001",
  "operation": "create",
  "happenedAt": "2026-03-12T10:00:00.000Z",
  "data": {
    "idRanchAnimal": 15,
    "serviceType": "artificial",
    "semenBreed": "Charolais Premium",
    "technician": "Dr. López",
    "reproductiveLot": "Lote Cría A",
    "notes": "IA exitosa con semen congelado de importación"
  }
}
```

### Ejemplo CREATE (Transferencia de Embriones)

```json
{
  "localId": "srv-emb-001",
  "operation": "create",
  "happenedAt": "2026-03-15T11:15:00.000Z",
  "data": {
    "idRanchAnimal": 22,
    "serviceType": "embryo",
    "semenBreed": "Angus Puro (sexado)",
    "technician": "Dra. Martínez",
    "reproductiveLot": "Lote Cría B",
    "notes": "Transferencia de embrión de raza Angus, muy buena calidad"
  }
}
```

### Código React Native

```typescript
interface BreedingServiceOperation {
  localId: string;
  operation: 'create';
  data: Record<string, any>;
  happenedAt: string; // ISO 8601
}

enum ServiceType {
  NATURAL = 'natural',
  ARTIFICIAL = 'artificial',
  EMBRYO = 'embryo'
}

// CREATE: Monta Natural
const createNaturalService = (
  femaleId: number,
  maleId: number,
  reproductiveLot: string
): BreedingServiceOperation => {
  return {
    localId: `srv-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: femaleId, // DEBE ser hembra
      serviceType: ServiceType.NATURAL,
      idAnimalMale: maleId, // OBLIGATORIO para natural
      reproductiveLot,
      notes: 'Monta natural sin complicaciones'
    }
  };
};

// CREATE: Inseminación Artificial
const createArtificialService = (
  femaleId: number,
  semenBreed: string,
  technician: string
): BreedingServiceOperation => {
  return {
    localId: `srv-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: femaleId,
      serviceType: ServiceType.ARTIFICIAL,
      semenBreed, // Ej: "Charolais", "Angus"
      technician,
      reproductiveLot: 'Lote Cría A'
    }
  };
};

// CREATE: Con referencias locales
const createServiceWithLocalRefs = (
  femaleLocalId: string,
  maleLocalId: string
): BreedingServiceOperation => {
  return {
    localId: `srv-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      localRef_idRanchAnimal: femaleLocalId,
      serviceType: ServiceType.NATURAL,
      localRef_idAnimalMale: maleLocalId,
      notes: 'Servicio de batch'
    }
  };
};
```

---

## Proceso 5: Diagnósticos de Gestación (Gestation Diagnoses)

### Schema en BD
```sql
CREATE TABLE gestation_diagnoses (
  id_diagnosis BIGINT PRIMARY KEY,
  id_event BIGINT NOT NULL,
  id_service BIGINT NOT NULL,
  method VARCHAR(20) NOT NULL,
  result VARCHAR(20) NOT NULL,
  gestation_days INT,
  estimated_birth DATE,
  veterinarian VARCHAR(150),
  local_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_service) REFERENCES breeding_services(id_service),
  FOREIGN KEY (id_event) REFERENCES animal_events(id_event)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Valores Válidos |
|-------|------|-------------|-------------|-----------------|
| `idRanchAnimal` | number | ✅ | Hembra | ID o `localRef_idRanchAnimal` |
| `idService` | number | ✅ | FK a servicio | ID o `localRef_idService` |
| `method` | enum | ✅ | Exacto | `"ultrasound"`, `"palpation"`, `"blood_test"` |
| `result` | enum | ✅ | Exacto | `"pregnant"`, `"empty"`, `"uncertain"` |
| `gestationDays` | number | ❌ | Días de gestación | 20-80 típicamente |
| `estimatedBirth` | date | ❌ | ISO 8601 | "2026-06-20" |
| `veterinarian` | string | ❌ | Profesional | "Dr. Carlos Ruiz" |

### Validaciones Críticas

⚠️ **TIMING:** El diagnóstico debe hacerse 20-60 días POST servicio
⚠️ **RESULTADO POSITIVO:** Si result="pregnant", se bloquean otros servicios para la hembra
⚠️ **RESULTADO NEGATIVO:** Si result="empty", se permite nuevo servicio inmediatamente

### Ejemplo CREATE (Diagnóstico Positivo por Ecografía)

```json
{
  "localId": "diag-pos-001",
  "operation": "create",
  "happenedAt": "2026-04-20T10:30:00.000Z",
  "data": {
    "idRanchAnimal": 15,
    "idService": 8,
    "method": "ultrasound",
    "result": "pregnant",
    "gestationDays": 40,
    "estimatedBirth": "2026-06-20",
    "veterinarian": "Dr. Carlos Ruiz",
    "notes": "Ecografía confirma embrión viable. Desarrollo normal para 40 días, placenta perfecta"
  }
}
```

### Ejemplo CREATE (Diagnóstico Negativo por Palpación)

```json
{
  "localId": "diag-neg-001",
  "operation": "create",
  "happenedAt": "2026-04-25T09:00:00.000Z",
  "data": {
    "idRanchAnimal": 16,
    "idService": 9,
    "method": "palpation",
    "result": "empty",
    "veterinarian": "Dr. López",
    "notes": "Palpación rectal: útero vacío. Probable falla de inseminación. Ciclo normal, lista para re-servicio"
  }
}
```

### Ejemplo CREATE (Diagnóstico Incierto)

```json
{
  "localId": "diag-unc-001",
  "operation": "create",
  "happenedAt": "2026-04-22T11:00:00.000Z",
  "data": {
    "idRanchAnimal": 17,
    "idService": 10,
    "method": "blood_test",
    "result": "uncertain",
    "gestationDays": 30,
    "veterinarian": "Dr. Martínez",
    "notes": "Análisis de sangre: niveles de progesterona ligeramente elevados. Necesita re-evaluación en 7 días"
  }
}
```

### Código React Native

```typescript
interface GestationDiagnosisOperation {
  localId: string;
  operation: 'create';
  data: Record<string, any>;
  happenedAt: string;
}

enum DiagnosisMethod {
  ULTRASOUND = 'ultrasound',
  PALPATION = 'palpation',
  BLOOD_TEST = 'blood_test'
}

enum DiagnosisResult {
  PREGNANT = 'pregnant',
  EMPTY = 'empty',
  UNCERTAIN = 'uncertain'
}

// CREATE: Diagnóstico positivo (ecografía)
const createPositiveDiagnosis = (
  femaleId: number,
  serviceId: number,
  estimatedBirth: string
): GestationDiagnosisOperation => {
  return {
    localId: `diag-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: femaleId,
      idService: serviceId,
      method: DiagnosisMethod.ULTRASOUND,
      result: DiagnosisResult.PREGNANT,
      gestationDays: 40,
      estimatedBirth, // "2026-06-20"
      veterinarian: 'Dr. Carlos Ruiz',
      notes: 'Diagnóstico positivo confirmado por ecografía'
    }
  };
};

// CREATE: Diagnóstico negativo
const createNegativeDiagnosis = (
  femaleId: number,
  serviceId: number
): GestationDiagnosisOperation => {
  return {
    localId: `diag-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: femaleId,
      idService: serviceId,
      method: DiagnosisMethod.PALPATION,
      result: DiagnosisResult.EMPTY,
      veterinarian: 'Dr. López',
      notes: 'Sin preñez confirmada. Lista para nuevo servicio'
    }
  };
};

// CREATE: Con referencias locales
const createDiagnosisWithLocalRefs = (
  femaleLocalId: string,
  serviceLocalId: string,
  result: DiagnosisResult
): GestationDiagnosisOperation => {
  return {
    localId: `diag-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      localRef_idRanchAnimal: femaleLocalId,
      localRef_idService: serviceLocalId,
      method: DiagnosisMethod.ULTRASOUND,
      result,
      gestationDays: 45,
      estimatedBirth: result === DiagnosisResult.PREGNANT ? '2026-06-25' : undefined
    }
  };
};
```

---

## Proceso 6: Partos (Parturitions)

### Schema en BD
```sql
CREATE TABLE parturitions (
  id_parturition BIGINT PRIMARY KEY,
  id_event BIGINT NOT NULL,
  id_diagnosis BIGINT NOT NULL,
  id_cria BIGINT,
  birth_type VARCHAR(20) NOT NULL,
  cria_weight INT,
  cria_status VARCHAR(20) NOT NULL,
  mother_condition VARCHAR(20),
  local_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_diagnosis) REFERENCES gestation_diagnoses(id_diagnosis)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Valores Válidos |
|-------|------|-------------|-------------|-----------------|
| `idRanchAnimal` (madre) | number | ✅ | FK hembra | ID o `localRef_idRanchAnimal` |
| `idDiagnosis` | number | ✅ | FK diagnóstico | ID o `localRef_idDiagnosis` (DEBE ser result="pregnant") |
| `birthType` | enum | ✅ | Exacto | `"natural"`, `"assisted"`, `"surgical"` |
| `criaStatus` | enum | ✅ | Exacto | `"alive"`, `"dead"`, `"weak"` |
| `criaWeight` | number | ❌ | Kg | 28-45 típicamente |
| `criaData` | object | ❌ | JSON | `{sex: "F", color: "rojo", code: "CRIA-001"}` |
| `motherCondition` | string | ❌ | Condición | "good", "regular", "bad" |

### Validaciones Críticas

⚠️ **PARTO SOLO POST DIAGNÓSTICO:** Solo después de diagnóstico result="pregnant"
⚠️ **FECHA ESTIMADA:** Parto debe estar ±10 días de estimatedBirth
⚠️ **CRÍA CREADA:** Si criaStatus="alive", el sistema crea automáticamente el registro del animal

### Ejemplo CREATE (Parto Natural Exitoso)

```json
{
  "localId": "parto-001",
  "operation": "create",
  "happenedAt": "2026-06-20T14:35:00.000Z",
  "data": {
    "idRanchAnimal": 15,
    "idDiagnosis": 12,
    "birthType": "natural",
    "criaStatus": "alive",
    "criaWeight": 32,
    "criaData": {
      "sex": "F",
      "color": "rojo oscuro",
      "code": "CRIA-HAC-001"
    },
    "motherCondition": "good",
    "notes": "Parto natural sin complicaciones. Cría hembra sana, amamantamiento inmediato"
  }
}
```

### Ejemplo CREATE (Parto con Asistencia)

```json
{
  "localId": "parto-002",
  "operation": "create",
  "happenedAt": "2026-06-21T11:20:00.000Z",
  "data": {
    "idRanchAnimal": 16,
    "idDiagnosis": 13,
    "birthType": "assisted",
    "criaStatus": "alive",
    "criaWeight": 28,
    "motherCondition": "regular",
    "notes": "Parto asistido por tracción suave. Cría pequeña pero viable. Madre 38ºC, bajo vigilancia"
  }
}
```

### Ejemplo CREATE (Cesárea de Emergencia)

```json
{
  "localId": "parto-003",
  "operation": "create",
  "happenedAt": "2026-06-22T16:45:00.000Z",
  "data": {
    "idRanchAnimal": 17,
    "idDiagnosis": 14,
    "birthType": "surgical",
    "criaStatus": "alive",
    "criaWeight": 35,
    "criaData": {
      "sex": "M"
    },
    "motherCondition": "bad",
    "notes": "Cesárea por distocia (posición anómala de cría). Incisión limpia, sin complicaciones quirúrgicas. Cría macho sano. Madre requiere antibióticos 10 días"
  }
}
```

### Ejemplo CREATE (Cría Nacida Muerta)

```json
{
  "localId": "parto-004",
  "operation": "create",
  "happenedAt": "2026-06-23T06:00:00.000Z",
  "data": {
    "idRanchAnimal": 18,
    "idDiagnosis": 15,
    "birthType": "natural",
    "criaStatus": "dead",
    "notes": "Cría nacida sin signos de vida. Autopsia no realizada. Causa probable: aborto perinatal"
  }
}
```

### Código React Native

```typescript
interface ParturitionOperation {
  localId: string;
  operation: 'create';
  data: Record<string, any>;
  happenedAt: string;
}

enum BirthType {
  NATURAL = 'natural',
  ASSISTED = 'assisted',
  SURGICAL = 'surgical'
}

enum CriaStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
  WEAK = 'weak'
}

enum MotherCondition {
  GOOD = 'good',
  REGULAR = 'regular',
  BAD = 'bad'
}

interface CriaData {
  sex?: 'F' | 'M';
  color?: string;
  code?: string;
  [key: string]: any;
}

// CREATE: Parto natural exitoso
const createNaturalBirth = (
  motherId: number,
  diagnosisId: number,
  criaData: CriaData
): ParturitionOperation => {
  return {
    localId: `parto-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: motherId,
      idDiagnosis: diagnosisId,
      birthType: BirthType.NATURAL,
      criaStatus: CriaStatus.ALIVE,
      criaWeight: 32,
      criaData,
      motherCondition: MotherCondition.GOOD,
      notes: 'Parto natural exitoso'
    }
  };
};

// CREATE: Parto con asistencia
const createAssistedBirth = (
  motherId: number,
  diagnosisId: number
): ParturitionOperation => {
  return {
    localId: `parto-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: motherId,
      idDiagnosis: diagnosisId,
      birthType: BirthType.ASSISTED,
      criaStatus: CriaStatus.ALIVE,
      criaWeight: 28,
      motherCondition: MotherCondition.REGULAR,
      notes: 'Asistencia con tracción manual. Cría viable, madre estable'
    }
  };
};

// CREATE: Con referencias locales
const createBirthWithLocalRefs = (
  motherLocalId: string,
  diagnosisLocalId: string,
  criaDataSex: 'F' | 'M'
): ParturitionOperation => {
  return {
    localId: `parto-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      localRef_idRanchAnimal: motherLocalId,
      localRef_idDiagnosis: diagnosisLocalId,
      birthType: BirthType.NATURAL,
      criaStatus: CriaStatus.ALIVE,
      criaWeight: 32,
      criaData: { sex: criaDataSex },
      motherCondition: MotherCondition.GOOD
    }
  };
};
```

---

## Proceso 7: Destetes (Weanings)

### Schema en BD
```sql
CREATE TABLE weanings (
  id_weaning BIGINT PRIMARY KEY,
  id_event BIGINT NOT NULL,
  id_cria BIGINT NOT NULL,
  id_lot_dest BIGINT NOT NULL,
  weaning_weight DECIMAL(10,2),
  weaning_age INT,
  local_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_cria) REFERENCES ranch_animals(id_ranch_animal),
  FOREIGN KEY (id_lot_dest) REFERENCES ranch_lots(id_lot),
  FOREIGN KEY (id_event) REFERENCES animal_events(id_event)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `idRanchAnimal` (cría) | number | ✅ | FK animal | ID o `localRef_idRanchAnimal` |
| `idLotDest` | number | ⚠️ | FK lote | ID o `localRef_idLotDest` (recomendado) |
| `weaningWeight` | number | ❌ | Kg (2 decimales) | 180, 200, 220 |
| `weaningAge` | number | ❌ | Días | 150, 180, 210 |

### Validaciones Críticas

⚠️ **EDAD:** Rango típico 150-210 días. Fuera de 120-300 días genera advertencia
⚠️ **SINGULARIDAD:** Un animal NO puede ser destetado dos veces
⚠️ **MADRE DISPONIBLE:** Después del destete, la madre queda disponible para nuevo ciclo reproductivo

### Ejemplo CREATE (Destete Normal a los 180 días)

```json
{
  "localId": "destete-001",
  "operation": "create",
  "happenedAt": "2026-11-25T08:00:00.000Z",
  "data": {
    "idRanchAnimal": 45,
    "idLotDest": 8,
    "weaningWeight": 195,
    "weaningAge": 180,
    "notes": "Destete a los 180 días. Cría en excelente salud, peso ideal para edad. Comportamiento normal"
  }
}
```

### Ejemplo CREATE (Destete Tardío)

```json
{
  "localId": "destete-002",
  "operation": "create",
  "happenedAt": "2026-12-10T09:15:00.000Z",
  "data": {
    "idRanchAnimal": 46,
    "idLotDest": 9,
    "weaningWeight": 220,
    "weaningAge": 200,
    "notes": "Destete a los 200 días (tardío). Cría muy grande, madre requería descanso"
  }
}
```

### Ejemplo CREATE con Referencias Locales

```json
{
  "localId": "destete-003",
  "operation": "create",
  "happenedAt": "2026-11-20T10:00:00.000Z",
  "data": {
    "localRef_idRanchAnimal": "ani-cria-batch-001",
    "localRef_idLotDest": "lote-recria-batch-001",
    "weaningWeight": 185,
    "weaningAge": 170
  }
}
```

### Código React Native

```typescript
interface WeaningOperation {
  localId: string;
  operation: 'create';
  data: Record<string, any>;
  happenedAt: string;
}

// CREATE: Destete estándar
const createWeaning = (
  criaId: number,
  destLotId: number,
  weaningWeight: number,
  ageDays: number
): WeaningOperation => {
  return {
    localId: `destete-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      idRanchAnimal: criaId,
      idLotDest: destLotId,
      weaningWeight,
      weaningAge: ageDays,
      notes: `Destete a los ${ageDays} días, peso ${weaningWeight} kg`
    }
  };
};

// CREATE: Con referencias locales
const createWeaningWithLocalRefs = (
  criaLocalId: string,
  lotLocalId: string,
  weaningWeight: number
): WeaningOperation => {
  return {
    localId: `destete-${uuidv4()}`,
    operation: 'create',
    happenedAt: new Date().toISOString(),
    data: {
      localRef_idRanchAnimal: criaLocalId,
      localRef_idLotDest: lotLocalId,
      weaningWeight,
      weaningAge: 180
    }
  };
};
```

---

## Proceso 8: Historiales de Cría (Animal Declared History)

### Schema en BD
```sql
CREATE TABLE animal_declared_history (
  id_history BIGINT PRIMARY KEY,
  id_ranch_animal BIGINT NOT NULL UNIQUE,
  prev_births_count INT,
  prev_last_birth_year INT,
  prev_avg_weaning_weight DECIMAL(10,2),
  notes TEXT,
  local_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_ranch_animal) REFERENCES ranch_animals(id_ranch_animal)
);
```

### Validaciones y Constraints

| Campo | Tipo | Obligatorio | Restricción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `idRanchAnimal` | number | ✅ | FK animal | ID o `localRef_idRanchAnimal` |
| `prevBirthsCount` | number | ❌ | Entero ≥ 0 | 0, 3, 5, 7 |
| `prevLastBirthYear` | number | ❌ | 4 dígitos, ≤ ahora, > ahora-20 | 2025, 2024 |
| `prevAvgWeaningWeight` | number | ❌ | Kg (2 decimales) | 175, 190, 210 |
| `notes` | string | ❌ | Información adicional | "Vaca del Uruguay con 3 partos" |

### Validaciones Críticas

⚠️ **INFORMATIVO:** Este registro NO bloquea operaciones futuras
⚠️ **UNO POR ANIMAL:** Solo se puede crear UN historial declarado por animal
⚠️ **ANTIGÜEDAD:** prevLastBirthYear no puede ser > 20 años atrás

### Ejemplo CREATE (Animal Importado con Historial)

```json
{
  "localId": "hist-imp-001",
  "operation": "create",
  "data": {
    "idRanchAnimal": 22,
    "prevBirthsCount": 4,
    "prevLastBirthYear": 2025,
    "prevAvgWeaningWeight": 185,
    "notes": "Vaca importada de Uruguay (Ganadería Las Flores). 4 partos exitosos. Último parto Feb 2025 (cría hembra 35 kg). Genética Charolais premium. Sin problemas reproductivos reportados."
  }
}
```

### Ejemplo CREATE (Primeriza Comprada)

```json
{
  "localId": "hist-prim-001",
  "operation": "create",
  "data": {
    "idRanchAnimal": 23,
    "prevBirthsCount": 0,
    "notes": "Vaquilla primeriza (0 partos). Comprada a criador local. Edad: 3 años. Genética pura Angus. Lista para primer servicio"
  }
}
```

### Ejemplo CREATE con Referencias Locales

```json
{
  "localId": "hist-batch-001",
  "operation": "create",
  "data": {
    "localRef_idRanchAnimal": "ani-importado-001",
    "prevBirthsCount": 2,
    "prevLastBirthYear": 2024,
    "prevAvgWeaningWeight": 172,
    "notes": "Historial previo del batch. Importación externa"
  }
}
```

### Código React Native

```typescript
interface AnimalDeclaredHistoryOperation {
  localId: string;
  operation: 'create';
  data: Record<string, any>;
}

// CREATE: Animal importado con historial
const createDeclaredHistory = (
  animalId: number,
  birthsCount: number,
  lastBirthYear?: number,
  avgWeaningWeight?: number
): AnimalDeclaredHistoryOperation => {
  return {
    localId: `hist-${uuidv4()}`,
    operation: 'create',
    data: {
      idRanchAnimal: animalId,
      prevBirthsCount: birthsCount,
      ...(lastBirthYear && { prevLastBirthYear: lastBirthYear }),
      ...(avgWeaningWeight && { prevAvgWeaningWeight: avgWeaningWeight }),
      notes: `Historial: ${birthsCount} partos previos${lastBirthYear ? ` (último ${lastBirthYear})` : ''}`
    }
  };
};

// CREATE: Primeriza
const createPrimerizaHistory = (animalId: number): AnimalDeclaredHistoryOperation => {
  return {
    localId: `hist-${uuidv4()}`,
    operation: 'create',
    data: {
      idRanchAnimal: animalId,
      prevBirthsCount: 0,
      notes: 'Primeriza sin historial reproductivo previo'
    }
  };
};

// CREATE: Con referencias locales
const createHistoryWithLocalRef = (
  animalLocalId: string,
  birthsCount: number
): AnimalDeclaredHistoryOperation => {
  return {
    localId: `hist-${uuidv4()}`,
    operation: 'create',
    data: {
      localRef_idRanchAnimal: animalLocalId,
      prevBirthsCount: birthsCount
    }
  };
};
```

---

## Flujo Completo: Ejemplo End-to-End

### Escenario: Sincronización Completa de Lote de Cría (Batch)

**Qué sucede:**
1. Crear un potrero nuevo (Potrero Cría)
2. Crear un lote de reproducción dentro del potrero
3. Crear una hembra (reproducción)
4. Crear un macho (reproductor)
5. Registrar servicio (monta natural)
6. Diagnosticar preñez (positiva)
7. RegistrarParto (cría nacida)
8. Registrar destete (cría separada)

### Request Completo

```json
{
  "idRanch": 1,
  "ranchPastures": [
    {
      "localId": "pot-cria-001",
      "operation": "create",
      "data": {
        "name": "Potrero Cría 2026",
        "areaHectares": 25.5,
        "description": "Potrero nuevo dedicado a cría de alto rendimiento",
        "isActive": true
      }
    }
  ],
  "ranchLots": [
    {
      "localId": "lote-cria-001",
      "operation": "create",
      "data": {
        "name": "Lote Cría Charolais 2026",
        "lotType": "breeding",
        "localRef_idRanchPasture": "pot-cria-001",
        "capacity": 30
      }
    }
  ],
  "ranchAnimals": [
    {
      "localId": "ani-hembra-001",
      "operation": "create",
      "data": {
        "code": "HAC-CRIA-2026-001",
        "idBreed": 2,
        "idStatus": 1,
        "idAnimalClass": 8,
        "sex": "F",
        "birthdate": "2022-05-10",
        "idProductiveStatus": 1,
        "weight": 420,
        "origin": "Crianza local",
        "localRef_idLot": "lote-cria-001"
      }
    },
    {
      "localId": "ani-macho-001",
      "operation": "create",
      "data": {
        "code": "TAU-CRIA-2026-001",
        "idBreed": 2,
        "idStatus": 1,
        "idAnimalClass": 10,
        "sex": "M",
        "birthdate": "2020-03-15",
        "idProductiveStatus": 1,
        "weight": 850,
        "origin": "Crianza local",
        "localRef_idLot": "lote-cria-001"
      }
    }
  ],
  "breedingServices": [
    {
      "localId": "srv-001",
      "operation": "create",
      "happenedAt": "2026-03-10T09:30:00.000Z",
      "data": {
        "localRef_idRanchAnimal": "ani-hembra-001",
        "serviceType": "natural",
        "localRef_idAnimalMale": "ani-macho-001",
        "reproductiveLot": "Lote Cría Charolais 2026",
        "notes": "Monta natural exitosa en celo sincronizado"
      }
    }
  ],
  "gestationDiagnoses": [
    {
      "localId": "diag-001",
      "operation": "create",
      "happenedAt": "2026-04-20T10:30:00.000Z",
      "data": {
        "localRef_idRanchAnimal": "ani-hembra-001",
        "localRef_idService": "srv-001",
        "method": "ultrasound",
        "result": "pregnant",
        "gestationDays": 40,
        "estimatedBirth": "2026-06-20",
        "veterinarian": "Dr. Carlos Ruiz",
        "notes": "Ecografía confirma embrión viable. Desarrollo normal"
      }
    }
  ],
  "parturitions": [
    {
      "localId": "parto-001",
      "operation": "create",
      "happenedAt": "2026-06-20T14:35:00.000Z",
      "data": {
        "localRef_idRanchAnimal": "ani-hembra-001",
        "localRef_idDiagnosis": "diag-001",
        "birthType": "natural",
        "criaStatus": "alive",
        "criaWeight": 32,
        "criaData": {
          "sex": "F",
          "color": "rojo"
        },
        "motherCondition": "good",
        "notes": "Parto natural sin complicaciones"
      }
    }
  ],
  "weanings": [
    {
      "localId": "destete-001",
      "operation": "create",
      "happenedAt": "2026-11-25T08:00:00.000Z",
      "data": {
        "idRanchAnimal": 45,
        "localRef_idLotDest": "lote-cria-001",
        "weaningWeight": 195,
        "weaningAge": 180,
        "notes": "Destete exitoso a los 180 días"
      }
    }
  ]
}
```

### Respuesta Esperada (HTTP 200 OK)

```json
{
  "totalSucceeded": 8,
  "totalFailed": 0,
  "ranchPastures": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "pot-cria-001",
        "status": "success",
        "serverId": 15
      }
    ]
  },
  "ranchLots": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "lote-cria-001",
        "status": "success",
        "serverId": 22
      }
    ]
  },
  "ranchAnimals": {
    "succeeded": 2,
    "failed": 0,
    "results": [
      {
        "localId": "ani-hembra-001",
        "status": "success",
        "serverId": 100
      },
      {
        "localId": "ani-macho-001",
        "status": "success",
        "serverId": 101
      }
    ]
  },
  "breedingServices": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "srv-001",
        "status": "success",
        "serverId": 55
      }
    ]
  },
  "gestationDiagnoses": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "diag-001",
        "status": "success",
        "serverId": 88
      }
    ]
  },
  "parturitions": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "parto-001",
        "status": "success",
        "serverId": 120
      }
    ]
  },
  "weanings": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "destete-001",
        "status": "success",
        "serverId": 45
      }
    ]
  },
  "animalDeclaredHistories": {
    "succeeded": 0,
    "failed": 0,
    "results": []
  }
}
```

### Código React Native: Construcción del Batch

```typescript
import { v4 as uuidv4 } from 'uuid';

interface SyncBatchPayload {
  idRanch: number;
  ranchPastures: any[];
  ranchLots: any[];
  ranchAnimals: any[];
  breedingServices: any[];
  gestationDiagnoses: any[];
  parturitions: any[];
  weanings: any[];
  animalDeclaredHistories: any[];
}

const createCompleteBatch = (ranchId: number): SyncBatchPayload => {
  // IDs locales que usaremos para referencias internas
  const pastureLocalId = `pot-${uuidv4()}`;
  const lotLocalId = `lote-${uuidv4()}`;
  const femaleLocalId = `ani-f-${uuidv4()}`;
  const maleLocalId = `ani-m-${uuidv4()}`;
  const serviceLocalId = `srv-${uuidv4()}`;
  const diagnosisLocalId = `diag-${uuidv4()}`;
  const parturitionLocalId = `parto-${uuidv4()}`;

  return {
    idRanch: ranchId,
    ranchPastures: [
      {
        localId: pastureLocalId,
        operation: 'create',
        data: {
          name: `Potrero ${new Date().getFullYear()}`,
          areaHectares: 25.5,
          description: 'Nueva zona de cría',
          isActive: true
        }
      }
    ],
    ranchLots: [
      {
        localId: lotLocalId,
        operation: 'create',
        data: {
          name: 'Lote Cría',
          lotType: 'breeding',
          localRef_idRanchPasture: pastureLocalId,
          capacity: 30
        }
      }
    ],
    ranchAnimals: [
      {
        localId: femaleLocalId,
        operation: 'create',
        data: {
          code: `HAC-${Date.now()}`,
          idBreed: 2,
          idStatus: 1,
          idAnimalClass: 8,
          sex: 'F',
          birthdate: '2022-05-10',
          idProductiveStatus: 1,
          weight: 420,
          origin: 'Crianza local',
          localRef_idLot: lotLocalId
        }
      },
      {
        localId: maleLocalId,
        operation: 'create',
        data: {
          code: `TAU-${Date.now()}`,
          idBreed: 2,
          idStatus: 1,
          idAnimalClass: 10,
          sex: 'M',
          birthdate: '2020-03-15',
          idProductiveStatus: 1,
          weight: 850,
          origin: 'Crianza local',
          localRef_idLot: lotLocalId
        }
      }
    ],
    breedingServices: [
      {
        localId: serviceLocalId,
        operation: 'create',
        happenedAt: new Date().toISOString(),
        data: {
          localRef_idRanchAnimal: femaleLocalId,
          serviceType: 'natural',
          localRef_idAnimalMale: maleLocalId,
          reproductiveLot: 'Lote Cría'
        }
      }
    ],
    gestationDiagnoses: [
      {
        localId: diagnosisLocalId,
        operation: 'create',
        happenedAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        data: {
          localRef_idRanchAnimal: femaleLocalId,
          localRef_idService: serviceLocalId,
          method: 'ultrasound',
          result: 'pregnant'
        }
      }
    ],
    parturitions: [
      {
        localId: parturitionLocalId,
        operation: 'create',
        happenedAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
        data: {
          localRef_idRanchAnimal: femaleLocalId,
          localRef_idDiagnosis: diagnosisLocalId,
          birthType: 'natural',
          criaStatus: 'alive',
          criaWeight: 32,
          criaData: { sex: 'F' },
          motherCondition: 'good'
        }
      }
    ],
    weanings: [],
    animalDeclaredHistories: []
  };
};

// Uso
const batch = createCompleteBatch(1);

// Enviar al servidor
const syncBatch = async (payload: SyncBatchPayload) => {
  try {
    const response = await fetch('http://api.server.com/sync/cria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sync exitoso:', result);
      // Guardar mapping de localId -> serverId para futuros syncs
      updateLocalToServerIdMapping(result);
    } else {
      console.error('❌ Error en sync:', response.status);
      const error = await response.json();
      console.error('Detalle:', error);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
};
```

---

## Resumen: Checklist para Desarrollo

### Antes de Crear el Batch
- [ ] Cada `localId` es ÚNICO dentro del batch
- [ ] Las fechas están en ISO 8601 (`YYYY-MM-DD` para dates, `YYYY-MM-DDTHH:MM:SS.sssZ` para timestamps)
- [ ] Los enums usan EXACTAMENTE los valores válidos (case-sensitive)
- [ ] Las referencias cruzadas usan `localRef_<campo>` correctamente
- [ ] Los animales tienen código ÚNICO
- [ ] Las madres son sexo 'F', padres sexo 'M'

### Errores Comunes a Evitar
- ❌ Usar strings para enums cuando deben ser exactos (`"natural"` no `"Natural"`)
- ❌ Olvidar `serverId` en operaciones `update` o `delete`
- ❌ Mezclar `idRanchPasture` con `localRef_idRanchPasture` en el mismo registro
- ❌ Fechas en formato incorrecto (debe ser ISO 8601)
- ❌ Códigos de animales duplicados
- ❌ Referenciar al batch_interno sin usar `localRef_`

### Testing en Postman/Insomnia
```
POST http://api.server.com/sync/cria
Headers:
  Content-Type: application/json
  Authorization: Bearer <token>

Body: (JSON del batch)
```

---

## Contacto y Soporte

Para preguntas sobre integración:
- Esta documentación es COMPLETA y DETALLADA
- Todos los valores permitidos están listados explícitamente
- Los ejemplos JSON son COPIABLES y PEGABLES
- Las validaciones están basadas en el código de BD real

---

**Versión:** 1.0  
**Última actualización:** 3 de abril de 2026  
**Estado:** Documentación completa lista para integración React Native
