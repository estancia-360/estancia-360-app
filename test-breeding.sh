#!/usr/bin/env bash
# =============================================================================
#  ESTANCIA-360 — TEST SUITE COMPLETO: Módulo Cría / Reproducción
#  Crea todos los datos necesarios desde cero (DB vacía con constantes)
#  Compatible con macOS y Linux
# =============================================================================
# Requisitos: curl, jq
# Uso:        ./test-breeding.sh
# =============================================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
API="${BASE_URL}/api/estancia-360"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

PASS=0; FAIL=0; TOTAL=0
TS=$(date +%s)  # timestamp para datos únicos

# ── Helpers ──────────────────────────────────────────────────────────────────
section() {
    echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════════${RESET}"
    echo -e "${BOLD}${CYAN}  $1${RESET}"
    echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${RESET}"
}

assert() {
    local label="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL+1))
    if [ "$actual" -eq "$expected" ]; then
        echo -e "  ${GREEN}✔ PASS${RESET} [HTTP $actual] $label"
        PASS=$((PASS+1))
    else
        echo -e "  ${RED}✘ FAIL${RESET} [HTTP $actual, esperado $expected] $label"
        echo -e "       ${YELLOW}Body:${RESET} $(jq -c . /tmp/last_resp.json 2>/dev/null || cat /tmp/last_resp.json 2>/dev/null)"
        FAIL=$((FAIL+1))
    fi
}

# Falla crítica: abortar setup si algo esencial no funciona
assert_critical() {
    local label="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL+1))
    if [ "$actual" -eq "$expected" ]; then
        echo -e "  ${GREEN}✔ PASS${RESET} [HTTP $actual] $label"
        PASS=$((PASS+1))
    else
        echo -e "  ${RED}✘ FAIL CRÍTICO${RESET} [HTTP $actual, esperado $expected] $label"
        echo -e "       ${YELLOW}Body:${RESET} $(jq -c . /tmp/last_resp.json 2>/dev/null || cat /tmp/last_resp.json 2>/dev/null)"
        echo -e "\n  ${RED}Setup fallido. No se pueden continuar los tests.${RESET}"
        summary
        exit 1
    fi
}

do_post() {
    curl -s -X POST "$1" \
        -H "Content-Type: application/json" \
        -d "$2" \
        -o /tmp/last_resp.json \
        -w "%{http_code}"
}
do_patch() {
    curl -s -X PATCH "$1" \
        -H "Content-Type: application/json" \
        -d "$2" \
        -o /tmp/last_resp.json \
        -w "%{http_code}"
}
do_delete() {
    curl -s -X DELETE "$1" \
        -o /tmp/last_resp.json \
        -w "%{http_code}"
}
do_get() {
    curl -s -X GET "$1" \
        -o /tmp/last_resp.json \
        -w "%{http_code}"
}

field()  { jq -r "${1} // empty" /tmp/last_resp.json 2>/dev/null || echo ""; }
fieldq() { jq -r "${1} // empty" /tmp/last_resp.json 2>/dev/null; }  # sin fallback echo

summary() {
    echo ""
    echo -e "  ${BOLD}Total:   $TOTAL${RESET}"
    echo -e "  ${GREEN}Passed:  $PASS${RESET}"
    echo -e "  ${RED}Failed:  $FAIL${RESET}"
    echo ""
    if [ "$FAIL" -eq 0 ]; then
        echo -e "  ${GREEN}${BOLD}✔ Todos los tests pasaron.${RESET}"
    else
        echo -e "  ${YELLOW}${BOLD}⚠ $FAIL test(s) fallaron — revisar outputs arriba.${RESET}"
    fi
    echo ""
}

# ════════════════════════════════════════════════════════════════════════════
section "0. VERIFICAR SERVIDOR"
# ════════════════════════════════════════════════════════════════════════════
if ! curl -s --max-time 3 -o /dev/null "$BASE_URL"; then
    echo -e "${RED}✘ Servidor no responde en $BASE_URL${RESET}"
    exit 1
fi
echo -e "  ${GREEN}✔ Servidor activo en $BASE_URL${RESET}"

# ════════════════════════════════════════════════════════════════════════════
section "SETUP 1/5 — Obtener catálogos (roles, razas, estados, país, región, ciudad)"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}GET /roles${RESET}"
SC=$(do_get "$API/roles")
assert_critical "GET roles (catálogo)" 200 "$SC"
ID_ROLE=$(jq -r '.roles[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → idRole = $ID_ROLE (usando el primero disponible)"

echo -e "\n  ${BOLD}GET /animal-breeds${RESET}"
SC=$(do_get "$API/animal-breeds")
assert_critical "GET razas de animales (catálogo)" 200 "$SC"
ID_RAZA=$(jq -r '.breeds[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → idBreed = $ID_RAZA (usando la primera disponible)"

echo -e "\n  ${BOLD}GET /animal-states${RESET}"
SC=$(do_get "$API/animal-states")
assert_critical "GET estados de animales (catálogo)" 200 "$SC"
ID_STATUS=$(jq -r '.statues[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → idStatus = $ID_STATUS (usando el primero disponible)"

echo -e "\n  ${BOLD}GET /countries${RESET}"
SC=$(do_get "$API/countries")
assert_critical "GET países (catálogo)" 200 "$SC"
# Buscar Bolivia específicamente porque las regiones/ciudades seeded son bolivianas
ID_COUNTRY=$(jq -r '.countries[] | select(.name == "Bolivia") | .id // empty' /tmp/last_resp.json 2>/dev/null)
# Fallback: si no existe "Bolivia", tomar el último (id más alto, más probable que tenga datos)
if [ -z "$ID_COUNTRY" ] || [ "$ID_COUNTRY" = "null" ]; then
    ID_COUNTRY=$(jq -r '[.countries[].id] | max // empty' /tmp/last_resp.json 2>/dev/null)
fi
echo "     → idCountry = $ID_COUNTRY (Bolivia)"

echo -e "\n  ${BOLD}GET /regions/$ID_COUNTRY${RESET}"
SC=$(do_get "$API/regions/$ID_COUNTRY")
assert_critical "GET regiones del país" 200 "$SC"
ID_REGION=$(jq -r '.regions[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → idRegion = $ID_REGION"

echo -e "\n  ${BOLD}GET /cities/$ID_REGION${RESET}"
SC=$(do_get "$API/cities/$ID_REGION")
assert_critical "GET ciudades de la región" 200 "$SC"
ID_CITY=$(jq -r '.cities[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → idCity = $ID_CITY"

# Production type: el endpoint no tiene GET expuesto, usamos id=1 (seeded por defecto)
ID_PROD_TYPE=1
echo -e "\n  → idProductionType = $ID_PROD_TYPE (valor default seeded)"

# Validar que obtuvimos todo
for VAR_NAME in ID_ROLE ID_RAZA ID_STATUS ID_COUNTRY ID_REGION ID_CITY; do
    VAL="${!VAR_NAME}"
    if [ -z "$VAL" ] || [ "$VAL" = "null" ]; then
        echo -e "  ${RED}✘ No se pudo obtener $VAR_NAME del catálogo. ¿Hay datos seeded?${RESET}"
        echo -e "  ${YELLOW}Verifica que animal_breeds, animal_statuses, countries, regions, cities, roles tengan datos.${RESET}"
        exit 1
    fi
done
echo -e "\n  ${GREEN}✔ Catálogos obtenidos correctamente${RESET}"

# ════════════════════════════════════════════════════════════════════════════
section "SETUP 2/5 — Registrar usuario productor"
# ════════════════════════════════════════════════════════════════════════════
USER_EMAIL="test.productor.${TS}@estancia360.test"
USER_PASS="Test1234!"

echo -e "\n  ${BOLD}POST /auth/register${RESET}"
SC=$(do_post "$API/auth/register" '{
  "idRole": '"$ID_ROLE"',
  "ci": "TEST'"$TS"'",
  "fullname": "Productor Test '"$TS"'",
  "paternalSurname": "García",
  "maternalSurname": "López",
  "email": "'"$USER_EMAIL"'",
  "password": "'"$USER_PASS"'",
  "celphone": "78900000"
}')
assert_critical "Registrar usuario productor" 201 "$SC"
ID_USER=$(jq -r '.user.id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → user.id = $ID_USER  (email: $USER_EMAIL)"

# ════════════════════════════════════════════════════════════════════════════
section "SETUP 3/5 — Crear estancia"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}POST /ranches${RESET}"
SC=$(do_post "$API/ranches" '{
  "idUser": '"$ID_USER"',
  "idCity": '"$ID_CITY"',
  "idProductionTypes": ['"$ID_PROD_TYPE"'],
  "name": "Estancia Test '"$TS"'"
}')
assert_critical "Crear estancia" 201 "$SC"
ID_RANCH=$(jq -r '.ranch.id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → ranch.id = $ID_RANCH"

# ════════════════════════════════════════════════════════════════════════════
section "SETUP 4/5 — Crear animales (hembra + macho)"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}POST /ranch-animals (hembra)${RESET}"
SC=$(do_post "$API/ranch-animals" '{
  "idRanch": '"$ID_RANCH"',
  "idBreed": '"$ID_RAZA"',
  "idStatus": '"$ID_STATUS"',
  "code": "VAC-H-'"$TS"'",
  "sex": "F",
  "birthdate": "2020-03-15",
  "weight": 380.5,
  "createdAt": "2026-01-01T08:00:00.000Z"
}')
assert_critical "Crear hembra (VAC-H)" 201 "$SC"
# El endpoint de crear animals no devuelve el ID creado en el body según el controller
# Usamos el endpoint de búsqueda para obtener el animal recién creado
SC2=$(do_get "$API/ranch-animals/$ID_RANCH?sex=F&limit=1&page=1")
ID_HEMBRA=$(jq -r '.data[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → hembra.id = $ID_HEMBRA"

echo -e "\n  ${BOLD}POST /ranch-animals (macho)${RESET}"
SC=$(do_post "$API/ranch-animals" '{
  "idRanch": '"$ID_RANCH"',
  "idBreed": '"$ID_RAZA"',
  "idStatus": '"$ID_STATUS"',
  "code": "TOR-M-'"$TS"'",
  "sex": "M",
  "birthdate": "2018-06-20",
  "weight": 620.0,
  "createdAt": "2026-01-01T08:00:00.000Z"
}')
assert_critical "Crear macho (TOR-M)" 201 "$SC"
SC2=$(do_get "$API/ranch-animals/$ID_RANCH?sex=M&limit=1&page=1")
ID_MACHO=$(jq -r '.data[0].id // empty' /tmp/last_resp.json 2>/dev/null)
echo "     → macho.id  = $ID_MACHO"

if [ -z "$ID_HEMBRA" ] || [ "$ID_HEMBRA" = "null" ] || [ -z "$ID_MACHO" ] || [ "$ID_MACHO" = "null" ]; then
    echo -e "  ${RED}✘ No se pudieron obtener los IDs de los animales creados.${RESET}"
    exit 1
fi

# ════════════════════════════════════════════════════════════════════════════
section "SETUP 5/5 — Resumen de datos de prueba"
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo "     ID_USER    = $ID_USER   ($USER_EMAIL)"
echo "     ID_RANCH   = $ID_RANCH"
echo "     ID_HEMBRA  = $ID_HEMBRA  (VAC-H-$TS, sex=F)"
echo "     ID_MACHO   = $ID_MACHO   (TOR-M-$TS, sex=M)"
echo "     ID_RAZA    = $ID_RAZA"
echo "     ID_STATUS  = $ID_STATUS"
echo ""
echo -e "  ${GREEN}${BOLD}✔ Setup completo. Comenzando tests del módulo Cría...${RESET}"

# ════════════════════════════════════════════════════════════════════════════
section "1. FLUJO ONLINE — REGISTRAR (happy path)"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}1.1 POST /breeding/animal-declared-history${RESET}"
SC=$(do_post "$API/breeding/animal-declared-history" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "prevBirthsCount": 3,
  "prevLastBirthYear": 2024,
  "prevAvgWeaningWeight": 145.5,
  "notes": "Declarado por el productor al ingreso"
}')
assert "Registrar historial declarado" 201 "$SC"
HISTORY_ID=$(field '.history.id')
echo "     → history.id = $HISTORY_ID"

echo -e "\n  ${BOLD}1.2 POST /breeding/breeding-service (inseminación artificial)${RESET}"
SC=$(do_post "$API/breeding/breeding-service" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "serviceType": "artificial_insemination",
  "semenBreed": "Angus",
  "technician": "Técnico García",
  "reproductiveLot": "LOT-2026-01",
  "notes": "Primera IA de la temporada",
  "eventDate": "2026-01-10T09:00:00.000Z"
}')
assert "Registrar servicio de monta (IA)" 201 "$SC"
SERVICE_ID=$(field '.breedingService.id')
echo "     → breedingService.id = $SERVICE_ID"

echo -e "\n  ${BOLD}1.3 POST /breeding/gestation-diagnosis (pregnant)${RESET}"
SC=$(do_post "$API/breeding/gestation-diagnosis" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idService": '"$SERVICE_ID"',
  "method": "ultrasound",
  "result": "pregnant",
  "gestationDays": 35,
  "estimatedBirth": "2026-07-15",
  "veterinarian": "Dr. Ramírez",
  "notes": "Eco a los 35 días, preñez confirmada",
  "eventDate": "2026-02-14T10:00:00.000Z"
}')
assert "Registrar diagnóstico gestación (pregnant)" 201 "$SC"
DIAG_ID=$(field '.gestationDiagnosis.id')
echo "     → gestationDiagnosis.id = $DIAG_ID"

echo -e "\n  ${BOLD}1.4 POST /breeding/parturition (cría viva → animal creado automáticamente)${RESET}"
CRIA_CODE="BOV-${TS}-CRIA"
SC=$(do_post "$API/breeding/parturition" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idDiagnosis": '"$DIAG_ID"',
  "birthType": "normal",
  "criaStatus": "alive",
  "criaWeight": 34.5,
  "motherCondition": "good",
  "notes": "Parto sin complicaciones",
  "eventDate": "2026-07-14T06:30:00.000Z",
  "criaData": {
    "code": "'"$CRIA_CODE"'",
    "idBreed": '"$ID_RAZA"',
    "idStatus": '"$ID_STATUS"',
    "sex": "F",
    "weight": 34.5
  }
}')
assert "Registrar parto (cría viva + animal creado)" 201 "$SC"
PARTURITION_ID=$(field '.parturition.id')
CRIA_ID=$(field '.parturition.cria.id')
echo "     → parturition.id   = $PARTURITION_ID"
echo "     → cria (animal).id = $CRIA_ID"

echo -e "\n  ${BOLD}1.5 POST /breeding/weaning (sobre la cría)${RESET}"
WEANING_TARGET="${CRIA_ID}"
[ -z "$WEANING_TARGET" ] || [ "$WEANING_TARGET" = "null" ] && WEANING_TARGET="$ID_HEMBRA"
SC=$(do_post "$API/breeding/weaning" '{
  "idRanchAnimal": '"$WEANING_TARGET"',
  "weaningWeight": 128.0,
  "ageDays": 180,
  "notes": "Destete a los 6 meses",
  "eventDate": "2026-10-14T08:00:00.000Z"
}')
assert "Registrar destete" 201 "$SC"
WEANING_ID=$(field '.weaning.id')
echo "     → weaning.id = $WEANING_ID"

# ════════════════════════════════════════════════════════════════════════════
section "2. FLUJO ONLINE — ACTUALIZAR"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}2.1 PATCH /breeding/breeding-service/$SERVICE_ID${RESET}"
SC=$(do_patch "$API/breeding/breeding-service/$SERVICE_ID" '{
  "technician": "Dr. López (corregido)",
  "reproductiveLot": "LOT-2026-01-V2"
}')
assert "Actualizar servicio de monta" 200 "$SC"

echo -e "\n  ${BOLD}2.2 PATCH /breeding/gestation-diagnosis/$DIAG_ID${RESET}"
SC=$(do_patch "$API/breeding/gestation-diagnosis/$DIAG_ID" '{
  "gestationDays": 37,
  "estimatedBirth": "2026-07-13",
  "veterinarian": "Dr. Ramírez (corrección)"
}')
assert "Actualizar diagnóstico gestación" 200 "$SC"

echo -e "\n  ${BOLD}2.3 PATCH /breeding/parturition/$PARTURITION_ID${RESET}"
SC=$(do_patch "$API/breeding/parturition/$PARTURITION_ID" '{
  "criaWeight": 35.2,
  "motherCondition": "good"
}')
assert "Actualizar parto" 200 "$SC"

echo -e "\n  ${BOLD}2.4 PATCH /breeding/weaning/$WEANING_ID${RESET}"
SC=$(do_patch "$API/breeding/weaning/$WEANING_ID" '{
  "weaningWeight": 131.0,
  "ageDays": 183
}')
assert "Actualizar destete" 200 "$SC"

echo -e "\n  ${BOLD}2.5 PATCH /breeding/animal-declared-history/$HISTORY_ID${RESET}"
SC=$(do_patch "$API/breeding/animal-declared-history/$HISTORY_ID" '{
  "prevBirthsCount": 4,
  "notes": "Corrección: el productor recordó un parto más"
}')
assert "Actualizar historial declarado" 200 "$SC"

# ════════════════════════════════════════════════════════════════════════════
section "3. ERRORES ESPERADOS (validaciones y conflictos)"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}3.1 Campos obligatorios faltantes (serviceType + eventDate) → 400${RESET}"
SC=$(do_post "$API/breeding/breeding-service" '{"idRanchAnimal": '"$ID_HEMBRA"'}')
assert "Campos obligatorios faltantes → 400" 400 "$SC"

echo -e "\n  ${BOLD}3.2 Animal inexistente → 404${RESET}"
SC=$(do_post "$API/breeding/breeding-service" '{
  "idRanchAnimal": 999999,
  "serviceType": "natural",
  "eventDate": "2026-01-10T09:00:00.000Z"
}')
assert "Animal inexistente → 404" 404 "$SC"

echo -e "\n  ${BOLD}3.3 Servicio de monta inexistente → 404${RESET}"
SC=$(do_post "$API/breeding/gestation-diagnosis" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idService": 999999,
  "method": "ultrasound",
  "result": "pregnant",
  "eventDate": "2026-02-14T10:00:00.000Z"
}')
assert "Servicio inexistente → 404" 404 "$SC"

echo -e "\n  ${BOLD}3.4 Segundo diagnóstico para el mismo servicio → 409${RESET}"
SC=$(do_post "$API/breeding/gestation-diagnosis" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idService": '"$SERVICE_ID"',
  "method": "palpation",
  "result": "empty",
  "eventDate": "2026-02-20T10:00:00.000Z"
}')
assert "Diagnóstico duplicado → 409" 409 "$SC"

echo -e "\n  ${BOLD}3.5 Segundo parto para el mismo diagnóstico → 409${RESET}"
SC=$(do_post "$API/breeding/parturition" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idDiagnosis": '"$DIAG_ID"',
  "birthType": "assisted",
  "criaStatus": "dead",
  "eventDate": "2026-07-15T08:00:00.000Z"
}')
assert "Parto duplicado → 409" 409 "$SC"

echo -e "\n  ${BOLD}3.6 Historial declarado duplicado → 409${RESET}"
SC=$(do_post "$API/breeding/animal-declared-history" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "prevBirthsCount": 2
}')
assert "Historial declarado duplicado → 409" 409 "$SC"

echo -e "\n  ${BOLD}3.7 PATCH ID inexistente → 404${RESET}"
SC=$(do_patch "$API/breeding/breeding-service/999999" '{"technician": "X"}')
assert "Update ID inexistente → 404" 404 "$SC"

echo -e "\n  ${BOLD}3.8 DELETE ID inexistente → 404${RESET}"
SC=$(do_delete "$API/breeding/parturition/999999")
assert "Delete ID inexistente → 404" 404 "$SC"

echo -e "\n  ${BOLD}3.9 Enum serviceType inválido → 400${RESET}"
SC=$(do_post "$API/breeding/breeding-service" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "serviceType": "magic_mating",
  "eventDate": "2026-01-10T09:00:00.000Z"
}')
assert "Enum inválido → 400" 400 "$SC"

echo -e "\n  ${BOLD}3.10 Enum result de diagnóstico inválido → 400${RESET}"
SC=$(do_post "$API/breeding/gestation-diagnosis" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idService": '"$SERVICE_ID"',
  "method": "ultrasound",
  "result": "maybe_pregnant",
  "eventDate": "2026-02-14T10:00:00.000Z"
}')
assert "Enum result inválido → 400" 400 "$SC"

# ════════════════════════════════════════════════════════════════════════════
section "4. SYNC OFFLINE — BATCH CREATE con localRefs"
# ════════════════════════════════════════════════════════════════════════════
echo -e "  Simula 1 semana offline: svc → diagnóstico via localRef → historial macho\n"

SC=$(do_post "$API/breeding/sync" '{
  "operations": [
    {
      "localId": "svc-offline-001",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-02-01T08:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "serviceType": "artificial_insemination",
        "semenBreed": "Angus",
        "technician": "Ing. Morales",
        "reproductiveLot": "IA-LOTE-2026-A"
      }
    },
    {
      "localId": "diag-offline-001",
      "type": "gestation_diagnosis",
      "operation": "create",
      "happenedAt": "2026-03-08T10:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "localRef_idService": "svc-offline-001",
        "method": "ultrasound",
        "result": "pregnant",
        "gestationDays": 35,
        "estimatedBirth": "2026-08-20",
        "veterinarian": "Dr. Castro"
      }
    },
    {
      "localId": "hist-macho-001",
      "type": "animal_declared_history",
      "operation": "create",
      "happenedAt": "2026-02-01T07:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_MACHO"',
        "prevBirthsCount": 0,
        "notes": "Macho reproductor sin historial previo"
      }
    }
  ]
}')
assert "Sync batch create (svc → diag via localRef → historial macho)" 200 "$SC"
SYNC_SVC_ID=$(jq -r '.results[] | select(.localId=="svc-offline-001") | .serverId' /tmp/last_resp.json 2>/dev/null)
SYNC_DIAG_ID=$(jq -r '.results[] | select(.localId=="diag-offline-001") | .serverId' /tmp/last_resp.json 2>/dev/null)
jq -r '.results[] | "     [\(.status)] \(.localId) → serverId=\(.serverId // "N/A")\(if .error then "  ⚠ "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null
echo "     → succeeded=$(jq -r '.succeeded' /tmp/last_resp.json) failed=$(jq -r '.failed' /tmp/last_resp.json) (esperado: 3/0)"

# ════════════════════════════════════════════════════════════════════════════
section "5. SYNC OFFLINE — BATCH MASIVO (1 mes offline)"
# ════════════════════════════════════════════════════════════════════════════
echo -e "  Crea ciclos, correcciones offline y encadena referencias\n"

CRIA2_CODE="BOV-${TS}-SYNC2"
SC=$(do_post "$API/breeding/sync" '{
  "operations": [
    {
      "localId": "svc-m01",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-03-01T08:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "serviceType": "embryo_transfer",
        "technician": "Dr. Vargas",
        "reproductiveLot": "ET-BATCH-2026"
      }
    },
    {
      "localId": "update-svc-offline-001",
      "type": "breeding_service",
      "operation": "update",
      "happenedAt": "2026-03-02T09:00:00.000Z",
      "serverId": '"${SYNC_SVC_ID:-1}"',
      "data": {
        "technician": "Ing. Morales (corregido offline)",
        "reproductiveLot": "IA-LOTE-2026-A-V2"
      }
    },
    {
      "localId": "diag-m01-empty",
      "type": "gestation_diagnosis",
      "operation": "create",
      "happenedAt": "2026-04-01T10:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "localRef_idService": "svc-m01",
        "method": "palpation",
        "result": "empty",
        "veterinarian": "Dr. Vargas"
      }
    },
    {
      "localId": "svc-m02",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-04-05T08:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "serviceType": "natural",
        "reproductiveLot": "MONTA-ABR-2026"
      }
    },
    {
      "localId": "diag-m02-preg",
      "type": "gestation_diagnosis",
      "operation": "create",
      "happenedAt": "2026-05-10T10:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "localRef_idService": "svc-m02",
        "method": "ultrasound",
        "result": "pregnant",
        "gestationDays": 35,
        "estimatedBirth": "2026-10-20",
        "veterinarian": "Dr. Castro"
      }
    }
  ]
}')
assert "Sync masivo 5 ops (creates + update + localRefs encadenados)" 200 "$SC"
jq -r '.results[] | "     [\(.status)] \(.localId) → serverId=\(.serverId // "N/A")\(if .error then "  ⚠ "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null
echo "     → succeeded=$(jq -r '.succeeded' /tmp/last_resp.json) failed=$(jq -r '.failed' /tmp/last_resp.json)"

# ════════════════════════════════════════════════════════════════════════════
section "6. SYNC OFFLINE — ERRORES DENTRO DEL BATCH"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}6.1 Op válida + animal inexistente + op válida → 1 falla, batch 200${RESET}"
SC=$(do_post "$API/breeding/sync" '{
  "operations": [
    {
      "localId": "svc-valid-1",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-06-01T08:00:00.000Z",
      "data": { "idRanchAnimal": '"$ID_HEMBRA"', "serviceType": "natural" }
    },
    {
      "localId": "svc-bad-animal",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-06-02T08:00:00.000Z",
      "data": { "idRanchAnimal": 999999, "serviceType": "natural" }
    },
    {
      "localId": "svc-valid-2",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-06-03T08:00:00.000Z",
      "data": { "idRanchAnimal": '"$ID_HEMBRA"', "serviceType": "natural" }
    }
  ]
}')
assert "Batch mixto (2 success + 1 fail)" 200 "$SC"
jq -r '.results[] | "     [\(.status)] \(.localId)\(if .error then ": "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null
echo "     → succeeded=$(jq -r '.succeeded' /tmp/last_resp.json) failed=$(jq -r '.failed' /tmp/last_resp.json) (esperado: 2/1)"

echo -e "\n  ${BOLD}6.2 Update sin serverId → resultado failed, batch 200${RESET}"
SC=$(do_post "$API/breeding/sync" '{
  "operations": [{
    "localId": "bad-update-no-serverid",
    "type": "breeding_service",
    "operation": "update",
    "happenedAt": "2026-06-01T08:00:00.000Z",
    "data": { "technician": "alguien" }
  }]
}')
assert "Update sin serverId → resultado failed (batch 200)" 200 "$SC"
jq -r '.results[0] | "     [\(.status)]\(if .error then ": "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null

echo -e "\n  ${BOLD}6.3 Delete serverId inexistente → resultado failed, batch 200${RESET}"
SC=$(do_post "$API/breeding/sync" '{
  "operations": [{
    "localId": "delete-ghost",
    "type": "breeding_service",
    "operation": "delete",
    "happenedAt": "2026-06-01T08:00:00.000Z",
    "serverId": 999999,
    "data": {}
  }]
}')
assert "Delete ID fantasma → resultado failed (batch 200)" 200 "$SC"
jq -r '.results[0] | "     [\(.status)]\(if .error then ": "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null

echo -e "\n  ${BOLD}6.4 Batch vacío → 400${RESET}"
SC=$(do_post "$API/breeding/sync" '{"operations": []}')
assert "Batch vacío → 400" 400 "$SC"

echo -e "\n  ${BOLD}6.5 localRef cuya op padre falló → ambas fallan, batch 200${RESET}"
SC=$(do_post "$API/breeding/sync" '{
  "operations": [
    {
      "localId": "svc-will-fail",
      "type": "breeding_service",
      "operation": "create",
      "happenedAt": "2026-06-01T08:00:00.000Z",
      "data": { "idRanchAnimal": 999999, "serviceType": "natural" }
    },
    {
      "localId": "diag-dead-ref",
      "type": "gestation_diagnosis",
      "operation": "create",
      "happenedAt": "2026-06-10T10:00:00.000Z",
      "data": {
        "idRanchAnimal": '"$ID_HEMBRA"',
        "localRef_idService": "svc-will-fail",
        "method": "ultrasound",
        "result": "pregnant"
      }
    }
  ]
}')
assert "localRef de op fallida → ambas failed (batch 200)" 200 "$SC"
jq -r '.results[] | "     [\(.status)] \(.localId)\(if .error then ": "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null
echo "     → succeeded=$(jq -r '.succeeded' /tmp/last_resp.json) (esperado: 0) failed=$(jq -r '.failed' /tmp/last_resp.json) (esperado: 2)"

# ════════════════════════════════════════════════════════════════════════════
section "7. DELETE con cascada (online)"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}7.1 DELETE weaning/$WEANING_ID → revierte isWeaned en animal${RESET}"
SC=$(do_delete "$API/breeding/weaning/$WEANING_ID")
assert "Eliminar destete (isWeaned → null)" 204 "$SC"

echo -e "\n  ${BOLD}7.2 DELETE animal-declared-history/$HISTORY_ID${RESET}"
SC=$(do_delete "$API/breeding/animal-declared-history/$HISTORY_ID")
assert "Eliminar historial declarado" 204 "$SC"

echo -e "\n  ${BOLD}7.3 DELETE parturition/$PARTURITION_ID${RESET}"
SC=$(do_delete "$API/breeding/parturition/$PARTURITION_ID")
assert "Eliminar parto" 204 "$SC"

echo -e "\n  ${BOLD}7.4 DELETE gestation-diagnosis/$DIAG_ID (parto ya eliminado)${RESET}"
SC=$(do_delete "$API/breeding/gestation-diagnosis/$DIAG_ID")
assert "Eliminar diagnóstico" 204 "$SC"

echo -e "\n  ${BOLD}7.5 DELETE breeding-service/$SERVICE_ID (ya sin hijos)${RESET}"
SC=$(do_delete "$API/breeding/breeding-service/$SERVICE_ID")
assert "Eliminar servicio" 204 "$SC"

echo -e "\n  ${BOLD}7.6 Crear svc→diag→parto para test de cascada total${RESET}"
SC=$(do_post "$API/breeding/breeding-service" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "serviceType": "natural",
  "eventDate": "2026-08-01T09:00:00.000Z"
}')
assert "Crear servicio (para cascada)" 201 "$SC"
C_SVC=$(field '.breedingService.id')

SC=$(do_post "$API/breeding/gestation-diagnosis" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idService": '"$C_SVC"',
  "method": "palpation",
  "result": "pregnant",
  "eventDate": "2026-09-01T10:00:00.000Z"
}')
assert "Crear diagnóstico (para cascada)" 201 "$SC"
C_DIAG=$(field '.gestationDiagnosis.id')

SC=$(do_post "$API/breeding/parturition" '{
  "idRanchAnimal": '"$ID_HEMBRA"',
  "idDiagnosis": '"$C_DIAG"',
  "birthType": "cesarean",
  "criaStatus": "dead",
  "motherCondition": "bad",
  "eventDate": "2026-12-01T06:00:00.000Z"
}')
assert "Crear parto muerto (para cascada)" 201 "$SC"

echo -e "\n  ${BOLD}7.7 DELETE breeding-service/$C_SVC → cascada elimina diag + parto + 3 eventos${RESET}"
SC=$(do_delete "$API/breeding/breeding-service/$C_SVC")
assert "Delete servicio con cascada total (svc→diag→parto+eventos)" 204 "$SC"

echo -e "\n  ${BOLD}7.8 Verificar diagnóstico ya no existe → 404${RESET}"
SC=$(do_delete "$API/breeding/gestation-diagnosis/$C_DIAG")
assert "Diagnóstico ya eliminado por cascada → 404" 404 "$SC"

# ════════════════════════════════════════════════════════════════════════════
section "8. SYNC — UPDATE y DELETE en batch"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}8.1 Batch con update + delete usando serverIds reales${RESET}"
SC=$(do_post "$API/breeding/sync" '{
  "operations": [
    {
      "localId": "update-sync-svc",
      "type": "breeding_service",
      "operation": "update",
      "happenedAt": "2026-03-05T09:00:00.000Z",
      "serverId": '"${SYNC_SVC_ID:-1}"',
      "data": { "reproductiveLot": "LOT-ACTUALIZADO-OFFLINE-V2" }
    },
    {
      "localId": "delete-sync-diag",
      "type": "gestation_diagnosis",
      "operation": "delete",
      "happenedAt": "2026-03-10T08:00:00.000Z",
      "serverId": '"${SYNC_DIAG_ID:-1}"',
      "data": {}
    }
  ]
}')
assert "Sync batch (update + delete con serverIds reales)" 200 "$SC"
jq -r '.results[] | "     [\(.status)] \(.localId)\(if .error then ": "+.error else "" end)"' /tmp/last_resp.json 2>/dev/null
echo "     → succeeded=$(jq -r '.succeeded' /tmp/last_resp.json) failed=$(jq -r '.failed' /tmp/last_resp.json)"

# ════════════════════════════════════════════════════════════════════════════
section "9. GET — Eventos del animal (paginado)"
# ════════════════════════════════════════════════════════════════════════════

echo -e "\n  ${BOLD}9.1 GET /animal-events/animal/$ID_HEMBRA?page=1&limit=10${RESET}"
SC=$(do_get "$API/animal-events/animal/$ID_HEMBRA?page=1&limit=10")
assert "GET eventos paginados del animal hembra" 200 "$SC"
echo "     → total=$(field '.meta.total')  pages=$(field '.meta.pages')  items=$(jq '.data | length' /tmp/last_resp.json 2>/dev/null)"

# ════════════════════════════════════════════════════════════════════════════
section "RESULTADO FINAL"
# ════════════════════════════════════════════════════════════════════════════
summary
