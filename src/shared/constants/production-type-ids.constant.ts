// Fixed IDs from the production_types catalog (data.sql) — seed data, never changes.
// A ranch's enabled rubros (ranch_production_types) — determines which modules apply to it.
export const PRODUCTION_TYPE_IDS = {
    CRIA: 1,
    RECRIA: 2,
    ENGORDE: 3,
} as const;
