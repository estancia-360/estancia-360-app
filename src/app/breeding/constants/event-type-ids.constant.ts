/**
 * IDs fijos del catálogo event_types (data.sql).
 * Estos valores no cambian — son datos semilla del sistema.
 */
export const EVENT_TYPE_IDS = {
    SERVICE: 1,       // Servicio de monta / IA / transferencia embrionaria
    DIAGNOSIS: 2,     // Diagnóstico de gestación
    BIRTH: 3,         // Parto (parturition)
    WEANING: 4,       // Destete (weaning)
    WEIGHT_RECORD: 5,
    REARING_SELECTION: 6,
    PURCHASE: 7,
    SALE: 8,
    TRANSFER: 9,
    EXIT: 10,
    VACCINATION: 11,
    TREATMENT: 12,
    HEALTH_INCIDENT: 13,
    FATTENING_ENTRY: 14,
} as const;
