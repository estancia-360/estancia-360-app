/**
 * IDs fijos del catálogo productive_statuses (data.sql).
 * Estados productivos por los que pasa un animal durante su vida.
 * Estos valores no cambian — son datos semilla del sistema.
 */
export const PRODUCTIVE_STATUS_IDS = {
    CRIA: 1,        // Cría: animal joven, en etapa reproductiva
    RECRIA: 2,      // Recría: animal post-destete, en crecimiento
    ENGORDE: 3,     // Engorde: animal en fase de ganancia de peso
    BAJA: 4,        // Baja: animal dado de baja (vendido, muerto, etc.)
} as const;
