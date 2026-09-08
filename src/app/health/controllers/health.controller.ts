import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
    HealthCheck, HealthCheckService,
    TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/app/auth/decorators';

// @Public() — Docker, Kubernetes, and monitoring tools have no JWT token.
// @SkipThrottle() — uptime monitors pueden pollear esto cada pocos segundos; no es una
// ruta sensible a fuerza bruta como login/register.
@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db:     TypeOrmHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
        private readonly disk:   DiskHealthIndicator,
    ) {}

    @Get()
    @Public()
    @SkipThrottle()
    @HealthCheck()
    @ApiOperation({
        summary:     'Application health',
        description: 'Returns 200 if all checks pass, 503 if any check fails. Consumed by Docker, Kubernetes, load balancers, and uptime monitors.',
    })
    check() {
        return this.health.check([
            // Runs SELECT 1 against the TypeORM connection.
            () => this.db.pingCheck('database'),

            // Fails if Node.js heap exceeds 300 MB — adjust to your server specs.
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // Fails if disk usage exceeds 90%. Remove if the app writes no local files.
            () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
        ]);
    }
}
