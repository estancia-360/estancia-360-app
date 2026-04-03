# 🚀 CHEAT SHEET: Sincronización CRÍA - React Native

**Para**: Desarrolladores mobile React Native  
**Fecha**: 3 de abril de 2026  
**Última actualización**: Abril 2026

---

## ⚡ INICIO RÁPIDO (5 minutos)

### 1. Endpoint Principal
```
POST /sync/cria
Headers: Authorization: Bearer {token}, Content-Type: application/json
```

### 2. Estructura Mínima del Batch
```javascript
const batch = {
  idRanch: 1,
  ranchPastures: [],
  ranchLots: [],
  ranchAnimals: [],
  breedingServices: [],
  gestationDiagnoses: [],
  parturitions: [],
  weanings: [],
  animalDeclaredHistories: []
};
```

### 3. Enviar
```javascript
const response = await fetch('https://api.server.com/sync/cria', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(batch)
});
const result = await response.json();
```

---

## 📋 ESTRUCTURA DE CADA OPERACIÓN

```javascript
{
  localId: "unique-id-123",        // Único dentro del batch
  operation: "create|update|delete", // EXACTO (case-sensitive)
  serverId: 5,                     // SOLO para update/delete
  data: { /* campos específicos */ }
}
```

---

## 🎯 VALORES PERMITIDOS (COPY-PASTE)

### OPERACIONES
```javascript
const OPERATIONS = ['create', 'update', 'delete'];
```

### TIPOS DE LOTES
```javascript
const LOT_TYPES = {
  'breeding': 'Reproducción',
  'rearing': 'Recría/Levante',
  'fattening': 'Engorde',
  'reproductive': 'Reproductivo especializado',
  'general': 'General/Sin clasificación'
};
```

### SEXO
```javascript
const SEX = {
  'F': 'Femenino',
  'M': 'Masculino'
};
```

### CLASES DE ANIMALES
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

### SERVICIOS DE REPRODUCCIÓN
```javascript
const SERVICE_TYPES = {
  'natural': 'Monta natural (se requiere idAnimalMale)',
  'artificial': 'Inseminación artificial',
  'embryo': 'Transferencia de embriones'
};
```

### DIAGNÓSTICOS DE GESTACIÓN
```javascript
const DIAGNOSIS_METHODS = {
  'ultrasound': 'Ecografía (90-95% accuracyracy)',
  'palpation': 'Palpación rectal (70-80%)',
  'blood_test': 'Análisis sangre'
};

const DIAGNOSIS_RESULTS = {
  'positive': 'Preñada (bloquea otros servicios)',
  'negative': 'No preñada (permite nuevo servicio)',
  'uncertain': 'Incierto (requiere re-evaluación)'
};
```

### PARTOS
```javascript
const BIRTH_TYPES = {
  'natural': 'Parto espontáneo',
  'assisted': 'Parto asistido',
  'surgical': 'Cesárea'
};

const CRIA_STATUS = {
  'alive': 'Viva y viable',
  'stillborn': 'Nacida muerta',
  'weak': 'Viva pero débil'
};
```

---

## 🔧 EJEMPLOS LISTOS PARA COPIAR

### ✨ Crear Potrero
```javascript
{
  localId: `pot-${uuid()}`,
  operation: 'create',
  data: {
    name: 'Potrero Norte',
    areaHectares: 15.5,
    description: 'Campo con agua permanente',
    isActive: true
  }
}
```

### ✨ Crear Lote (con referencia a potrero del batch)
```javascript
{
  localId: `lote-${uuid()}`,
  operation: 'create',
  data: {
    name: 'Lote Cría A',
    lotType: 'breeding',
    localRef_idRanchPasture: 'pot-001',  // Referencia al potrero creado
    capacity: 50
  }
}
```

### ✨ Crear Hembra Reproductiva
```javascript
{
  localId: `ani-h-${uuid()}`,
  operation: 'create',
  data: {
    code: `HAC-${Date.now()}`, // DEBE ser único
    idBreed: 2,                // Charolais
    idStatus: 1,               // Sano
    idAnimalClass: 8,          // Vaca
    sex: 'F',                  // EXACTO: F o M
    birthdate: '2022-05-10',   // YYYY-MM-DD
    idProductiveStatus: 1,     // Activo
    weight: 420,
    origin: 'Crianza local',
    localRef_idLot: 'lote-001' // Referencia al lote
  }
}
```

### ✨ Crear Macho Reproductor
```javascript
{
  localId: `ani-m-${uuid()}`,
  operation: 'create',
  data: {
    code: `TAU-${Date.now()}`,
    idBreed: 2,
    idStatus: 1,
    idAnimalClass: 10,  // Toro
    sex: 'M',           // EXACTO: M
    birthdate: '2020-03-15',
    idProductiveStatus: 1,
    weight: 850,
    origin: 'Crianza local'
  }
}
```

### ✨ Crear Servicio (Monta Natural)
```javascript
{
  localId: `srv-${uuid()}`,
  operation: 'create',
  happenedAt: new Date().toISOString(),
  data: {
    localRef_idRanchAnimal: 'ani-h-001',   // Hembra
    serviceType: 'natural',
    localRef_idAnimalMale: 'ani-m-001',    // Macho (obligatorio para natural)
    reproductiveLot: 'Lote Cría A'
  }
}
```

### ✨ Crear Diagnóstico Positivo
```javascript
{
  localId: `diag-${uuid()}`,
  operation: 'create',
  happenedAt: new Date().toISOString(),
  data: {
    localRef_idRanchAnimal: 'ani-h-001',
    localRef_idService: 'srv-001',
    method: 'ultrasound',
    result: 'positive',
    gestationDays: 40,
    estimatedBirth: '2026-06-20',
    veterinarian: 'Dr. López'
  }
}
```

### ✨ Registrar Parto
```javascript
{
  localId: `parto-${uuid()}`,
  operation: 'create',
  happenedAt: new Date().toISOString(),
  data: {
    localRef_idRanchAnimal: 'ani-h-001',
    localRef_idDiagnosis: 'diag-001',
    birthType: 'natural',
    criaStatus: 'alive',
    criaWeight: 32,
    criaData: { sex: 'F', color: 'rojo' },
    motherCondition: 'good'
  }
}
```

### ✨ Registrar Destete
```javascript
{
  localId: `destete-${uuid()}`,
  operation: 'create',
  happenedAt: new Date().toISOString(),
  data: {
    idRanchAnimal: 100,  // ID de la cría (del servidor)
    idLotDest: 22,       // ID del lote destino (del servidor)
    weaningWeight: 195,
    weaningAge: 180
  }
}
```

---

## 🔗 REFERENCIAS CRUZADAS (MUY IMPORTANTE)

Cuando quieras referenciar un registro creado EN EL MISMO BATCH (sin serverId aún):

```javascript
// ❌ MAL
data: {
  idRanchPasture: "pot-001"  // NO FUNCIONA
}

// ✅ BIEN
data: {
  localRef_idRanchPasture: "pot-001"  // CORRECTO
}
```

**Patrón**: `localRef_<nombreDelCampo>`

**Ejemplos**:
- `localRef_idRanchPasture` → Referencia a potrero
- `localRef_idRanchAnimal` → Referencia a animal
- `localRef_idService` → Referencia a servicio
- `localRef_idDiagnosis` → Referencia a diagnóstico
- `localRef_idLot` → Referencia a lote

---

## 📊 MANEJO DE RESPUESTAS

```javascript
const result = await response.json();

// Estructura de resultado
{
  totalSucceeded: 5,
  totalFailed: 0,
  ranchPastures: {
    succeeded: 1,
    failed: 0,
    results: [
      {
        localId: "pot-001",
        status: "success",
        serverId: 15  // ← GUARDAR ESTE ID
      }
    ]
  },
  // ... más secciones
}

// Procesar resultados
Object.keys(result).forEach(section => {
  if (typeof result[section] === 'object' && result[section].results) {
    result[section].results.forEach(item => {
      if (item.status === 'success') {
        // Guardar mapping localId → serverId
        saveMapping(item.localId, item.serverId);
      } else {
        // Registrar error
        console.error(`${section}: ${item.error}`);
      }
    });
  }
});
```

---

## ✅ CHECKLIST ANTES DE ENVIAR

- [ ] Cada `localId` es único en el batch
- [ ] Operaciones son `"create"`, `"update"`, o `"delete"` (exacto)
- [ ] Solo update/delete tienen `serverId`
- [ ] Fechas en ISO 8601: `"2026-03-10T09:30:00.000Z"` o `"2026-03-10"`
- [ ] Enums exactos: `"natural"` ✅, `"Natural"` ❌
- [ ] Códigos de animales únicos en la estancia
- [ ] Madre sexo=`"F"`, padre sexo=`"M"`
- [ ] Refs cruzadas usan `localRef_` para apuntar al batch
- [ ] Total < 500 operaciones, < 50 MB
- [ ] Token JWT válido y no expirado

---

## 🔴 ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Invalid enum | serviceType inválido | Usar `"natural"`, no `"Natural"` o `"montanatura"` |
| Unique constraint | Código duplicado | Generar código único para cada animal |
| FK validation | Referencia inexistente | Usar `localRef_` si está en el batch |
| Missing required | Falta campo obligatorio | Revisar DTO, agregar campo |
| Invalid date | Formato incorrecto | Usar ISO 8601: `"2026-03-10T09:30:00.000Z"` |
| Missing serverId | Update sin serverId | Incluir `serverId` para update/delete |

---

## 🛠️ HELPER FUNCTIONS (React Native)

```typescript
import { v4 as uuidv4 } from 'uuid';

// Generar UUID único para batch
const generateLocalId = (prefix: string) => `${prefix}-${uuidv4()}`;

// Crear operación base
function createOperation(
  prefix: string,
  operation: 'create' | 'update' | 'delete',
  data: Record<string, any>,
  serverId?: number,
  happenedAt?: string
) {
  return {
    localId: generateLocalId(prefix),
    operation,
    ...(serverId && { serverId }),
    ...(happenedAt && { happenedAt }),
    data
  };
}

// Crear potrero
function createPasture(name: string, areaHectares: number) {
  return createOperation('pot', 'create', {
    name,
    areaHectares,
    isActive: true
  });
}

// Crear lote
function createLot(name: string, lotType: string, potrerLocalId: string) {
  return createOperation('lote', 'create', {
    name,
    lotType,
    localRef_idRanchPasture: potrerLocalId,
    capacity: 50
  });
}

// Crear animal
function createAnimal(
  code: string,
  sex: 'F' | 'M',
  birthdate: string,
  animalClass: number,
  breed: number = 2
) {
  return createOperation('ani', 'create', {
    code,
    idBreed: breed,
    idStatus: 1,
    idAnimalClass: animalClass,
    sex,
    birthdate,
    idProductiveStatus: 1
  });
}

// Enviar batch y guardar mapping
async function syncBatch(batch: any, token: string) {
  try {
    const response = await fetch('https://api.server.com/sync/cria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(batch)
    });

    const result = await response.json();
    
    if (response.ok) {
      // Procesar y guardar mapping
      const mapping: Record<string, number> = {};
      Object.values(result).forEach((section: any) => {
        if (section.results) {
          section.results.forEach((item: any) => {
            if (item.status === 'success') {
              mapping[item.localId] = item.serverId;
            }
          });
        }
      });
      
      await AsyncStorage.setItem('localToServerMapping', JSON.stringify(mapping));
      return { success: true, data: result, mapping };
    } else {
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error };
  }
}
```

---

## 📱 INTEGRACIÓN COMPLETA (Flujo Típico)

```typescript
// 1. Crear datos locales (sin conexión)
const batch = {
  idRanch: 1,
  ranchPastures: [createPasture('Potrero A', 15.5)],
  ranchLots: [/* ... */],
  ranchAnimals: [/* ... */],
  breedingServices: [/* ... */],
  gestationDiagnoses: [/* ... */],
  parturitions: [/* ... */],
  weanings: [/* ... */],
  animalDeclaredHistories: [/* ... */]
};

// 2. Guardar localmente
await AsyncStorage.setItem('pendingSync', JSON.stringify(batch));

// 3. Cuando hay conexión, sincronizar
const { success, mapping } = await syncBatch(batch, token);

// 4. Actualizar BD local con serverIds
if (success && mapping) {
  await updateLocalDatabase(mapping);
  await AsyncStorage.removeItem('pendingSync');
}
```

---

## 📚 REFERENCIAS

- **Endpoint**: POST `/sync/cria`
- **Autenticación**: Bearer token (JWT)
- **Formato**: JSON
- **Límite**: 500 ops, 50 MB, 60s timeout
- **Documentación completa**: `/api/documentation` (Swagger)
- **Tabla de enums**: Ver sección "VALORES PERMITIDOS" arriba
- **Ejemplos JSON**: Ver sección "EJEMPLOS LISTOS PARA COPIAR" arriba

---

## 🆘 SOPORTE

¿Dudas sobre campos específicos? Expande el DTO en Swagger para ver documentación detallada de cada campo.

¿Problemas? Revisar:
1. Token válido y no expirado
2. Formato exacto de enums
3. localId único dentro del batch
4. localRef_ para referencias internas
5. Fechas en ISO 8601
6. Códigos únicos de animales

---

**Versión**: 1.0  
**Última actualización**: 3 de abril de 2026  
**Estado**: Listo para producción
