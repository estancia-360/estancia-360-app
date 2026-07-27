// Fixed IDs from the productive_statuses catalog (data.sql) — seed data, never changes.
// ranch_animals.id_productive_status tracks which stage of the production cycle an animal is in.
export const PRODUCTIVE_STATUS_IDS = {
    CRIA: 1,
    RECRIA: 2,
    ENGORDE: 3,
    BAJA: 4,
} as const;
