/**
 * IDs fijos del catálogo animal_statuses (data.sql).
 * Estados operativos de un animal en cualquier momento.
 * Estos valores no cambian — son datos semilla del sistema.
 */
export const ANIMAL_STATUS_IDS = {
    ACTIVO: 1,           // Activo: animal en operación normal
    OBSERVACION: 2,      // En Observación: cuarentena, seguimiento veterinario
    INACTIVO: 3,         // Inactivo: dado de baja, no recibe más operaciones
    PENDING_MOVEMENT: 4, // Pendiente de Movimiento: incluido en una venta aún no confirmada
    SOLD: 5,             // Vendido: venta confirmada o salida a otra estancia
} as const;
