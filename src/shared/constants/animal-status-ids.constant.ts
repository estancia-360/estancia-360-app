// Fixed IDs from the animal_statuses catalog (data.sql) — seed data, never changes.
// Operational status of an animal — independent from its productive status.
export const ANIMAL_STATUS_IDS = {
    ACTIVE: 1,
    OBSERVATION: 2,
    INACTIVE: 3,
    PENDING_MOVEMENT: 4,
    SOLD: 5,
} as const;
