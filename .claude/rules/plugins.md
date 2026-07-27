# plugins/ — Port & Adapter Reference

Plugins follow the Port & Adapter pattern — consumers inject the port (abstract class), never the concrete adapter.
Swapping implementations (e.g., SMTP → Resend) requires zero changes to business code.

## Plugin Structure
```
plugins/{name}/
├── {name}.port.ts           # abstract class — the contract
├── {name}.module.ts         # @Global() DynamicModule.register()
├── exceptions/              # plugin-specific exception classes
└── {adapter}/
    ├── {adapter}.adapter.ts # extends port
    ├── {adapter}.config.ts  # reads env vars via ConfigService
    └── {adapter}.module.ts  # provides adapter, exports port
```
Module.register() re-exports the adapter module (NestJS 11 requirement) — this makes the port globally injectable.

## Mailer Plugin
```typescript
import { MailerPort, MailOptions } from 'src/plugins/mailer/mailer.port';

constructor(private readonly mailer: MailerPort) {}

// Fire-and-forget (errors are logged, not thrown)
this.mailer.send({
    to:      'user@example.com',
    subject: 'Welcome',
    html:    '<p>Hello!</p>',
    // text, template, context, attachments also available
});
```
Transport selected at startup via `MAILER_TRANSPORT=smtp|api` env var.
- SMTP: uses `@nestjs-modules/mailer` with Handlebars for templates.
- API: compatible with Resend by default — override `buildPayload()` for other providers.

## Adding a New Plugin
Use `/nestjs/plugin <Name> <Adapter>` slash command — it scaffolds the full port/adapter structure.
Key requirements:
- Port must be an `abstract class` (not interface) so NestJS DI can use it as a token.
- `{Name}Module.register()` returns `{ module, imports: [adapterModule], exports: [adapterModule] }`.
- Add env vars to `.env.example` and `src/config/env.validation.ts`.
- All errors → exception classes in `exceptions/`, never inline throws.
