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
            const errorCode = typeof response === 'object' && response !== null ? response.error : undefined;
            const rawMessage = typeof response === 'object' && response !== null ? response.message : undefined;
            const message = Array.isArray(rawMessage) ? rawMessage[0] : (rawMessage ?? error?.message ?? 'Unknown error');
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
