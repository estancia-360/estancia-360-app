# Guía Mobile — Módulo MOVIMIENTOS (React Native)

> Guía de integración para el desarrollador de la app móvil.
> Cubre venta (2 fases), compra, traslado entre potreros/lotes, salida a otra estancia, y bajas
> por muerte/descarte. **Leer completo antes de implementar** — la app móvil debe replicar las
> mismas restricciones que el servidor (batch-first, máquina de estados, quién expande un lote).

---

## Concepto central: batch-first

Una operación de movimiento (`movement`) puede cubrir **uno o varios animales** a la vez. El
detalle por animal vive en `movement_animals` (1 movimiento → N animales). **No existe** un
concepto de "mover un lote" como operación aparte: es un movimiento cuyos animales son todos los
del lote.

**Quién arma la lista de animales: el cliente, siempre.** Cuando el operador elige "mover el Lote
3 entero", la app resuelve localmente (con su copia de datos ya bajada por `/sync/download`) qué
animales tiene el Lote 3 **en ese momento** y los manda explícitos en `animals: [...]`. El
servidor nunca expande un lote por su cuenta — si lo hiciera, dos dispositivos podrían pisarse
(uno mete un animal al lote justo cuando el otro ya registró offline el traslado del lote
"completo", y el servidor no tiene forma de saber qué vio el operador realmente).

---

## Los 4 tipos de movimiento

| `movementType` | Estado inicial | Efecto sobre el animal | Quién puede registrar |
|---|---|---|---|
| `pasture_transfer` | `confirmed` directo | `id_lot = idLotDest`. El estado del animal NO cambia. | Cualquier usuario de la estancia |
| `purchase` | `confirmed` directo | Crea `ranch_animals` nuevos (`origin='purchased'`) | **Solo Owner** (`ranch_role=1`) |
| `sale` | **`pending`** | `id_status=4` (Pendiente de Movimiento) hasta confirmar | **Solo Owner** |
| `ranch_exit` | `confirmed` directo | `id_status=5` (Vendido) + `ps=4` (Baja) — **IRREVERSIBLE** | **Solo Owner** |

**Cómo se valida "Owner" hoy:** el body manda `idUser`, y el servidor verifica su `ranch_role` en
esa estancia contra la tabla `ranch_users`. **Todavía no hay JWT** — es la misma confianza que
tiene el resto del proyecto (nadie valida el token aún). No mandar un `idUser` que no sea el que
realmente está logueado.

---

## Validaciones que aplican a TODOS los tipos (replicarlas en el cliente para UX, el servidor las repite igual)

- El animal debe pertenecer a la estancia (`idRanch` del movimiento).
- El animal no puede estar en baja (`ps=4`) — RN-02/RN-07.
- El animal no puede estar ya en `id_status=4` (otro movimiento pendiente sin resolver) — si lo
  está, hay que resolver ese movimiento primero.
- Un mismo animal no puede repetirse dos veces dentro del mismo `animals[]`.
- **Solo `sale`**: ningún animal puede tener un tratamiento con retiro sanitario activo
  (`withdrawal_end_date >= hoy`) — RN-18. El error trae la fecha exacta de fin de retiro.
- **Solo `purchase`**: el `code` (caravana) del animal nuevo debe ser único en la estancia (RN-03).

---

## Endpoints Online

### Registrar un movimiento — POST /movements/register

**Traslado entre potreros/lotes** (`pasture_transfer`):
```json
{
  "idRanch": 1,
  "idUser": 1,
  "movementType": "pasture_transfer",
  "movementDate": "2027-03-01",
  "animals": [
    { "idRanchAnimal": 4, "idLotDest": 2, "notes": "opcional" },
    { "idRanchAnimal": 5, "idLotDest": 2 }
  ]
}
```
`idLotDest` es obligatorio por animal (permite que, dentro de "mover el lote", algún animal vaya
a un lote distinto del resto — la UI puede ofrecerlo como ajuste fino).

**Compra** (`purchase`, solo Owner):
```json
{
  "idRanch": 1,
  "idUser": 1,
  "movementType": "purchase",
  "movementDate": "2027-03-01",
  "originName": "Estancia La Esperanza",
  "totalPrice": 15000.00,
  "pricePerKg": 3.50,
  "animals": [
    {
      "newAnimal": {
        "idBreed": 1,
        "idAnimalClass": 8,
        "code": "COMP-001",
        "sex": "F",
        "birthdate": "2024-05-10",
        "weight": 320.50,
        "idLot": 2
      }
    }
  ]
}
```
Cada animal de una compra va con `newAnimal` (NO `idRanchAnimal` — el animal no existe todavía).
El servidor crea el `ranch_animal` con `origin='purchased'`.

**Venta** (`sale`, solo Owner, 2 fases):
```json
{
  "idRanch": 1,
  "idUser": 1,
  "movementType": "sale",
  "movementDate": "2027-03-01",
  "counterpartName": "Frigorífico del Norte",
  "totalPrice": 45000.00,
  "animals": [
    { "idRanchAnimal": 4 },
    { "idRanchAnimal": 5 }
  ]
}
```
Queda en `status='pending'`, animales en `id_status=4`. **Nada se confirma todavía** — hace
falta el paso siguiente por cada animal.

**Salida a otra estancia** (`ranch_exit`, solo Owner):
```json
{
  "idRanch": 1,
  "idUser": 1,
  "movementType": "ranch_exit",
  "movementDate": "2027-03-01",
  "counterpartName": "Estancia Hermana (otro dueño, mismo grupo)",
  "animals": [{ "idRanchAnimal": 4 }]
}
```
`counterpartName` es obligatorio (texto libre, sin FK — no hay relación entre estancias en el
sistema). La estancia destino registra su ingreso como una `purchase` independiente.

**Idempotencia:** todo `RegisterMovementDto` acepta `localId` — si ya se procesó, devuelve el
movimiento existente sin duplicar. Cada animal dentro de `animals[]` también acepta su propio
`localId` (necesario para el mapeo offline, ver sección de sync).

---

### Confirmar/rechazar un animal de una venta — PATCH /movements/animal/:idMovementAnimal/confirm

```json
{ "status": "accepted", "notes": "opcional" }
```
o
```json
{ "status": "rejected", "notes": "el comprador no lo quiso por peso" }
```

- `accepted` → el animal queda `id_status=5` (Vendido) + `ps=4` (Baja). **Irreversible.**
- `rejected` → el animal vuelve a su estado previo a la venta, queda disponible en la estancia.
- Repetir la misma decisión ya aplicada → **200 OK, sin efecto** (idempotente — un reintento de
  red no rompe nada).
- Pedir la decisión contraria a una ya aplicada (ej. `accepted` sobre uno ya `rejected`) →
  **409 INVALID_STATUS_TRANSITION**.
- Confirmar sobre un movimiento ya cancelado → **409 MOVEMENT_CANCELLED**.

Cuando el último animal `pending` de la venta se resuelve (accepted o rejected), el movimiento
pasa solo a `confirmed`.

`idMovementAnimal` es el ID que devuelve el servidor en `movement.animals[].id` al registrar (o
el `serverId` que devuelve el sync — ver abajo).

---

### Cancelar un movimiento — PATCH /movements/:idMovement/cancel

Cancela una venta **antes** de que se resuelvan todos sus animales. Los que sigan `pending`
vuelven a su estado previo; los que ya fueron `accepted` NO se revierten (la venta confirmada
por animal ya es irreversible).

- Cancelar dos veces → **200 OK, sin efecto** (idempotente).
- Cancelar un movimiento ya `confirmed` → **409 MOVEMENT_ALREADY_CONFIRMED**.

---

### Bajas (muerte, descarte, pérdida) — POST /movements/animal-exit

```json
{
  "idRanchAnimal": 4,
  "reason": "death",
  "notes": "Accidente en el potrero",
  "eventDate": "2027-03-01T08:00:00.000Z"
}
```
- `reason`: `death` | `discard` | `loss` | `other` (con `other`, `notes` es obligatorio).
- El animal pasa a `ps=4` (Baja) + `id_status=3` (Inactivo) — **irreversible**, no hay DELETE.
- **`PATCH /movements/animal-exit/:id`** solo corrige `reason`/`notes` (error de carga) — el
  estado del animal no se toca.
- Concepto **distinto** de venta: la mortalidad va siempre acá, nunca como `sale` ni registrada
  en Sanidad.

---

## Endpoints GET (consulta)

```
GET /movements/ranch/:idRanch?movementType=&status=&page=&limit=   ← listado paginado, filtrable
GET /movements/:id                                                  ← con su detalle animals[]
GET /animal-exits/animal/:idRanchAnimal                              ← bajas de un animal
GET /animal-exits/:id
```

---

## Sincronización offline — POST /sync/movimientos

**Orden de procesamiento:** `animalExits` → `movements` → `movementAnimals`

### 1. Bajas
```json
{
  "idRanch": 1,
  "animalExits": [
    {
      "localId": "exit-uuid-001",
      "operation": "create",
      "happenedAt": "2027-05-10T08:00:00.000Z",
      "data": { "idRanchAnimal": 4, "reason": "death", "notes": "Accidente" }
    }
  ]
}
```
Solo `create` y `update` (corrección) — **sin `delete`**, es irreversible.

### 2. Movimientos — create con animales anidados

```json
{
  "idRanch": 1,
  "movements": [
    {
      "localId": "mov-uuid-001",
      "operation": "create",
      "happenedAt": "2027-05-10",
      "data": {
        "idUser": 1,
        "movementType": "pasture_transfer",
        "movementDate": "2027-05-10",
        "animals": [
          { "idRanchAnimal": 4, "idLotDest": 2, "localId": "ma-uuid-001" },
          { "idRanchAnimal": 5, "idLotDest": 2, "localId": "ma-uuid-002" }
        ]
      }
    }
  ]
}
```
**Cada animal dentro de `data.animals[]` debe traer su propio `localId`** — es la única forma de
mapear después el `serverId` de cada `movement_animal` (necesario para poder confirmar/rechazar
esa fila específica en un sync posterior). La respuesta trae ese mapeo en la sección
`movementAnimals` (ver ejemplo de respuesta abajo).

### 3. Movimientos — cancelar (único `update` permitido sobre `movements`)

```json
{
  "movements": [
    { "localId": "cancel-uuid-001", "operation": "update", "serverId": 7, "data": { "status": "cancelled" } }
  ]
}
```
No hay otro campo editable vía sync en `movements` — para cambios de datos comerciales (precio,
notas) no hay endpoint todavía.

### 4. Confirmar/rechazar animales de una venta

```json
{
  "movementAnimals": [
    { "localId": "confirm-uuid-001", "operation": "update", "serverId": 12, "data": { "status": "accepted" } }
  ]
}
```
- **Solo `update`** — los `movement_animals` se crean siempre anidados dentro de un `movements`
  create, nunca sueltos.
- `serverId` es el ID del `movement_animal` (no del movimiento). Si el movimiento se creó en un
  sync ANTERIOR, ese `serverId` ya lo tenés guardado localmente desde esa respuesta. Si se creó
  en el MISMO batch de este sync, también podés usar el `localId` que le pusiste al animal en el
  paso 2 en lugar de `serverId` — el servidor lo resuelve igual.

### Respuesta del batch

```json
{
  "totalSucceeded": 3,
  "totalFailed": 0,
  "animalExits": { "succeeded": 1, "failed": 0, "results": [...] },
  "movements": { "succeeded": 1, "failed": 0, "results": [{ "localId": "mov-uuid-001", "status": "success", "serverId": 7 }] },
  "movementAnimals": {
    "succeeded": 2,
    "failed": 0,
    "results": [
      { "localId": "ma-uuid-001", "status": "success", "serverId": 12 },
      { "localId": "ma-uuid-002", "status": "success", "serverId": 13 }
    ]
  }
}
```
**Guardar SIEMPRE los `serverId` de `movementAnimals`** — son los que después necesitás para
confirmar/rechazar cada animal de una venta.

### Concurrencia offline — por qué las transiciones son seguras

Como dos dispositivos pueden sincronizar en cualquier orden (el dueño confirma desde el celular
mientras alguien más cancela el movimiento desde otro dispositivo, o el mismo `confirm` se
reintenta por un corte de red), el servidor **nunca confía en el estado que el cliente cree
tener** — valida siempre contra el estado actual en la base:

- Pedir la transición a la que YA está → responde éxito sin tocar nada (a prueba de reintentos).
- Pedir una transición incompatible con el estado actual → falla **solo esa operación** del
  batch, con un código de error claro (`INVALID_STATUS_TRANSITION`, `MOVEMENT_CANCELLED`,
  `MOVEMENT_ALREADY_CONFIRMED`); el resto del batch sigue procesándose normal.
- El cliente se entera del estado real (por si perdió una carrera contra otro dispositivo) en la
  siguiente descarga (`GET /sync/download`), donde `movements`/`movementAnimals` siempre reflejan
  el estado actual del servidor.

---

## Reglas de negocio críticas

| Regla | Descripción |
|---|---|
| RN-01 / RN-16 | Solo el Owner (`ranch_role=1`) puede registrar `sale`, `purchase`, `ranch_exit` |
| RN-02 / RN-07 | Animal en baja (`ps=4`) no puede moverse; toda baja/venta confirmada es irreversible |
| RN-03 | Código caravana único por estancia (aplica a `purchase`) |
| RN-10 | Animal dado de baja no puede reactivarse |
| RN-18 | Retiro sanitario activo bloquea `sale` (no bloquea `purchase`/`transfer`/`ranch_exit`) |
| — | Animal en un movimiento `pending` no puede entrar a otro movimiento ni recibir un `animal_exit` hasta resolverse |
| — | `prev_id_status` (para rollback) **siempre** lo calcula el servidor — nunca enviarlo desde el cliente |

---

## Notas importantes

- **`animal_exits` no es lo mismo que `sale`**: `sale`→`id_status=5` (Vendido); `animal_exit`→
  `id_status=3` (Inactivo). Ambos terminan en `ps=4` (Baja) pero representan conceptos de negocio
  distintos — no usar uno por el otro.
- **`ranch_exit` no crea vínculo con la otra estancia**: `counterpartName` es solo texto. La
  estancia que recibe registra su propio `purchase`, sin relación en la base de datos.
- **No hay DELETE en ninguna parte de este módulo** salvo lo ya descrito (correcciones de datos
  vía `update`, nunca reversión de estado). Todo lo demás se corrige con una operación nueva
  (cancelar, o resolver el animal como `rejected`).
- **Quién arma la lista de animales de un movimiento es siempre el cliente** (ver sección inicial)
  — el servidor nunca expande un lote por su cuenta.
