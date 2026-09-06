import { BulkImportResultDto } from '../dto/outputs/bulk-import-result.dto';
import { BulkImportRowResultDto } from '../dto/outputs/bulk-import-row-result.dto';

/**
 * Runs `handler` once per row, sequentially (never in parallel — capacity checks like
 * SUBSCRIPTION_CAPACITY_EXCEEDED are read-then-write and would race under concurrency).
 * A failing row does not stop the batch — every row gets its own success/error result.
 */
export async function runBulkRows<TRow extends { rowIndex: number }>(
    rows: TRow[],
    handler: (row: TRow) => Promise<number>,
): Promise<BulkImportResultDto> {
    const results: BulkImportRowResultDto[] = [];

    for (const row of rows) {
        try {
            const id = await handler(row);
            results.push({ rowIndex: row.rowIndex, success: true, id });
        } catch (error: any) {
            const response = error?.response;
            const hasStructuredResponse = typeof response === 'object' && response !== null;
            const errorCode = hasStructuredResponse ? response.error : undefined;
            const rawMessage = hasStructuredResponse ? response.message : undefined;
            // BUG-11 (auditoria QA E2E, 2026-09-03): si el error no vino de una excepcion de
            // dominio (ej. un error crudo de Postgres que se escapo de la capa de servicio), no
            // hay que reenviar error?.message tal cual — puede contener el mensaje literal del
            // driver (nombre de constraint/tabla/columna). Se cae a un mensaje generico.
            const message = Array.isArray(rawMessage) ? rawMessage[0] : (rawMessage ?? (hasStructuredResponse ? error?.message : undefined) ?? 'Unexpected error processing this row.');
            results.push({ rowIndex: row.rowIndex, success: false, errorCode, message });
        }
    }

    return {
        totalRows: rows.length,
        succeeded: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
    };
}
