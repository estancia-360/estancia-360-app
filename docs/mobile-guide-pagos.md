# Guía Mobile — Módulo PAGOS / SUSCRIPCIONES (React Native)

> Guía de integración para el desarrollador de la app móvil (o el agente que lo asista).
> Cubre qué le toca a la app móvil en este módulo, por qué está diseñado así, y cómo integrarlo.

---

## TL;DR — qué le toca a la app móvil

**Solo 2 cosas, ambas de lectura/reacción — nunca de escritura:**

1. **Leer** el estado de suscripción de la estancia actual (`GET /subscriptions/my-ranch/:idRanch`) para mostrar avisos ("te quedan 3 animales de tu plan", "tu plan vence en 5 días", "tu plan venció").
2. **Reaccionar** con una UI amigable cuando el backend rechaza la creación de un animal por límite de plan (`400 SUBSCRIPTION_CAPACITY_EXCEEDED`), en vez de mostrar un error genérico.

**Todo lo demás del módulo (activar plan, registrar pago, cancelar, ver métricas) es del panel administrativo interno de Estancia360 — no existe en la app móvil, ni debería intentarse desde ahí.** Esos endpoints (`/admin/subscriptions/*`) requieren rol `ADMIN`/`ROOT`; un usuario normal de la app (Dueño, Trabajador o Administrador de una estancia, todos `RoleEnum.USER`) recibe `403 PERMISSION_DENIED` si los llama. No son parte de este contrato de integración.

Quien paga es el cliente **por fuera del sistema** (QR/transferencia) y avisa a Estancia360 por el canal que sea (WhatsApp, email). Alguien del equipo de Estancia360 — no el operador de campo — carga ese pago desde el panel admin (Fase 2, todavía no construido; hoy solo existe el backend). La app móvil nunca ve ni participa de esa parte del flujo.

---

## Contexto de negocio (el porqué)

Cada **estancia** (no cada usuario — un usuario puede ser Dueño de una estancia y Trabajador de otra, cada una con su propia suscripción independiente) tiene un plan comercial que define cuántos animales activos puede tener:

| Plan | Rango de animales | Precio mensual | Precio anual | Trial |
|---|---|---|---|---|
| Free | 0–30 | 0 Bs | 0 Bs | — (permanente, no vence) |
| Estancia | 31–350 | 100 Bs | 1000 Bs | 7 días |
| Hacienda | 351–1500 | 300 Bs | 3000 Bs | 14 días |
| Ganadero Plus | 1501+ | 450 Bs | 4500 Bs | 21 días |

Toda estancia nace en Free automáticamente al crearse — funciona como demo self-service, por eso **no existe un formulario de "solicitar plan"** en ningún lado del sistema (se evaluó y se descartó a propósito).

**Por qué el enforcement es "soft" en la app móvil y no bloquea nada existente:** el criterio del producto es que un operador de campo nunca debería perder acceso a datos que ya cargó — sería devastador que, por un plan vencido, alguien no pueda ver o actualizar el peso de un animal que ya tiene registrado. Lo único que se restringe es **crecer por encima de lo que el plan permite** (agregar animales nuevos). El bloqueo "duro" (acceso completo cortado) es un concepto distinto que existirá en el futuro dashboard web (Fase 3, no construido) para quien administra desde la computadora — **no aplica ni va a aplicar a la app móvil**.

---

## Contrato de datos

### Tipos (TypeScript)

```typescript
type SubscriptionEffectiveStatus = 'trial' | 'active' | 'expired' | 'cancelled';

interface SubscriptionPlan {
    id: number;
    name: string;
    capacityMin: number;
    capacityMax: number | null; // null = sin límite (Ganadero Plus)
    priceMonthly: number;
    priceAnnual: number;
    trialDays: number;
    isActive: boolean;
}

interface RanchSubscription {
    id: number;
    idRanch: number;
    idPlan: number;
    billingCycle: 'monthly' | 'annual' | null;
    trialEndsAt: string | null;      // fecha ISO (YYYY-MM-DD) o null
    currentPeriodEnd: string | null; // fecha ISO (YYYY-MM-DD) o null
    cancelledAt: string | null;
    effectiveStatus: SubscriptionEffectiveStatus; // calculado en el momento, no es una columna
    plan: SubscriptionPlan;
    createdAt: string;
}
```

`effectiveStatus` no se guarda en ninguna tabla — se calcula en cada consulta a partir de las fechas. Significado de cada valor y qué debería mostrar la app:

| Valor | Significa | Sugerencia de UI |
|---|---|---|
| `trial` | Dentro del período de prueba de un plan pago (`trialEndsAt` en el futuro) | Banner informativo: "Estás en período de prueba, vence el {fecha}" |
| `active` | Plan pago vigente (`currentPeriodEnd` en el futuro), o plan Free (nunca vence) | Sin aviso, o mostrar cupo restante si está cerca del límite |
| `expired` | `currentPeriodEnd` quedó en el pasado sin pago nuevo | Banner de advertencia: "Tu plan venció, no podés agregar más animales hasta regularizar" — pero la app **sigue funcionando normal** para todo lo demás |
| `cancelled` | El admin lo canceló manualmente (`cancelledAt` seteado) | Mismo tratamiento que `expired` |

**Importante:** con `expired` o `cancelled`, el límite de capacidad efectivo cae al de Free (30) aunque el plan asignado en `idPlan`/`plan` siga mostrando el plan pago anterior — no calcules el cupo restante vos mismo en el cliente a partir de `plan.capacityMax`; ese campo puede no ser el límite real vigente. Si necesitás saber cuánto cupo queda, la única fuente confiable es que el backend rechace el `POST` (ver más abajo) — no hay hoy un campo que devuelva "cupo restante" precalculado.

---

## Endpoints que sí usa la app móvil

### 1. Catálogo de planes (público, sin auth)

**GET /subscription-plans** — útil solo si la app quiere mostrar información de planes (ej. en una pantalla "por qué se bloqueó, mirá los planes disponibles"). No requiere token.

```json
{ "plans": [ { "id": 1, "name": "Free", "capacityMin": 0, "capacityMax": 30, "priceMonthly": 0, "priceAnnual": 0, "trialDays": 0, "isActive": true }, "..." ] }
```

### 2. Estado de mi estancia

**GET /subscriptions/my-ranch/:idRanch** — requiere JWT (`Authorization: Bearer <accessToken>`). El usuario autenticado debe pertenecer a esa estancia (cualquier `ranch_role`: Dueño, Trabajador o Administrador) — si no, `403`.

```json
{ "subscription": { "id": 1, "idRanch": 1, "idPlan": 1, "billingCycle": null, "trialEndsAt": null, "currentPeriodEnd": null, "cancelledAt": null, "effectiveStatus": "active", "plan": { "id": 1, "name": "Free", "capacityMax": 30, "priceMonthly": 0, "priceAnnual": 0 }, "createdAt": "2026-07-07T00:00:00.000Z" } }
```

**Cuándo llamarlo:** al abrir la app / cambiar de estancia activa (si el usuario maneja varias), y periódicamente (ej. al volver a foreground, o una vez por sesión) — no hace falta en tiempo real, es un dato que cambia poco. No está pensado para llamarse antes de cada alta de animal; mejor cachear localmente y refrescar con moderación.

---

## El punto no obvio: esto NO es parte del offline-first, y eso importa

A diferencia de todos los demás módulos (Cría, Recría, Engorde, Sanidad, Movimientos), **Pagos no tiene endpoint de sync** (`POST /sync/pagos` no existe) y las suscripciones no tienen `local_id`. El chequeo de capacidad **no es algo que la app pueda validar localmente contra una copia offline** — solo el backend sabe el estado real y actualizado del plan.

Esto tiene una consecuencia directa para el flujo offline-first del resto de la app: cuando el operador crea un animal **sin conexión**, ese animal se guarda localmente y recién se valida contra el límite de plan cuando **sincroniza**. Si en ese momento la estancia ya está en el límite, el alta se rechaza recién ahí — el animal pudo haberse cargado localmente sin problema, mostrado en la lista local, y fallar días después al sincronizar.

**Comportamiento exacto en cada camino:**

- **Online, alta directa** (`POST /ranch-animals`, `POST /breeding/parturition` con cría viva, `POST /movements/register` de tipo `purchase`): el rechazo es inmediato, con un body estructurado:
  ```json
  { "message": "La estancia ID=1 alcanzó el límite de 30 animales de su plan actual. Actualizá el plan para agregar más animales.", "error": "SUBSCRIPTION_CAPACITY_EXCEEDED", "statusCode": 400 }
  ```
  Acá sí podés hacer `if (error.error === 'SUBSCRIPTION_CAPACITY_EXCEEDED')` y mostrar un mensaje específico ("Llegaste al límite de tu plan — contactá a Estancia360 para ampliarlo").

- **Offline → sync** (`POST /sync/cria`, `POST /sync/movimientos`): cada operación del batch se procesa independiente; si una falla por límite de capacidad, **no aborta el resto del batch** — las demás operaciones se procesan igual. La respuesta trae el resultado por ítem:
  ```json
  { "localId": "uuid-generado-en-el-dispositivo", "status": "failed", "error": "La estancia ID=1 alcanzó el límite de 30 animales de su plan actual. Actualizá el plan para agregar más animales." }
  ```
  **Ojo:** acá **no viene un `errorCode` estructurado** como en el camino online, solo un string de mensaje. Si la app necesita distinguir "fue por límite de plan" de otras razones de fallo dentro de un sync, hoy la única forma es matchear el texto del mensaje (frágil) o simplemente mostrar el mensaje tal cual llegó — no hay un código de error dedicado en la respuesta de sync todavía. Si esto se vuelve necesario, es un cambio de backend a pedir, no algo que se pueda resolver solo del lado móvil.

Diseño recomendado para la UI: al ver un ítem `failed` en la respuesta de sync, mostrar el `error` tal cual al usuario y dejar el registro marcado como "no sincronizado" localmente (igual que cualquier otro fallo de sync) — no reintentar automático sin que el usuario haga algo (ampliar el plan es una acción humana, no algo que un reintento resuelva solo).

---

## Qué debería integrar la app móvil (checklist)

- [ ] Al abrir la app / cambiar de estancia activa: `GET /subscriptions/my-ranch/:idRanch`, guardar `effectiveStatus` y `plan` en el estado local.
- [ ] Banner persistente si `effectiveStatus` es `expired` o `cancelled` — mensaje claro de que el plan venció/se canceló, sin bloquear ninguna otra pantalla.
- [ ] Banner informativo (no bloqueante) si `effectiveStatus` es `trial`, con la fecha de `trialEndsAt`.
- [ ] En las 3 pantallas de alta de animal (alta manual, registrar parto con cría viva, registrar compra): capturar específicamente `error === 'SUBSCRIPTION_CAPACITY_EXCEEDED'` en la respuesta del POST online y mostrar el mensaje del backend en vez de un error genérico.
- [ ] En la pantalla de resultado de sincronización: mostrar el `error` de cada ítem `failed`, incluyendo los que vengan por límite de capacidad (sin poder distinguirlos por código, ver arriba).
- [ ] No cachear `plan.capacityMax` como "el límite real" de forma indefinida — puede quedar desactualizado si el estado pasó a `expired`/`cancelled` (ahí el límite real cae a Free). Refrescar el estado de suscripción con cierta frecuencia, no asumir que un valor leído hace una semana sigue vigente.

---

## Referencia de código (React Native / TypeScript)

```typescript
// api/subscriptions.ts
export async function getMySubscription(idRanch: number, accessToken: string): Promise<RanchSubscription> {
    const res = await fetch(`${API_BASE}/subscriptions/my-ranch/${idRanch}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw await res.json();
    const { subscription } = await res.json();
    return subscription;
}
```

```typescript
// hooks/useSubscriptionStatus.ts
export function useSubscriptionStatus(idRanch: number) {
    const [subscription, setSubscription] = useState<RanchSubscription | null>(null);

    const refresh = useCallback(async () => {
        const accessToken = await getAccessToken();
        const sub = await getMySubscription(idRanch, accessToken);
        setSubscription(sub);
    }, [idRanch]);

    useEffect(() => { refresh(); }, [refresh]);

    return {
        subscription,
        refresh,
        isExpiredOrCancelled: subscription?.effectiveStatus === 'expired' || subscription?.effectiveStatus === 'cancelled',
        isTrial: subscription?.effectiveStatus === 'trial',
    };
}
```

```typescript
// Manejo del rechazo por capacidad en un alta online (ej. crear animal)
try {
    await createRanchAnimal(payload, accessToken);
} catch (err: any) {
    if (err?.error === 'SUBSCRIPTION_CAPACITY_EXCEEDED') {
        showAlert('Límite de plan alcanzado', err.message);
        // no reintentar automático — es una decisión del cliente (ampliar plan), no un error transitorio
        return;
    }
    // manejo genérico del resto de errores
    throw err;
}
```

```typescript
// Interpretar un resultado de sync con fallos (ej. POST /sync/cria — la sección de
// animales se llama "ranchAnimals" en la respuesta, no "animals")
for (const result of syncResponse.ranchAnimals.results) {
    if (result.status === 'failed') {
        // no hay errorCode estructurado acá — solo el mensaje tal cual lo mandó el backend
        markLocalRecordAsSyncFailed(result.localId, result.error);
    }
}
```

---

## Notas importantes (por qué está diseñado así)

- **Alcance por estancia, no por usuario**: `id_ranch` es la clave única de la suscripción, nunca `id_user` — porque un usuario puede ser Dueño de una estancia y Trabajador de otra, cada una con su propio plan.
- **`trial` no cuenta como "activo" en las métricas del admin** (esto no afecta a la app móvil directamente, pero explica por qué `effectiveStatus='trial'` es un estado real y distinto de `active`, no solo un detalle interno): el equipo de Estancia360 solo considera ingreso confirmado cuando ya hubo un pago, no mientras el operador está probando gratis los primeros días.
- **`billingCycle` obligatorio al activar un plan pago** (irrelevante para la app móvil, la menciono por si el campo aparece null inesperadamente en algún caso viejo): sin esto, el cálculo de MRR del admin asumía mensual sin avisar — ya está resuelto, pero explica por qué siempre debería venir seteado en cualquier suscripción con plan pago activo.
- **Sin columna `status` en la base de datos**: `effectiveStatus` siempre se calcula a partir de fechas en el momento de la consulta — no hay caché ni cron que lo mantenga sincronizado, así que un valor leído hace tiempo puede estar desactualizado sin que nada lo haya "roto".
- **No hay pasarela de pagos integrada ni planeada a corto plazo** — todo el cobro es manual, fuera del sistema. Si en algún momento se agrega una pasarela real, `payment_source`/`external_reference` (campos internos del pago, no expuestos a la app móvil) ya están preparados para eso sin requerir cambios de schema.
