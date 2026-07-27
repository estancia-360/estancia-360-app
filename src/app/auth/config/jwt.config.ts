import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/services/app.config';

// Sin refresh token — un único access token, igual que el proyecto viejo.
@Injectable()
export class JwtConfig {
    readonly isActive:  boolean;
    readonly secret:    string;
    readonly expiresIn: string;

    constructor(cfg: ConfigService, app: AppConfig) {
        this.secret    = cfg.get<string>('JWT_SECRET')!;
        this.expiresIn = cfg.get<string>('JWT_TIME_EXPIRE')!;
        // Force active in production to prevent accidental bypass via ACTIVE_JWT=false.
        this.isActive  = app.isProduction ? true : (cfg.get<boolean>('ACTIVE_JWT') ?? true);
    }
}
