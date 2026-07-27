// Fixed IDs from the event_types catalog (data.sql) — seed data, never changes.
// animal_events is the pivot table: every action on an animal creates one of these first.
export const EVENT_TYPE_IDS = {
    SERVICE: 1,
    DIAGNOSIS: 2,
    BIRTH: 3,
    WEANING: 4,
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
