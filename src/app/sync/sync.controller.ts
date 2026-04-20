import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import * as express from 'express';
import { OkRes, SwaggerBadRequestCommon } from 'src/shared/utils';
import { SyncService } from './sync.service';
import { SyncCriaDto } from './dto/inputs/sync-cria.dto';
import { SyncCriaResponseDto } from './dto/outputs/sync-cria-response.dto';
import { SyncRecriaDto } from './dto/inputs/sync-recria.dto';
import { SyncRecriaResponseDto } from './dto/outputs/sync-recria-response.dto';

@ApiTags('Sincronización Offline')
@Controller('sync')
export class SyncController {
    constructor(private readonly syncService: SyncService) { }

    // ─────────────────────────────────────────────────────────────────────────
    //  POST /sync/cria
    // ─────────────────────────────────────────────────────────────────────────

    @Post('cria')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar datos offline del módulo de CRÍA [REACT NATIVE]',
        description: `**🚀 ENDPOINT PRINCIPAL PARA INTEGRACIÓN EN APP MÓVIL 🚀**

Recibe un batch completo de operaciones creadas SIN CONEXIÓN en el dispositivo móvil 
y las procesa en el servidor. Devuelve los IDs asignados a cada registro para mapeo local.

---

## 📋 PROPÓSITO
- Sincronizar datos del módulo de reproducción/cría (potreros, lotes, animales, servicios, diagnósticos, partos, destetes)
- **Manejo offline**: App crea registros localmente, luego sincroniza cuando hay conexión
- **Transacciones garantizadas**: Cada operación es atómica (todo sale bien o nada)
- **Fallos independientes**: Si una operación falla, las demás continúan (no aborta todo el batch)

---

## 🔄 ORDEN DE PROCESAMIENTO (GARANTIZADO)
1. **ranchPastures** — Potreros (sin dependencias externas)
2. **ranchLots** — Lotes (pueden referenciar potreros)
3. **ranchAnimals** — Animales (pueden referenciar lotes)
4. **breedingServices** — Servicios de reproducción (monta, IA, transferencia)
5. **gestationDiagnoses** — Diagnósticos de gestación (ecografía, palpación, sangre)
6. **parturitions** — Partos/nacimientos
7. **weanings** — Destetes
8. **animalDeclaredHistories** — Historiales reproductivos previos (animales importados)

---

## ⚡ VALORES PERMITIDOS - REFERENCIA RÁPIDA

### OPERACIONES (para todos los tipos)
\`\`\`
"create"  → Crear nuevo registro
"update"  → Actualizar registro existente (requiere serverId)
"delete"  → Eliminar registro (requiere serverId, soft delete)
\`\`\`

### LOT_TYPE (para lotes)
\`\`\`
"breeding"      → Lote de reproducción (cría)
"rearing"       → Lote de recría/levante (jóvenes)
"fattening"     → Lote de engorde (ganancia peso)
"reproductive"  → Lote reproductivo especializado
"general"       → General/sin clasificación
\`\`\`

### SEX (para animales)
\`\`\`
"F" → Femenino (hembra)
"M" → Masculino (macho)
\`\`\`

### ANIMAL_CLASS (id_animal_class)
\`\`\`
1  → Ternera
2  → Ternero macho entero
3  → Ternero macho castrado
4  → Hembra destetada
5  → Macho entero destetado
6  → Macho castrado destetado
7  → Vaquilla
8  → Vaca
9  → Hembra esterilizada
10 → Toro
11 → Novillo
\`\`\`

### ANIMAL_STATUS (id_status típicos)
\`\`\`
1 → Sano
2 → Enfermo
3 → Inactivo
4 → Cuarentena
\`\`\`

### PRODUCTIVE_STATUS (id_productive_status típicos)
\`\`\`
1 → Activo en reproducción
2 → Inactivo
3 → En ceba
\`\`\`

### SERVICE_TYPE (para servicios de reproducción)
\`\`\`
"natural"   → Monta natural (hay macho presente, idAnimalMale obligatorio)
"artificial"→ Inseminación artificial (usa semenBreed)
"embryo"    → Transferencia de embriones
\`\`\`

### DIAGNOSIS_METHOD (para diagnósticos gestación)
\`\`\`
"ultrasound"       → Ecografía (90-95% exactitud)
"palpation"        → Palpación rectal (70-80% exactitud)
"blood_test"       → Análisis sangre (progesterona, PSPB)
\`\`\`

### DIAGNOSIS_RESULT (para diagnósticos gestación)
\`\`\`
"positive"  → Gestación confirmada (bloquea otros servicios)
"negative"  → Sin gestación (permite nuevo servicio)
"uncertain" → Resultado incierto (requiere re-evaluación)
\`\`\`

### BIRTH_TYPE (para partos)
\`\`\`
"natural"   → Parto espontáneo sin intervención
"assisted"  → Parto con asistencia (tracción, lubricantes)
"surgical"  → Cesárea (nacimiento quirúrgico)
\`\`\`

### CRIA_STATUS (para estado cría al nacer)
\`\`\`
"alive"     → Cría nacida viva y viable
"stillborn" → Cría nacida muerta (sin signos vida)
"weak"      → Cría viva pero débil (requiere cuidados)
\`\`\`

---

## 💾 FLUJO DE INTEGRACIÓN EN APLICACIÓN MÓVIL REACT NATIVE

### 1️⃣ CREAR DATOS LOCALMENTE (sin conexión)
\`\`\`javascript
// En dispositivo móvil, crear registros con localId único
const batch = {
  idRanch: 1,
  ranchPastures: [{
    localId: "uuid-app-001",
    operation: "create",
    data: { name: "Potrero A", areaHectares: 10 }
  }],
  // ... más operaciones
};
// Guardar localmente para sincronizar después
\`\`\`

### 2. SINCRONIZAR CUANDO HAY CONEXIÓN
\`\`\`javascript
// POST /sync/cria
const response = await fetch('https://api.estancia.com/sync/cria', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(batch)
});

const result = await response.json();
// result.totalSucceeded = 1
// result.ranchPastures.results[0].serverId = 5  ← Guardar este ID localmente
\`\`\`

### 3. ACTUALIZAR BD LOCAL CON SERVERIDS
\`\`\`javascript
// Mapear localId → serverId para futuras sincronizaciones
for (const op of result.ranchPastures.results) {
  if (op.status === 'success') {
    updateLocalRecord(op.localId, op.serverId);
  } else {
    logError(op.localId, op.error);
  }
}
\`\`\`

## REFERENCIAS CRUZADAS (BATCH INTERNO)
Para referenciar registros del mismo batch que AÚN NO tienen serverId,
usar patrón: \`"localRef_<campo>": "<localId_origen>"\`

Ejemplo:
\`\`\`json
{
  "idRanch": 1,
  "ranchPastures": [{
    "localId": "pot-001",
    "operation": "create",
    "data": { "name": "Potrero A", "areaHectares": 10 }
  }],
  "ranchLots": [{
    "localId": "lote-001",
    "operation": "create",
    "data": {
      "name": "Lote Cría",
      "lotType": "breeding",
      "localRef_idRanchPasture": "pot-001"  ← Referencia al potrero
    }
  }]
}
\`\`\`

El servidor AUTOMÁTICAMENTE sustituye \`localRef_idRanchPasture\` por el serverId real (5).

## RESPUESTA - EJEMPLO DE ÉXITO
\`\`\`json
{
  "totalSucceeded": 2,
  "totalFailed": 0,
  "ranchPastures": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "pot-001",
        "status": "success",
        "serverId": 5
      }
    ]
  },
  "ranchLots": {
    "succeeded": 1,
    "failed": 0,
    "results": [
      {
        "localId": "lote-001",
        "status": "success",
        "serverId": 12
      }
    ]
  }
}
\`\`\`

### 2️⃣ SINCRONIZAR CUANDO HAY CONEXIÓN
\`\`\`javascript
// POST /sync/cria
const response = await fetch('https://api.estancia.com/sync/cria', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify(batch)
});

const result = await response.json();
// result.totalSucceeded = X
// result.totalFailed = Y
// result.ranchPastures.results[0].serverId = 5  ← Guardar este ID localmente
\`\`\`

### 3️⃣ ACTUALIZAR BD LOCAL CON SERVERIDS
\`\`\`javascript
// Mapear localId → serverId para futuras sincronizaciones
const mapping = {};

// Procesar cada sección
Object.keys(result).forEach(section => {
  if (typeof result[section] === 'object' && result[section].results) {
    result[section].results.forEach(item => {
      if (item.status === 'success' && item.serverId) {
        mapping[item.localId] = item.serverId;
        updateLocalDatabase(item.localId, item.serverId);
      } else if (item.status === 'failed') {
        logError(\`\${section}: \${item.localId} - \${item.error}\`);
      }
    });
  }
});

// Guardar mapping para próximas sincronizaciones
await AsyncStorage.setItem('syncMapping', JSON.stringify(mapping));
\`\`\`

---

## 🔗 REFERENCIAS CRUZADAS (BATCH INTERNO)

Para referenciar registros del mismo batch que AÚN NO tienen serverId,
usar patrón: \`"localRef_<campo>": "<localId_origen>"\`

**Ejemplo completo de flujo con referencias internas:**
\`\`\`json
{
  "idRanch": 1,
  "ranchPastures": [{
    "localId": "pot-001",
    "operation": "create",
    "data": { "name": "Potrero Norte", "areaHectares": 15.5 }
  }],
  "ranchLots": [{
    "localId": "lote-001",
    "operation": "create",
    "data": {
      "name": "Lote Cría A",
      "lotType": "breeding",
      "localRef_idRanchPasture": "pot-001"
    }
  }],
  "ranchAnimals": [{
    "localId": "ani-h-001",
    "operation": "create",
    "data": {
      "code": "HAC-001",
      "idBreed": 2,
      "idStatus": 1,
      "idAnimalClass": 8,
      "sex": "F",
      "birthdate": "2022-05-10",
      "idProductiveStatus": 1,
      "localRef_idLot": "lote-001"
    }
  }],
  "breedingServices": [{
    "localId": "srv-001",
    "operation": "create",
    "happenedAt": "2026-03-10T09:30:00.000Z",
    "data": {
      "localRef_idRanchAnimal": "ani-h-001",
      "serviceType": "natural",
      "reproductiveLot": "Lote Cría A"
    }
  }]
}
\`\`\`

El servidor AUTOMÁTICAMENTE sustituye todos los \`localRef_*\` por los serverIds reales.

---

## 📨 RESPUESTA - EJEMPLO DE ÉXITO (HTTP 200 OK)
\`\`\`json
{
  "totalSucceeded": 4,
  "totalFailed": 0,
  "ranchPastures": {
    "succeeded": 1,
    "failed": 0,
    "results": [{
      "localId": "pot-001",
      "status": "success",
      "serverId": 15
    }]
  },
  "ranchLots": {
    "succeeded": 1,
    "failed": 0,
    "results": [{
      "localId": "lote-001",
      "status": "success",
      "serverId": 22
    }]
  },
  "ranchAnimals": {
    "succeeded": 1,
    "failed": 0,
    "results": [{
      "localId": "ani-h-001",
      "status": "success",
      "serverId": 100
    }]
  },
  "breedingServices": {
    "succeeded": 1,
    "failed": 0,
    "results": [{
      "localId": "srv-001",
      "status": "success",
      "serverId": 55
    }]
  },
  "gestationDiagnoses": { "succeeded": 0, "failed": 0, "results": [] },
  "parturitions": { "succeeded": 0, "failed": 0, "results": [] },
  "weanings": { "succeeded": 0, "failed": 0, "results": [] },
  "animalDeclaredHistories": { "succeeded": 0, "failed": 0, "results": [] }
}
\`\`\`

## 📨 RESPUESTA - EJEMPLO CON ERRORES (HTTP 200 OK)
\`\`\`json
{
  "totalSucceeded": 1,
  "totalFailed": 1,
  "ranchAnimals": {
    "succeeded": 0,
    "failed": 1,
    "results": [{
      "localId": "ani-001",
      "status": "failed",
      "error": "El código 'HAC-001' del animal ya existe en la estancia. Los códigos deben ser únicos (caravana/marca)"
    }]
  }
}
\`\`\`

---

## ✅ CHECKLIST ANTES DE ENVIAR BATCH

- [ ] **localId**: Cada registro tiene localId ÚNICO dentro del batch
- [ ] **Operaciones**: Son exactamente "create", "update", o "delete"
- [ ] **serverId**: Incluido SOLO para operaciones "update" y "delete"
- [ ] **Fechas ISO**: Formato YYYY-MM-DD (dates) o ISO 8601 (timestamps con time)
- [ ] **Enums**: Valores exactos (case-sensitive): "natural" NO "Natural", "breeding" NO "Breeding"
- [ ] **Códigos animal**: ÚNICOS dentro de la estancia
- [ ] **Genealogía**: Madre sexo="F", Padre sexo="M"
- [ ] **Referencias cruzadas**: Usar localRef_<campo> para refs del mismo batch
- [ ] **Límites**: < 500 operaciones, < 50 MB, < 60 segundos
- [ ] **Conexión**: Verificar token de autenticación válido

---

## ⏱️ LIMITACIONES DEL SYSTÈME

- **MAX 500 operaciones** por batch (recomendación: <200 para mejor rendimiento)
- **MAX 50 MB** tamaño total del request
- **Timeout: 60 segundos** para procesar el batch completo
- **localId**: Debe ser ÚNICO dentro del batch
- **Validación FK**: Todas las referencias a otras tablas deben existir en BD

---

## 📊 CÓDIGOS HTTP

| Código | Significado | Acción |
|--------|-------------|--------|
| **200 OK** | Batch procesado | Verificar totalSucceeded y totalFailed en respuesta |
| **400 Bad Request** | Validación fallida | Revisar formato JSON, tipos, enums. Detalle en error response |
| **401 Unauthorized** | No autenticado | Token JWT inválido o expirado. Re-autenticar |
| **403 Forbidden** | Sin permisos | Sin acceso a la estancia especificada en idRanch |
| **500 Server Error** | Error interno | Reintentar. Si persiste, contactar soporte |

---

## 🚀 PRÓXIMOS PASOS PARA INTEGRADOR REACT NATIVE

1. **Descarga Swagger UI** → Accede a /api/documentation para ver esquemas completos
2. **Copia ejemplos JSON** → Cada DTO tiene ejemplos listos para pegar
3. **Implementa helper** → Crea funciones para construir operaciones (createPasture, createAnimal, etc.)
4. **Mapea IDs locales** → Guarda mapping localId → serverId para futuros syncs
5. **Manejo errores** → Implementa retry logic y logging de fallos
6. **Testing offline** → Crea batch sin conexión, luego sincroniza cuando esté disponible
7. **Monitoreo** → Registra totalSucceeded/Failed para alertas y debugging

---

## 📖 DOCUMENTACIÓN DETALLADA

Para detalles completos de cada campo (validaciones, constraints, ejemplos):
- Revisa la documentación de cada DTO en el Swagger (expande "SyncRanchPastureOperationDto", etc.)
- Cada @ApiProperty tiene explicación completa de valores permitidos
- Ejemplos de JSON están en cada DTO (copiar/pegar directamente)`,
    })
    @ApiOkResponse({
        description:
            'Batch procesado correctamente. Revisar cada sección para ver éxitos (serverId asignados) y fallos (detalles de error).',
        type: SyncCriaResponseDto,
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async syncCria(
        @Body() dto: SyncCriaDto,
        @Res() res: express.Response,
    ) {
        const result = await this.syncService.syncCria(dto);
        return OkRes(res, result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  POST /sync/recria
    // ─────────────────────────────────────────────────────────────────────────

    @Post('recria')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar datos offline del módulo de RECRÍA [REACT NATIVE]',
        description: `**Endpoint de sincronización offline para el módulo de Recría.**

Recibe un batch de operaciones registradas sin conexión (pesajes y selecciones de recría) y las procesa en orden.

## Orden de procesamiento
1. **weightRecords** — Pesajes de animales (actualiza peso en ranch_animals)
2. **rearingSelections** — Selecciones de destino (replacement/fattening/sale)

## Comportamiento por operación
- **create**: Crea el evento animal + registro. Retorna serverId.
- **update**: Actualiza campos editables. Retorna serverId.
- **delete**: Elimina registro y evento asociado. Para selección fattening, también elimina fattening_entry.

## Notas importantes
- Destino **fattening** en rearingSelections: requiere \`idLotDest\` y \`systemType\`. Crea automáticamente un fattening_entry y cambia ps=3.
- Destino **sale**: Cambia ps=4 y status=3 (IRREVERSIBLE). No se puede revertir.
- Usar \`localRef_<campo>\` para referencias cruzadas dentro del mismo batch.`,
    })
    @ApiOkResponse({
        description: 'Batch procesado. Revisar weightRecords y rearingSelections para ver resultados individuales.',
        type: SyncRecriaResponseDto,
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async syncRecria(
        @Body() dto: SyncRecriaDto,
        @Res() res: express.Response,
    ) {
        const result = await this.syncService.syncRecria(dto);
        return OkRes(res, result);
    }
}
