import { ApiProperty, ApiPropertyOptional, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
    IsNumber,
    IsEnum,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
//  Constantes de tipos y operaciones
// ─────────────────────────────────────────────────────────────────────────────

export const SYNC_OPERATION_TYPES = ['create', 'update', 'delete'] as const;
export type SyncOperationType = typeof SYNC_OPERATION_TYPES[number];

export const SYNC_BREEDING_EVENT_TYPES = [
    'breeding_service',
    'gestation_diagnosis',
    'parturition',
    'weaning',
    'animal_declared_history',
] as const;
export type SyncBreedingEventType = typeof SYNC_BREEDING_EVENT_TYPES[number];

// ─────────────────────────────────────────────────────────────────────────────
//  Clase base de operación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Operación genérica de sincronización.
 * Para referencias a otros registros creados en el MISMO batch (sin serverId aún),
 * usar `localRef_<campo>` en el objeto `data`.
 */
export class BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        description:
            'ID local del dispositivo para este registro ÚNICO dentro del batch. Usado para retornar el mapa localId→serverId en la respuesta. Ejemplos: "uuid-device-abc-001", "movil-001-20260403", o cualquier string único que generes en el dispositivo.',
        example: 'uuid-device-abc-001',
    })
    @IsString()
    @IsNotEmpty()
    localId: string;

    @ApiProperty({
        type: 'string',
        enum: SYNC_OPERATION_TYPES,
        description: 'Operación a ejecutar sobre este registro. **Valores aceptados SOLO:** "create" | "update" | "delete"',
        example: 'create',
    })
    @IsIn(SYNC_OPERATION_TYPES, { message: 'La operación debe ser: create, update o delete' })
    operation: SyncOperationType;

    @ApiPropertyOptional({
        type: 'integer',
        description:
            'ID del servidor del registro a actualizar o eliminar. **Obligatorio para operaciones "update" y "delete". Ignorado en "create".** Este es el ID asignado por el servidor en sincronizaciones previas.',
        example: 42,
    })
    @IsOptional()
    @IsInt()
    serverId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de potrero (ranch_pastures)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRanchPastureOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del potrero (campo/pasto) según la operación.

**OPERACIÓN CREATE:**
Campos obligatorios:
• **name** (string): Nombre único del potrero. Ejemplos: "Potrero Norte", "Campo A1", "Pasto Prime"
  - Max 100 caracteres
  - Se valida que el nombre sea único dentro de la estancia

• **areaHectares** (number): Área del potrero en hectáreas. Ejemplos: 10, 15.5, 22.75
  - Debe ser > 0
  - Precisión: 2 decimales

Campos opcionales:
• **description** (string): Descripción del potrero. Ejemplos: "Campo natural con agua permanente", "Pasto mejorado Brachiaria"
  - Max 500 caracteres

• **isActive** (boolean): Si el potrero está activo o no. Default: true
  - true = disponible para asignar lotes y animales
  - false = inactivo, sin uso actual

**OPERACIÓN UPDATE:**
Enviar SOLO los campos que deseas modificar:
  - name, areaHectares, description, isActive
  - Requiere "serverId" en la operación

**OPERACIÓN DELETE:**
  - Enviar data = {} (objeto vacío)
  - Requiere "serverId" en la operación
  - Se marca como inactivo (soft delete)
  - El potrero se mantiene en BD para referencias históricas

**RESTRICCIONES EN BD:**
- El nombre DEBE ser único para cada estancia
- Una vez creado, desvincularse de lotes puede afectar diseño lotes
- Si se elimina un potrero, todos sus lotes se orfanan (quedan sin referencia)`,
        example: {
            name: 'Potrero Norte',
            areaHectares: 15.5,
            description: 'Campo natural con agua permanente, adecuado para descanso',
            isActive: true,
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de lote (ranch_lots)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRanchLotOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del lote (grupo de animales) según la operación.

**OPERACIÓN CREATE:**

Campos obligatorios:
• **name** (string): Nombre del lote. Ejemplos: "Lote Cría A", "Recría Hembras", "Engorde final"
  - Max 100 caracteres
  - Único dentro de la estancia

• **lotType** (string, enum): Tipo/propósito del lote. **Valores aceptados SOLO:**
  - "breeding" — Lote de reproducción (hembras y machos reproductores)
  - "rearing" — Lote de recría/levante (animales jóvenes en crecimiento pre-adultez)
  - "fattening" — Lote de engorde (animales en ganancia rápida de peso)
  - "reproductive" — Lote reproductivo especializado (puede coincidir con breeding)
  - "general" — Lote general/otro (sin clasificación específica)

• **idRanchPasture** O **localRef_idRanchPasture** (number/string): Potrero donde está el lote.
  - Si el potrero ya existe en BD: enviar "idRanchPasture": 5
  - Si el potrero fue creado en el mismo batch: enviar "localRef_idRanchPasture": "uuid-potrero-1"
  - NO enviar ambos, solo uno
  - Obligatorio: el lote DEBE estar en un potrero

Campos opcionales:
• **capacity** (number): Capacidad máxima de animales del lote.
  - Ejemplo: 50, 100, 200
  - Si se omite, capacidad infinita (sin límite de sistema)
  - Usado para advertencias cuando se asignan más animales de lo recomendado

**OPERACIÓN UPDATE:**
Enviar SOLO los campos a modificar:
  - name, lotType, capacity (NO se puede cambiar potrero en update)
  - Requiere "serverId"

**OPERACIÓN DELETE:**
  - Enviar data = {} (vacío)
  - Requiere "serverId"
  - Soft delete (marca inactivo)
  - Los animales del lote quedan huérfanos (sin lote asignado)

**RESTRICCIONES EN BD:**
- El nombre del lote DEBE ser único dentro de la estancia
- El potrero DEBE existir (validación FK)
- lotType determina reglas especiales de reproducción (ej: breeding = control reproductivo)
- Si se elimina el lote, animales referencias quedan sin lote (estado inconsistente)
- Capacity es SOLO informativo (no bloquea agregar más)`,
        example: {
            name: 'Lote Cría A',
            lotType: 'breeding',
            idRanchPasture: 5,
            capacity: 50,
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de animal (ranch_animals)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRanchAnimalOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del animal según la operación.

**OPERACIÓN CREATE:**

Campos obligatorios:
• **code** (string): Código/identificador único del animal. Ejemplos: "HAC-001", "2025-F-5432", "A-12345"
  - Debe identificar únicamente el animal en el sistema (CARAVANA, marca registrada, etc.)
  - Max 50 caracteres
  - Único en la estancia

• **idBreed** (number): ID de la raza del animal. Ejemplos: 1 (Angus), 2 (Charolais), 3 (Hereford)
  - Debe existir en tabla de razas
  - Especificar correctamente para trazabilidad genética

• **idStatus** (number): ID del estado de salud del animal. Ejemplos: 1 (Sano), 2 (Enfermo), 3 (Inactivo), 4 (Cuarentena)
  - Valores comunes: 1 = Sano, 2 = Enfermo, 3 = Inactivo, 4 = Cuarentena
  - Debe existir en tabla estados (validación FK)

• **idAnimalClass** (number): Clasificación/tipo del animal. Ejemplos: 1 (Hembra), 2 (Macho), 3 (Capado)
  - Valores: 1 = Hembra reproductiva, 2 = Macho reproductor, 3 = Macho capado (novillo)

• **sex** (string, enum): Sexo del animal. **Valores aceptados SOLO:**
  - "F" — Femenino (hembra)
  - "M" — Masculino (macho)

• **birthdate** (string, ISO-date): Fecha de nacimiento. Formato: "YYYY-MM-DD"
  - Ejemplo: "2024-03-15"
  - Debe ser fecha válida
  - Debe ser ≤ hoy (no puede nacer en el futuro)

• **idProductiveStatus** (number): Estado productivo del animal. Ejemplos: 1 (Activo), 2 (Inactivo), 3 (Ceba)
  - Valores: 1 = Activo en reproducción, 2 = Inactivo, 3 = En ceba
  - Debe existir en tabla (validación FK)

Campos opcionales (pero recomendados):
• **weight** (number): Peso actual en kg. Ejemplo: 250, 350.5, 450
  - Usado para seguimiento del crecimiento
  - Se valida por raza (rangos esperados por edad)

• **origin** (string): Origen del animal. Ejemplos: "Crianza local", "Compra importación", "Regalo"
  - Usado para rastrear procedencia
  - Datos trazabilidad

• **codeMother** (string): Código de la madre (si es conocido). Ejemplo: "HAC-005"
  - Se convierte automáticamente a idMother si se encuentra el animal
  - O enviar "localRef_idMother" si la madre fue creada en el batch
  - Si se omite, puede completarse después

• **codeFather** (string): Código del padre/semental. Ejemplo: "HAC-003"
  - Se convierte a idFather
  - O usar "localRef_idFather"

• **createdAt** (string, ISO-datetime): Fecha de creación en dispositivo.
  - Si se omite, usa fecha actual del servidor
  - Útil para sincronización offline

**OPERACIÓN UPDATE:**
Enviar SOLO los campos a actualizar:
  - code, idBreed, idStatus, idAnimalClass, sex, birthdate, weight, origin, etc.
  - Requiere "serverId"
  - NO se puede cambiar el código de un animal existente (inmutable)

**OPERACIÓN DELETE:**
  - Enviar data = {} (vacío)
  - Requiere "serverId"
  - Soft delete: marca idStatus = 3 (Inactivo)
  - El animal se mantiene en BD para historial, pero no aparece en listados activos

**RESTRICCIONES EN BD:**
- El código DEBE ser único en la estancia (CARAVANA/marca únicos)
- sex DEBE coincidir con idAnimalClass:
  - sex = "F" siempre es válido
  - sex = "M" se valida con idAnimalClass (2 o 3 según reproductor/capado)
- birthdate DEBE ser fecha válida y ≤ hoy
- idBreed, idStatus, idAnimalClass existen en BD (validación FK)
- Mother/Father, si se proporcionan, deben ser animales válidos con sexo correspondiente
- No se puede "eliminar" un animal con dependencias (ej: es padre de otros animales activos)
- Peso se valida por raza (rangos esperados por edad y sexo)
- Único animal puede ser "criado localmente" - si codeMother/codeFather existen, se debe completar genealogía

**NOTAS CRÍTICAS:**
- Este es el registro MÁS CRÍTICO para trazabilidad sistema
- Cada animal debe tener código único (para caravana/marca registrada)
- Genealogía (padre/madre) es FUNDAMENTAL para reproducción
- Los datos de este registro afectan TODO el historial reproductivo
- Un animal mal registrado aquí afecta reportes genéticos, salud, producción`,
        example: {
            code: 'HAC-001',
            idBreed: 1,
            idStatus: 1,
            idAnimalClass: 1,
            sex: 'F',
            birthdate: '2024-03-15',
            idProductiveStatus: 1,
            weight: 380,
            origin: 'Crianza local',
            codeMother: 'HAC-005',
            codeFather: 'HAC-003',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de eventos de cría (tipos específicos separados)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Operación de servicio de reproducción (breeding_service)
 * 
 * Registra cuando un animal HEMBRA recibe un servicio de reproducción (monta natural, IA o transferencia de embriones).
 * Marca el inicio del ciclo reproductivo.
 */
export class SyncBreedingServiceOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        format: 'date-time',
        description:
            'Fecha y hora exacta en que ocurrió el servicio en el dispositivo (ISO 8601 válido). Ej: 2026-03-10T09:30:00Z o 2026-03-10T09:30:00.000Z. Este valor se guarda como eventDate en la base de datos.',
        example: '2026-03-10T09:30:00.000Z',
    })
    @IsDateString({}, { message: 'happenedAt debe ser una fecha ISO 8601 válida (ej: 2026-03-10T09:30:00Z)' })
    happenedAt: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Objeto JSON con los datos del servicio de reproducción.

**CAMPOS OBLIGATORIOS:**

• **idRanchAnimal** (number): ID del animal hembra que recibe el servicio. 
  - Si es del mismo batch (no tiene serverId aún), usar: "localRef_idRanchAnimal": "uuid-hembra-1"
  - Si ya existe en BD, usar: "idRanchAnimal": 5
  - NO se puede enviar ambos, usar uno u otro

• **serviceType** (string, enum): Tipo de servicio realizado. **Valores aceptados SOLO:**
  - "natural" — Monta natural (hay un macho presente)
  - "artificial" — Inseminación artificial con semen (congelado o fresco)
  - "embryo" — Transferencia de embriones

**CAMPOS OPCIONALES:**

• **idAnimalMale** (number): ID del macho utilizado. 
  - Obligatorio si serviceType = "natural"
  - Enviar si queda en la base de datos
  - Si es del mismo batch, usar localRef_idAnimalMale

• **semenBreed** (string): Raza o tipo de semen utilizado en IA. Ejemplos:
  - "Charolais", "Angus", "Brahman", "Hereford", "Cebú", etc.
  - Útil para rastrear genética en inseminaciones

• **technician** (string): Nombre del técnico veterinario que realizó el servicio.
  - Ejemplo: "Dr. Juan López", "María García"

• **reproductiveLot** (string): Identificador del lote reproductivo.
  - Ejemplo: "Lote Cría A", "Grupo 5"

• **notes** (string): Notas adicionales del evento.
  - Ejemplo: "Servicio con semen de toro Angus premium. Rechazo inicial, repetido al día siguiente"

**RESTRICCIONES EN BASE DE DATOS:**
- Mismo hembra (idRanchAnimal) NO puede tener dos servicios en el mismo día
- Se valida que idRanchAnimal sea una hembra (sex = 'F')
- Si idAnimalMale se envía, debe ser macho (sex = 'M')`,
        example: {
            idRanchAnimal: 15,
            serviceType: 'artificial',
            semenBreed: 'Charolais Premium',
            technician: 'Dr. López',
            reproductiveLot: 'Lote Cría A',
            notes: 'IA exitosa con semen congelado importado',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

/**
 * Operación de diagnóstico de gestación (gestation_diagnosis)
 * 
 * Confirma o rechaza preñez después de un servicio de reproducción.
 * Realizado entre 20-60 días después del servicio.
 */
export class SyncGestationDiagnosisOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        format: 'date-time',
        description:
            'Fecha y hora en que se realizó el diagnóstico (ISO 8601 válido). Típicamente entre 20-60 días post-servicio.',
        example: '2026-04-20T10:30:00.000Z',
    })
    @IsDateString({}, { message: 'happenedAt debe ser una fecha ISO 8601 válida' })
    happenedAt: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Objeto JSON con los datos del diagnóstico de gestación.

**CAMPOS OBLIGATORIOS:**

• **idRanchAnimal** (number): ID de la hembra que recibe el diagnóstico.
  - O usar localRef_idRanchAnimal si es del batch

• **idService** (number): ID del servicio de reproducción que se diagnostica.
  - O usar localRef_idService si fue creado en el mismo batch
  - DEBE existir previamente un servicio para este animal

• **method** (string, enum): Método utilizado para diagnosticar. **Valores aceptados SOLO:**
  - "ultrasound" — Ecografía (más preciso, 90-95% de certeza)
  - "manual_palpation" — Palpación rectal manual (menos preciso, 70-80%)
  - "blood_test" — Análisis de sangre (ej: progesterona, PSPB)

• **result** (string, enum): Resultado del diagnóstico. **Valores aceptados SOLO:**
  - "positive" — Gestación confirmada
  - "negative" — No hay gestación (falla de inseminación, aborto)
  - "uncertain" — Resultado no conclusivo, requiere re-evaluación

**CAMPOS OPCIONALES:**

• **gestationDays** (number): Estimación de días de gestación basada en el diagnóstico.
  - Ejemplo: 45, 60, 90
  - Usado junto con estimatedBirth para planificación

• **estimatedBirth** (string, ISO-date): Fecha estimada de parto basada en el diagnóstico.
  - Formato: "2026-06-20" (YYYY-MM-DD)
  - Se calcula normalmente como: fecha-servicio + 280-290 días
  - Ejemplo: "2026-06-20"

• **veterinarian** (string): Nombre del veterinario que realizó el diagnóstico.
  - Ejemplo: "Dr. Carlos Ruiz"

• **notes** (string): Notas detalladas del diagnóstico.
  - Ejemplo: "Ecografía muestra 1 embrión viable, placenta normal, sin anomalías"
  - Ejemplo para negativo: "Útero vacío, probable aborto espontáneo"

**RESTRICCIONES EN BASE DE DATOS:**
- Solo se puede diagnosticar después de un servicio (20+ días)
- Un animal puede tener múltiples diagnósticos para el mismo servicio (re-evaluaciones)
- Si result = "positive", se bloquean otros servicios para la hembra (sistema de reprodución)
- Si result = "negative", se permite nuevo servicio inmediatamente`,
        example: {
            idRanchAnimal: 15,
            idService: 8,
            method: 'ultrasound',
            result: 'positive',
            gestationDays: 45,
            estimatedBirth: '2026-06-20',
            veterinarian: 'Dr. Carlos Ruiz',
            notes: 'Ecografía confirma embrión viable, desarrollo normal para 45 días',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

/**
 * Operación de parto (parturition)
 * 
 * Registra el nacimiento de una cría tras la gestación confirmada.
 * Uno de los eventos más críticos del ciclo reproductivo.
 */
export class SyncParturitionOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        format: 'date-time',
        description:
            'Fecha y hora exacta en que nació la cría (ISO 8601). Este es un evento crítico para trazabilidad.',
        example: '2026-06-20T14:35:00.000Z',
    })
    @IsDateString({}, { message: 'happenedAt debe ser una fecha ISO 8601 válida' })
    happenedAt: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Objeto JSON con los datos del parto.

**CAMPOS OBLIGATORIOS:**

• **idRanchAnimal** (number): ID de la madre (hembra que parió).
  - O localRef_idRanchAnimal si es del batch
  - DEBE ser la misma que tuvo el diagnóstico positivo

• **idDiagnosis** (number): ID del diagnóstico de gestación que confirma la preñez.
  - O localRef_idDiagnosis si fue creado en el batch
  - Validación: DEBE tener result = "positive"

• **birthType** (string, enum): Tipo de parto realizado. **Valores aceptados SOLO:**
  - "natural" — Parto espontáneo sin intervención
  - "assisted" — Parto con asistencia (tracción manual, lubricantes, etc.)
  - "surgical" — Cesárea (nacimiento vía cirugía)

• **criaStatus** (string, enum): Estado de la cría al nacer. **Valores aceptados SOLO:**
  - "alive" — Cría nacida viva y viable
  - "stillborn" — Cría nacida muerta (sin signos de vida)
  - "weak" — Cría viva pero débil (requiere cuidados inmediatos)

**CAMPOS OPCIONALES:**

• **criaWeight** (number): Peso de la cría al nacer en kg.
  - Ejemplo: 28, 32.5, 38
  - Varía según raza y sexo
  - Usado para evaluar viabilidad

• **criaData** (object): Información adicional de la cría nacida.
  - Puede contener: sexo ("M"/"F"), color, marcas especiales, etc.
  - Ejemplo: {"sex": "F", "color": "rojo", "code": "CRIA-001"}

• **motherCondition** (string): Condición de la madre post-parto.
  - Valores sugeridos: "good" (bien), "fair" (regular), "critical" (crítica)
  - Exemplo: "good"
  - Importante para seguimiento veterinario

• **notes** (string): Notas detalladas del evento.
  - Ejemplo: "Parto natural, 1 cría hembra (28 kg), madre en buen estado, amamantamiento inmediato"
  - Ejemplo: "Cesárea de emergencia 12:00 por distocia. Cría débil, madre requiere antibióticos"

**RESTRICCIONES EN BASE DE DATOS:**
- El parto se registra SOLO si hay diagnóstico positivo previo
- La madre se marca como NO disponible para servicios hasta período de descanso
- Si se registra una cría nacida, se crea automáticamente el animal en el sistema
- Parto de múltiples crías: registrar un evento por cría (o usar criaData como array)
- Validación: fecha de parto DEBE coincidir aproximadamente con estimatedBirth ± 10 días`,
        example: {
            idRanchAnimal: 15,
            idDiagnosis: 12,
            birthType: 'natural',
            criaStatus: 'alive',
            criaWeight: 32,
            motherCondition: 'good',
            criaData: { sex: 'F', color: 'rojo oscuro' },
            notes: 'Parto natural, cría hembra sana 32 kg, madre en excelente condición, amamantamiento exitoso',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

/**
 * Operación de destete (weaning)
 * 
 * Separa la cría de la madre e inicia su alimentación independiente.
 * Marca transición crítica en crecimiento y salud del animal.
 */
export class SyncWeaningOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        format: 'date-time',
        description:
            'Fecha y hora en que se realizó el destete (ISO 8601). Típicamente entre 150-180 días post-parto.',
        example: '2026-11-25T08:00:00.000Z',
    })
    @IsDateString({}, { message: 'happenedAt debe ser una fecha ISO 8601 válida' })
    happenedAt: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Objeto JSON con los datos del destete.

**CAMPOS OBLIGATORIOS:**

• **idRanchAnimal** (number): ID de la cría a destetar.
  - O localRef_idRanchAnimal si fue creada en el batch
  - DEBE ser el animal hijo nacido previamente

**CAMPOS OPCIONALES:**

• **idLotDest** (number): ID del lote de destino a donde va la cría tras separarse.
  - O localRef_idLotDest si fue creado en el batch
  - Ejemplo: lote de "recría_A", "destete_hembras", etc.
  - Si no se envía, la cría se queda en el lote actual (SIN cambio)

• **weaningWeight** (number): Peso de la cría al momento del destete (kg).
  - Ejemplo: 180, 200, 220
  - Importante para evaluar ganancia de peso y calidad de cría
  - Rango esperado: 150-250 kg según raza y sexo

• **ageDays** (number): Edad de la cría en días al destete.
  - Ejemplo: 150, 180, 210
  - Rango típico: 150-210 días
  - Valores fuera de rango generan advertencias (destete muy temprano/tardío)

• **notes** (string): Notas del evento.
  - Ejemplo: "Destete sin complicaciones. Cría en excelente condición, peso ideal para edad"
  - Ejemplo: "Destete a los 180 días, peso 195 kg. Cría adaptándose bien al alimento seco"
  - Mencionar comportamiento, salud, problemas si los hay

**RESTRICCIONES EN BASE DE DATOS:**
- NO se permite destetar una cría que no ha sido destetada previamente (singularidad)
- La madre se marca como "disponible para reproducción" después del destete
- Si se proporciona idLotDest, el animal se transfiere a ese lote automáticamente
- Validación: ageDays vs fecha nacimiento: debe estar entre 120-300 días
- Se valida que weaningWeight sea realista para la edad y raza del animal
- No se puede destetar un animal que ya está destetado (marcar como error si lo intenta)

**NOTAS IMPORTANTES:**
- Este evento es crítico para el traceability (trazabilidad) del animal
- A partir del destete, el registro de cría tiene entrada en "peso al destete" para futuros reportes
- La madre queda lista para nuevo ciclo reproductivo`,
        example: {
            idRanchAnimal: 45,
            idLotDest: 8,
            weaningWeight: 195,
            ageDays: 180,
            notes: 'Destete a los 180 días. Cría en excelente salud, peso ideal. Trasladada a lote de recría',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

/**
 * Operación de historial declarado de animal (animal_declared_history)
 * 
 * Registra el historial reproductivo PREVIO de un animal importado o ingresado al sistema.
 * Usado para animales con registro externo (compra, transferencia) que no están en la base de datos.
 */
export class SyncAnimalDeclaredHistoryOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Objeto JSON con el historial reproductivo previo del animal.

**CAMPOS OBLIGATORIOS:**

• **idRanchAnimal** (number): ID del animal al cual se asigna el historial.
  - O localRef_idRanchAnimal si fue creado en el batch
  - DEBE ser una hembra (para historial reproductivo)
  - Típicamente un animal importado sin historial previo en sistema

**CAMPOS OPCIONALES (pero al menos uno recomendado):**

• **prevBirthsCount** (number): Cantidad total de partos que ha tenido el animal en el pasado.
  - Ejemplo: 3, 5, 7
  - Rango típico: 0-15 depende de edad y raza
  - 0 = nunca ha parido (primeriza)
  - Usado para evaluar experiencia reproductiva

• **prevLastBirthYear** (number): Año del último parto registrado antes de ingresar al sistema.
  - Formato: número de 4 dígitos (ej: 2025, 2024)
  - Ejemplo: 2025 (parió este año), 2024 (el año pasado)
  - Útil para calcular interval o entre partos

• **prevAvgWeaningWeight** (number): Peso promedio al destete de las crías previas (kg).
  - Ejemplo: 175, 190, 210
  - Indicador de productividad de la madre
  - Se usa para predecir calidad reproduc​tiva futura
  - Rango típico: 150-250 kg según raza

• **notes** (string): Notas adicionales sobre el historial previo.
  - Ejemplo: "Vaca importada de Uruguay con 3 partos exitosos. Última cría 2025. Genética Charolais pura"
  - Ejemplo: "Comprada a ganadería Las Flores. Primeriza (0 partos). Edad 3 años"
  - Mencionar origen, genética, problemas previos si los conoce

**RESTRICCIONES EN BASE DE DATOS:**
- SOLO se puede crear un historial declarado POR ANIMAL (no se puede duplicar)
- prevBirthsCount = 0 indica animal sin experiencia reproductiva
- prevLastBirthYear NO puede ser en el futuro
- prevLastBirthYear NO puede ser anterior a (año_actual - 20) [validación de antigüedad razonable]
- Se valida que prevAvgWeaningWeight sea realista (100-300 kg rango)
- Este historial es INFORMATIVO y no bloquea otras operaciones
  
**CASOS DE USO:**
1. Animal importado: se decl​ara su historial reproductivo previo
2. Compra de reproductora con antecedentes: llenar con datos históricos
3. Integración de base de datos externa: migrar historiales previos

**NOTAS IMPORTANTES:**
- Estos datos sirven solo como referencia histórica
- El sistema comienza a registrar automáticamente nuevos eventos a partir del primer servicio
- No afecta cálculos de reproducción futura (solo informativo)
- Último recurso para animales sin trazabilidad previa en el sistema`,
        example: {
            idRanchAnimal: 22,
            prevBirthsCount: 4,
            prevLastBirthYear: 2025,
            prevAvgWeaningWeight: 185,
            notes: 'Vaca importada de Uruguay, 4 partos exitosos. Último parto Feb 2025 (cría hembra 35 kg). Genética Charolais premium. SIN problemas reproductivos reportados',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DTO principal del endpoint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **ENDPOINT PRINCIPAL: POST /sync/cria**
 * 
 * Payload (body) de sincronización OFFLINE del módulo de CRÍA.
 * Diseñado para app móvil que trabaja SIN CONEXIÓN y luego sincroniza datos.
 * 
 * **ORDEN DE PROCESAMIENTO GARANTIZADO:**
 * 1. ranchPastures  → Potreros (sin dependencias externas)
 * 2. ranchLots      → Lotes (dependen de potreros)
 * 3. ranchAnimals   → Animales (dependen de lotes)
 * 4. breedingServices → Servicios de reproducción
 * 5. gestationDiagnoses → Diagnósticos de gestación
 * 6. parturitions   → Partos
 * 7. weanings       → Destetes
 * 8. animalDeclaredHistories → Historiales declarados
 * 
 * **GARANTÍAS DEL SISTEMA:**
 * - CADA OPERACIÓN dentro de TRANSACCIÓN individual (atomicidad)
 * - Si operación FALLA → registra error, pero CONTINÚA con las demás
 * - Batch NUNCA se aborta completamente por fallos parciales
 * - Respuesta SIEMPRE incluye: éxitos + fallos con detalles
 * 
 * **EJEMPLO DE USO EN APP MÓVIL:**
 * ```json
 * POST /sync/cria
 * {
 *   "idRanch": 1,
 *   "ranchPastures": [
 *     {
 *       "localId": "pot-uuid-001",
 *       "operation": "create",
 *       "data": { "name": "Potrero Norte", "areaHectares": 15.5 }
 *     }
 *   ],
 *   "ranchLots": [
 *     {
 *       "localId": "lote-uuid-001",
 *       "operation": "create",
 *       "data": {
 *         "name": "Lote Cría A",
 *         "lotType": "breeding",
 *         "localRef_idRanchPasture": "pot-uuid-001"
 *       }
 *     }
 *   ]
 * }
 * ```
 * 
 * **RESPUESTA:**
 * ```json
 * {
 *   "totalSucceeded": 2,
 *   "totalFailed": 0,
 *   "ranchPastures": {
 *     "succeeded": 1,
 *     "failed": 0,
 *     "results": [
 *       { "localId": "pot-uuid-001", "status": "success", "serverId": 5 }
 *     ]
 *   },
 *   "ranchLots": {
 *     "succeeded": 1,
 *     "results": [
 *       { "localId": "lote-uuid-001", "status": "success", "serverId": 12 }
 *     ]
 *   }
 * }
 * ```
 * 
 * **REFERENCIAS CRUZADAS (BATCH INTERNO):**
 * Para referenciar registros del MISMO BATCH aún SIN serverId,
 * usar: "localRef_<campo>": "<localId_del_registro_referenciado>"
 * 
 * Ejemplos:
 * - "localRef_idRanchPasture": "pot-uuid-001"
 * - "localRef_idRanchAnimal": "ani-uuid-005"
 * - "localRef_idService": "srv-uuid-002"
 * 
 * El servidor AUTOMÁTICAMENTE sustituye el localRef por el serverId real.
 * 
 * **LIMITACIONES Y RESTRICCIONES:**
 * - MAX 500 operaciones por batch (recomendación: < 200)
 * - MAX 50 MB tamaño total
 * - Timeout: 60 segundos
 * - localId DEBE ser ÚNICO dentro del batch
 * - Un animal NO puede ser padre/madre de sí mismo
 * - Madre DEBE ser sexo F, padre DEBE ser sexo M
 * - Validación completa de FK (relaciones) en BD
 * 
 * **IMPORTANTE PARA INTEGRADORES:**
 * Esta es la LLAMADA PRINCIPAL para sincronización.
 * Debe enviarse cada noche o con conexión disponible.
 * Los datos se preservan localmente hasta confirmación de servidor (HTTP 200).
 */
@ApiExtraModels(
    SyncRanchPastureOperationDto,
    SyncRanchLotOperationDto,
    SyncRanchAnimalOperationDto,
    SyncBreedingServiceOperationDto,
    SyncGestationDiagnosisOperationDto,
    SyncParturitionOperationDto,
    SyncWeaningOperationDto,
    SyncAnimalDeclaredHistoryOperationDto,
)
export class SyncCriaDto {
    @ApiProperty({
        type: 'integer',
        description: 'ID de la estancia a la que pertenecen todos los registros del batch.',
        example: 1,
    })
    @IsInt({ message: 'idRanch debe ser un número entero' })
    @Min(1, { message: 'idRanch no es válido' })
    idRanch: number;

    @ApiPropertyOptional({
        type: [SyncRanchPastureOperationDto],
        items: {
            $ref: getSchemaPath(SyncRanchPastureOperationDto),
        },
        description:
            'Operaciones sobre potreros (ranch_pastures). Se procesan primero, sin dependencias externas.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRanchPastureOperationDto)
    ranchPastures?: SyncRanchPastureOperationDto[];

    @ApiPropertyOptional({
        type: [SyncRanchLotOperationDto],
        items: {
            $ref: getSchemaPath(SyncRanchLotOperationDto),
        },
        description:
            'Operaciones sobre lotes (ranch_lots). Se procesan después de los potreros. Puede referenciar potreros del mismo batch con localRef_idRanchPasture.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRanchLotOperationDto)
    ranchLots?: SyncRanchLotOperationDto[];

    @ApiPropertyOptional({
        type: [SyncRanchAnimalOperationDto],
        items: {
            $ref: getSchemaPath(SyncRanchAnimalOperationDto),
        },
        description:
            'Operaciones sobre animales (ranch_animals). Se procesan después de los lotes. Puede referenciar lotes del mismo batch con localRef_idRanchLot.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRanchAnimalOperationDto)
    ranchAnimals?: SyncRanchAnimalOperationDto[];

    @ApiPropertyOptional({
        type: [SyncBreedingServiceOperationDto],
        items: {
            $ref: getSchemaPath(SyncBreedingServiceOperationDto),
        },
        description:
            'Operaciones sobre servicios de reproducción (breeding_services). Se procesan después de los animales. Puede referenciar animales del mismo batch con localRef_idRanchAnimal.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncBreedingServiceOperationDto)
    breedingServices?: SyncBreedingServiceOperationDto[];

    @ApiPropertyOptional({
        type: [SyncGestationDiagnosisOperationDto],
        items: {
            $ref: getSchemaPath(SyncGestationDiagnosisOperationDto),
        },
        description:
            'Operaciones sobre diagnósticos de gestación (gestation_diagnoses). Se procesan después de los servicios. Puede referenciar servicios y animales del mismo batch.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncGestationDiagnosisOperationDto)
    gestationDiagnoses?: SyncGestationDiagnosisOperationDto[];

    @ApiPropertyOptional({
        type: [SyncParturitionOperationDto],
        items: {
            $ref: getSchemaPath(SyncParturitionOperationDto),
        },
        description:
            'Operaciones sobre partos (parturitions). Se procesan después de los diagnósticos. Puede referenciar diagnósticos y animales del mismo batch.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncParturitionOperationDto)
    parturitions?: SyncParturitionOperationDto[];

    @ApiPropertyOptional({
        type: [SyncWeaningOperationDto],
        items: {
            $ref: getSchemaPath(SyncWeaningOperationDto),
        },
        description:
            'Operaciones sobre destetes (weanings). Se procesan después de los partos. Puede referenciar animales y lotes del mismo batch.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncWeaningOperationDto)
    weanings?: SyncWeaningOperationDto[];

    @ApiPropertyOptional({
        type: [SyncAnimalDeclaredHistoryOperationDto],
        items: {
            $ref: getSchemaPath(SyncAnimalDeclaredHistoryOperationDto),
        },
        description:
            'Operaciones sobre historiales declarados de animales (animal_declared_histories). Se procesan al final. Puede referenciar animales del mismo batch.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncAnimalDeclaredHistoryOperationDto)
    animalDeclaredHistories?: SyncAnimalDeclaredHistoryOperationDto[];
}