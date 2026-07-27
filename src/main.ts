import 'dotenv/config';

import { types } from 'pg';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfig } from './config/services/app.config';
import { getEnvSettings } from './config/helpers/environment';
import { getCorsOptions } from './config/helpers/cors';
import { setupSwagger } from './config/helpers/swagger';
import { logServerStatus } from './config/helpers/logger';
import { HttpExceptionFilter } from './shared/filters';
import { JwtConfig } from './app/auth/config/jwt.config';
import { DatabaseConfig } from './database/config/database.config';

async function bootstrap() {
    const { logger, swagger } = getEnvSettings(process.env.NODE_ENV);

    // BigInt / bigserial (OID 20) arrives as string from pg — cast for auto-increment IDs.
    types.setTypeParser(20, Number);

    const app = await NestFactory.create(AppModule, { logger });
    const cfg = app.get(AppConfig);

    app.setGlobalPrefix(cfg.apiPrefix);

    if (swagger) {
        setupSwagger(app, {
            title:       'estancia-360-app',
            description: 'API Documentation',
            version:     '1.0',
            path:        'api/docs',
        });
    }

    app.enableCors(getCorsOptions(cfg.domainFrontend));

    app.useGlobalPipes(new ValidationPipe({
        transform:            true,
        whitelist:            true,
        forbidNonWhitelisted: true,
        transformOptions:     { enableImplicitConversion: false },
    }));

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(cfg.port);

    const jwtCfg = app.get(JwtConfig,      { strict: false });
    const dbCfg  = app.get(DatabaseConfig, { strict: false });

    logServerStatus(cfg, 'estancia-360-app', {
        swagger:   swagger,
        docsPath:  'api/docs',
        cors:      cfg.domainFrontend,
        logLevels: logger,
        jwtActive: jwtCfg.isActive,
        dbLogs:    dbCfg.logging,
        database:  `${dbCfg.host}:${dbCfg.port}/${dbCfg.database}`,
    });
}
bootstrap();
