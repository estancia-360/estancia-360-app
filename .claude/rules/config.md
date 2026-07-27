# config/ — Configuration Reference

## AppConfigModule (`src/config/config.module.ts`)
`@Global()` — providers exported here are available in every module without re-importing.
Loads `.env`, validates with Joi schema, and exposes `AppConfig` service.

## AppConfig (`src/config/services/app.config.ts`)
```typescript
import { AppConfig } from 'src/config/services/app.config';

constructor(private readonly config: AppConfig) {}
// Available properties:
config.nodeEnv        // EnvironmentEnum
config.port           // number
config.apiPrefix      // string  (default: 'api')
config.domainFrontend // string  (CORS origin)
```

## Adding New Env Vars
1. Add to `src/config/env.validation.ts` (Joi schema)
2. Add to `.env.example`
3. If needed, expose via a config service (create in `src/config/services/`)
```typescript
// env.validation.ts — append:
MY_VAR: Joi.string().required(),
MY_OPT: Joi.number().default(42),
```

## Environment Helpers
- `getEnvSettings(nodeEnv)` → `{ logger: LogLevel[], swagger: boolean }`
  - `development/debug` → swagger enabled, verbose logging
  - `production` → swagger disabled, error-only logging
- `getCorsOptions(domainFrontend)` → Express CORS config
- `setupSwagger(app, options)` → configures OpenAPI at `/api/docs` with bearer auth
  - Bearer scheme name: `'access-token'` → use `@ApiBearerAuth('access-token')` in controllers
- `logServerStatus(cfg, appName, opts)` → prints the startup banner
