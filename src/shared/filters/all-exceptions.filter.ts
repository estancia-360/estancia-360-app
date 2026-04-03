import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Filtro global de excepciones para Estancia-360.
 *
 * - Excepciones HTTP (BadRequest, NotFound, Conflict, etc.): se pasan tal cual.
 * - QueryFailedError (TypeORM/DB): se loguea el SQL y en development se expone
 *   el mensaje real; en production solo aparece "Error de base de datos".
 * - Cualquier otro error inesperado: en development se expone el mensaje;
 *   en production solo "Error interno del servidor".
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
    private readonly isDevelopment = process.env.NODE_ENV !== 'production';

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // ── 1. Excepción HTTP (NestJS) — pasar sin modificar ────────────────
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            response.status(status).json(body);
            return;
        }

        // ── 2. Error de base de datos (TypeORM) ─────────────────────────────
        if (exception instanceof QueryFailedError) {
            const err = exception as any;
            this.logger.error(
                `DB error en ${request.method} ${request.url} — ${err.message}`,
                err.stack,
            );
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: 500,
                error: 'Database Error',
                message: this.isDevelopment
                    ? err.message                      // mensaje real de Postgres
                    : 'Error de base de datos. Contacte al administrador.',
                ...(this.isDevelopment && {
                    query: err.query,
                    parameters: err.parameters,
                }),
            });
            return;
        }

        // ── 3. Error inesperado (bug / lógica) ───────────────────────────────
        const err = exception as any;
        this.logger.error(
            `Error inesperado en ${request.method} ${request.url} — ${err?.message ?? exception}`,
            err?.stack,
        );
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: 500,
            error: 'Internal Server Error',
            message: this.isDevelopment
                ? (err?.message ?? String(exception))
                : 'Error interno del servidor.',
        });
    }
}
