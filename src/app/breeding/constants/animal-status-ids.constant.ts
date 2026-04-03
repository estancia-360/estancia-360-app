/**
 * IDs fijos del catálogo animal_statuses (data.sql).
 * Estados operativos de un animal en cualquier momento.
 * Estos valores no cambian — son datos semilla del sistema.
 */
export const ANIMAL_STATUS_IDS = {
    ACTIVO: 1,           // Activo: animal en operación normal
    OBSERVACION: 2,      // En Observación: cuarentena, seguimiento veterinario
    INACTIVO: 3,         // Inactivo: dado de baja, no recibe más operaciones
} as const;
